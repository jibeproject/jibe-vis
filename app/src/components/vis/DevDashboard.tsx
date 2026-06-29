import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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

  const [tab, setTab] = useState(0);
  const [uploads, setUploads] = useState<File[]>([]);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const [files, setFiles] = useState<S3File[]>([]);
  const [catalog, setCatalog] = useState<CatalogTable[]>([]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const target = { city, year, scenario };

  const refreshLists = async () => {
    setError(null);
    try {
      const [f, c] = await Promise.all([
        callDevApi('list-files', target, 'GET'),
        callDevApi('list-catalog', { city, scenario }, 'GET'),
      ]);
      setFiles(f.files || []);
      setCatalog(c.tables || []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    refreshLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const pollIngest = async (jobRunId: string): Promise<boolean> => {
    while (true) {
      const r = await callDevApi('ingest-status', { jobRunId }, 'GET');
      setStatus(`Glue job: ${r.state}`);
      if (r.state === 'SUCCEEDED') return true;
      if (['FAILED', 'STOPPED', 'TIMEOUT', 'ERROR'].includes(r.state)) {
        throw new Error(`Ingest ${r.state}: ${r.errorMessage || 'see Glue logs'}`);
      }
      await sleep(5000);
    }
  };

  const pollQueries = async (queries: { group: string; queryExecutionId: string }[]) => {
    const ids = queries.map((q) => q.queryExecutionId);
    while (true) {
      const r = await callDevApi('query-status', { queryExecutionIds: ids }, 'POST');
      const states: { state: string; reason?: string }[] = r.queries || [];
      const failed = states.find((s) => ['FAILED', 'CANCELLED'].includes(s.state));
      if (failed) throw new Error(`Distribution rebuild ${failed.state}: ${failed.reason || ''}`);
      const done = states.every((s) => s.state === 'SUCCEEDED');
      setStatus(`Rebuilding distribution tables: ${states.filter((s) => s.state === 'SUCCEEDED').length}/${states.length} done`);
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
      <Typography variant="h6" gutterBottom>1. Source files</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
        <Tab label="Upload" />
        <Tab label="Already in S3" />
      </Tabs>

      {tab === 0 && (
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

      {tab === 1 && (
        <Box>
          <Button size="small" onClick={refreshLists} disabled={busy}>Refresh</Button>
          {files.length === 0 ? (
            <Typography variant="body2" color="text.secondary" mt={1}>No files staged for this combination.</Typography>
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
    </Box>
  );
}
