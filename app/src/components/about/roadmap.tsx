import Timeline from '../vis/timeline';
import Architecture from '/images/jibe-vis architecture - status - simplified.svg';
import ActionResearch from '/images/Action research proposal.svg';
import './roadmap.css';
import { Section } from '../section';



  export const timeline_data = {
    nodes: [
        { id: 1, label: "", group: 'Prototype', date: "2024-04-01", end: "2024-07-09", offset: 5, anchor: 'Start' },
        { id: 2, label: "Workshop 1", group: 'Prototype', date: "2024-06-17", end: "", offset: -60, anchor: 'end' },
        { id: 3, label: "Prioritisation", group: 'Prototype', date: "2024-07-01", end: "", offset: -40, anchor: 'start' },
        { id: 4, label: "", group: 'Development', date: "2024-07-09", end: "2025-02-17", offset: 5, anchor: 'start' },
        { id: 5, label: "", group: 'Presentation', date: "2024-07-18", end: "", offset: 5, anchor: 'middle' },
        { id: 6, label: "", group: 'Presentation', date: "2024-07-23", end: "", offset: 5, anchor: 'middle' },
        { id: 7, label: "", group: 'Presentation', date: "2024-10-15", end: "", offset: 5, anchor: 'middle' },
        { id: 8, label: "", group: 'Presentation', date: "2024-11-04", end: "", offset: 5, anchor: 'middle' },
        { id: 9, label: "Workshop 2", group: 'Development', date: "2024-11-14", end: "", offset: -20, anchor: 'end' },
        { id: 10, label: "Workshop 3", group: 'Development', date: "2024-12-01", end: "", offset: -20, anchor: 'start' },
        { id: 11,label: "Documentation and wrap up", group: 'Completion', date: "2025-02-17", end: "2025-04-30", offset: 0, anchor: 'middle' },
    ]
  }

  export function Roadmap() {
      return (
        <div>
        <Section
          stub="about"
          section='roadmap'
          heading="Project roadmap"
          subheading="Development commenced in April 2024, with planning for an initial stakeholder engagement workshop."
          subtext=""
          default_view={true}
          content={
            <Timeline data={timeline_data} width={600} height={150} polarity={1} radius={10}/>
          }
          />
        <Section
          stub="about"
          section=""
          heading=""
          subheading="To support on-going and iterative development of the interactive tool an architecture to support continuous development and integration of new features was prototyped with the support of RMIT's AWS Supercomputer Hub."
          subtext=""
          default_view={true}
          content={
            <figure>
            <img src={Architecture} alt="Prototype architecture" id="Architecture"/>
            </figure>
            }
          />
         <Section
          stub="about"
          section=""
          heading=""
          subheading="The project uses an action research informed approach to research software engineering."
          subtext=""
          default_view={true}
          content={
            <figure>
              <img src={ActionResearch} alt="Action research proposal" id="ActionResearch"/>
            </figure>
          }
          />
        </div>
      )
  };

