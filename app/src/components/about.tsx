import { Flex, View, Text, Heading} from '@aws-amplify/ui-react';
import './about.css';

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
          <Text variation="primary">
          Interventions to improve equity in access to urban environments that promote physically active transportation modes, such as walking and cycling, have become priorities for cities globally. Policymakers, health advocates and other stakeholders broadly recognise the benefits of active travel for human and planetary health, along with economic and social co-benefits. However, effective implementation of targeted interventions requires detailed consideration of complex urban systems scenarios applied to local contexts. This is essential to achieve positive outcomes that reduce  inequalities in accessibility to health supportive built environments and health.
          </Text>
          <Text variation="primary">
          Through the JIBE project (Joining Impact models of transport with spatial measures of the Built Environment), we have developed agent-based transport simulation models (ABMs) capable of depicting complex urban systems.  These ABMs model how street-level built environment exposures influence behaviour, accessibility and health with high spatial and demographic granularity. By forecasting travel itineraries, behaviours, exposures, and health for a synthetic population of individuals, these ABMs allow us to simulate scenarios of interest to health and transport planners. However, the complexity of the models and their extensive, detailed outputs can be a barrier to effective knowledge translation and therefore impact.
          </Text>
          <Text variation="primary">
          We adopted an action research framework to engage government and advocacy stakeholder partners to co-develop an interactive platform to inform healthy transport planning policy and localised infrastructure interventions, and visualise the impacts of modelled transportation scenarios.  This presentation outlines our approach to make policy- and practice- relevant evidence on built environment change scenarios accessible to a broad range of government and advocacy  stakeholders to maximise active transport uptake, redress spatial and health inequities and inform investments in high-impact built environment interventions. The methods and open-source visualisation platform developed through this work can be adapted by other researchers and practitioners for new settings for translation of research evidence into practice.
          </Text>
      </View>
      </Flex>
    </div>
  );
}
