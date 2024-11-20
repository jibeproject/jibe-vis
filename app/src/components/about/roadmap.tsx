import Timeline from '../vis/timeline';
import Architecture from '/images/jibe-vis architecture - status - simplified.svg';
import ActionResearch from '/images/Action research proposal.svg';
import './roadmap.css';
import { Section } from '../section';



  export const timeline_data = {
    nodes: [
        { label: "", group: 'Prototype', date: "2024-04-01", end: "2024-07-09", offset: 5, anchor: 'start' },
        { label: "Workshop 1", group: 'Prototype', date: "2024-06-17", end: "", offset: 0, anchor: 'end' },
        { label: "Prioritisation", group: 'Prototype', date: "2024-07-01", end: "", offset: -60, anchor: 'end' },
        { label: "", group: 'Development', date: "2024-07-09", end: "2025-02-17", offset: 5, anchor: 'start' },
        { label: "Feature implementation (ongoing)", group: 'Development', date: "2024-07-09", end: "", offset: -40, anchor: 'start' },
        { label: "Workshop 2", group: 'Development', date: "2024-11-14", end: "", offset: 0, anchor: 'end' },
        { label: "Workshop 3", group: 'Development', date: "2024-12-01", end: "", offset: 0, anchor: 'start' },
        { label: "Documentation and next steps", group: 'Completion', date: "2025-02-17", end: "2025-04-30", offset: -20, anchor: 'middle' },
        // { label: "Data stories", group: 'Development', date: "2024-08-09", end: "", offset: -60, anchor: 'middle' },
        // { label: "Submit Feedback", group: 'Development', date: "2024-08-16", end: "", offset: -40, anchor: 'start' },
        // { label: "Share URL", group: 'Development', date: "2024-08-23", end: "", offset: -20, anchor: 'start' },
        // { label: "20 minute neighbourhoods (search, select indicator, select/compare feature)", group: 'Development', date: "2024-09-19", end: "", offset: -60, anchor: 'start' },
        // { label: "Cycling infrastructure (selection XY plot, area ranking, filter features)", group: 'Development', date: "2024-10-07", end: "", offset: -40, anchor: 'start' },
        // { label: "Low speed traffic zones (causal pathways, time animation, split screen compare)", group: 'Development', date: "2024-10-24", end: "", offset: -20, anchor: 'start' },
        { label: "", group: 'Presentation', date: "2024-07-18", end: "", offset: 5, anchor: 'middle' },
        { label: "", group: 'Presentation', date: "2024-07-23", end: "", offset: 5, anchor: 'middle' },
        { label: "", group: 'Presentation', date: "2024-08-15", end: "", offset: 5, anchor: 'middle' },
        { label: "", group: 'Presentation', date: "2024-08-22", end: "", offset: 5, anchor: 'middle' },
        { label: "", group: 'Presentation', date: "2024-11-04", end: "", offset: 5, anchor: 'middle' },
        { label: "", group: 'Presentation', date: "2024-11-21", end: "", offset: 5, anchor: 'middle' },
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

