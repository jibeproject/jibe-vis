import { Flex, View, Heading} from '@aws-amplify/ui-react';
import { DataCitations } from './citations';
import VideoCard from './video';
import { ImageList } from '@mui/material';

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
            <ImageList cols={3} gap={20}>
          {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/introduction%20video.mp4",
            "Joining Impact models of transport with spatial measures of the Built Environment (JIBE): Modelling methods and outputs",
            "Dr Belen Zapata-Diomedi provides an introduction to the Joining Impact models of transport with spatial measures of the Built Environment (JIBE) project.",
            '',
            '')}
          {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/agent%20based%20transport%20model%20and%20exposure_video.mp4",
            "Agent-based transport model and exposures",
            "Dr Qin Zhang introduces the agent-based transport model and exposure simulations developed for evaluating the impact of urban design and transport interventions in Melbourne, Australia.",
            '',
            '')}
          {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/spatial%20data%20melbourne.mp4",
            "Geodatabase for Melbourne Land use and Transport",
            "Corin Staves introduces the geographic resources developed for modelling the built environment and transport in Greater Melbourne.",
            '',
            '')}
          {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/health%20models%20video.mp4",
            "JIBE health model",
            "Dr Belen Zapata-Diomedi.",
            '',
            '')}
          {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/20mn%20neighbourhood%20video.mp4",
            "Local accessibility: Melbourne 20-minute neighbourhood scenario",
            "Steve Pemberton describes the modelling of interventions exploring impacts of the Plan Melbourne 20-minute neighbourhoods policy on walking and cycling uptake.",
            '',
            '')}
            {VideoCard(
              "https://d1txe6hhqa9d2l.cloudfront.net/videos/cycling%20intervention%20video.mp4",
              "Cycling intervention: a comparison of two cycling scenarios in Greater Melbourne",
              "Mahsa Abdollahyar introduces the spatial outputs modelled for cycling scenarios relating to latent demand and equity in Melbourne.",
              '',
              '')}
          </ImageList>
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