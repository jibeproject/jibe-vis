import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../../amplify_outputs.json';
import citiesData from './stories/cities.json';

// --- API helper ------------------------------------------------------------

async function callDevApi(action: string, params: Record<string, any>, method: 'GET' | 'POST' = 'POST') {
  const apiGatewayUrl = (outputs as any)?.custom?.apiGatewayUrl;
  if (!apiGatewayUrl) throw new Error('API Gateway URL not found in amplify_outputs.json');

  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new Error('Not authenticated');

  const baseUrl = apiGatewayUrl.endsWith('/') ? apiGatewayUrl.slice(0, -1) : apiGatewayUrl;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  let url = `${baseUrl}/dev`;
  let init: RequestInit = { method, headers };
  if (method === 'GET') {
    url += `?${new URLSearchParams({ action, ...params })}`;
  } else {
    init.body = JSON.stringify({ action, ...params });
  }

  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// --- component -------------------------------------------------------------

const cityOptions = Object.keys(citiesData as Record<string, unknown>).map((c) => c.toLowerCase());

type Phase = 'idle' | 'ingesting' | 'rebuilding' | 'done' | 'error';

interface S3File { key: string; size: number; lastModified: string; }
interface CatalogTable { name: string; location?: string; updateTime?: string | null; }

export default function DevDashboard() {
  const [city, setCity] = useState(cityOptions.includes('melbourne') ? 'melbourne' : cityOptions[0] || '');
  const [year, setYear] = useState('2018');
  const [scenario, setScenario] = useState('base');

  const [mode, setMode] = useState<'browse' | 'upload'>('browse');
  const [uploads, setUploads] = useState<File[]>([]);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const [files, setFiles] = useState<S3File[]>([]);
  const [sourceInfo, setSourceInfo] = useState<{ bucket: string; prefix: string } | null>(null);
  const [catalog, setCatalog] = useState<CatalogTable[]>([]);

  const [refFiles, setRefFiles] = useState<S3File[]>([]);
  const [refUploads, setRefUploads] = useState<File[]>([]);
  const [linkStatus, setLinkStatus] = useState<string | null>(null);
  const [linkState, setLinkState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  const [tiles, setTiles] = useState<S3File[]>([]);
  const [tileUploads, setTileUploads] = useState<File[]>([]);
  const [tilesMsg, setTilesMsg] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const target = { city, year, scenario };

  const refreshLists = async () => {
    setError(null);
    try {
      const [f, c, r, t] = await Promise.all([
        callDevApi('list-files', target, 'GET'),
        callDevApi('list-catalog', { city, scenario }, 'GET'),
        callDevApi('list-reference', { city }, 'GET'),
        callDevApi('list-tiles', {}, 'GET'),
      ]);
      setFiles(f.files || []);
      if (f.bucket && f.prefix) setSourceInfo({ bucket: f.bucket, prefix: f.prefix });
      setCatalog(c.tables || []);
      setRefFiles(r.files || []);
      setTiles(t.files || []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    refreshLists();
  }, [city, year, scenario]);

  const handleUpload = async () => {
    if (uploads.length === 0) return;
    setBusy(true);
    setError(null);
    setUploadMsg(null);
    try {
      for (const file of uploads) {
        const { url } = await callDevApi('presign-upload', { ...target, filename: file.name }, 'POST');
        const put = await fetch(url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': 'text/csv' },
        });
        if (!put.ok) throw new Error(`Upload failed for ${file.name} (${put.status})`);
      }
      setUploadMsg(`Uploaded ${uploads.length} file(s).`);
      setUploads([]);
      await refreshLists();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const pollIngest = async (
    jobRunId: string,
    onStatus: (msg: string) => void = setStatus,
  ): Promise<boolean> => {
    while (true) {
      const r = await callDevApi('ingest-status', { jobRunId }, 'GET');
      onStatus(`Glue job: ${r.state}`);
      if (r.state === 'SUCCEEDED') return true;
      if (['FAILED', 'STOPPED', 'TIMEOUT', 'ERROR'].includes(r.state)) {
        throw new Error(`Ingest ${r.state}: ${r.errorMessage || 'see Glue logs'}`);
      }
      await sleep(5000);
    }
  };

  const pollQueries = async (
    queries: { group: string; queryExecutionId: string }[],
    label = 'distribution tables',
    onStatus: (msg: string) => void = setStatus,
  ) => {
    const ids = queries.map((q) => q.queryExecutionId);
    while (true) {
      const r = await callDevApi('query-status', { queryExecutionIds: ids }, 'POST');
      const states: { state: string; reason?: string }[] = r.queries || [];
      const failed = states.find((s) => ['FAILED', 'CANCELLED'].includes(s.state));
      if (failed) throw new Error(`Rebuild of ${label} ${failed.state}: ${failed.reason || ''}`);
      const done = states.every((s) => s.state === 'SUCCEEDED');
      onStatus(`Rebuilding ${label}: ${states.filter((s) => s.state === 'SUCCEEDED').length}/${states.length} done`);
      if (done) return;
      await sleep(4000);
    }
  };

  const handleProcess = async () => {
    setBusy(true);
    setError(null);
    setPhase('ingesting');
    setStatus('Starting Glue job…');
    try {
      const ingest = await callDevApi('start-ingest', target, 'POST');
      await pollIngest(ingest.jobRunId);

      setPhase('rebuilding');
      setStatus('Rebuilding distribution tables…');
      const rebuild = await callDevApi('rebuild-distribution', target, 'POST');
      await pollQueries(rebuild.queries || []);

      setPhase('done');
      setStatus('Scenario data refreshed.');
      await refreshLists();
    } catch (e: any) {
      setPhase('error');
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const runLinkageStep = async (step: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setLinkState('busy');
    try {
      await step();
      setLinkState('done');
      await refreshLists();
    } catch (e: any) {
      setLinkState('error');
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleReferenceUpload = () =>
    runLinkageStep(async () => {
      for (const file of refUploads) {
        const { url } = await callDevApi('presign-reference-upload', { city, filename: file.name }, 'POST');
        const put = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': 'text/csv' } });
        if (!put.ok) throw new Error(`Upload failed for ${file.name} (${put.status})`);
      }
      setRefUploads([]);
      setLinkStatus(`Uploaded ${refUploads.length} reference file(s).`);
    });

  const handleReferenceIngest = () =>
    runLinkageStep(async () => {
      setLinkStatus('Starting reference ingest…');
      const r = await callDevApi('start-reference-ingest', { city }, 'POST');
      await pollIngest(r.jobRunId, setLinkStatus);
      setLinkStatus(`Reference tables registered (${r.tablePrefix}*).`);
    });

  const handleRebuildLinkage = () =>
    runLinkageStep(async () => {
      setLinkStatus('Starting linkage table rebuild…');
      const r = await callDevApi('rebuild-linkage', { city, year }, 'POST');
      await pollQueries(r.queries || [], 'area linkage tables', setLinkStatus);
      setLinkStatus(`Rebuilt ${r.queries?.length ?? 0} linkage tables.`);
    });

  const handleTileUpload = async () => {
    if (tileUploads.length === 0) return;
    setBusy(true);
    setError(null);
    setTilesMsg(null);
    try {
      for (const file of tileUploads) {
        const { url } = await callDevApi('presign-tiles-upload', { filename: file.name }, 'POST');
        const put = await fetch(url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': 'application/octet-stream' },
        });
        if (!put.ok) throw new Error(`Upload failed for ${file.name} (${put.status})`);
      }
      setTilesMsg(`Uploaded ${tileUploads.length} tileset(s). Note: a replaced tileset may be served from the CloudFront cache for up to 24 hours.`);
      setTileUploads([]);
      await refreshLists();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

  return (
    <Box maxWidth="md" width="100%" margin="1rem auto" padding="0 1rem">
      <Typography variant="h5" gutterBottom>Developer dashboard — scenario data</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Upload or select raw model output files for a city / year / scenario, then process them
        into the Athena tables that power the visualisations. Replaces the offline Glue + SQL steps.
      </Typography>

      {/* Target selector */}
      <Box display="flex" gap="1rem" flexWrap="wrap" marginTop="1rem" marginBottom="1.5rem">
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel id="city-label">City</InputLabel>
          <Select labelId="city-label" label="City" value={city} onChange={(e) => setCity(e.target.value)}>
            {cityOptions.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Year" size="small" value={year} onChange={(e) => setYear(e.target.value)} sx={{ width: 120 }} />
        <TextField label="Scenario" size="small" value={scenario} onChange={(e) => setScenario(e.target.value.toLowerCase())} sx={{ width: 180 }} helperText="e.g. base, cycling" />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Source files */}
      <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>1. Source files</Typography>

      {/* Expected S3 location for this city/year/scenario */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Expected S3 location for these files:
        </Typography>
        <Typography variant="body2" component="code" sx={{ wordBreak: 'break-all' }}>
          s3://{sourceInfo?.bucket ?? (outputs as any)?.custom?.dataBucket ?? '(resolving…)'}/{sourceInfo?.prefix ?? `source/${city}/scenOutput_${year}/${scenario}/`}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Place the model output CSVs (e.g. trips.csv, pp_exposure_{year}.csv) under a
          <code> microData/ </code> sub-folder here, then use “Already in S3”.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <ToggleButtonGroup
          color="primary"
          exclusive
          size="small"
          value={mode}
          onChange={(_, v) => { if (v) setMode(v); }}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="browse">Already in S3</ToggleButton>
          <ToggleButton value="upload">Upload</ToggleButton>
        </ToggleButtonGroup>

        {mode === 'browse' && (
          <Box>
            <Button size="small" variant="outlined" onClick={refreshLists} disabled={busy} sx={{ mb: 1 }}>
              Refresh
            </Button>
            {files.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No files found at this location yet. Copy your CSVs to the path above, then Refresh.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead><TableRow><TableCell>Key</TableCell><TableCell align="right">Size</TableCell></TableRow></TableHead>
                <TableBody>
                  {files.map((f) => (
                    <TableRow key={f.key}><TableCell sx={{ wordBreak: 'break-all' }}>{f.key}</TableCell><TableCell align="right">{formatSize(f.size)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}

        {mode === 'upload' && (
          <Box>
            <Button variant="outlined" component="label" disabled={busy}>
              Choose CSV files
              <input
                hidden
                multiple
                type="file"
                accept=".csv"
                onChange={(e) => setUploads(Array.from(e.target.files || []))}
              />
            </Button>
            {uploads.length > 0 && (
              <Box mt={1}>
                {uploads.map((f) => <Chip key={f.name} label={`${f.name} (${formatSize(f.size)})`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}
                <Box mt={1}>
                  <Button variant="contained" onClick={handleUpload} disabled={busy}>Upload to S3</Button>
                </Box>
              </Box>
            )}
            {uploadMsg && <Alert severity="success" sx={{ mt: 1 }}>{uploadMsg}</Alert>}
          </Box>
        )}
      </Paper>

      {/* Process */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>2. Process &amp; rebuild</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Runs the Glue job (CSV → parquet + tables) for <strong>{city}_{scenario}</strong> (year {year}),
        then rebuilds the derived distribution tables.
      </Typography>
      <Button variant="contained" onClick={handleProcess} disabled={busy || !city || !year || !scenario}>
        Process scenario
      </Button>
      {phase !== 'idle' && (
        <Box mt={2}>
          {busy && <LinearProgress sx={{ mb: 1 }} />}
          <Chip
            label={status || phase}
            color={phase === 'done' ? 'success' : phase === 'error' ? 'error' : 'default'}
          />
        </Box>
      )}

      {/* Catalog */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>3. Registered tables</Typography>
      {catalog.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No tables registered for {city}_{scenario}.</Typography>
      ) : (
        <Table size="small">
          <TableHead><TableRow><TableCell>Table</TableCell><TableCell>Updated</TableCell></TableRow></TableHead>
          <TableBody>
            {catalog.map((t) => (
              <TableRow key={t.name}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.updateTime ? new Date(t.updateTime).toLocaleString() : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Area linkage tables (exposures & health stories) */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>4. Area linkage tables (exposures &amp; health)</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Builds the <code>{'{var}_x_{group}_{area}'}</code> tables behind the “Transport exposures and
        health” map stories from the ingested person/household microdata. Requires a one-off
        <strong> areas.csv</strong> reference lookup for {city} (a <code>zone</code> column matching the
        synthetic-population home zone, plus one column per area level, e.g.
        <code> sa2_name_2016</code>, <code>lga_name_2016</code>).
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
        <Typography variant="body2" gutterBottom>
          Reference files staged for {city}: {refFiles.length === 0
            ? 'none'
            : refFiles.map((f) => f.key.split('/').pop()).join(', ')}
        </Typography>
        <Box display="flex" gap="0.5rem" flexWrap="wrap" alignItems="center">
          <Button variant="outlined" component="label" size="small" disabled={busy}>
            Choose reference CSV
            <input hidden multiple type="file" accept=".csv" onChange={(e) => setRefUploads(Array.from(e.target.files || []))} />
          </Button>
          {refUploads.length > 0 && (
            <Button variant="contained" size="small" onClick={handleReferenceUpload} disabled={busy}>
              Upload {refUploads.map((f) => f.name).join(', ')}
            </Button>
          )}
          <Button variant="outlined" size="small" onClick={handleReferenceIngest} disabled={busy || refFiles.length === 0}>
            Ingest reference tables
          </Button>
          <Button variant="contained" size="small" onClick={handleRebuildLinkage} disabled={busy}>
            Rebuild linkage tables
          </Button>
        </Box>
        {linkState !== 'idle' && (
          <Box mt={1.5}>
            {busy && linkState === 'busy' && <LinearProgress sx={{ mb: 1 }} />}
            <Chip
              label={linkStatus || linkState}
              color={linkState === 'done' ? 'success' : linkState === 'error' ? 'error' : 'default'}
            />
          </Box>
        )}
      </Paper>

      {/* PMTiles */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>5. Map tiles (PMTiles)</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Vector tilesets served via CloudFront and referenced from story configuration
        (<code>pmtiles://…</code> URLs). New uploads land under <code>tiles/</code>.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box display="flex" gap="0.5rem" flexWrap="wrap" alignItems="center" sx={{ mb: 1 }}>
          <Button variant="outlined" component="label" size="small" disabled={busy}>
            Choose .pmtiles file
            <input hidden multiple type="file" accept=".pmtiles" onChange={(e) => setTileUploads(Array.from(e.target.files || []))} />
          </Button>
          {tileUploads.length > 0 && (
            <Button variant="contained" size="small" onClick={handleTileUpload} disabled={busy}>
              Upload {tileUploads.map((f) => `${f.name} (${formatSize(f.size)})`).join(', ')}
            </Button>
          )}
        </Box>
        {busy && tileUploads.length > 0 && <LinearProgress sx={{ mb: 1 }} />}
        {tilesMsg && <Alert severity="success" sx={{ mb: 1 }}>{tilesMsg}</Alert>}
        {tiles.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No tilesets found.</Typography>
        ) : (
          <Table size="small">
            <TableHead><TableRow><TableCell>Key</TableCell><TableCell align="right">Size</TableCell><TableCell>Updated</TableCell></TableRow></TableHead>
            <TableBody>
              {tiles.map((f) => (
                <TableRow key={f.key}>
                  <TableCell sx={{ wordBreak: 'break-all' }}>{f.key}</TableCell>
                  <TableCell align="right">{formatSize(f.size)}</TableCell>
                  <TableCell>{new Date(f.lastModified).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
