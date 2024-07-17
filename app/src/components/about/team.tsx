import { Flex, View, Text, Heading} from '@aws-amplify/ui-react';
import { Link } from '@mui/material';
import { logo_UC, logo_RMIT, logo_TUM } from './logos/logos';
const team = [
    {'Development Team': [
    {'name': 'Dr Belen Zapata Diomedi', 'role': 'Principal Investigator', 'institution': 'University of Cambridge / RMIT University'},
    {'name': 'Dr Carl Higgs', 'role': 'Research Software Engineer / Developer, Co-Investigator', 'institution': 'RMIT University'},
    {'name': 'Atefeh Soleimani Roudi', 'role': 'Co-Investigator', 'institution': 'RMIT University'},
    ]},
    {'Partner Investigators': [
    {'name': 'Prof James Woodcock', 'role': 'Partner Investigator', 'institution': 'University of Cambridge'},
    {'name': 'Prof Rolf Moeckel', 'role': 'Partner Investigator', 'institution': 'Technical University of Munich'},
    {'name': 'Dr Alan Both', 'role': 'Partner Investigator', 'institution': 'RMIT University'},
    ]},
    {'Co-investigators': [
    {'name': 'Dr Afshin Jafari', 'role': 'Co-investigator', 'institution': 'RMIT University'},
    {'name': 'Steve Pemberton', 'role': 'Co-investigator', 'institution': 'RMIT University'},
    {'name': 'Mahsa Abdollahyar', 'role': 'Co-investigator', 'institution': 'RMIT University'},
    {'name': 'Ismail Saadi', 'role': 'Co-investigator', 'institution': 'University of Cambridge'},
    {'name': 'Qin Zhang', 'role': 'Co-investigator', 'institution': 'University of Cambridge'},
    {'name': 'Corin Staves', 'role': 'Co-investigator', 'institution': 'University of Cambridge'},
    {'name': 'Melanie Lowe', 'role': 'Co-investigator', 'institution': 'RMIT University'},
    ]}
]

export function Team() {
  return (
    <section id="team">
    <Flex direction={{ base: 'column', large: 'row'}}>
      <View  
        minWidth={'570px'}
        maxWidth={{ base: '100%', large: '570px'}}
        padding="1rem"
        >
          <Heading level={1} order={1}>Team</Heading>
       </View>
      <View 
        padding={{ base: '1rem', large: '1rem'}}
        width="100%"
        >
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
        <Flex
            direction='row'
            alignItems='center'
            marginTop={20}
            id="logos-institutional"
        >
            <View margin={16}>{logo_RMIT(50)}</View>
            <View margin={16}>{logo_UC(50)}</View>
            <View margin={16}>{logo_TUM(50)}</View>
        </Flex>
      </View>
      </Flex>
    </section>
  );
}
