import { Flex, View, Heading} from '@aws-amplify/ui-react';
import { DataCitations } from './citations';
import { Section } from './section'
import { Glossary } from './glossary.tsx';
import { References } from './references.tsx';

export function Resources() {
    return (
      <>
      <Section
          stub="resources"
          section="gallery"
          heading="JIBE Resources"
          subheading="Click on record headings to view more information about the resources developed through the JIBE project as well as options for access and download. Further resources will be added to this list as they are published."
          subtext=""
          default_view={true}
          content={
            <Flex direction='column'>
              <View width="100%" margin={0}>
              {/* DataCitations takes string arguments: title, description, formats, citation, licence, url */}
                <Heading level={4} lineHeight="3">Presentations</Heading>
                {DataCitations("JIBE model methods and outputs","Through the JIBE project (Joining Impact models of transport with spatial measures of the Built Environment), we have developed agent-based transport simulation models (ABMs) capable of depicting complex urban systems. These ABMs model how street-level built environment exposures influence behaviour, accessibility and health with high spatial and demographic granularity. By forecasting travel itineraries, behaviours, exposures, and health for a synthetic population of individuals, these ABMs allow us to simulate scenarios of interest to health and transport planners. These presentations include an introduction to the projects, methods and outputs.", "PDF", "Zapata-Diomedi, Belen; Zhang, Qin; Staves, Corin; Pemberton, Steve; Abdollahyar, Mahsa (2024). Methods and outputs JIBE model. RMIT University. Presentations. https://doi.org/10.25439/rmt.25965541.v1", "CC BY 4.0","https://doi.org/10.25439/rmt.25965541.v1")}
                {DataCitations("Association between Built Environment attributes and Strava speeds and volumes in the Greater Manchester region","The Built Environment (BE) along the travel network influences the likelihood of people making short or multimodal trips using active travel (AT) modes (i.e., cycling and walking). The literature shows that BE attributes are significant predictors of AT and are strongly correlated with high cycling volumes. Specifically, they have higher association with AT than socio-demographics, or proximity to central locations and green space. Moreover, their collective relationship with AT use is not additive but complex, since many of them are correlated.  Existing literature shows that BE attributes at the same time can contribute to delays, comfort and perceived safety levels. There is scarce evidence whether cycling and walking volumes increase if travel delays are reduced, while comfort level credited to high quality walking or cycling infrastructure is improved.  In this video we describe how: we examined the association between travel delays for cycling and walking, with the presence and type of intersections' traffic signals, street lighting, crime rates and pavement quality; we compared self-reported speeds and volumes from Strava users in Greater Manchester with the MATSim modelled free-flow speeds (function of the network gradient) and volumes; and we observed travel delays on the network, with some attributes having positive, while others negative effect on speeds and volumes.", "MP4", "Itova, I., C. Staves, S. M. Labib, A. de Nazelle, A. Jafari, J. Woodcock, J. Panter, et al. 'Association between Built Environment Attributes and Strava Speeds and Volumes in the Greater Manchester Region'. Science Talks 8 (1 December 2023): 100268. https://doi.org/10.1016/j.sctalk.2023.100268", "CC BY 4.0","https://doi.org/10.1016/j.sctalk.2023.100268")}
                {DataCitations("Integrating spatially detailed micro-environmental attributes to a routable transport network for active travel modeling: A pilot study in Greater Manchester","Prior studies show that the Built Environment (BE) can influence route and mode choice, increasing the uptake of active modes and reducing car dominance. One of the main challenges in establishing such relationships between the BE and travel behaviour is the unavailability of micro-scale BE data. This study presents a methodology for harmonising and joining multi-source spatial datasets to the unit level of the street segment (link). We observed significant link-level variations of the environmental characteristics, which would have been missed with more traditional area-level approaches. Thus more detailed information of specific street segments can assist travel demand modelling.","PDF","Labib, S.M, Irena Itova, Corin Staves, Belén Zapata-Diomedi, Alan Both, Lucy Gunn, Haneen Khreis, et al. 'Integrating Spatially Detailed Micro-Environmental Attributes to a Routable Transport Network for Active Travel Modeling: A Pilot Study in Greater Manchester'. 28 March 2022. https://doi.org/10.5281/zenodo.6411627.","CC BY 4.0","https://zenodo.org/records/6411627")}
                {DataCitations("Incorporating Network-based Built Environmental Attributes of Walkability and Cyclability into Accessibility Modelling: A Pilot Study for Greater Manchester","Accessibility is a key instrument for assessing active mobility. However, accessibility measures often suffer from biases due to spatial aggregation, isochrones with arbitrary cut-offs, and distance-based cost functions that ignore the route conditions. Previous literature has addressed these issues individually, but not holistically. This study applies the MATSim framework to efficiently route between billions of origin-destination pairs to calculate fully disaggregate Hansen accessibilities using cost functions sensitive to network quality. With examples of greenspace and foodstore accessibility, we demonstrate the potential of this method for providing policy-relevant insight into the suitability of the built environment for active travel.","PDF","Staves, Corin, S.M. Labib, Irena Itova, Rolf Moeckel, James Woodcock, and Belen Zapata-Diomedi. 'Incorporating Network-Based Built Environmental Attributes of Walkability and Cyclability into Accessibility Modelling: A Pilot Study for Greater Manchester'. 19 April 2023. https://doi.org/10.5281/zenodo.7825121.","CC BY 4.0","https://ethz.ch/content/dam/ethz/special-interest/baug/ivt/ivt-dam/events/2023/09/05/abstracts/Staves_EtAl_MUM_2023.pdf")}
                {DataCitations("A	MATSim-based	Framework	for	Modelling	the	Inluence	of	the	Built	Environment	on	Walkability	and	Cyclability","At the 2023 MATSim User Meeting, Corin presented “A MATSim-based framework to Incorporate High Resolution Built Environment Data for Modelling Walkability and Cyclability.” The MATSim user meeting is the annual meeting for users and developers of the open-source MATSim agent-based transport simulation tool. This study further extended the walkability and cycling accessibility work presented at GISRUK2023 and showcased it to the MATSim community. The primary output of this was a flexible, open-source tool which made use of computationally efficient algorithms in MATSim to quickly calculate walkability and cyclability indicators at any level of precision. We were very pleased to find this to be an engaging presentation for the MATSim community and it also won their ‘best paper’ award.","PDF","Staves, Corin, S.M. Labib, Irena Itova, Qin Zhang, James Woodcock, Rolf Moeckel, and Belen Zapata-Diomedi. 'A	MATSim-based	Framework	for	Modelling	the	Inluence	of	the	Built	Environment	on	Walkability	and	Cyclability'. 2023 MATSim User Meeting. https://doi.org/10.5281/zenodo.7825121.","CC BY 4.0","https://zenodo.org/records/7825121")}
                {/* {DataCitations("title","description","formats","citation","licence","url")} */}
                <Heading level={4} lineHeight="3">Data Outputs</Heading>
                { DataCitations("JIBE 20 Minute Melbourne Scenario Impacts","Data outputs from the JIBE 20 minute neighbourhood intervention. The intervention has two components: 1) the destination component, in which new amenities and services are added to locations in and around defined activity centres to evaluate accessibility and utilisation levels; 2) the cycling component, which evaluates the impact of reducing vehicle speed limits to 40km/h or 30km/h on residential streets.", "CSV, XLSX, RDS, SQLITE", "Pemberton, S., Saghapour, T., Giles-Corti, B., Abdollahyar, M., Both, A., Pearson, D., Higgs, C., Jafari, A., Singh, D., Gunn, L., Woodcock, J., & Zapata-Diomedi, B. (2024). 20-minute neighbourhood scenario modelling for Melbourne (JIBE) (Version 1.0.0) [Computer software]. https://doi.org/10.5281/zenodo.13846250", "ODbL","https://github.com/jibeproject/20mnMelbourne")}
            </View>
            </Flex>
          }
    />
    <Glossary/>
    <References/>
    </>
    )
};
