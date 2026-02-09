import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import outputs from '../../../amplify_outputs.json';
import { DownloadChartAsPng } from './graphs';

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
  const [selectedModes, setSelectedModes] = useState<string[]>(['bike']);
  const [plotType, setPlotType] = useState<'minutes' | 'modeShare'>('minutes');
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
      // Get CloudFront query URL from Amplify outputs (deployed) or env var (local dev)
      const lambdaUrl = (outputs as any)?.custom?.cloudFrontQueryUrl 
        || import.meta.env.VITE_ATHENA_QUERY_URL 
        || null;
      
      if (!lambdaUrl) {
        setLoading(false);
        return;
      }
      
      // Fetch distribution data for both scenarios
      const [baseResponse, cyclingResponse] = await Promise.all([
        fetch(`${lambdaUrl}?${new URLSearchParams({ topic: 'demographic_distribution', city: 'melbourne', scenario: 'base', group_by: groupBy })}`),
        fetch(`${lambdaUrl}?${new URLSearchParams({ topic: 'demographic_distribution', city: 'melbourne', scenario: 'cycling', group_by: groupBy })}`)
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

  const renderDistributionPlot = (base: DistributionData, cycling: DistributionData) => {
    const modeConfigs = {
      walk: { name: 'Walk', color: '#4caf50' },
      bike: { name: 'Bike', color: '#2196f3' },
      car: { name: 'Car', color: '#ff9800' },
      pt: { name: 'Public Transport', color: '#9e9e9e' }
    };
    
    const width = 600;
    const rowHeight = 60;
    const numRows = selectedModes.length * 2; // 2 rows per mode (base + cycling)
    const height = numRows * rowHeight + 60;
    const margin = { top: 10, right: 60, bottom: 30, left: 120 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    // Calculate max value across all selected modes
    let maxValue = 0;
    selectedModes.forEach(mode => {
      const baseP95 = base[`avg_${mode}_mins_day_p95` as keyof DistributionData] as number;
      const cyclingP95 = cycling[`avg_${mode}_mins_day_p95` as keyof DistributionData] as number;
      maxValue = Math.max(maxValue, baseP95, cyclingP95);
    });
    maxValue = maxValue * 1.1;
    
    const scale = (val: number) => (val / maxValue) * plotWidth;
    
    return (
      <svg width={width} height={height} style={{ marginTop: '1rem' }}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {selectedModes.map((mode, modeIndex) => {
            const config = modeConfigs[mode as keyof typeof modeConfigs];
            const yOffset = modeIndex * rowHeight * 2;
            
            const baseP5 = base[`avg_${mode}_mins_day_p5` as keyof DistributionData] as number;
            const baseP25 = base[`avg_${mode}_mins_day_p25` as keyof DistributionData] as number;
            const baseP50 = base[`avg_${mode}_mins_day_p50` as keyof DistributionData] as number;
            const baseP75 = base[`avg_${mode}_mins_day_p75` as keyof DistributionData] as number;
            const baseP95 = base[`avg_${mode}_mins_day_p95` as keyof DistributionData] as number;
            
            const cyclingP5 = cycling[`avg_${mode}_mins_day_p5` as keyof DistributionData] as number;
            const cyclingP25 = cycling[`avg_${mode}_mins_day_p25` as keyof DistributionData] as number;
            const cyclingP50 = cycling[`avg_${mode}_mins_day_p50` as keyof DistributionData] as number;
            const cyclingP75 = cycling[`avg_${mode}_mins_day_p75` as keyof DistributionData] as number;
            const cyclingP95 = cycling[`avg_${mode}_mins_day_p95` as keyof DistributionData] as number;
            
            return (
              <g key={mode}>
                {/* Mode label */}
                <text x="-10" y={yOffset + 25} fontSize="12" fontWeight="bold" textAnchor="end" fill="#333">
                  {config.name}
                </text>
                
                {/* Base scenario */}
                <g transform={`translate(0, ${yOffset + 15})`}>
                  <rect
                    x={scale(baseP25)}
                    y="-5"
                    width={Math.max(scale(baseP75) - scale(baseP25), 1)}
                    height="10"
                    fill="#9e9e9e"
                    opacity="0.4"
                  />
                  <circle cx={scale(baseP50)} cy="0" r="3" fill="#424242" />
                  <line x1={scale(baseP5)} y1="0" x2={scale(baseP25)} y2="0" stroke="#757575" strokeWidth="1" />
                  <line x1={scale(baseP75)} y1="0" x2={scale(baseP95)} y2="0" stroke="#757575" strokeWidth="1" />
                  <text x="-65" y="4" fontSize="10" textAnchor="end" fill="#666">Base</text>
                </g>
                
                {/* Cycling scenario */}
                <g transform={`translate(0, ${yOffset + 45})`}>
                  <rect
                    x={scale(cyclingP25)}
                    y="-5"
                    width={Math.max(scale(cyclingP75) - scale(cyclingP25), 1)}
                    height="10"
                    fill={config.color}
                    opacity="0.4"
                  />
                  <circle cx={scale(cyclingP50)} cy="0" r="3" fill={config.color} />
                  <line x1={scale(cyclingP5)} y1="0" x2={scale(cyclingP25)} y2="0" stroke={config.color} strokeWidth="1" />
                  <line x1={scale(cyclingP75)} y1="0" x2={scale(cyclingP95)} y2="0" stroke={config.color} strokeWidth="1" />
                  <text x="-65" y="4" fontSize="10" textAnchor="end" fill="#2caa4a">Cycling</text>
                </g>
              </g>
            );
          })}
          
          {/* X-axis */}
          <g transform={`translate(0, ${plotHeight})`}>
            <line x1="0" y1="0" x2={plotWidth} y2="0" stroke="#333" />
            {Array.from({ length: 6 }, (_, i) => i * (maxValue / 5)).map(val => (
              <g key={val} transform={`translate(${scale(val)}, 0)`}>
                <line y1="0" y2="5" stroke="#333" />
                <text y="18" fontSize="10" textAnchor="middle">{val.toFixed(0)}</text>
              </g>
            ))}
            <text x={plotWidth / 2} y="28" fontSize="11" textAnchor="middle">minutes per weekday</text>
          </g>
        </g>
      </svg>
    );
  };

  const renderModeShareBars = (base: DistributionData, cycling: DistributionData) => {
    const modes = [
      { name: 'Walk', base: base.walk_share * 100, cycling: cycling.walk_share * 100, color: '#4caf50' },
      { name: 'Bike', base: base.bike_share * 100, cycling: cycling.bike_share * 100, color: '#2196f3' },
      { name: 'Car', base: base.car_share * 100, cycling: cycling.car_share * 100, color: '#ff9800' },
      { name: 'Public transport', base: base.pt_share * 100, cycling: cycling.pt_share * 100, color: '#9e9e9e' }
    ];
    
    return (
      <Box marginTop="1rem">
        <Typography variant="body2" fontWeight="bold">Mode Share</Typography>
        {modes.map(mode => (
          <Box key={mode.name} marginBottom="1rem">
            <Typography variant="body2" fontWeight="normal" marginBottom="0.5rem">{mode.name}</Typography>
            <Box display="flex" alignItems="center" gap="0.5rem" marginBottom="0.25rem">
              <Typography variant="caption" width="60px" color="text.secondary">Base</Typography>
              <Box 
                height="24px" 
                bgcolor={mode.color} 
                width={`${mode.base}%`} 
                minWidth="2px" 
                sx={{ opacity: 0.6 }} 
                display="flex" 
                alignItems="center" 
                paddingLeft="4px"
              >
                <Typography variant="caption" fontWeight="bold">{mode.base.toFixed(1)}%</Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap="0.5rem">
              <Typography variant="caption" width="60px" color="#2caa4a">Cycling</Typography>
              <Box 
                height="24px" 
                bgcolor={mode.color} 
                width={`${mode.cycling}%`} 
                minWidth="2px" 
                display="flex" 
                alignItems="center" 
                paddingLeft="4px"
              >
                <Typography variant="caption" fontWeight="bold">{mode.cycling.toFixed(1)}%</Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box maxWidth="md" width="100%" margin="1rem auto">
      <Typography variant="h6">
        Melbourne Transport and Health: Baseline vs Cycling Intervention
      </Typography>
      
      <Typography variant="body2" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        Comparison of average weekday transport time and mode share between 2018 baseline and cycling intervention scenarios.
      </Typography>
      
      <Box display="flex" gap="2rem" marginBottom="1rem" flexWrap="wrap">
        <Typography variant="body2">
          Mode:&nbsp;
          <select 
            className="responsive-select" 
            multiple
            value={selectedModes}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions, option => option.value);
              if (options.length > 0) {
                setSelectedModes(options);
              }
            }}
            style={{ height: '80px', verticalAlign: 'top' }}
          >
            <option value="walk">Walk</option>
            <option value="bike">Bike</option>
            <option value="car">Car</option>
            <option value="pt">Public Transport</option>
          </select>
        </Typography>
        
        <Typography variant="body2">
          Plot:&nbsp;
          <select 
            className="responsive-select" 
            value={plotType}
            onChange={(e) => setPlotType(e.target.value as 'minutes' | 'modeShare')}
          >
            <option value="minutes">Minutes per weekday</option>
            <option value="modeShare">Mode share</option>
          </select>
        </Typography>
        
        <Typography variant="body2">
          Grouped by:&nbsp;
          <select 
            className="responsive-select" 
            value={groupBy} 
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="Overall">Overall</option>
            <option value="gender">Gender</option>
            <option value="age">Age</option>
            <option value="occupation">Occupation</option>
          </select>
        </Typography>
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
            {baseData.map((baseRow, i) => {
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
                    <Typography variant="subtitle1" fontWeight="bold">{baseRow.group}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Population: {baseRow.person_count.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  {selectedModes.map(mode => {
                    const modeNames: {[key: string]: string} = { walk: 'Walk', bike: 'Bike', car: 'Car', pt: 'Public Transport' };
                    const baseMedian = baseRow[`avg_${mode}_mins_day_p50` as keyof DistributionData] as number;
                    const cyclingMedian = cyclingRow[`avg_${mode}_mins_day_p50` as keyof DistributionData] as number;
                    const medianChange = cyclingMedian - baseMedian;
                    
                    return (
                      <Typography key={mode} variant="body2" marginTop="0.5rem">
                        <strong>Median {modeNames[mode]}:</strong> {baseMedian.toFixed(1)} → {cyclingMedian.toFixed(1)} min/weekday
                        <span style={{ color: medianChange > 0 ? '#2caa4a' : medianChange < 0 ? '#d32f2f' : '#666', fontWeight: 'bold' }}>
                          {' '}({medianChange > 0 ? '+' : ''}{medianChange.toFixed(1)} min)
                        </span>
                      </Typography>
                    );
                  })}
                  
                  {plotType === 'minutes' && renderDistributionPlot(baseRow, cyclingRow)}
                  {plotType === 'modeShare' && renderModeShareBars(baseRow, cyclingRow)}
                  
                  <Box position="absolute" bottom="0.5rem" right="0.5rem">
                    <DownloadChartAsPng elementId={chartId} />
                  </Box>
                </Box>
              );
            })}
          </div>
        ) : null}
      </div>
    </Box>
  );
}
