
import Typography from '@mui/material/Typography';
import Stack from "@mui/material/Stack";
import Link from '@mui/material/Link';
import { TransportHealthImpacts } from './vis/transporthealthimpacts.tsx';
import { Ampersand } from './vis/transporthealthimpacts.tsx';

export function Intro() {
  return (
    
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="center"
      alignItems="center"
      sx={{ width: 1, height: "90vh", overflow: 'hidden' }}
    >
          {TransportHealthImpacts("800","1076")}
          <Stack
      direction="column"
      padding="1rem">
          <Typography id="pitch" variant="h4" gutterBottom> An interactive platform to inform healthy transport planning policy and localised infrastructure interventions, and visualise the impact pathways of modelled transportation scenarios.</Typography>
          <Typography id="sub-pitch" variant="h6" gutterBottom><Link href="about/">Find out more</Link>, or view our gallery of transport health impact <Link href="pathways/">pathways</Link>.</Typography>
          </Stack>
          {Ampersand()}

    </Stack>
  );
}
