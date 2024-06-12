// import { useMemo } from 'react';
// import Box from '@mui/material/Box';
import { DataGrid, GridToolbar,GridColDef} from '@mui/x-data-grid';
import './glossary.css'

const jibe_glossary: { [key: string]: any } = {
"20 minute neighbourhood": "A concept focused on urban planning where residents can access most of their daily needs within a 20-minute return walk from home, emphasising safe cycling and local transport options.",
"Access points": "Points indicating how every activity location can be reached on the network, providing information on accessibility.",
"Accessibility analysis": "Examination of how easily individuals can reach various destinations, often considering factors such as distance, transportation options, and infrastructure.",
"Active travel": "Modes of transportation that involve physical activity, such as walking or cycling.",
"Active travel decisions": "Choices made by individuals regarding their use of active transportation modes.",
"Activity centres": "Places where various activities (e.g., work, shopping, recreation) occur, often serving as focal points for transportation planning.",
"Activity-based transport model": "A transportation model that represents travel behavior based on individual activities rather than trips.",
"Address level": "Precise geographic coordinates of a location, often used for detailed mapping and analysis.",
"Agent-based transport model": "Modeling approach that simulates the behavior of individual agents (e.g., people, vehicles) to understand system-level outcomes.",
"Background concentration": "Ambient level of a substance (e.g., air pollution) in a given environment.",
"Base case": "A scenario representing the current state or situation, often used as a reference point for comparison in analyses.",
"Base year": "A specific year used as the starting point for analysis or comparison in a study.",
"Behavioral model ": "Models aimed at understanding human behavior and model intervention/scenario impacts.",
"Behavioural modification": "Interventions aimed at altering human behavior to achieve desired outcomes.",
"Binary scoring method": "A method assigning a score of 1 or 0 based on whether a condition is met or not.",
"Body mass index (BMI)": "A measure of body fat based on height and weight, commonly used to assess health and risk of disease.",
"Built environment": "Human-made surroundings where people live, work, and recreate, including infrastructure like buildings, parks, and transportation networks.",
"Catchments (for activity centres)": "Areas surrounding activity centers that capture the population or demand for services.",
"Chronic disease": "Long-lasting medical conditions requiring ongoing management or treatment.",
"Coarse representation (of land use and transport)": "Simplified or generalised representation of land use and transportation features in modeling or analysis.",
"Comparative risk assessment": "Methods developed by the World Health Organisation to assess the population health burden of exposure to risk factors",
"Congestion level": "Degree of traffic congestion on roadways or transportation networks, often measured by factors like travel time or vehicle density.",
"Cycling infrastructure": "Facilities and amenities designed to support cycling, such as bike lanes, bike paths, and bike racks.",
"Cycling stress": "A measure used to predict how suitable different roads on the network are for cycling.",
"Daily living destinations": "Locations where people regularly go for daily activities such as work, shopping, or recreation.",
"Dedicated bike lanes": "Segregated lanes reserved for bicycles, separate from motor vehicle traffic.",
"Demographic events": "Significant demographic changes or milestones in individuals' lives, such as births, deaths, marriages, or job changes.",
"Demographic model": "A model that simulates population dynamics and characteristics, often used in forecasting or planning.",
"Digital surface model": "A digital representation of the Earth's surface, often used for terrain analysis or mapping.",
"Digital terrain model": "A digital model representing the bare Earth's surface, often used for elevation analysis or mapping.",
"Directed graph structure": "A mathematical representation of a network with edges indicating directional connections between nodes.",
"Disease specific occurrence": "Incidence or prevalence of a specific disease or health condition within a population.",
"Dose response function": "Relationship between a behaviours, exposure to a substance or factor and the likelihood or severity of a health outcome.",
"Dying prematurely/ premature death": "Death occurring at a younger age than expected, often due to preventable causes or health issues.",
"Edge effects": "Effects resulting from people traveling in and out of the border or boundary of a defined area.",
"Edges (of network)": "Connections or links between nodes in a network, representing transportation routes or pathways.",
"Elevation data": "Information about the height or elevation of terrain features, often used in geographic analysis or mapping.",
"Environmental outputs": "Results or outcomes related to the environment, such as emissions, pollution levels, or habitat quality.",
"Equitable access (cycling intervention)": "Ensuring fair and equal access to cycling infrastructure or opportunities for all members of society.",
"Equitable distribution": "Fair and even allocation or distribution of resources, opportunities, or benefits across a population.",
"Exposure simulations": "Simulated scenarios or models representing potential exposures to hazards, pollutants, or other factors.",
"Eye-level greenness visibility": "Visibility or presence of green spaces or vegetation at eye level, often used in environmental or urban planning.",
"Features of urban design": "Characteristics or elements of urban environments, such as population density, land use mix, or transportation infrastructure.",
"General Transit Feed Specification (GTFS)": "A standard format for public transportation schedules and related geographic information.",
"Geographic database/geodatabase": "A database containing geographic data, often used for mapping, analysis, or modeling purposes.",
"Gradient": "The rate of change of elevation over distance, often used to describe the steepness of terrain features.",
"Health adjusted life years": "A measure of overall disease burden, combining the impact of mortality and morbidity on quality of life.",
"Health Economic Assessment Tool (HEAT by WHO)": "A tool developed by the World Health Organization (WHO) for assessing the health and economic impacts of transportation interventions.",
"Health exposures": "Factors or conditions that influence health outcomes or risks, such as air pollution, physical activity, or access to healthcare.",
"Health impact models": "Models that simulate or predict the health effects of various factors or interventions, often used in public health or policy analysis.",
"Health inequalities": "Disparities or differences in health outcomes or access to healthcare between different population groups.",
"Health outputs": "Results or outcomes related to health, such as disease incidence, mortality rates, or years of life lost.",
"Health pathways": "Ways in which the built environment influences health, including factors such as physical activity, exposure to pollutants, social connections, and access to healthcare.",
"Health trajectory": "The expected course or pattern of health status or outcomes over time, often influenced by factors such as lifestyle, environment, and healthcare access.",
"Individual travel activity plan": "A plan or schedule detailing an individual's travel activities, including destinations, modes of transportation, and timing.",
"Intervention": "An action, policy, or program implemented to achieve a specific outcome or address a particular issue or problem.",
"Junction stress": "The level of stress or difficulty experienced by cyclists at road junctions or intersections, often influenced by factors such as traffic volume, design, and signage.",
"Knowledge translation": "The process of synthesizing, disseminating, and applying research findings or knowledge to inform decision-making, policy development, or practice.",
"Land use database": "A database containing information about the distribution and characteristics of land use, often used in urban planning, environmental analysis, and transportation modeling.",
"Latent demand scenario (cycling intervention)": "Hypothetical situations or scenarios representing unmet or latent demand for cycling infrastructure or opportunities.",
"Life expectancy": "The average number of years a person is expected to live, often used as a measure of population health and well-being.",
"Life year": "A unit of measure representing one year of life, often used in assessing the impact of diseases, interventions, or policies on mortality or quality of life.",
"Link concentration": "The density or concentration of transportation links or connections within a network, often used in network analysis or optimization.",
"Link stress": "The level of stress or difficulty experienced by cyclists or pedestrians on specific road links or segments, often influenced by factors such as traffic volume, speed, and design.",
"Local Government Area (LGA)": "A geographical area or administrative division within a country or region, often used for local governance and planning purposes.",
"Marginal metabolic equivalent of task": "A measure of energy expenditure or physical activity intensity, often used in health and fitness assessments.",
"MATSim": "Multi-Agent Transport Simulation, a framework for simulating individual travel behavior and interactions in transportation networks.",
"Microsimulation approach": "A modeling technique that simulates individual entities or agents and their interactions to understand system-level behavior or outcomes.",
"Mobility outputs": "Results or outcomes related to mobility, such as travel patterns, mode choice, or accessibility.",
"Mode choice": "The selection of a transportation mode for a given trip or journey, often influenced by factors such as distance, time, cost, and convenience.",
"Mortality risk": "The likelihood or probability of death within a population or group, often influenced by factors such as age, gender, lifestyle, and health status.",
"Multimodal network": "A transportation network that accommodates multiple modes of transportation, such as walking, cycling, public transit, and driving.",
"Multistate life table": "A statistical tool used to estimate life expectancies and mortality rates for different states or conditions within a population.",
"Network assignment": "The process of allocating or assigning travel demand to specific routes or paths within a transportation network, often used in transportation planning and modeling.",
"NO2": "Nitrogen dioxide, a common air pollutant produced by combustion processes, industrial activities, and vehicle emissions.",
"Nodes (of network)": "Points or locations within a transportation network where connections or links converge, diverge, or intersect.",
"Non-occupational physical activity": "Physical activity performed outside of work or occupational settings, such as exercise, recreation, or active transportation.",
"OpenStreetMap (OSM)": "An open-source mapping platform and database containing user-generated geographic data, often used for mapping, navigation, and analysis.",
"Optimization procedure": "A method or algorithm used to find the best or most efficient solution to a problem, often used in transportation planning and network design.",
"Physical activity": "Any bodily movement produced by skeletal muscles that requires energy expenditure, often associated with health benefits and disease prevention.",
"Planning system": "A framework or process for developing and implementing plans, policies, and strategies to guide future development and decision-making.",
"PM2.5": "Particulate matter with a diameter of 2.5 micrometers or less, a common air pollutant generated by combustion processes, industrial activities, and vehicle emissions.",
"Points of interest": "Specific locations or landmarks that may be of interest to travelers, such as tourist attractions, restaurants, or parks.",
"Policy advisory group": "A group or committee tasked with providing advice, recommendations, or guidance on policy development, implementation, or evaluation.",
"Respiratory diseases": "Health conditions affecting the respiratory system, such as asthma or chronic obstructive pulmonary disease (COPD).",
"Risk factor": "Any attribute, characteristic, or exposure that increases the likelihood of developing a particular disease or health condition.",
"Road classifications": "Categorization of roads based on factors such as size, capacity, and function, often used in transportation planning and management.",
"Road segment": "A specific section of road between two distinct points, often used in transportation analysis and modeling.",
"Route level indicators": "Metrics or measures associated with specific travel routes, such as distance, travel time, safety, or comfort.",
"Routing": "Process of determining the best or optimal path or route from one location to another, often used in navigation systems or transportation planning.",
"Safe cycling infrastructure": "Physical infrastructure designed to support safe and convenient cycling, including bike lanes, cycle tracks, and bike-friendly intersections.",
"Satellite data": "Information collected by satellites orbiting the Earth, often used for various purposes such as mapping, monitoring, and environmental analysis.",
"Simulation model": "A model or system that replicates the behavior or characteristics of a real-world process or system, often used for analysis, prediction, or training.",
"Social demographic attributes": "Characteristics of a population related to social and demographic factors, such as age, gender, income, and education.",
"Spatial analysis": "Analysis of geographic data and relationships between spatial features or phenomena, often used to identify patterns or trends.",
"Spatial equity": "Fair and equitable distribution of resources, opportunities, and services across geographic areas or populations.",
"Spatial outputs": "Results or outcomes from spatial analysis or modeling processes, often represented visually or numerically.",
"Spatial/temporal resolution": "Level of detail or granularity in spatial and temporal data or analysis, often related to the size of geographic units or time intervals.",
"State transitions model": "A model representing how individuals transition between different states or conditions over time, often used in health or demographic analysis.",
"Statistical Area 1 (SA1)": "A geographic unit used for statistical purposes, typically containing a population of 200 to 800 people, defined by the Australian Bureau of Statistics.",
"Statistical Area 2 (SA2)": "A larger geographic unit used for statistical purposes, typically containing a population of 3,000 to 25,000 people, defined by the Australian Bureau of Statistics.",
"Street connectivity": "Measure of how well-connected or accessible streets are within a network, often used in urban planning and transportation analysis.",
"Street level attributes": "Characteristics or features associated with streets at ground level, such as width, pavement condition, or amenities.",
"Synthetic agent": "Simulated or artificial entity representing an individual or entity in a model or simulation.",
"Synthetic population": "Artificial population created for modeling or simulation purposes, often based on statistical or demographic data.",
"The integrated Transport and Health Impact Model (ITHIM)": "A modeling framework used to assess the health impacts of transportation policies and interventions.",
"Traffic volume": "The amount or volume of vehicular traffic on roadways, often measured as the number of vehicles passing a point within a specific time period.",
"Transition probability (between health states)": "The likelihood or probability of transitioning from one health state or condition to another over a certain period.",
"Transport behaviors": "Patterns or actions related to transportation choices and activities, such as mode choice, route selection, and travel frequency.",
"Transport model": "A representation of transportation systems, behaviors, or outcomes, often used for analysis, planning, or simulation.",
"Transport network": "The infrastructure and pathways that enable movement of people or goods, often represented as a network of nodes and edges.",
"Transport system": "The overarching framework or structure governing transportation operations, policies, and infrastructure.",
"Transport scenario": "A hypothetical or projected situation or condition related to transportation, often used for planning or policy analysis.",
"Travel behaviour model": "A model representing the choices and behaviors of individuals or groups related to travel and transportation.",
"Travel demand": "The need or desire for travel by individuals or groups, often influenced by factors such as work, recreation, and social activities.",
"Travel times": "The duration or length of time required to travel between two locations, often a key factor in transportation planning and decision-making.",
"Trip-based parenting": "Parenting approach focused on organizing activities and responsibilities around trips or travel needs, often used to manage family schedules and logistics.",
"Under-utilised capacity analysis": "Examination of unused or underutilized capacity within a system or infrastructure, often to identify opportunities for improvement or optimization.",
"Vehicle traffic": "The movement of vehicles on roadways or transportation networks, often measured by factors such as volume, speed, and density.",
"Viewshed greenness visibility index (VGVI)": "An indicator of the visibility or perceptibility of green spaces or vegetation within a specified viewshed or area.",
"VISTA data": "Data collected or generated by the Victorian Integrated Survey of Travel and Activity, often used for transportation planning and analysis.",
"Work bike accessibility": "The ease or convenience of accessing workplaces or employment centers via bicycle, often influenced by factors such as infrastructure, distance, and safety.",
"Years lived with disability": "A measure of overall disease burden accounting for the impact of disability on quality of life and functioning.",
"Years of life lost": "A measure of premature mortality, representing the number of years lost due to death at an earlier age than expected."
}

function createJibeGlossaryRows() {
    return Object.entries(jibe_glossary).map(([key, value]) => {
        return { name: key, description: value };
    });
}

// const rows = createJibeGlossaryRows();
export function JibeGlossary() {
    const columns: GridColDef[] = [
        {field:'name', headerName:'Concept', width: 200},
        {field:'description', headerName:'Definition', width: 600}
    ]
    const data = createJibeGlossaryRows();
    return (
      <div  className="data-grid-container">
        <DataGrid
            sx={{
            "& .MuiDataGrid-columnHeaderTitle": {
                whiteSpace: "normal",
                lineHeight: "normal",
                fontWeight: "bold !important"
            },
            "& .MuiDataGrid-columnHeader": {
                // Forced to use important since overriding inline styles
                height: "unset !important",
            },
            "& .MuiDataGrid-cell": {
                // Forced to use important since overriding inline styles
                lineHeight: "16px !important",
                textWrap: "wrap !important"
            },
            "& .MuiDataGrid-columnHeaders": {
                // Forced to use important since overriding inline styles
                maxHeight: "168px !important"
            }
            }}
            autoHeight
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            columns={columns}
            rows ={data}
            getRowId={(row) => row.name} 
            slots={{ toolbar: GridToolbar }}
            slotProps={{
                toolbar: {
                showQuickFilter: true,
            },
          }}
        />
      </div>
    );
}

