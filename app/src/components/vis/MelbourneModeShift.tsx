import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import outputs from '../../../amplify_outputs.json';
import { DownloadChartAsPng } from './graphs';

interface DistributionData {
  group: string;
  person_count: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  walk_share: number;
  bike_share: number;
  car_share: number;
}

interface MelbourneModeShiftProps {
  open?: boolean;
  onClose?: () => void;
}

export function MelbourneModeShift({ open = true, onClose = () => {} }: MelbourneModeShiftProps = {}) {
  const [groupBy, setGroupBy] = useState('gender');
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
        setBaseData(getPlaceholderDistribution('base', groupBy));
        setCyclingData(getPlaceholderDistribution('cycling', groupBy));
        setError('Using example data - Lambda function not yet deployed');
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
          group: formatDemographicGroup(row.demographic_group, groupBy),
          person_count: row.person_count,
          p5: row.p5,
          p25: row.p25,
          p50: row.p50,
          p75: row.p75,
          p95: row.p95,
          walk_share: row.walk_share,
          bike_share: row.bike_share,
          car_share: row.car_share
        }));
      };
      
      setBaseData(mapData(baseResult));
      setCyclingData(mapData(cyclingResult));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data, loading example data:', err);
      setBaseData(getPlaceholderDistribution('base', groupBy));
      setCyclingData(getPlaceholderDistribution('cycling', groupBy));
      setError(`Using example data - ${err instanceof Error ? err.message : 'Failed to fetch data'}`);
      setLoading(false);
    }
  };

  const formatDemographicGroup = (value: string | number, groupType: string): string => {
    const strValue = String(value);
    
    if (groupType === 'gender') {
      switch (strValue) {
        case '1':
          return 'Male';
        case '2':
          return 'Female';
        default:
          return strValue;
      }
    }
    
    if (groupType === 'occupation') {
      switch (strValue) {
        case '0':
          return 'Toddler';
        case '1':
          return 'Employed';
        case '2':
          return 'Unemployed';
        case '3':
          return 'Student';
        case '4':
          return 'Retiree';
        default:
          return strValue;
      }
    }
    
    return strValue;
  };

  const getPlaceholderDistribution = (scenario: string, group: string): DistributionData[] => {
    const shift = scenario === 'cycling' ? 1.5 : 0;
    
    const generatePercentiles = (base: number, spread: number) => ({
      p5: Math.max(0, base + shift - spread * 0.8),
      p25: Math.max(0, base + shift - spread * 0.4),
      p50: base + shift,
      p75: base + shift + spread * 0.4,
      p95: base + shift + spread * 0.8
    });

    if (group === 'gender') {
      return [
        { group: 'Female', person_count: 2450000, ...generatePercentiles(6.5, 3.2), 
          walk_share: scenario === 'cycling' ? 0.18 : 0.15, bike_share: scenario === 'cycling' ? 0.08 : 0.03, car_share: scenario === 'cycling' ? 0.62 : 0.70 },
        { group: 'Male', person_count: 2380000, ...generatePercentiles(7.1, 3.5), 
          walk_share: scenario === 'cycling' ? 0.16 : 0.14, bike_share: scenario === 'cycling' ? 0.10 : 0.04, car_share: scenario === 'cycling' ? 0.60 : 0.68 }
      ];
    } else if (group === 'age') {
      return [
        { group: '18-34', person_count: 1520000, ...generatePercentiles(7.8, 4.0), 
          walk_share: scenario === 'cycling' ? 0.22 : 0.18, bike_share: scenario === 'cycling' ? 0.12 : 0.05, car_share: scenario === 'cycling' ? 0.55 : 0.65 },
        { group: '35-54', person_count: 1680000, ...generatePercentiles(6.4, 3.0), 
          walk_share: scenario === 'cycling' ? 0.15 : 0.13, bike_share: scenario === 'cycling' ? 0.08 : 0.03, car_share: scenario === 'cycling' ? 0.65 : 0.72 },
        { group: '55+', person_count: 1630000, ...generatePercentiles(5.9, 2.8), 
          walk_share: scenario === 'cycling' ? 0.16 : 0.14, bike_share: scenario === 'cycling' ? 0.06 : 0.02, car_share: scenario === 'cycling' ? 0.63 : 0.70 }
      ];
    } else {
      return [
        { group: 'Employed', person_count: 2850000, ...generatePercentiles(6.6, 3.2), 
          walk_share: scenario === 'cycling' ? 0.16 : 0.14, bike_share: scenario === 'cycling' ? 0.09 : 0.03, car_share: scenario === 'cycling' ? 0.63 : 0.71 },
        { group: 'Student', person_count: 680000, ...generatePercentiles(8.2, 4.2), 
          walk_share: scenario === 'cycling' ? 0.25 : 0.20, bike_share: scenario === 'cycling' ? 0.14 : 0.06, car_share: scenario === 'cycling' ? 0.48 : 0.60 },
        { group: 'Retired', person_count: 920000, ...generatePercentiles(5.4, 2.5), 
          walk_share: scenario === 'cycling' ? 0.18 : 0.15, bike_share: scenario === 'cycling' ? 0.05 : 0.02, car_share: scenario === 'cycling' ? 0.60 : 0.68 },
        { group: 'Unemployed', person_count: 380000, ...generatePercentiles(5.9, 2.9), 
          walk_share: scenario === 'cycling' ? 0.20 : 0.17, bike_share: scenario === 'cycling' ? 0.07 : 0.03, car_share: scenario === 'cycling' ? 0.58 : 0.66 }
      ];
    }
  };

  const renderDistributionPlot = (base: DistributionData, cycling: DistributionData) => {
    const width = 600;
    const height = 120;
    const margin = { top: 10, right: 60, bottom: 30, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    const maxValue = Math.max(base.p95, cycling.p95, 8.75) * 1.1;
    const scale = (val: number) => (val / maxValue) * plotWidth;
    
    return (
      <svg width={width} height={height} style={{ marginTop: '1rem' }}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Base scenario */}
          <g transform="translate(0, 15)">
            {/* IQR box */}
            <rect
              x={scale(base.p25)}
              y="-5"
              width={scale(base.p75) - scale(base.p25)}
              height="10"
              fill="#9e9e9e"
              opacity="0.4"
            />
            {/* Median */}
            <circle cx={scale(base.p50)} cy="0" r="3" fill="#424242" />
            {/* Whiskers */}
            <line x1={scale(base.p5)} y1="0" x2={scale(base.p25)} y2="0" stroke="#757575" strokeWidth="1" />
            <line x1={scale(base.p75)} y1="0" x2={scale(base.p95)} y2="0" stroke="#757575" strokeWidth="1" />
            <text x="-10" y="4" fontSize="11" textAnchor="end" fill="#666">Base</text>
          </g>
          
          {/* Cycling scenario */}
          <g transform="translate(0, 55)">
            <rect
              x={scale(cycling.p25)}
              y="-5"
              width={scale(cycling.p75) - scale(cycling.p25)}
              height="10"
              fill="#2caa4a"
              opacity="0.4"
            />
            <circle cx={scale(cycling.p50)} cy="0" r="3" fill="#2caa4a" />
            <line x1={scale(cycling.p5)} y1="0" x2={scale(cycling.p25)} y2="0" stroke="#2caa4a" strokeWidth="1" />
            <line x1={scale(cycling.p75)} y1="0" x2={scale(cycling.p95)} y2="0" stroke="#2caa4a" strokeWidth="1" />
            <text x="-10" y="4" fontSize="11" textAnchor="end" fill="#2caa4a">Cycling</text>
          </g>
          
          {/* WHO reference */}
          <line x1={scale(8.75)} y1="0" x2={scale(8.75)} y2={plotHeight} stroke="#ff9800" strokeWidth="1.5" strokeDasharray="3,3" />
          <text x={scale(8.75)} y="-2" fontSize="10" fill="#ff9800" textAnchor="middle">WHO</text>
          
          {/* X-axis */}
          <g transform={`translate(0, ${plotHeight})`}>
            <line x1="0" y1="0" x2={plotWidth} y2="0" stroke="#333" />
            {[0, 2, 4, 6, 8, 10, 12].map(val => (
              <g key={val} transform={`translate(${scale(val)}, 0)`}>
                <line y1="0" y2="5" stroke="#333" />
                <text y="18" fontSize="10" textAnchor="middle">{val}</text>
              </g>
            ))}
            <text x={plotWidth / 2} y="28" fontSize="11" textAnchor="middle">mMET-hours/week</text>
          </g>
        </g>
      </svg>
    );
  };

  const renderModeShareBars = (base: DistributionData, cycling: DistributionData) => {
    const modes = [
      { name: 'Walk', base: base.walk_share * 100, cycling: cycling.walk_share * 100, color: '#4caf50' },
      { name: 'Bike', base: base.bike_share * 100, cycling: cycling.bike_share * 100, color: '#2196f3' },
      { name: 'Car', base: base.car_share * 100, cycling: cycling.car_share * 100, color: '#ff9800' }
    ];
    
    return (
      <Box display="flex" gap="1.5rem" marginTop="1rem">
        {modes.map(mode => (
          <Box key={mode.name} flex={1}>
            <Typography variant="body2" fontWeight="bold">{mode.name}</Typography>
            <Box display="flex" gap="0.5rem" marginTop="0.25rem">
              <Box flex={1}>
                <Typography variant="caption" color="text.secondary">Base</Typography>
                <Box 
                  height="20px" 
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
              <Box flex={1}>
                <Typography variant="caption" color="#2caa4a">Cycling</Typography>
                <Box 
                  height="20px" 
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
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Typography variant="h6">
          Melbourne Transport and Health: Baseline vs Cycling Intervention
        </Typography>
        
        <Typography variant="body2" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          Comparison of physical activity distributions and mode share between 2018 baseline and cycling intervention scenarios.
        </Typography>
        
        <Typography variant="body2">
          Grouped by:&nbsp;
          <select 
            className="responsive-select" 
            value={groupBy} 
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="gender">Gender</option>
            <option value="age">Age</option>
            <option value="occupation">Occupation</option>
          </select>
        </Typography>

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
                
                const medianChange = cyclingRow.p50 - baseRow.p50;
                
                return (
                  <Box 
                    key={i} 
                    border="1px solid #ddd" 
                    borderRadius="4px" 
                    padding="1rem" 
                    marginTop="1rem"
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">{baseRow.group}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Population: {baseRow.person_count.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" marginTop="0.5rem">
                      <strong>Median Physical Activity:</strong> {baseRow.p50.toFixed(2)} → {cyclingRow.p50.toFixed(2)} mMET-hours/week 
                      <span style={{ color: medianChange > 0 ? '#2caa4a' : '#d32f2f', fontWeight: 'bold' }}>
                        {' '}({medianChange > 0 ? '+' : ''}{medianChange.toFixed(2)}, {((medianChange / baseRow.p50) * 100).toFixed(1)}%)
                      </span>
                    </Typography>
                    
                    {renderDistributionPlot(baseRow, cyclingRow)}
                    {renderModeShareBars(baseRow, cyclingRow)}
                  </Box>
                );
              })}
            </div>
          ) : null}
        </div>
      </DialogContent>
      
      <DialogActions>
        <DownloadChartAsPng elementId="melbourne-mode-shift-charts" />
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
