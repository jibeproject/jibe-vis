import { Text } from '@aws-amplify/ui-react';
import Link from '@mui/material/Link';
import './about.css';
import JibeDiagram from '../vis/jibe_model_diagram';
import { Team } from './team';
import { Funding } from './funding'
import { JIBE } from './jibe'
import { Roadmap } from './roadmap'
import { Features } from './features'
import { Ampersand } from '../vis/transporthealthimpacts.tsx';
import { Section } from '../section.tsx';
import { Feedback } from './feedback.tsx';
import { Implementation } from './implementation.tsx';

export function About() {
  return (
    <>
    <Section
      stub="about"
      section="background"
      heading="Background"
      subheading="An interactive platform designed to inform healthy transport planning policy and localised infrastructure interventions, and visualise the impact pathways of modelled transportation scenarios."
      subtext=""
      default_view={true}
      content={<>
        <Text variation="primary"> Through the <Link href="https://jibeproject.com/" target="_blank">JIBE project</Link> (Joining Impact models of transport with spatial measures of the Built Environment) and the associated <Link href="https://doi.org/10.1080/15472450.2024.2372894" target="_blank">AToM project</Link> ( Activity-based and agent-based Transport model of Melbourne), we have developed agent-based transport simulation models capable of depicting complex urban systems.
        </Text>
        <Text variation="primary"> Agent-based models like JIBE model how street-level built environment exposures influence behaviour, accessibility and health with high spatial and demographic granularity. Forecasting travel itineraries, behaviours, exposures, and health for representative synthetic populations of individuals allows us to simulate a broad range of scenarios of interest to health and transport planners and advocates.
        </Text>
        <Text variation="primary">The JIBE model and its outputs are illustrated in the following diagram:</Text>
        {Ampersand("70","94")}
        <JibeDiagram/>
        <Text variation="primary">However, the complexity of the models and their extensive, detailed outputs can be overwhelming; a potential barrier to effective knowledge translation and impact.
        </Text>

        <Text variation="primary"> Development of Transport & Health Impacts commenced in 2024 in collaboration with advocacy and government stakeholders as open source software on <Link href="https://github.com/jibeproject/jibe-vis" target="_blank">GitHub</Link>.  Through iterative development and testing of new data stories and functionality we aim to increase the accessibility and utility of transport modelling research.</Text>
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
      <JIBE/>
      <Roadmap/>
      <Implementation/>
      <Section
        stub="about"
        section="data-inclusion"
        heading="Data inclusion"
        subheading=""
        subtext=""
        default_view={true}
        content={<>
          <Text variation="primary">To help ensure the responsible and ethical use of data, we have established a protocol for data inclusion.  To be featured, included data and variables must:</Text>
          <ul>
            <li>have a clear summary description</li>
            <li>have upstream data sources attributed</li>
            <li>be accompanied by a formal citation</li>
            <li>be published under a licence supporting open access</li>
            <li>have written agreement from the data authors supporting inclusion in the platform</li>
          </ul>

          <Text>
            Preparation of data for inclusion in the Transport Health Impacts platform is documented in the project's public GitHub repository <Link target="_blank" href='https://github.com/jibeproject/jibe-vis/blob/main/data-preparation/JIBE-vis-data-preparation-R.md'>here</Link>.
          </Text>
          <Text>
            Data stories are then defined in a configuration file, '<Link target="_blank" href='https://github.com/jibeproject/jibe-vis/blob/main/app/src/components/vis/stories/stories.json'>stories.json</Link>'.  This contains records detailing the story title, URL, type (e.g. map), image thumbnail, authors, description, city location, data sources, and how to represent map layers and linked data.  Additionally, guidance for interpreting the story can be defined along with a sequence of interactive steps or hints to guide the user on features or aspects of interest.
          </Text>
            <table className='simple_table'>
            <thead>
              <tr>
              <th scope='col'>Parameter</th>
              <th scope='col'>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
              <td>title</td>
              <td>The title of the story.</td>
              </tr>
              <tr>
              <td>page</td>
              <td>The sub-page URL</td>
              </tr>
              <tr>
              <td>type</td>
              <td>The type of content (e.g., "map")</td>
              </tr>
              <tr>
              <td>img</td>
              <td>A thumbnail image illustrating the story</td>
              </tr>
              <tr>
              <td>authors</td>
              <td>A list of author names with links for further information</td>
              </tr>
              <tr>
              <td>story</td>
              <td>A brief description of the story</td>
              </tr>
              <tr>
              <td>city</td>
              <td>The city, corresponding to cities configured in <Link target="_blank" href="https://github.com/jibeproject/jibe-vis/blob/main/app/src/components/vis/stories/cities.json">cities.json</Link></td>
              </tr>
              <tr>
              <td>directions</td>
              <td>Instructions or additional information related to the story</td>
              </tr>
              <tr>
              <td>sources</td>
              <td>Data sources used in the story and linked attributions</td>
              </tr>
              <tr>
              <td>layers</td>
              <td>Configuration for featured data layers</td>
              </tr>
            </tbody>
            </table>
        </>}
        />
        <Features/>
        <Feedback/>
      </>
  )
}
