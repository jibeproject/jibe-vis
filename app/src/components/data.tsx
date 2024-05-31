import { Flex, View, Heading} from '@aws-amplify/ui-react';
import { DataCitations } from './citations';
import VideoCard from './video';

export function Data() {
    return (
      <section id="get-the-data">
      <Flex direction={{ base: 'column', large: 'row'}}>
        <View
          maxWidth={{ base: '100%', large: '30%'}}
          padding="1rem"
          >
            <Heading level={1} order={1}>JIBE Resources</Heading>
            <Heading level={4}> An example list of data and options for download. Click on a record for more information.</Heading>
         </View>
         <View>
         <Flex direction='column'>
          <Flex>
            <Heading level={4}> Videos</Heading>
            <View>
          {VideoCard("https://d1txe6hhqa9d2l.cloudfront.net/videos/20mn%20neighbourhood%20video.mp4","Local accessibility: Melbourne 20-minute neighbourhood scenario","Steve Pemberton describes the modelling of interventions exploring impacts of the Plan Melbourne 20-minute neighbourhoods policy on walking and cycling uptake.",'','')}
          </View>
          </Flex>
          <Flex>
          <Heading level={4}> Data</Heading>
          <View>
          {/* DataCitations takes string arguments: title, description, formats, citation, licence, url */}
            { DataCitations("JIBE 20 Minute Melbourne Scenario Impacts","Data outputs from the JIBE 20 minute neighbourhood intervention. The intervention has two components: 1) the destination component, in which new amenities and services are added to locations in and around defined activity centres to evaluate accessibility and utilisation levels; 2) the cycling component, which evaluates the impact of reducing vehicle speed limits to 40km/h or 30km/h on residential streets.", "CSV, XLSX, RDS, SQLITE", "Pemberton S, Zapata-Diomedi B, Giles-Corti B, Saghapour T, Both A, Abdollahyar M, et al. JIBE 20 Minute Melbourne Scenario Impacts.  Melbourne: RMIT University, JIBE Project; 2024.", "ODbL","https://github.com/jibeproject/20mnMelbourne")}
            { DataCitations("Another output example without URL (not ideal, but this is what it looks like)","Data outputs from the JIBE 20 minute neighbourhood intervention. The intervention has two components: 1) the destination component, in which new amenities and services are added to locations in and around defined activity centres ('ACs') and utilisation levels are evaluated; 2) the cycling component, which evaluates the impact of reducing vehicle speed limits to 40km/h on residential streets on cycling uptake.", "XLSX, CSV, GPKG", "Pemberton S, Zapata-Diomedi B, Giles-Corti B, Saghapour T, Both A, Abdollahyar M, et al. JIBE 20 Minute Melbourne Scenario Impacts.  Melbourne: RMIT University, JIBE Project; 2024.", "ODbL","")}
            </View>
            </Flex>
            </Flex>
        </View>
        </Flex>
        </section>
    );
  }