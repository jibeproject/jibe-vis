import { useState } from 'react';
import { Table, TableCell, TableRow, TableHead, TableBody} from '@aws-amplify/ui-react';
import './glossary.css'
import FileDownload from '@mui/icons-material/FileDownload';
import { Section } from './section.tsx';
import { Text } from '@aws-amplify/ui-react';

export function getJibeTerm(term: string) {
    return term+": "+glossary[term];
}

export function getJibeTitle(term: string) {
    return (
        <title>{getJibeTerm(term)}</title>
    )
}


export const glossary: { [key: string]: any } = {
"20 minute neighbourhood": "A concept focused on urban planning where residents can access most of their daily needs within a 20-minute return walk from home, emphasising safe cycling and local transport options.",
"Access points": "Points indicating how every activity location can be reached on the network, providing information on accessibility.",
"Accessibility analysis": "Examination of how easily individuals can reach various destinations, often considering factors such as distance, transportation options, and infrastructure.",
"Active travel": "Modes of transportation that involve physical activity, such as walking or cycling.",
"Activity centres": "Places where various activities (e.g., work, shopping, recreation) occur, often serving as focal points for transportation planning.",
"Agent-based transport and health model": "A modeling approach that simulates the behavior of a synthetic population of individual agents (e.g., people, vehicles) to understand system-level outcomes like mode share, physical activity, and health.",
"Agent-based transport simulation": "A modeling approach that simulates the behavior and interactions of individual agents conducting their daily activities using representations of real or counterfactual transportation infrastructure to understand system-level outcomes of planning or policy scenarios.",
"Air pollutant": "Particles or gases released into the air, often from vehicle emissions and industrial activities, that can harm human health and the environment, particularly affecting respiratory and cardiovascular systems.",
"Address level": "Precise geographic coordinates of a location, often used for detailed mapping and analysis.",
"Agent-based transport model": "Modeling approach that simulates the behavior of individual agents (e.g., people, vehicles) to understand system-level outcomes.",
"Background concentration": "Ambient level of a substance (e.g., air pollution) in a given environment.",
"Base case": "A scenario representing the current state or situation, often used as a reference point for comparison in analyses.",
"Base year": "A specific year used as the starting point for analysis or comparison in a study.",
"Behavioural modification": "Interventions aimed at altering human behavior to achieve desired outcomes.",
"Binary scoring method": "A method assigning a score of 1 or 0 based on whether a condition is met or not.",
"Body mass index (BMI)": "A measure of body fat based on height and weight, commonly used to assess health and risk of disease.",
"Built environment": "Human-made surroundings where people live, work, and recreate, including infrastructure like buildings, parks, and transportation networks.",
"Built environment outputs": "Modelling outputs related to the built enviornment, such as cycling infrastructructure, measures of local accesibility, multi-modal road network",
"Built environment spatial analysis": "The systematic examination of how the design, layout, and characteristics of streets, buildings, parks, and transportation infrastructure in urban and suburban areas influence accessibility, health outcomes, and transportation choices.",
"Catchments (for activity centres)": "Areas surrounding activity centers that capture the population or demand for services.",
"Carbon Footprint": "The total amount of greenhouse gases (primarily carbon dioxide) produced by human activities, including travel, heating, and consumption, which contribute to climate change and environmental sustainability.",
"Chronic disease": "Long-lasting medical conditions requiring ongoing management or treatment.",
"Comparative risk assessment": "Methods developed by the World Health Organization to assess the population health burden of exposure to risk factors",
"Congestion": "The buildup of vehicles on roadways that slows traffic flow and increases travel times, often resulting in increased emissions, fuel consumption, and driver stress.",
"Congestion level": "Degree of traffic congestion on roadways or transportation networks, often measured by factors like travel time or vehicle density.",
"Cycling infrastructure": "Facilities and amenities designed to support cycling, such as bike lanes, bike paths, and bike racks.",
"Cycling stress": "A measure used to predict how suitable different roads on the network are for cycling.",
"Daily living destinations": "Locations where people regularly go for daily activities such as work, shopping, or recreation.",
"Dedicated bike lanes": "Segregated lanes reserved for bicycles, separate from motor vehicle traffic.",
"Deaths": "Mortality events within a population, which can be prevented or delayed through improvements in public health, safety, and healthy behaviors such as physical activity and active transportation.",
"Demographic events": "Significant demographic changes or milestones in individuals' lives, such as births, deaths, marriages, or job changes.",
"Demographic model": "A model that simulates population dynamics and characteristics, often used in forecasting or planning.",
"Digital surface model": "A digital model representing the Earth's surface including natural and built features, often used for terrain analysis or mapping.",
"Digital terrain model": "A digital model representing the bare Earth's surface, often used for elevation analysis or mapping.",
"Directed graph structure": "A mathematical representation of a network with edges indicating directional connections between nodes.",
"Disease specific occurrence": "Incidence or prevalence of a specific disease or health condition within a population.",
"Diseases": "Medical conditions or illnesses affecting individuals or populations, including chronic conditions like obesity, heart disease, and diabetes that can be influenced by physical activity levels and environmental factors.",
"Dose response function": "Relationship between a behaviours, exposure to a substance or factor and the likelihood or severity of a health outcome.",
"Dying prematurely/ premature death": "Death occurring at a younger age than expected, often due to preventable causes or health issues.",
"Edge effects": "Effects resulting from people traveling in and out of the border or boundary of a defined area.",
"Edges (of network)": "Connections or links between nodes in a network, representing transportation routes or pathways.",
"Elevation data": "Information about the height or elevation of terrain features, often used in geographic analysis or mapping.",
"Emissions": "Gases or particles released into the atmosphere from vehicles, industry, and other human activities, contributing to air pollution and climate change.",
"Environmental outputs": "Results or outcomes related to the environment, such as emissions, air pollution and noise pollution. ",
"Exposure models": "Simulated scenarios or models representing potential exposures to hazards, pollutants, or other factors.",
"Eye-level greenness visibility": "Visibility or presence of green spaces or vegetation at eye level, often used in environmental or urban planning.",
"Equity outcomes": "Fair and equitable distribution of the benefits and impacts of transport and health improvements across different communities and population groups, ensuring no groups are disadvantaged.",
"Features of urban design": "Characteristics or elements of urban environments, such as population density, land use mix, or transportation infrastructure.",
"General Transit Feed Specification (GTFS)": "A standard format for public transportation schedules and related geographic information.",
"Geographic database/geodatabase": "A database containing geographic data, often used for mapping, analysis, or modeling purposes.",
"Gradient": "The rate of change of elevation over distance, often used to describe the steepness of terrain features.",
"Health adjusted life years": "A measure of overall disease burden, combining the impact of mortality and morbidity on quality of life.",
"Health Economic Assessment Tool": "A tool developed by the World Health Organization (WHO) for assessing the health and economic impacts of active trasnport scenarios.",
"Health exposures": "Factors or conditions that influence health outcomes or risks, such as air pollution, physical activity, or access to healthcare.",
"Health impact models": "Models that simulate or predict the health effects of various factors or interventions, often used in public health or policy analysis.",
"Health inequalities": "Disparities or differences in health outcomes or access to healthcare between different population groups.",
"Health model": "Representation or simulation of how health outcomes (such as disease incidence, injury rates, or quality of life) change in response to different behavioral and environmental factors, including physical activity.",
"Health outputs": "Results or outcomes related to health, such as disease incidence, mortality rates, or years of life lost.",
"Health pathways": "Ways in which the built environment influences health, including factors such as physical activity, exposure to pollutants, social connections, and access to healthcare.",
"Health trajectory": "The expected course or pattern of health status or outcomes over time, often influenced by factors such as lifestyle, environment, and healthcare access.",
"Individual travel activity plan": "A plan or schedule detailing an individual's travel activities, including destinations, modes of transportation, and timing.",
"Individual travel behaviors": "The patterns and choices individuals make regarding how they travel, including mode selection (walking, cycling, driving, public transport), frequency of trips, and route choice.",
"Intervention": "An action, policy, or program implemented to achieve a specific outcome or address a particular issue or problem.",
"Junction stress": "The level of stress or difficulty experienced by cyclists at road junctions or intersections, often influenced by factors such as traffic volume, design, and signage.",
"Injury Models": "Simulation tools that predict the incidence and severity of injuries, including road traffic injuries from different transportation modes and mechanisms.",
"Knowledge translation": "The process of synthesizing, disseminating, and applying research findings or knowledge to inform decision-making, policy development, or practice.",
"JIBE network with environmental exposures": "A representation of the transportation network compiled in the JIBE model that includes data on environmental exposures such as air pollution and noise levels along different routes.",
"Land use database": "A database containing information about the distribution and characteristics of land use, often used in urban planning, environmental analysis, and transportation modeling.",
"Latent demand scenario (cycling intervention)": "Hypothetical situations or scenarios representing unmet or latent demand for cycling infrastructure or opportunities.",
"Land use": "The assignment and organization of different geographic areas for specific purposes such as residential, commercial, industrial, parks, and transportation infrastructure.",
"Life expectancy": "The average number of years a person is expected to live, often used as a measure of population health and well-being.",
"Life year": "A unit of measure representing one year of life, often used in assessing the impact of diseases, interventions, or policies on mortality.",
"Link concentration": "The density or concentration of transportation links or connections within a network, often used in network analysis or optimization.",
"Link stress": "The level of stress or difficulty experienced by cyclists or pedestrians on specific road links or segments, often influenced by factors such as traffic volume, speed, and design.",
"Local accessibility": "The ease with which residents can reach nearby essential services, facilities, and destinations such as shops, schools, workplaces, and healthcare on foot or by bicycle.",
"Marginal metabolic equivalent of task": "A measure of energy expenditure or physical activity intensity, often used in health and fitness assessments.",
"MATSim": "Multi-Agent Transport Simulation, a framework for simulating individual travel behavior and interactions in transportation networks.",
"Microsimulation ": "A modeling technique that simulates individual entities or agents and their interactions to understand system-level behavior or outcomes.",
"Mobility outputs": "Results or outcomes related to mobility, such as congestion, travel times, travel stress. ",
"Mode choice": "The selection of a transportation mode for a given trip or journey, often influenced by factors such as distance, time, cost, and convenience.",
"Mortality risk": "The likelihood or probability of death within a population or group, often influenced by factors such as age, gender, lifestyle, and health status.",
"Multimodal network": "A transportation network that accommodates multiple modes of transportation, such as walking, cycling, public transport, and driving.",
"Multistate life table": "A statistical tool used to estimate life expectancies and mortality rates for different states or conditions within a population.",
"Network assignment": "The process of allocating or assigning travel demand to specific routes or paths within a transportation network, often used in transportation planning and modeling.",
"NO2": "Nitrogen dioxide, a common air pollutant produced by combustion processes, industrial activities, and vehicle emissions.",
"Nodes (of network)": "Points or locations within a transportation network where connections or links converge, diverge, or intersect.",
"Non-occupational physical activity": "Physical activity performed outside of work or occupational settings, such as exercise, recreation, or active transportation.",
"Noise": "Unwanted or harmful sound from vehicle traffic, airports, and industrial activities that can affect sleep, stress levels, cognitive function, and overall wellbeing.",
"OpenStreetMap (OSM)": "An open-source mapping platform and database containing user-generated geographic data, often used for mapping, navigation, and analysis.",
"Optimization procedure": "A method or algorithm used to find the best or most efficient solution to a problem, often used in transportation planning and network design.",
"Physical activity": "Any bodily movement produced by skeletal muscles that requires energy expenditure, often associated with health benefits and disease prevention.",
"Physical activity models": "Mathematical or computational systems that estimate how changes in the built environment and transportation infrastructure influence the amount and type of physical activity that individuals undertake.",
"PM2.5": "Particulate matter with a diameter of 2.5 micrometers or less, a common air pollutant generated by combustion processes, industrial activities, and vehicle emissions.",
"Points of interest": "Specific locations or landmarks that may be of interest to travelers, such as tourist attractions, restaurants, or parks.",
"Policy advisory group": "A stakeholder group comprising experts, policymakers, community representatives, and other key parties who provide guidance, feedback, and recommendations to inform the development and evaluation of transport and health policies.",
"Policy analysis": "The systematic evaluation of proposed or existing policies to assess their feasibility, impacts, costs, benefits, and effectiveness in achieving desired outcomes.",
"Quality of life": "A multidimensional concept encompassing physical health, mental wellbeing, social connections, safety, environmental quality, and overall satisfaction with life circumstances.",
"Risk factor": "Any attribute, characteristic, or exposure that increases the likelihood of developing a particular disease or health condition.",
"Road classifications": "Categorization of roads based on factors such as size, capacity, and function, often used in transportation planning and management.",
"Road segment": "A specific section of road between two distinct points, often used in transportation analysis and modeling.",
"Route level indicators": "Metrics or measures associated with specific travel routes, such as distance, travel time, safety, or comfort.",
"Routing": "Process of determining the best or optimal path or route from one location to another, often used in navigation systems or transportation planning.",
"Satellite data": "Information collected by satellites orbiting the Earth, often used for various purposes such as mapping, monitoring, and environmental analysis.",
"Scenario development": "The process of creating alternative plausible futures or hypothetical situations that explore different combinations of policies, infrastructure investments, and behavioral changes to understand potential outcomes.",
"Simulation model": "A model or system that replicates the behavior or characteristics of a real-world process or system, often used for analysis, prediction, or training.",
"Social demographic attributes": "Characteristics of a population related to social and demographic factors, such as age, gender, income, and education.",
"Spatial analysis": "Analysis of geographic data and relationships between spatial features or phenomena, often used to identify patterns or trends.",
"Spatial equity": "Fair and equitable distribution of resources, opportunities, and services across geographic areas or populations.",
"Spatial/temporal resolution": "Level of detail or granularity in spatial and temporal data or analysis, often related to the size of geographic units or time intervals.",
"State transitions model": "A model representing how individuals transition between different states or conditions over time, often used in health or demographic analysis.",
"Statistical Area 1 (SA1)": "A geographic unit used for statistical purposes, typically containing a population of 200 to 800 people, defined by the Australian Bureau of Statistics.",
"Statistical Area 2 (SA2)": "A larger geographic unit used for statistical purposes, typically containing a population of 3,000 to 25,000 people, defined by the Australian Bureau of Statistics.",
"Street connectivity": "Measure of how well-connected or accessible streets are within a network, often used in urban planning and transportation analysis.",
"Street level attributes": "Characteristics or features associated with streets at ground level, such as width, pavement condition, or amenities.",
"Stress": "In the context of cycling, refers to the level of discomfort, danger, or difficulty experienced by cyclists on different road segments, influenced by traffic volume, road design, and separation from motor vehicles.",
"Agent": "Simulated or artificial entity representing an individual or entity in a model or simulation.",
"Synthetic population": "Artificial population created for modeling or simulation purposes, often based on statistical or demographic data.",
"The integrated Transport and Health Impact Model (ITHIM)": "A modeling framework used to assess the health impacts of transportation policies and interventions.",
"Traffic volume": "The amount or volume of vehicular traffic on roadways, often measured as the number of vehicles passing a point within a specific time period.",
"Transition probability (between health states)": "The likelihood or probability of transitioning from one health state or condition to another over a certain period.",
"Transport behaviors": "Patterns or actions related to transportation choices and activities, such as mode choice, route selection, and travel frequency.",
"Transport model": "A representation of transportation systems, behaviors, or outcomes often used for analysing, predicting, or simulating how people travel, travel demand, and the impacts of changes to transportation infrastructure or policies on mobility patterns.",
"Transport network": "The infrastructure and pathways that enable movement of people or goods, often represented as a network of nodes and edges.",
"Transport networks: vehicles, walk, bike": "The integrated system of roads, pathways, and infrastructure that accommodates multiple modes of transportation including motorized vehicles, pedestrian paths, and cycling facilities.",
"Transport system": "The overarching framework or structure governing transportation operations, policies, and infrastructure.",
"Transport scenario": "A hypothetical or projected situation or condition related to transportation, often used for planning or policy analysis.",
"Travel behaviour model": "A model representing the choices and behaviors of individuals or groups related to travel and transportation.",
"Travel demand": "The need or desire for travel by individuals or groups, often influenced by factors such as work, recreation, and social activities.",
"Travel times": "The duration or length of time required to travel between two locations, often a key factor in transportation planning and decision-making.",
"Under-utilised capacity analysis": "Examination of unused or underutilized capacity within a system or infrastructure, often to identify opportunities for improvement or optimization.",
"Vehicle traffic": "The movement of vehicles on roadways or transportation networks, often measured by factors such as volume, speed, and density.",
"Viewshed greenness visibility index (VGVI)": "An indicator of the visibility or perceptibility of green spaces or vegetation within a specified viewshed or area.",
"VISTA data": "Data collected or generated by the Victorian Integrated Survey of Travel and Activity, often used for transportation planning and analysis.",
"Years lived with disability": "A measure of overall disease burden accounting for the impact of disability on quality of life and functioning.",
"Years of life lost": "A measure of premature mortality, representing the number of years lost due to death at an earlier age than expected."}

function createJibeGlossaryRows() {
    return Object.entries(glossary).map(([key, value]) => {
        return { name: key, description: value };
    });
}

export function GlossaryTable() {
    const [searchTerm, setSearchTerm] = useState('');
    const rows = createJibeGlossaryRows().filter(row => row.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleDownload = () => {
        const downloadLink = document.createElement('a');
        downloadLink.href = '/resources/JIBE Glossary of Key Terms.pdf';
        downloadLink.download = 'JIBE Glossary of Key Terms.pdf';
        downloadLink.click();
    };
    const handleRowClick = (row: {
        name: string;
        description: any;
    }) => {
        navigator.clipboard.writeText('"'+row.name+": "+row.description+'" (source: JIBE Team 2024, https://transporthealthimpacts.org)');
    };

    return (
        <div>
            <span id="widgets">
                <FileDownload id="download" onClick={handleDownload} titleAccess="Download glossary as a PDF file" style={{ cursor: 'pointer' }} />
                <input
                    id="search-bar"
                    type="text"
                    placeholder="Search for a concept"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    title="Filter list by searching for key words"
                />
            </span>
            <Table highlightOnHover={true} id='table-container'>
                <TableHead>
                    <TableRow>
                        <TableCell as="th">Concept</TableCell>
                        <TableCell as="th">Definition</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.name} onClick={() => handleRowClick(row)} style={{ cursor: 'pointer' }}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.description}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}



// const rows = createJibeGlossaryRows();
export function Glossary() {
    return (
    <>
    <Section
        stub="resources"
        section="faq"
        heading="Frequently Asked Questions"
        subheading=""
        subtext=""
        default_view={true}
        content={<Text>This website—including this section of frequently asked questions—is under active development during 2024. Please check back for updates.</Text>}
    />
    <Section
        stub="resources"
        section="key-terms"
        heading="Terms used in transport and health modelling"
        subheading="Search the table for specific terms, and optionally download these as a PDF file.  Click a term to copy its definition to the clipboard for use."
        subtext=""
        default_view={true}
        content={GlossaryTable()}
    />
    </>
    );
}
