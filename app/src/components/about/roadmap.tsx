import { Flex, View, Heading} from '@aws-amplify/ui-react';
import Timeline from '../vis/timeline';
import './roadmap.css';
import Architecture from '/images/jibe-vis architecture - status - simplified.svg';
import ActionResearch from '/images/Action research proposal.svg';


  export const timeline_data = {
    nodes: [
        { id: 1, label: "", group: 'Prototype', date: "2024-04-01", end: "2024-07-09", offset: 5, anchor: 'Start' },
        { id: 2, label: "Workshop 1", group: 'Prototype', date: "2024-06-17", end: "", offset: -20, anchor: 'end' },
        { id: 3, label: "Prioritisation", group: 'Prototype', date: "2024-07-01", end: "", offset: -20, anchor: 'start' },
        { id: 4, label: "", group: 'Development', date: "2024-07-09", end: "2025-02-17", offset: 5, anchor: 'start' },
        { id: 5, label: "", group: 'Presentation', date: "2024-07-18", end: "", offset: 5, anchor: 'middle' },
        { id: 6, label: "", group: 'Presentation', date: "2024-07-23", end: "", offset: 5, anchor: 'middle' },
        { id: 7, label: "", group: 'Presentation', date: "2024-10-15", end: "", offset: 5, anchor: 'middle' },
        { id: 8, label: "", group: 'Presentation', date: "2024-11-04", end: "", offset: 5, anchor: 'middle' },
        { id: 9, label: "Workshop 2", group: 'Development', date: "2024-11-14", end: "", offset: -20, anchor: 'end' },
        { id: 10, label: "Workshop 3", group: 'Development', date: "2024-12-01", end: "", offset: -20, anchor: 'start' },
        { id: 11,label: "Documentation and wrap up", group: 'Completion', date: "2025-02-17", end: "2025-04-30", offset: -20, anchor: 'start' },
    ]
  }

  export function Roadmap() {
      return (
        <div>
        <Flex direction={{ base: 'column', large: 'row'}}>
          <View
            minWidth={'570px'}
            maxWidth={{ base: '100%', large: '570px'}}
            padding="1rem"
            >
              <Heading level={1} order={1}>Project roadmap</Heading>
              <Heading level={4}> Development commenced in April 2024, with planning for an initial stakeholder engagement workshop.  Concurrent to this, an architecture to support continuous development and integration of new features was prototyped with the support of RMIT's AWS Supercomputer Hub.</Heading>
           </View>
          <View 
            padding={{ base: '1rem', large: '1rem'}}
            width="100%"
            marginTop={24}
            >
              <Timeline data={timeline_data} width={600} height={150} polarity={1} radius={10}/>,
              <span id="Architecture">
              <img src={Architecture} alt="Action research proposal" id="Architecture"/>
              <figcaption>Prototype architecture to support development of an interactive tool to make transport and health modelling results from JIBE and similar projects accessible and useful. Diagram: Carl Higgs, 2024.</figcaption>
              </span>
              <img src={ActionResearch} alt="Action research proposal" id="ActionResearch"/>
              <figcaption>The project uses an <a href="https://au.sagepub.com/en-gb/oce/action-research/book266023#contents" target="_blank">action research</a> approach to <a href="https://www.davefarley.net/?p=352" target="_blank">software engineering</a> for research.  See linked resources for more information.  Diagram: Carl Higgs, 2023.</figcaption>
            </View>
            </Flex>
          </div>
      )
  };

