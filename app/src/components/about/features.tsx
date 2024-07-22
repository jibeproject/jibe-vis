import { Flex, Heading, Text, View } from '@aws-amplify/ui-react';
import { Hierarchy } from '../vis/code-hierarchy';
import { loadFeatureData } from '../vis/processFeatureData';
// import { processFeatureData } from '../vis/processFeatureData';
import Box from '@mui/material/Box';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';


const features = [
  {
    label: 'Usage examples',
    interpretation: 'Stakeholders shared a range of different usage examples relating to their backgrounds and roles.  Modelling results were considered particularly useful as a source of evidence of the benefits of investing in active transport infrastruature, identifying priorities for investment, for use in business case proposals and informing planning decisions.  While these could be used for advocacy at all levels of government, there was particular interest in the modelling evidence supporting local government health and wellbeing plans.  Alignment with in-house modelling tools and objectives was also a priority, particuarly for comparisons against official reference data (e.g. on cycling mode shift), cross-checking and validation.',
    tweak: 1,
  },
  {
    label: 'Features',
    interpretation: 'Simple and intuitive comparisons highlighting changes resulting from scenarios and interventions, and against official projects, were identified as priorities.  User defined scenarios created through filtering the data being visualised and modifying parameters were requested.  Linkage and overalway with data on socio-demographic attributes and inequities was also considered important, for example to inform local government health and wellbeing plans.  There was broad interest in infographics and interactive visualisations, such as heat maps or graphs, particularly where these could intuitively communicate the potential for change resulting from planning policy and investment.',
    tweak: 1.5
  },
  {
    label: 'Measures',
    interpretation: 'There was strong interest in measures of the direct and indirect health and wellbeing benefits of active transport scenarios, including increased physical activity as well as mode share and mode shift to active transport, travel time and travel stress.  Level of activity service demand was an aspect of interest for users wishing to explore their own scenarios, and at different spatial scales.  Green visibility when cycling and gradient were measures that were discussed in terms of filtering attributes to customise interactive visualisations.',
    tweak: 0.6
  },
  {
    label: 'Artifacts and experiences',
    interpretation: 'The importance of high-level documentation of model assumptions, validation and calibration against official references cases was emphasised by workshop participants, along with summary reports and a user guide.  The need for compelling narratives—data stories—to support the use of the tool in advocacy was also identified as important, along with the ability to customise and share visualisations for engagement with different audiences.  Infographics highlighting the impacts of transport and health scenariors that could readily be shared, embedded in reports or presentations were considered important for advocacy.  Other users requested the ability to export data for further analysis, however the need for things to be simple and intuitive was underscored along with the need for training and education on how to make effective and appropriate usage of the resources.',
    tweak: 0.7
  },
  {
    label: 'Spatial scales',
    interpretation: 'To support the different planning and advocacy needs of stakeholders, data and visualisations should be available at a range of spatial scales, from neighbourhoods and precincts to local government areas. Capacity to query individual links, routes and corridors, was specifically requested; for example, selecting an origin and destination for cycling and visualising the changes in relevant measures resulting from a planning scenario or intervention.  The ability to compare scenarios and interventions at different spatial scales was considered particularly important for consideration of health equity.',
    tweak: 0.61
  },
  {
    label: 'Infrastructure uses and users',
    interpretation: 'Workshop attendees had a particular interest in scenarios related to active transport and cycling, but also expressed interest in understanding the externalities and impacts of non-active transport and the health equity implications of public transport investment.',
    tweak: 0.58
  },
  {
    label: 'Interaction',
    interpretation: 'The value of observing change through \'playing\' and zooming in and out at a range of relevant scales was emphasised, a concept linked with having a simple and intuitive user interface.  While customisation of scenarios through a dashboard was considered important, the risks of complexity that this entails were also appreciated.  With regard to the user interface and user experience of the tool, it was specifically stated that this should be \'not for engineers\'.  Given the challenges of achieving simplicity when allowing customisation, it was suggested that there could be different modes of interaction; advanced methods could be available as an option.  While the risks of complexity could be offset through provision of training and education materials, the development of an intuitive and simple user interface that self-documents should be a priority in the first instance.',
    tweak: 0.6
  },
]



// import './features.css';
export function Features() {
  // const feature_data = processFeatureData();
  const feature_data = loadFeatureData();
  // console.log(feature_data)
  if (feature_data) {
    return (
      <section id="features">
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
          
          <Heading level={4}>Explore summarised themes arising from the workshop below.</Heading>
          <ul>
            <li className='About'>Scroll horizontally through
              <ul>
              <li className='About'>Usage examples</li>
              <li className='About'>Features and measures requested</li>
              <li className='About'>Artifacts and experiences that users want to get out of the tool</li>
              <li className='About'>Spatial scales and infrastructures of interest, and</li>
              <li className='About'>How users would like to interact with the tool.</li>
              </ul>
            </li>
            <li className='About'>Number of mentions of a theme is represented by a proportionately scaled circle.</li>
            <li className='About'>Hover over a theme for additional context, displaying related intersecting themes.
              <ul>
                <li className='About'>The number of mentions provides a crude metric of priority, however many concepts are inter-related.</li>
                <li className='About'>Less mentioned aspects may be important considerations for concepts mentioned elsewhere.</li>
              </ul>
            </li>
          </ul>
        </View>
        </Flex>    
        <Box marginTop={4}>
          <Swiper navigation={true} modules={[Navigation]} className="mySwiper">
            {features.map((step:any,i) => (
              <SwiperSlide key={i}>
                <Hierarchy 
                  data={feature_data} 
                  radius={8} 
                  feature={step.label} 
                  interpretation={step.interpretation} 
                  tweak={step.tweak}/>
            </SwiperSlide>
            ))}
            </Swiper>
        </Box>
        </section>
    )
  } else {
  return (
    <>
    </>
  )
}
};

