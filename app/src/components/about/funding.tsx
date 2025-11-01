
import { Flex, View, Text } from '@aws-amplify/ui-react';
import Link from '@mui/material/Link';
import { logo_AWS, logo_RMIT, logo_VH } from './logos/logos';
import { Section } from '../section';

export function Funding() {
  return (
    
    <Section
    stub="about"
    section='funding'
    heading="Funding"
    subheading=""
    subtext=""
    default_view={true}
    content={
      <>
           <Text>We gratefully acknowledge funding and resources provided through a 2023 VicHealth Impact Research Grant (<Link href="https://www.vichealth.vic.gov.au/funding/impact-research-grants#2023-impact-research-grant-recipients-19356">Developing tools for knowledge translation in transport and health modelling</Link>), and through <Link href="https://www.rmit.edu.au/partner/hubs/race">RMIT AWS Supercomputing Hub (RACE Hub)</Link> grants RMAS00013,  CIC00014, and RMIT Engaging Impact Platforms.</Text>
      
           <Flex
            direction={{ base: 'column', large: 'row'}}
            alignItems='center'
            marginTop={16}
            id="logos-institutional"
        >
            <View margin={16}>{logo_VH(50)}</View>
            <View margin={16}>{logo_RMIT(50)}</View>
            <View margin={16}>{logo_AWS(50)}</View>
        </Flex>
      </>
    }
    />
  );
}

