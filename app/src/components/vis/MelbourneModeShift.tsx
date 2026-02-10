import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';
import { ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import outputs from '../../../amplify_outputs.json';
import { DownloadChartAsPng } from './graphs';
import { signedFetch } from '../utilities/signedFetch';

interface DistributionData {
  group: string;
  person_count: number;
  avg_walk_mins_day_p5: number;
  avg_walk_mins_day_p25: number;
  avg_walk_mins_day_p50: number;
  avg_walk_mins_day_p75: number;
  avg_walk_mins_day_p95: number;
  avg_bike_mins_day_p5: number;
  avg_bike_mins_day_p25: number;
  avg_bike_mins_day_p50: number;
  avg_bike_mins_day_p75: number;
  avg_bike_mins_day_p95: number;
  avg_car_mins_day_p5: number;
  avg_car_mins_day_p25: number;
  avg_car_mins_day_p50: number;
  avg_car_mins_day_p75: number;
  avg_car_mins_day_p95: number;
  avg_pt_mins_day_p5: number;
  avg_pt_mins_day_p25: number;
  avg_pt_mins_day_p50: number;
  avg_pt_mins_day_p75: number;
  avg_pt_mins_day_p95: number;
  walk_share: number;
  bike_share: number;
  car_share: number;
  pt_share: number;
}

export function MelbourneModeShift() {
  const [groupBy, setGroupBy] = useState('Overall');
  const [selectedModes, setSelectedModes] = useState<string[]>(['bike', 'car']);
  const [plotType, setPlotType] = useState<'minutes' | 'modeShare'>('modeShare');
  const [baseData, setBaseData] = useState<DistributionData[]>([]);
  const [cyclingData, setCyclingData] = useState<DistributionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBothScenarios();
  }, [groupBy]);

  const fetchBothScenarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use direct Lambda Function URL for authenticated requests
      const lambdaUrl = (outputs as any)?.custom?.athenaQueryFunctionUrl 
        || import.meta.env.VITE_ATHENA_LAMBDA_URL;
      
      if (!lambdaUrl) {
        throw new Error('Lambda Function URL not configured');
      }
      
      // Fetch distribution data for both scenarios using signed requests
      const baseUrl = `${lambdaUrl}?${new URLSearchParams({ topic: 'demographic_distribution', city: 'melbourne', scenario: 'base', group_by: groupBy })}`;
      const cyclingUrl = `${lambdaUrl}?${new URLSearchParams({ topic: 'demographic_distribution', city: 'melbourne', scenario: 'cycling', group_by: groupBy })}`;
      
      const [baseResponse, cyclingResponse] = await Promise.all([
        signedFetch(baseUrl),
        signedFetch(cyclingUrl)
      ]);
      
      // Check for HTTP errors
      if (!baseResponse.ok) {
        const errorText = await baseResponse.text();
        throw new Error(`Base scenario failed (${baseResponse.status}): ${errorText}`);
      }
      if (!cyclingResponse.ok) {
        const errorText = await cyclingResponse.text();
        throw new Error(`Cycling scenario failed (${cyclingResponse.status}): ${errorText}`);
      }
      
      const [baseResult, cyclingResult] = await Promise.all([
        baseResponse.json(),
        cyclingResponse.json()
      ]);
      
      // Lambda now returns array of objects directly, no need to parse
      const mapData = (result: any[]): DistributionData[] => {
        return result.map((row: any) => ({
          group: row.demographic_group,
          person_count: row.person_count,
          avg_walk_mins_day_p5: row.avg_walk_mins_day_p5,
          avg_walk_mins_day_p25: row.avg_walk_mins_day_p25,
          avg_walk_mins_day_p50: row.avg_walk_mins_day_p50,
          avg_walk_mins_day_p75: row.avg_walk_mins_day_p75,
          avg_walk_mins_day_p95: row.avg_walk_mins_day_p95,
          avg_bike_mins_day_p5: row.avg_bike_mins_day_p5,
          avg_bike_mins_day_p25: row.avg_bike_mins_day_p25,
          avg_bike_mins_day_p50: row.avg_bike_mins_day_p50,
          avg_bike_mins_day_p75: row.avg_bike_mins_day_p75,
          avg_bike_mins_day_p95: row.avg_bike_mins_day_p95,
          avg_car_mins_day_p5: row.avg_car_mins_day_p5,
          avg_car_mins_day_p25: row.avg_car_mins_day_p25,
          avg_car_mins_day_p50: row.avg_car_mins_day_p50,
          avg_car_mins_day_p75: row.avg_car_mins_day_p75,
          avg_car_mins_day_p95: row.avg_car_mins_day_p95,
          avg_pt_mins_day_p5: row.avg_pt_mins_day_p5,
          avg_pt_mins_day_p25: row.avg_pt_mins_day_p25,
          avg_pt_mins_day_p50: row.avg_pt_mins_day_p50,
          avg_pt_mins_day_p75: row.avg_pt_mins_day_p75,
          avg_pt_mins_day_p95: row.avg_pt_mins_day_p95,
          walk_share: row.walk_share,
          bike_share: row.bike_share,
          car_share: row.car_share,
          pt_share: row.pt_share
        }));
      };
      
      setBaseData(mapData(baseResult));
      setCyclingData(mapData(cyclingResult));
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  // Helper function to calculate nice axis domain with evenly spaced ticks
  const calculateAxisDomain = (maxValue: number): [number, number, number] => {
    // Determine a nice tick interval based on the magnitude
    let tickInterval: number;
    if (maxValue <= 6) {
      tickInterval = 1;
    } else if (maxValue <= 12) {
      tickInterval = 2;
    } else if (maxValue <= 30) {
      tickInterval = 5;
    } else if (maxValue <= 60) {
      tickInterval = 10;
    } else if (maxValue <= 120) {
      tickInterval = 20;
    } else {
      tickInterval = 30;
    }
    
    // Calculate how many ticks we need to cover maxValue
    const minTicks = Math.ceil(maxValue / tickInterval);
    let domainMax = minTicks * tickInterval;
    
    // If maxValue is closer to the next tick mark (more than 50% of the way there),
    // include the next tick mark
    const distanceToCurrentMax = domainMax - maxValue;
    const distanceToNextTick = tickInterval - distanceToCurrentMax;
    if (distanceToNextTick < distanceToCurrentMax) {
      domainMax += tickInterval;
    }
    
    return [0, domainMax, tickInterval];
  };

  const renderDistributionPlot = (base: DistributionData, cycling: DistributionData, sharedAxisDomain: [number, number, number]) => {
    const modeConfigs = {
      walk: { name: 'Walk', color: '#4caf50' },
      bike: { name: 'Bicycle', color: '#2196f3' },
      car: { name: 'Car', color: '#ff9800' },
      pt: { name: 'Public Transport', color: '#9e9e9e' }
    };

    // Transform data for Recharts - group by mode with reference and intervention data
    const chartData: any[] = [];
    const [domainMin, domainMax, tickInterval] = sharedAxisDomain;
    
    // Create one row per mode with both reference and intervention data
    selectedModes.forEach(mode => {
      const config = modeConfigs[mode as keyof typeof modeConfigs];
      chartData.push({
        mode: config.name,
        // Reference data
        reference_p5: base[`avg_${mode}_mins_day_p5` as keyof DistributionData] as number,
        reference_p25: base[`avg_${mode}_mins_day_p25` as keyof DistributionData] as number,
        reference_p50: base[`avg_${mode}_mins_day_p50` as keyof DistributionData] as number,
        reference_p75: base[`avg_${mode}_mins_day_p75` as keyof DistributionData] as number,
        reference_p95: base[`avg_${mode}_mins_day_p95` as keyof DistributionData] as number,
        // Intervention data
        intervention_p5: cycling[`avg_${mode}_mins_day_p5` as keyof DistributionData] as number,
        intervention_p25: cycling[`avg_${mode}_mins_day_p25` as keyof DistributionData] as number,
        intervention_p50: cycling[`avg_${mode}_mins_day_p50` as keyof DistributionData] as number,
        intervention_p75: cycling[`avg_${mode}_mins_day_p75` as keyof DistributionData] as number,
        intervention_p95: cycling[`avg_${mode}_mins_day_p95` as keyof DistributionData] as number
      });
    });

    // Custom BoxPlot shape - manually calculate scale from chart dimensions
    const BoxPlot = (props: any) => {
      const { x, y, width, height, payload, fill } = props;
      const dataKey = props.dataKey; // 'reference_p95' or 'intervention_p95'
      const prefix = dataKey.replace('_p95', ''); // 'reference' or 'intervention'
      
      const p5 = payload[`${prefix}_p5`];
      const p25 = payload[`${prefix}_p25`];
      const p50 = payload[`${prefix}_p50`];
      const p75 = payload[`${prefix}_p75`];
      const p95 = payload[`${prefix}_p95`];
      const color = fill;
      
      // The Bar component draws width based on p95 (our dataKey)
      // So width represents p95 units on the chart scale
      // Calculate the scale factor: pixels per unit value
      const scale = (value: number) => x + (value / p95) * width;
      
      const scaledP5 = scale(p5);
      const scaledP25 = scale(p25);
      const scaledP50 = scale(p50);
      const scaledP75 = scale(p75);
      const scaledP95 = x + width; // p95 is at the end of the bar
      const boxWidth = Math.max(scaledP75 - scaledP25, 1);
      
      return (
        <g>
          {/* Whisker line (p5 to p95) */}
          <line x1={scaledP5} y1={y + height / 2} x2={scaledP95} y2={y + height / 2} stroke={color} strokeWidth={5} />
          
          {/* IQR box (p25 to p75) */}
          <rect 
            x={scaledP25} 
            y={y + height / 6} 
            width={boxWidth} 
            height={(2 * height) / 3} 
            fill={color}
            stroke={color}
            strokeWidth={1}
          />
          
          {/* Median line */}
          <line 
            x1={scaledP50} 
            y1={y + height / 6} 
            x2={scaledP50} 
            y2={y + (5 * height) / 6} 
            stroke={"white"}
            strokeWidth={2.5}
          />
        </g>
      );
    };

    const copyTableToTSV = (event: React.MouseEvent<HTMLDivElement>, modeId: string, data: any) => {
      event.stopPropagation();
      event.preventDefault();
      
      const mode = data.mode;
      let tsv = `${mode}\nminutes per weekday\n`;
      tsv += '\tP5\tP25\tP50\tP75\tP95\n';
      tsv += `Reference\t${data.reference_p5.toFixed(1)}\t${data.reference_p25.toFixed(1)}\t${data.reference_p50.toFixed(1)}\t${data.reference_p75.toFixed(1)}\t${data.reference_p95.toFixed(1)}\n`;
      tsv += `Intervention\t${data.intervention_p5.toFixed(1)}\t${data.intervention_p25.toFixed(1)}\t${data.intervention_p50.toFixed(1)}\t${data.intervention_p75.toFixed(1)}\t${data.intervention_p95.toFixed(1)}\n`;
      const currentURL = window.location.href;
      tsv += `\n${currentURL}`;

      navigator.clipboard.writeText(tsv).then(() => {
        console.log(`Table for ${mode} copied to clipboard in TSV format`);
        const tableCopiedAdvice = document.getElementById('tableCopyAdvice-' + modeId);
        if (tableCopiedAdvice) {
          tableCopiedAdvice.innerHTML = `Copied table data for ${mode} to clipboard.`;
          setTimeout(() => {
            if (tableCopiedAdvice) {
              tableCopiedAdvice.innerHTML = 'Click to copy table to clipboard';
            }
          }, 2000);
        }
      }).catch(err => {
        console.error('Failed to copy table to clipboard: ', err);
      });
    };

    const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        const modeId = data.mode.replace(/\s+/g, '-');
        return (
          <div
            style={{ 
              backgroundColor: 'white', 
              border: '1px solid #ccc', 
              padding: '10px', 
              borderRadius: '4px', 
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation();
              copyTableToTSV(e, modeId, data);
            }}
          >
            <b style={{ pointerEvents: 'none' }}>{data.mode}</b>
            <table id={modeId} className='popup_summary' style={{ borderCollapse: 'collapse', marginTop: '4px', pointerEvents: 'none' }}>
              <caption style={{ fontSize: '11px', fontStyle: 'italic' }}>minutes per weekday</caption>
              <thead>
                <tr>
                  <th scope='col' style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px' }}></th>
                  <th scope='col' style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px' }}>P5</th>
                  <th scope='col' style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px' }}>P25</th>
                  <th scope='col' style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px' }}>P50</th>
                  <th scope='col' style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px' }}>P75</th>
                  <th scope='col' style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px' }}>P95</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px' }}><b>Reference</b></td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px', textAlign: 'right' }}>{data.reference_p5.toFixed(1)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px', textAlign: 'right' }}>{data.reference_p25.toFixed(1)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px', textAlign: 'right' }}><strong>{data.reference_p50.toFixed(1)}</strong></td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px', textAlign: 'right' }}>{data.reference_p75.toFixed(1)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px', textAlign: 'right' }}>{data.reference_p95.toFixed(1)}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px' }}><b>Intervention</b></td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px', textAlign: 'right' }}>{data.intervention_p5.toFixed(1)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px', textAlign: 'right' }}>{data.intervention_p25.toFixed(1)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px', textAlign: 'right' }}><strong>{data.intervention_p50.toFixed(1)}</strong></td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px', textAlign: 'right' }}>{data.intervention_p75.toFixed(1)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', fontSize: '11px', textAlign: 'right' }}>{data.intervention_p95.toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
            <Typography id={'tableCopyAdvice-' + modeId} variant="caption" fontStyle={'italic'} style={{ fontSize: '10px', marginTop: '4px', display: 'block', pointerEvents: 'none' }}>Click to copy table to clipboard</Typography>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="responsive-chart" style={{ width: '100%', marginTop: '1rem' }}>
        <ResponsiveContainer width="100%" height={selectedModes.length * 120 + 100}>
          <ComposedChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, bottom: 20, left: 120 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              domain={[domainMin, domainMax]}
              ticks={Array.from({ length: Math.floor(domainMax / tickInterval) + 1 }, (_, i) => i * tickInterval)}
              tickFormatter={(value) => Math.round(value).toString()}
              label={{ value: 'minutes per weekday', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              type="category" 
              dataKey="mode" 
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              wrapperStyle={{ pointerEvents: 'auto' }}
            />
            <Legend 
              wrapperStyle={{ bottom: 0, right: 0 }}
              iconType="rect"
            />
            <Bar dataKey="reference_p95" fill="#ff6b6b" name="Reference" shape={<BoxPlot />} />
            <Bar dataKey="intervention_p95" fill="#9b59b6" name="Intervention" shape={<BoxPlot />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderModeShareBars = (base: DistributionData, cycling: DistributionData) => {
    const allModeData = [
      { mode: 'Walk', modeKey: 'walk', Reference: base.walk_share * 100, Intervention: cycling.walk_share * 100, color: '#4caf50' },
      { mode: 'Bicycle', modeKey: 'bike', Reference: base.bike_share * 100, Intervention: cycling.bike_share * 100, color: '#2196f3' },
      { mode: 'Car', modeKey: 'car', Reference: base.car_share * 100, Intervention: cycling.car_share * 100, color: '#ff9800' },
      { mode: 'Public Transport', modeKey: 'pt', Reference: base.pt_share * 100, Intervention: cycling.pt_share * 100, color: '#9e9e9e' }
    ];
    
    // Filter based on selected modes
    const chartData = allModeData.filter(item => selectedModes.includes(item.modeKey));

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ margin: '4px 0 0 0', color: entry.color, fontSize: '12px' }}>
                {entry.name}: {entry.value.toFixed(1)}%
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="responsive-chart" style={{ width: '100%', marginTop: '1rem' }}>
        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 80, 150)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, bottom: 20, left: 120 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              label={{ value: 'Mode Share (%)', position: 'insideBottom', offset: -10 }}
              domain={[0, 100]}
            />
            <YAxis 
              type="category" 
              dataKey="mode" 
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ bottom: 0, right: 0 }}
              iconType="rect"
            />
            <Bar dataKey="Reference" fill="#ff6b6b" />
            <Bar dataKey="Intervention" fill="#9b59b6"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Box maxWidth="md" width="100%" margin="1rem auto">
      <Typography variant="h6">
        Melbourne Transport and Health: Baseline vs Cycling Intervention
      </Typography>
      
      <Typography variant="body2" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        Comparison of average weekday simulated transport time and mode share between 2018 baseline and cycling intervention scenarios.
      </Typography>
      
      <Box display="flex" gap="2rem" marginBottom="1rem" flexWrap="wrap" alignItems="center">
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel id="mode-select-label">Mode</InputLabel>
          <Select<string[]>
            labelId="mode-select-label"
            id="mode-select"
            multiple
            value={selectedModes}
            onChange={(event: SelectChangeEvent<string[]>) => {
              const {
                target: { value },
              } = event;
              const newValue = typeof value === 'string' ? value.split(',') : value;
              if (newValue.length > 0) {
                setSelectedModes(newValue);
              }
            }}
            input={<OutlinedInput id="select-multiple-mode" label="Mode" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const modeLabels: Record<string, string> = {
                    walk: 'Walk',
                    bike: 'Bicycle',
                    car: 'Car',
                    pt: 'Public Transport'
                  };
                  return <Chip key={value} label={modeLabels[value]} size="small" />;
                })}
              </Box>
            )}
            size="small"
          >
            {[
              { value: 'walk', label: 'Walk' },
              { value: 'bike', label: 'Bicycle' },
              { value: 'car', label: 'Car' },
              { value: 'pt', label: 'Public Transport' }
            ].map((mode) => (
              <MenuItem key={mode.value} value={mode.value}>
                {mode.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="plot-select-label">Plot</InputLabel>
          <Select
            labelId="plot-select-label"
            id="plot-select"
            value={plotType}
            label="Plot"
            onChange={(e) => setPlotType(e.target.value as 'minutes' | 'modeShare')}
            size="small"
          >
            <MenuItem value="minutes">Minutes per weekday</MenuItem>
            <MenuItem value="modeShare">Mode share</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="groupby-select-label">Grouped by</InputLabel>
          <Select
            labelId="groupby-select-label"
            id="groupby-select"
            value={groupBy}
            label="Grouped by"
            onChange={(e) => setGroupBy(e.target.value)}
            size="small"
          >
            <MenuItem value="Overall">Overall</MenuItem>
            <MenuItem value="gender">Gender</MenuItem>
            <MenuItem value="age">Age</MenuItem>
            <MenuItem value="occupation">Occupation</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <div id="modal-popup-container">
        {loading ? (
          <Box display="flex" justifyContent="center" padding="2rem">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box padding="1rem" bgcolor="#fff3cd" borderRadius="4px" marginTop="1rem">
            <Typography variant="body2" color="#856404">{error}</Typography>
          </Box>
        ) : baseData.length > 0 && cyclingData.length > 0 ? (
          <div id="melbourne-mode-shift-charts">
            {(() => {
              // Calculate global max value across all demographic groups for consistent axis
              let globalMaxValue = 0;
              baseData.forEach(baseRow => {
                const cyclingRow = cyclingData.find(d => d && d.group === baseRow.group);
                if (cyclingRow) {
                  selectedModes.forEach(mode => {
                    const baseP95 = baseRow[`avg_${mode}_mins_day_p95` as keyof DistributionData] as number;
                    const cyclingP95 = cyclingRow[`avg_${mode}_mins_day_p95` as keyof DistributionData] as number;
                    globalMaxValue = Math.max(globalMaxValue, baseP95, cyclingP95);
                  });
                }
              });
              
              const sharedAxisDomain = calculateAxisDomain(globalMaxValue);
              
              return baseData.map((baseRow, i) => {
              if (!baseRow || !baseRow.person_count) return null;
              const cyclingRow = cyclingData.find(d => d && d.group === baseRow.group);
              if (!cyclingRow || !cyclingRow.person_count) return null;
              
              const chartId = `melbourne-mode-shift-${baseRow.group.replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
              
              return (
                <Box 
                  key={i} 
                  id={chartId}
                  border="1px solid #ddd" 
                  borderRadius="4px" 
                  padding="1rem" 
                  marginTop="1rem"
                  position="relative"
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {groupBy === 'age' ? `${baseRow.group} years` : baseRow.group}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Population: {baseRow.person_count.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  {selectedModes.map(mode => {
                    const modeNames: {[key: string]: string} = { walk: 'Walk', bike: 'Bicycle', car: 'Car', pt: 'Public Transport' };
                    const baseMedian = baseRow[`avg_${mode}_mins_day_p50` as keyof DistributionData] as number;
                    const cyclingMedian = cyclingRow[`avg_${mode}_mins_day_p50` as keyof DistributionData] as number;
                    const medianChange = cyclingMedian - baseMedian;
                    
                    return (
                      <Typography key={mode} variant="body2" marginTop="0.5rem">
                        <strong>Median {modeNames[mode]} minutes per weekday:</strong> {baseMedian.toFixed(1)} → {cyclingMedian.toFixed(1)} min/weekday
                        <span style={{ color: medianChange > 0 ? '#2caa4a' : medianChange < 0 ? '#d32f2f' : '#666', fontWeight: 'bold' }}>
                          {' '}({medianChange > 0 ? '+' : ''}{medianChange.toFixed(1)} min)
                        </span>
                      </Typography>
                    );
                  })}
                  
                  {plotType === 'minutes' && renderDistributionPlot(baseRow, cyclingRow, sharedAxisDomain)}
                  {plotType === 'modeShare' && renderModeShareBars(baseRow, cyclingRow)}
                  
                  <Box position="absolute" bottom="0.5rem" right="0.5rem">
                    <DownloadChartAsPng elementId={chartId} />
                  </Box>
                </Box>
              );
            });
            })()}
          </div>
        ) : null}
      </div>
    </Box>
  );
}
