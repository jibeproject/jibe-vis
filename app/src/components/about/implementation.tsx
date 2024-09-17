import { Section } from "../section"
import { Timeline } from "../vis/timeline"
import {Text} from '@aws-amplify/ui-react';

export const implementation_data = {
    nodes: [
        { label: "Prototype", group: 'Implemented', date: "2024-05-07", end: "", offset: -5, anchor: 'start' },
        { label: "Navbar", group: 'Implemented', date: "2024-05-21", end: "", offset: -35, anchor: 'end' },
        { label: "Online CI/CD architecture", group: 'Implemented', date: "2024-05-21", end: "", offset: -20, anchor: 'end' },
        { label: "About", group: 'Implemented', date: "2024-05-27", end: "", offset: -50, anchor: 'end' },
        { label: "Resource catalogue", group: 'Implemented', date: "2024-05-29", end: "", offset: -65, anchor: 'end' },
        { label: "Infrastructure as code", group: 'Implemented', date: "2024-05-30", end: "", offset: -80, anchor: 'end' },
        { label: "Stream videos", group: 'Implemented', date: "2024-06-01", end: "", offset: -65, anchor: 'start' },
        { label: "Proof-of-concept map story", group: 'Implemented', date: "2024-06-03", end: "", offset: -50, anchor: 'start' },
        { label: "Map popups", group: 'Implemented', date: "2024-06-10", end: "", offset: -35, anchor: 'start' },
        { label: "Indicator summary", group: 'Implemented', date: "2024-06-12", end: "", offset: -20, anchor: 'start' },
        { label: "Glossary", group: 'Implemented', date: "2024-06-14", end: "", offset: -5, anchor: 'start' },
        { label: "Mobile layout", group: 'Implemented', date: "2024-06-15", end: "", offset: 10, anchor: 'start' },
        { label: "Analyse and visualise feedback", group: 'Implemented', date: "2024-07-16", end: "", offset: -90, anchor: 'middle', polarity: 1},
        { label: "Custom URL", group: 'Implemented', date: "2024-08-01", end: "", offset: -5, anchor: 'end' },
        { label: "Data story gallery", group: 'Implemented', date: "2024-08-09", end: "", offset: -35, anchor: 'end' },
        { label: "Live feedback submission", group: 'Implemented', date: "2024-08-16", end: "", offset: -65, anchor: 'middle' },
        { label: "Share URL", group: 'Implemented', date: "2024-08-23", end: "", offset: -35, anchor: 'start' },
        { label: "20 minute neighbourhoods (search, select indicator, select/compare feature)", group: 'In progress', date: "2024-09-19", end: "", offset: -80, anchor: 'start' },
        { label: "Cycling infrastructure (selection XY plot, area ranking, filter features)", group: 'Planned', date: "2024-10-07", end: "", offset: -60, anchor: 'start' },
        { label: "Data story info tour", group: 'Planned', date: "2024-10-16", end: "2024-12-23", offset: -40, anchor: 'start' },
        { label: "Low speed traffic zones (causal pathways, animation, split screen)", group: 'Planned', date: "2024-10-24", end: "", offset: -20, anchor: 'start' },
        { label: "GIF/PNG/PDF snippets for sharing", group: 'Planned', date: "2024-12-16", end: "", offset: 0, anchor: 'middle' },
    ]
  }

export const Implementation = () => {
    return (
        <Section
        stub="about"
        section='implementation'
        heading="Implementation timeline"
        subheading="Timeline of features implemented, in progress, and planned."
        subtext={<Text><i>Best viewed on a desktop computer or in landscape on a mobile device.</i></Text>}
        default_view={true}
        content={
            <Timeline data={implementation_data} width={600} height={150} polarity={1} radius={10}/>
        }
        />
    )
}