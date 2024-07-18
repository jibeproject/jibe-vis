import { Flex, View, Text, Heading} from '@aws-amplify/ui-react';
import { Link } from '@mui/material';

export function parseText(text: string): JSX.Element[] {
    const linkRegex = /<a>(.*?)<\/a>/g;
    const parts = text.split(linkRegex);
    const parsedParts: JSX.Element[] = [];

    for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('<a>') && parts[i + 1] === '</a>') {
            const linkText = parts[i].substring(3);
            parsedParts.push(<Link key={i} component="a" href="#">{linkText}</Link>);
            i++; // Skip the closing </a> tag
        } else {
            parsedParts.push(<Text key={i} variation="primary">{parts[i]}</Text>);
        }
    }
    // console.log(parsedParts);
    return (parsedParts);
}

export function generic_section(section: string, heading: string, text: string, additional: any = null) {
    const parsedText = parseText(text);

    return (
        <section id={section}>
            <Flex direction={{ base: 'column', large: 'row' }}>
                <View minWidth={'570px'} maxWidth={{ base: '100%', large: '570px' }} padding="1rem">
                    <Heading level={1} order={1}>{heading}</Heading>
                    {additional ? additional : ""}
                </View>
                <View padding={{ base: '1rem', large: '1rem' }} width="100%" marginTop={16}>
                    {parsedText}
                </View>
            </Flex>
        </section>
    );
}
