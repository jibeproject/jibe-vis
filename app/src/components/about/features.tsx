import { Heading } from '@aws-amplify/ui-react';
import { Hierarchy } from '../vis/code-hierarchy';
import { loadFeatureData } from '../vis/processFeatureData';
// import { processFeatureData } from '../vis/processFeatureData';
import Box from '@mui/material/Box';
import { Text } from '@aws-amplify/ui-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Section } from '../section.tsx';
import './features.css';
import { useEffect } from 'react';

const features = [
  {
    label: 'Usage examples',
    interpretation: 'Stakeholders shared usage examples relating to their backgrounds and roles. Modelling results were considered particularly useful as a source of evidence of the benefits of investing in active transport infrastructure, identifying priorities for investment, for use in business case proposals and informing planning decisions. While these could be used for advocacy at all levels of government, there was particular interest in the modelling evidence supporting local government health and wellbeing plans. Alignment with in-house modelling tools and objectives was also a priority, particularly for comparisons against official reference data (e.g., on cycling mode shift), cross-checking, and validation.',
    tweak: 1,
  },
  {
    label: 'Features',
    interpretation: 'Simple and intuitive comparisons highlighting changes resulting from scenarios and interventions, and against official projects, were identified as priorities. User-defined scenarios created through filtering the data being visualised and modifying parameters were requested. Linkage and overlay with data on socio-demographic attributes and inequities were also considered important, for example, to inform local government health and wellbeing plans. There was broad interest in infographics and interactive visualisations, such as heat maps or graphs, particularly where these could intuitively communicate the potential for change resulting from planning policy and investment.',
    tweak: 1.5
  },
  {
    label: 'Measures',
    interpretation: 'There was strong interest in measures of the direct and indirect health and wellbeing benefits of active transport scenarios, including increased physical activity as well as mode share and mode shift to active transport, travel time, and travel stress. Level of activity service demand was an aspect of interest for users wishing to explore their own scenarios, and at different spatial scales. Green visibility when cycling and gradient were measures that were discussed in terms of filtering attributes to customise interactive visualisations.',
    tweak: 0.67
  },
  {
    label: 'Artifacts and experiences',
    interpretation: 'The importance of high-level documentation of model assumptions, validation, and calibration against official reference cases was emphasised by workshop participants, along with summary reports and a user guide. The need for compelling narratives—data stories—to support the use of the tool in advocacy was also identified as important, along with the ability to customise and share visualisations for engagement with different audiences. Infographics highlighting the impacts of transport and health scenarios that could readily be shared, embedded in reports or presentations were considered important for advocacy. Other users requested the ability to export data for further analysis; however, the need for things to be simple and intuitive was underscored. Training and education on how to make effective and appropriate usage of the resources was requested. It was emphasised that above all, we should place particular emphasis on communicating the \'nexus of transport and health impacts\'.',
    tweak: 0.7
  },
  {
    label: 'Spatial scales',
    interpretation: 'To support the different planning and advocacy needs of stakeholders, data and visualisations should be customisable for a range of spatial scales, from neighbourhoods and precincts to local government areas. Capacity to query individual links, routes and corridors, was requested; for example, selecting an origin and destination for cycling and visualising the changes in relevant measures resulting from a planning scenario or intervention.  The ability to compare scenarios and interventions at different spatial scales was considered particularly important for consideration of health equity.',
    tweak: 0.61
  },
  {
    label: 'Infrastructure uses and users',
    interpretation: 'Workshop attendees were particularly interested in scenarios related to active transport and cycling, but also expressed interest in understanding the externalities and impacts of non-active transport and the health equity implications of public transport investment.',
    tweak: 0.58
  },
  {
    label: 'Interaction',
    interpretation: 'The value of observing change through \'playing\' and zooming in and out at a range of relevant scales was emphasised, a concept linked with having a simple and intuitive user interface.  While customisation of scenarios through a dashboard was considered important, the risks of complexity that this entails were also appreciated.  With regard to the user interface and user experience of the tool, it was specifically stated that this should be \'not for engineers\'.  Given the challenges of achieving simplicity when allowing customisation, it was suggested that there could be different modes of interaction; advanced methods could be available as an option.  While the risks of complexity could be offset through provision of training and education materials, the development of an intuitive and simple user interface that self-documents should be a priority in the first instance.',
    tweak: 1
  },
]



// import './features.css';
export function Features() {
  // const feature_data = processFeatureData();
  const feature_data = loadFeatureData();

  useEffect(() => {
    const elements = document.querySelectorAll('g.FeatureHierarchy');
    const handleClick = (event: Event) => {
      if (event.currentTarget) {
        (event.currentTarget as HTMLElement).classList.toggle('clicked');
      }
    };

    elements.forEach(element => {
      element.addEventListener('click', handleClick);
    });

    // Cleanup function to remove event listeners
    return () => {
      elements.forEach(element => {
        element.removeEventListener('click', handleClick);
      });
    };
  }, [feature_data]); // Dependency array ensures this runs when feature_data changes


  // console.log(feature_data)
  if (feature_data) {
    return (
      <div>
      <Section
        stub="about"
        section='features'
        heading="Priority planning"
        subheading="Development priorities have been informed through engagement with urban transport, planning and health stakeholders"
        subtext=""
        default_view={true}
        content={
          <>
          <Text variation="primary">Stakeholders from health and active transport advocacy organisations as well as government urban transport and planning agencies were invited to provide feedback on how transport and health modelling from the JIBE project could be made both accessible and useful to inform planning and advocacy. Feedback on an early platform prototype and priorities for development was elicited through a survey, moderated breakout session discussions and live Miro board coding.   Usage examples were gathered, along with features, interactivity and documentation required to support these.</Text>
          <Heading level={4}>Scroll horizontally across the below visualisation to explore themes grouped by topics</Heading>  
          <ul>
              <li className='About'>The number of mentions of a theme is represented by a proportionately scaled circle.</li>
              <li className='About'>Hover over a theme for additional context, displaying related intersecting themes.</li>
          </ul>
          </>
        }
        />
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
        </div>
    )
  } else {
  return (
    <>
    </>
  )
}
};

