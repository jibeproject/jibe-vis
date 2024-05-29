import { Flex, View, Heading} from '@aws-amplify/ui-react';
import { DataCitations } from './citations';

export function Data() {
    return (
      <div>
      <Flex direction={{ base: 'column', large: 'row'}}>
        <View
          maxWidth={{ base: '100%', large: '30%'}}
          padding="1rem"
          >
            <Heading level={1} order={1}>JIBE Data</Heading>
            <Heading level={4}> An example list of data and options for download. Click on a record for more information.</Heading>
         </View>
         <View>
         <Flex direction='column'>
          {/* DataCitations takes string arguments: title, description, formats, citation, licence, url */}
            { DataCitations("Melbourne street network (example research output placeholder with external URL)","Data outputs from the JIBE 20 minute neighbourhood intervention. The intervention has two components: 1) the destination component, in which new amenities and services are added to locations in and around defined activity centres ('ACs') and utilisation levels are evaluated; 2) the cycling component, which evaluates the impact of reducing vehicle speed limits to 40km/h on residential streets on cycling uptake.", "XLSX, CSV, GPKG", "Pemberton S, Zapata-Diomedi B, Giles-Corti B, Saghapour T, Both A, Abdollahyar M, et al. JIBE 20 Minute Melbourne Scenario Impacts.  Melbourne: RMIT University, JIBE Project; 2024.", "ODbL","https://github.com/jibeproject/20mnMelbourne")}
            { DataCitations("Another output example without URL (not ideal, but this is what it looks like)","Data outputs from the JIBE 20 minute neighbourhood intervention. The intervention has two components: 1) the destination component, in which new amenities and services are added to locations in and around defined activity centres ('ACs') and utilisation levels are evaluated; 2) the cycling component, which evaluates the impact of reducing vehicle speed limits to 40km/h on residential streets on cycling uptake.", "XLSX, CSV, GPKG", "Pemberton S, Zapata-Diomedi B, Giles-Corti B, Saghapour T, Both A, Abdollahyar M, et al. JIBE 20 Minute Melbourne Scenario Impacts.  Melbourne: RMIT University, JIBE Project; 2024.", "ODbL","")}
            </Flex>
        </View>
        </Flex>
      </div>
    );
  }