import { Flex, Heading, Text, View } from '@aws-amplify/ui-react';
import { Hierarchy } from '../vis/code-hierarchy';
import { loadFeatureData } from '../vis/processFeatureData';
import './features.css';
export function Features() {
  const feature_data = loadFeatureData();
  // console.log(feature_data)
  if (feature_data) {
    return (
      <div>
      <Flex direction={{ base: 'column', large: 'row'}}>
        <View
          // minWidth={'570px'}
          maxWidth={{ base: '100%', large: '570px'}}
          padding="1rem"
          >
            <Heading level={1} order={1}>Priority planning</Heading>
            <Heading level={4}> An initial stakeholder workshop was conducted in June 2024, with users invited from health and active transport advocacy organisations as well as local and state government urban transport and planning officials.  Feedback on how transport and health modelling data such as that produced through the JIBE project could be made both accessible and useful was elicited through a survey, moderated breakout session discussions and live Miro board coding.   Usage examples were gathered, along with features, interactivity and documentation required to support these.</Heading>
          </View>
        <View 
          padding={{ base: '1rem', large: '1rem'}}
          width="100%"
          marginTop={24}
          >
          <Text>Stakeholders participating in the first project workshop on 17 June 2024 shared insights into how transport and health modelling evidence such as that being produced through the JIBE project could support their roles as health and transport advocates, policy makers, planners, and consultants.  There was broad interest in accessing evidence to support advocacy to support healthy planning and design, scenarios for business cases, and informing local government and precinct planning.  However, we heard that this also needs to be delivered in a way that supports compelling narratives that can be directly used to communicate why investment in active transport is needed, where, and for whom.  Functionality for comparisons of intervention impacts for different areas, routes or corridors and demographic sub-groups should be incorporated to support such usage, including against policy relevant targets to illustrate the potential of scenarios to meet these.   Linkage and overlay of data on inequities and aspects relating to cost of implementation, including externalities or negative impacts relating to physical activity and environmental exposures.  There was interest in using the methods developed and used through the JIBE project in other agent based models of active transport behaviour, however it will be important to include details on the assumptions and validation including comparisons to existing models.</Text>
        </View>
        </Flex>
        <Hierarchy data={feature_data} radius={8} feature='Usage examples' interpretation='' tweak={1}/>,
        <Hierarchy data={feature_data} radius={8} feature='Features' interpretation='' tweak={1.5}/>,
        <Hierarchy data={feature_data} radius={8} feature="Measures" interpretation='' tweak={1}/>,
        <Hierarchy data={feature_data} radius={8} feature="Artifacts and experiences" interpretation='' tweak={1}/>,
        <Hierarchy data={feature_data} radius={8} feature="Spatial scales" interpretation='' tweak={1}/>,
        <Hierarchy data={feature_data} radius={8} feature="Infrastructure uses and users" interpretation='' tweak={0.6}/>,
        <Hierarchy data={feature_data} radius={8} feature="Interaction" interpretation='' tweak={1}/>,
        </div>
    )
  } else {
  return (
    <>
    </>
  )
}
};

