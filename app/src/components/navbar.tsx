import { FC, useState } from 'react';
import './navbar.css';
import logo from './cropped_jibe_logo_rgb.png';
import { Button, Card, Flex, Grid, Tabs, Text } from '@aws-amplify/ui-react';
import Map from './map';

const Navbar: FC = () => {
  const [tab, setTab] = useState('1');
  return (
    <>
      <img src={logo} alt="Visualising impacts of urban and transport planning scenarios based on simulation modelling evidence from the JIBE Project" className="logo"/>
      <Tabs className="heading"
        value={tab}
        onValueChange={(tab) => setTab(tab)}
        items={[
          {
            label: 'About',
            value: '1',
            content: (
<Grid
  columnGap="0.5rem"
  rowGap="0.5rem"
  templateColumns="1fr 1fr 1fr"
  templateRows="3fr 1fr"
>
  <Card
    columnStart="1"
    columnEnd="2"
  >
    Nav
  </Card>
  <Card
    columnStart="2"
    columnEnd="-1"
  >
    <Flex justifyContent="space-between" direction="column">
<Text>Supported by a VicHealth Impact Grant, we aim to catalyse the potential impact of results of a Victorian Department of Transport-funded RMIT/University of Cambridge collaborative study of the health impacts of urban and transport planning scenarios (https://cur.org.au/project/jibe/).  This will be achieved by creating a tool to enable knowledge translation, co-designed with stakeholder transport, planning and health policymakers, technical practitioners, and advocates. We will co-create a visualisation tool for our transport and health model results with stakeholders to support creating and implementing healthy built environment policies. The tool will provide policy-relevant evidence on built environment change scenarios that maximise active transport uptake, redress spatial and health inequities and inform investments in high impact-built environment interventions. This project will benefit from our well-established collaborations with government and non-government organisations facilitated through Healthy Liveable City Lab's Policy Advisory Group (PAG). The PAG is chaired by the CEO of Infrastructure Victoria and includes all responsible sectors for delivering a healthy built environment for all Melburnians, including Department of Transport and Planning.</Text>
 
 <Text>The VicHealth Impact Research Grant will facilitate the use of research models and evidence of the health and equity impacts of transport and planning strategies and policies to support the creation of healthy built environments for all Melbournians. We will address practice and policy needs related to the assessment of health and equity implications of key planning and transport visions in Victoria. We propose to co-design a visualisation tool to showcase the results of our transport and health model and share our modelling methods in a series of workshops. Co-design is a participatory process that involves stakeholders in the process of planning, design and implementation of a product (visualisation tool) (Javanparast et al., 2022).  This approach aligns with the AWS 'Working Backwards' methodology.</Text>
  
 <Text>Our specific objectives are:</Text>
  
 <Text>1. To co-design a visualisation tool for the transport and health model results for Melbourne and test usability as a tool to influence the formulation of healthy built environment policies.</Text>
  
 <Text>2. To contribute to improve transport modelling practice towards the inclusion of walking and cycling and related health impacts.</Text>
  
 <Text>3. To provide evidence on the potential health and equity impact of the selected built environment change scenarios using the visualisation tool.</Text>
 
 <Text>Project lead: Belen Zapata-Diomedia (CI)</Text>
 <Text>Developer: Carl Higgs</Text>
 <Text>Project officer: Atefeh Soleimani Roudi</Text>
 </Flex>
                

                </Card>
  <Card
    columnStart="2"
    columnEnd="-1"
  >
    <Button isFullWidth onClick={() => setTab('2')}>
                  Visualise the 20 minute neighbourhood intervention for Melbourne
                </Button>
  </Card>
</Grid>
            ),
          },
          {
            label: '20-minute neighbourhoods',
            value: '2',
            content: (
              <>
                <Map />
              </>
            ),
          },
          {
            label: 'Get the data',
            value: '3',
            content: (
              <>
              List of data and options for download
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export default Navbar;