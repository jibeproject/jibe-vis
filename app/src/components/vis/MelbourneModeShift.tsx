import { useEffect, useState } from 'react';
import { Flex, Heading, SelectField, Text, Card } from '@aws-amplify/ui-react';

interface DistributionData {
  group: string;
  person_count: number;
  p0: number; p5: number; p10: number; p15: number; p20: number;
  p25: number; p30: number; p35: number; p40: number; p45: number;
  p50: number; p55: number; p60: number; p65: number; p70: number;
  p75: number; p80: number; p85: number; p90: number; p95: number; p100: number;
  walk_share: number;
  bike_share: number;
  car_share: number;
}

export function MelbourneModeShift() {
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
      const lambdaUrl = import.meta.env.VITE_ATHENA_QUERY_URL || 'DEPLOY_FIRST';
      
      if (lambdaUrl === 'DEPLOY_FIRST') {
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
      
      const [baseResult, cyclingResult] = await Promise.all([
        baseResponse.json(),
        cyclingResponse.json()
      ]);
      
      const parseData = (result: any) => {
        const rows = JSON.parse(result);
        const headers = rows[0].Data.map((d: any) => d.VarCharValue);
        return rows.slice(1).map((row: any) => {
          const obj: any = {};
          row.Data.forEach((cell: any, i: number) => {
            obj[headers[i]] = cell.VarCharValue;
          });
          return obj;
        });
      };
      
      setBaseData(parseData(baseResult));
      setCyclingData(parseData(cyclingResult));
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setLoading(false);
    }
  };

  const getPlaceholderDistribution = (scenario: string, group: string): DistributionData[] => {
    const shift = scenario === 'cycling' ? 1.5 : 0;
    
    const generatePercentiles = (base: number, spread: number) => {
      const percentiles = [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];
      return percentiles.reduce((acc, p) => {
        const z = (p - 50) / 30; // Normalize around median
        acc[`p${p}`] = Math.max(0, base + shift + z * spread);
        return acc;
      }, {} as any);
    };

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
    
    const maxValue = Math.max(base.p100, cycling.p100, 8.75) * 1.1;
    const scale = (val: number) => (val / maxValue) * plotWidth;
    
    const percentiles = [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];
    const baseValues = percentiles.map(p => base[`p${p}` as keyof DistributionData] as number);
    const cyclingValues = percentiles.map(p => cycling[`p${p}` as keyof DistributionData] as number);
    
    return (
      <svg width={width} height={height} style={{ marginTop: '1rem' }}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Base scenario */}
          <g transform="translate(0, 15)">
            {/* Density curve */}
            <path
              d={`M ${baseValues.map((v, i) => `${scale(v)},${i * 0.8}`).join(' L ')}`}
              fill="none"
              stroke="#757575"
              strokeWidth="1.5"
              opacity="0.4"
            />
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
            <path
              d={`M ${cyclingValues.map((v, i) => `${scale(v)},${i * 0.8}`).join(' L ')}`}
              fill="none"
              stroke="#2caa4a"
              strokeWidth="1.5"
              opacity="0.5"
            />
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
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
        {modes.map(mode => (
          <div key={mode.name} style={{ flex: 1 }}>
            <Text fontSize="0.875rem" fontWeight="bold">{mode.name}</Text>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>Base</div>
                <div style={{ height: '20px', backgroundColor: mode.color, width: `${mode.base}%`, minWidth: '2px', opacity: 0.6, display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{mode.base.toFixed(1)}%</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: '#2caa4a' }}>Cycling</div>
                <div style={{ height: '20px', backgroundColor: mode.color, width: `${mode.cycling}%`, minWidth: '2px', display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{mode.cycling.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Flex direction="column" gap="1rem" padding="2rem" maxWidth="1400px">
      <Heading level={2}>Melbourne Transport and Health: Baseline vs Cycling Intervention</Heading>
      
      <Text>
        Comparison of physical activity distributions and mode share between 2018 baseline and cycling intervention scenarios. 
        Box plots show median (dot), interquartile range (box), 5th-95th percentile (whiskers), and distribution shape (curve).
      </Text>
      
      <SelectField
        label="Group By"
        value={groupBy}
        onChange={(e) => setGroupBy(e.target.value)}
        width="200px"
      >
        <option value="gender">Gender</option>
        <option value="age">Age</option>
        <option value="occupation">Occupation</option>
      </SelectField>

      {loading && <Text>Loading...</Text>}
      {error && <Card variation="outlined" backgroundColor="#fff3cd" padding="0.5rem"><Text color="#856404">{error}</Text></Card>}
      
      {!loading && baseData.length > 0 && cyclingData.length > 0 && (
        <Flex direction="column" gap="1.5rem">
          {baseData.map((baseRow, i) => {
            const cyclingRow = cyclingData.find(d => d.group === baseRow.group);
            if (!cyclingRow) return null;
            
            const medianChange = cyclingRow.p50 - baseRow.p50;
            
            return (
              <Card key={i} variation="outlined" padding="1rem">
                <Flex direction="row" justifyContent="space-between" alignItems="center">
                  <Heading level={4}>{baseRow.group}</Heading>
                  <Text fontSize="0.875rem" color="#666">
                    Population: {baseRow.person_count.toLocaleString()}
                  </Text>
                </Flex>
                
                <Text fontSize="0.875rem" marginTop="0.5rem">
                  <strong>Median Physical Activity:</strong> {baseRow.p50.toFixed(2)} → {cyclingRow.p50.toFixed(2)} mMET-hours/week 
                  <span style={{ color: medianChange > 0 ? '#2caa4a' : '#d32f2f', fontWeight: 'bold' }}>
                    {' '}({medianChange > 0 ? '+' : ''}{medianChange.toFixed(2)}, {((medianChange / baseRow.p50) * 100).toFixed(1)}%)
                  </span>
                </Text>
                
                {renderDistributionPlot(baseRow, cyclingRow)}
                {renderModeShareBars(baseRow, cyclingRow)}
              </Card>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
}
