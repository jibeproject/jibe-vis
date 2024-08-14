import { Flex, View, Text, Heading} from '@aws-amplify/ui-react';
import { Link } from '@mui/material';
import { logo_UC, logo_RMIT, logo_TUM } from './logos/logos';
import { Section } from '../section.tsx';

const team = [
    {'Development Team': [
    {'name': 'Dr Belen Zapata Diomedi', 'role': 'Principal Investigator', 'institution': 'University of Cambridge / RMIT University'},
    {'name': 'Dr Carl Higgs', 'role': 'Research Software Engineer / Developer, Co-Investigator', 'institution': 'RMIT University'},
    {'name': 'Atefeh Soleimani Roudi', 'role': 'Co-Investigator', 'institution': 'RMIT University'},
    ]},
    {'Co-Investigators': [
    {'name': 'Prof James Woodcock', 'role': 'Partner Investigator', 'institution': 'University of Cambridge'},
    {'name': 'Prof Rolf Moeckel', 'role': 'Partner Investigator', 'institution': 'Technical University of Munich'},
    {'name': 'Dr Afshin Jafari', 'role': ' Partner Investigator', 'institution': 'RMIT University'},
    {'name': 'Dr Ali Abbas', 'role': 'Partner Investigator', 'institution': 'University of Cambridge'},
    {'name': 'Steve Pemberton', 'role': 'Co-investigator', 'institution': 'RMIT University'},
    {'name': 'Mahsa Abdollahyar', 'role': 'Co-investigator', 'institution': 'RMIT University'},
    {'name': 'Dr Qin Zhang', 'role': 'Co-investigator', 'institution': 'University of Cambridge'},
    {'name': 'Dr Ismaïl Saadi', 'role': 'Co-investigator', 'institution': 'University of Cambridge'},
    {'name': 'Corin Staves', 'role': 'Co-investigator', 'institution': 'University of Cambridge'},
    {'name': 'Dr Alan Both', 'role': 'Partner Investigator', 'institution': 'RMIT University'},
    {'name': 'Dr Tayebeh Saghapour', 'role': 'Co-investigator', 'institution': 'RMIT University'},
    {'name': 'Dr SM Labib', 'role': 'Partner Investigator', 'institution': 'Utrecht University'},
    {'name': 'Dr Melanie Lowe', 'role': 'Co-investigator', 'institution': 'RMIT University'},
    {'name': 'Ryan Turner', 'role': 'Co-investigator', 'institution': 'RMIT University'},
    ]}
]

export function Team() {
  return (
    <div>
    <Section
    stub="about"
    section='team'
    heading="Team"
    subheading=""
    subtext=""
    default_view={true}
    content={<>
        {team.map((group, i) => {
                const subgroup = Object.keys(group)[0]
                return (
                    <View key={i}>
                        <Heading level={3} order={1}>{subgroup}</Heading>
                        {group[subgroup as keyof typeof group]?.map((member, i) => {
                        return (
                            <Text key={i}>{member.name}{subgroup==="Development Team"?", "+member.role+", ":", "}{member.institution}</Text>
                        );
                        })}
                    </View>
                );
            })}
        <Text>Find out more about the full <Link href="https://jibeproject.com/our-people/">JIBE modelling team</Link>.</Text>
    </>
    }
    />
    <Section
    stub="about"
    section=""
    heading=""
    subheading=""
    subtext=""
    default_view={true}
    content={
        <Flex
        direction={{ base: 'column', large: 'row'}}
        alignItems='center'
        marginTop={20}
        id="logos-institutional"
        >
        <View margin={16}>{logo_RMIT(50)}</View>
        <View margin={16}>{logo_UC(50)}</View>
        <View margin={16}>{logo_TUM(50)}</View>
        </Flex>
    }
    />
    </div>
  );
}
