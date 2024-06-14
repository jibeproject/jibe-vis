import { Flex, View, Text, Heading} from '@aws-amplify/ui-react';
import './about.css';
// import SVGCard from './media';
import Diagram from './jibe_model_diagram';
import VideoCard from './media';
import { Box } from '@mui/material';
import { Card } from '@mui/material';
import { CardActionArea } from '@mui/material';

export function About() {
  return (
    <div>
    <Flex direction={{ base: 'column', large: 'row'}}>
      <View
        maxWidth={{ base: '100%', large: '30%'}}
        padding="1rem"
        >
          <Heading level={1} order={1}>JIBE-Vis</Heading>
          <Heading level={4}> An interactive platform to inform healthy transport planning policy and localised infrastructure interventions, and visualise the impacts of modelled transportation scenarios</Heading>
       </View>
      <View 
        padding={{ base: '1rem', large: '1rem'}}
        width="100%"
        >
          <Heading level={4}>About</Heading>
          <Text variation="primary">
          Through the JIBE project (Joining Impact models of transport with spatial measures of the Built Environment), we have developed agent-based transport simulation models (ABMs) capable of depicting complex urban systems.  These ABMs model how street-level built environment exposures influence behaviour, accessibility and health with high spatial and demographic granularity. By forecasting travel itineraries, behaviours, exposures, and health for a synthetic population of individuals, these ABMs allow us to simulate scenarios of interest to health and transport planners. However, the complexity of the models and their extensive, detailed outputs can be a barrier to effective knowledge translation and therefore impact.
          </Text>
          <Text variation="primary">
          We plan to engage government and advocacy stakeholders and researchers to co-develop an interactive platform with two related aims: 1. to make complex urban systems modelling evidence accessible and useful for informing healthy transport planning policy and localised infrastructure interventions; and 2. support visualising the impacts of modelled transportation scenarios.  We plan to publish the methods and visualisation platform developed through this work as open source code that can be adapted by other researchers and practitioners for new settings for translation of research evidence into practice.
          </Text>
          <Text>This web site provides illustrative examples of potential functionality that we could implement in an interactive tool to make transport and health modelling results from JIBE and similar projects accessible and useful. Through our engagement with stakeholders, we will incorporate and test new functionality that can help meet their needs and achieve this goal.  The website is being developed as open source software on <a href="https://github.com/jibeproject/jibe-vis" target="_blank">GitHub</a>.</Text>
          <Heading level={4}>Videos</Heading>
          <Text>We have prepared a series of videos that provide more details about the modelling methods and outputs used in the JIBE project.  An <a href="https://www.youtube.com/watch?v=ycDjPVjGhmg" title="Joining Impact models with spatial measures of the Built Environment (JIBE)IBE">edited version including subtitles</a> is available to view on YouTube, and the seperate video chapters have also been included below.</Text>
          {/* <center><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ycDjPVjGhmg?si=ed0XVauNegpzhik8" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe></center> */}
          <Flex
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            alignContent="flex-start"
            wrap="wrap"
            gap="1rem"
          >
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
              "Dr Belen Zapata-Diomedi explains the built environment exposure health models developed for the JIBE project.",
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
          </Flex>
        <Box mt={5}>
        <Heading level={4}>JIBE model output diagram</Heading>
        <Text>The conceptual diagram below illustrates the modelling approach taken in the JIBE project.</Text>
        <Card>
          <CardActionArea >
            {Diagram("")}
          </CardActionArea>
        </Card>
        </Box>
      </View>
      </Flex>   
    </div>
  );
}
