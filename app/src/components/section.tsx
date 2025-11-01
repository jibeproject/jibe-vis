import { Flex, View, Heading, Text} from '@aws-amplify/ui-react';
import { NavHeading } from './navheading.tsx';

export function Section(props: {
    stub: string,
    section: string, 
    heading: string, 
    subheading: any,
    subtext: any,
    default_view: boolean,
    content: any, 
}
) {
    // const parsedText = parseText(text);
    return (
        <section id={props.section}>
            <Flex direction={{ base: 'column', large: 'row' }}>
                <View
                    width={{ base: '100%', large: '570px'}}
                    padding="1rem"
                >
                    {props.section?<NavHeading title={props.heading} id={props.section} stub={props.stub}/>:""}
                    {props.subheading?<Heading level={4} order={1}>{props.subheading}</Heading>:""}
                    <Text as="span">{props.subtext? props.subtext : ""}</Text>
                </View>
                {
                    props.default_view?                   
                        <View 
                        padding='1rem'
                        width="100%"
                        marginTop={{ base: '-3rem', large: '1rem'}}
                        >
                            {props.content}
                        </View> : 
                        <View>{props.content}</View>
                }
            </Flex>
        </section>
    )
}
