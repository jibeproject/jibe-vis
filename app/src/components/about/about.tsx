import { Text } from '@aws-amplify/ui-react';
import { Link } from '@mui/material';
import './about.css';
import { Team } from './team';
import { Funding } from './funding'
import jibeDiagram from '../vis/jibe_model_diagram';
import { Roadmap } from './roadmap'
import { Videos } from './videos'
import { Features } from './features'
import { Ampersand } from '../vis/transporthealthimpacts.tsx';
import { Section } from '../section.tsx';

export function About() {
  return (
    <>
    <Section
      stub="about"
      section="background"
      heading="Background"
      subheading=""
      subtext=""
      default_view={true}
      content={<>
        <Text variation="primary"> Through the <Link href="https://jibeproject.com/" target="_blank">JIBE project</Link> (Joining Impact models of transport with spatial measures of the Built Environment) and the associated <Link href="https://doi.org/10.1080/15472450.2024.2372894" target="_blank">AToM project</Link> ( Activity-based and agent-based Transport model of Melbourne), we have developed agent-based transport simulation models (ABMs) capable of depicting complex urban systems.  These ABMs model how street-level built environment exposures influence behaviour, accessibility and health with high spatial and demographic granularity. By forecasting travel itineraries, behaviours, exposures, and health for a synthetic population of individuals, these ABMs allow us to simulate scenarios of interest to health and transport planners. However, the complexity of the models and their extensive, detailed outputs can be a barrier to effective knowledge translation and therefore impact.
        </Text>
        <Text variation="primary"> This web site provides illustrative examples of potential functionality that we could implement in an interactive tool to make transport and health modelling results from JIBE and similar projects accessible and useful. Through our engagement with stakeholders, we will incorporate and test new functionality that can help meet their needs and achieve this goal.  The website is being developed as open source software on <Link href="https://github.com/jibeproject/jibe-vis" target="_blank">GitHub</Link>.</Text>
        {Ampersand("70","94")}
        </>
        }
        />
    <Section
      stub="about"
      section="aims"
      heading="Aims"
      subheading=""
      subtext=""
      default_view={true}
      content={<>
        <Text variation="primary">
        We plan to engage government and advocacy stakeholders and researchers to co-develop an interactive platform with two related aims:</Text>
        <li className='About' id='numeric'>To make complex urban systems modelling evidence accessible and useful for informing healthy transport planning policy and localised infrastructure interventions; and </li>
        <li className='About' id='numeric'>Support visualising the impacts of modelled transportation scenarios.</li>  
        <Text>We plan to publish the methods and visualisation platform developed through this work as open source code that can be adapted by other researchers and practitioners for new settings for translation of research evidence into practice.</Text>
        </>
        }
        />
      <Team/>
      <Funding/>
      {jibeDiagram()}
      {Videos()}
      <Roadmap/>
      <Features/>
    </>
  )
}
