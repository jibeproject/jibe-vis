import { Flex, View, Text, Heading} from '@aws-amplify/ui-react';
import './about.css';
// import SVGCard from './media';
import jibeDiagram from '../jibe_model_diagram';
import { Roadmap } from './roadmap'
import { Videos } from '../videos'
import { Features } from './features'
import { TransportHealthImpacts } from '../vis/transporthealthimpacts.tsx';

// import { JibeLines } from './jibelines'
// import { Box } from '@mui/material';
// import { Card } from '@mui/material';
// import { CardActionArea } from '@mui/material';

// const strokeLength = 8959;
// const scrollElem = document.querySelector('.svgscroll');
// const scrollSvg = document.querySelector('.svgscroll__svg path') as SVGPathElement;

// function svgScroll() {
//   if (scrollElem && scrollSvg) {
//     let scrollHeight = scrollElem.clientHeight;
//     let winHeight = window.innerHeight;
//     let calcHeight = scrollHeight - winHeight;
//     let scroll = window.scrollY;
//     let scrollPercent = scroll / calcHeight
//     scrollSvg.style.strokeDashoffset = `${strokeLength - (strokeLength * scrollPercent)}`;
//   }
// }

// window.addEventListener('scroll', function() {
//   svgScroll();
// });

export function About() {
  return (
    <div>
    <Flex direction={{ base: 'column', large: 'row'}}>
      <View  
        // minWidth={'570px'}
        maxWidth={{ base: '100%', large: '570px'}}
        padding="1rem"
        >
          {TransportHealthImpacts("515","308")}
          {/* <Heading level={1} order={1}>Transport & Health Impacts</Heading> */}
          <Heading level={4}> An interactive platform to inform healthy transport planning policy and localised infrastructure interventions, and visualise the impacts of modelled transportation scenarios</Heading>
          {/* <JibeLines/> */}
       </View>
      <View 
        padding={{ base: '1rem', large: '1rem'}}
        width="100%"
        marginTop={16}
        >
          {/* <Heading level={4}>About</Heading> */}
          <Text variation="primary">
          Through the JIBE project (Joining Impact models of transport with spatial measures of the Built Environment), we have developed agent-based transport simulation models (ABMs) capable of depicting complex urban systems.  These ABMs model how street-level built environment exposures influence behaviour, accessibility and health with high spatial and demographic granularity. By forecasting travel itineraries, behaviours, exposures, and health for a synthetic population of individuals, these ABMs allow us to simulate scenarios of interest to health and transport planners. However, the complexity of the models and their extensive, detailed outputs can be a barrier to effective knowledge translation and therefore impact.
          </Text>
          <Text variation="primary">
          We plan to engage government and advocacy stakeholders and researchers to co-develop an interactive platform with two related aims: 1. to make complex urban systems modelling evidence accessible and useful for informing healthy transport planning policy and localised infrastructure interventions; and 2. support visualising the impacts of modelled transportation scenarios.  We plan to publish the methods and visualisation platform developed through this work as open source code that can be adapted by other researchers and practitioners for new settings for translation of research evidence into practice.
          </Text>
          <Text>This web site provides illustrative examples of potential functionality that we could implement in an interactive tool to make transport and health modelling results from JIBE and similar projects accessible and useful. Through our engagement with stakeholders, we will incorporate and test new functionality that can help meet their needs and achieve this goal.  The website is being developed as open source software on <a href="https://github.com/jibeproject/jibe-vis" target="_blank">GitHub</a>.</Text>
      </View>
      </Flex>
      {jibeDiagram()}
      {Videos()}
      <Roadmap/>
      <Features/>
    </div>
  );
}
