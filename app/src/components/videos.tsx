import { Flex, View, Heading} from '@aws-amplify/ui-react';
import VideoCard from './media';

export function Videos() {
    return (
    <div>
    <Flex direction={{ base: 'column', large: 'row'}}>
        <View
        // minWidth={'570px'}
        maxWidth={{ base: '100%', large: '570px'}}
        padding="1rem"
        >
            <Heading level={1} order={1}>Videos</Heading>
            <Heading level={4}> We have prepared a series of videos that provide more details about the modelling methods and outputs used in the JIBE project.  An <a href="https://www.youtube.com/watch?v=ycDjPVjGhmg" title="Joining Impact models with spatial measures of the Built Environment (JIBE)IBE">edited version including subtitles</a> is available to view on YouTube, and the seperate video chapters have also been included below.</Heading>
        </View>
        <View 
        padding={{ base: '1rem', large: '1rem'}}
        width="100%"
        marginTop={24}
        >
        <Flex
        direction="row"
        justifyContent="center"
        alignItems="flex-start"
        alignContent="flex-start"
        wrap="wrap"
        gap="1rem"
        >
        {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/introduction%20video.mp4",
            "JIBE Modelling methods and outputs",
            "Dr Belen Zapata-Diomedi provides an introduction to the Joining Impact models of transport with spatial measures of the Built Environment (JIBE) project.",
            '',
            '')}
        {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/agent%20based%20transport%20model%20and%20exposure_video.mp4",
            "Agent-based transport model and exposures",
            "Dr Qin Zhang introduces the agent-based transport model and exposure simulations developed for evaluating the impact of urban design and transport interventions in Melbourne, Australia.",
            '',
            '')}
        {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/spatial%20data%20melbourne.mp4",
            "Geodatabase for Melbourne Land use and Transport",
            "Corin Staves introduces the geographic resources developed for modelling the built environment and transport in Greater Melbourne.",
            '',
            '')}
        {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/health%20models%20video.mp4",
            "JIBE health model",
            "Dr Belen Zapata-Diomedi explains the built environment exposure health models developed for the JIBE project.",
            '',
            '')}
        {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/20mn%20neighbourhood%20video.mp4",
            "Local accessibility: Melbourne 20-minute neighbourhood scenario",
            "Steve Pemberton describes the modelling of interventions exploring impacts of the Plan Melbourne 20-minute neighbourhoods policy on walking and cycling uptake.",
            '',
            '')}
        {VideoCard(
            "https://d1txe6hhqa9d2l.cloudfront.net/videos/cycling%20intervention%20video.mp4",
            "Cycling intervention: a comparison of two cycling scenarios in Greater Melbourne",
            "Mahsa Abdollahyar introduces the spatial outputs modelled for cycling scenarios relating to latent demand and equity in Melbourne.",
            '',
            '')}
        </Flex>
        </View>
        </Flex>
        </div>
    )
};

