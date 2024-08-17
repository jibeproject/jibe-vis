import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data'
import type { Schema } from "../../../amplify/data/resource";
import { Section } from '../section.tsx';
import { FeedbackCard } from '../media.tsx';
import { Flex } from '@aws-amplify/ui-react';
import { Button } from '@mui/material';
import { Heading } from '@aws-amplify/ui-react';    

const client = generateClient<Schema>({});


export function Feedback() {
    const [feedback, setFeedback] = useState<Schema["Feedback"]["type"][]>([]);
  
    const fetchFeedback = async () => {
      const { data: items } = await client.models.Feedback.list();
      setFeedback(items);
    };
    useEffect(() => {
      fetchFeedback();
    }, []);

    return (
      <Section
        stub="about"
        section='feedback'
        heading="Feedback"
        subheading=""
        subtext={
            <><Heading level={4}>The following comments and suggestions have been shared through the online feedback chat button, in the lower right corner on this website.</Heading><Heading level={4}>If you have a comment to share, we would love to hear your thoughts.</Heading><Button onClick={fetchFeedback}>Refresh for updated feedback</Button></>
        }
        default_view={true}
        content={
            <Flex
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            alignContent="flex-start"
            wrap="wrap"
            gap="5rem"
            marginTop={4}
            >
                
            {feedback.sort((a, b) => (a?.datetime ?? '').localeCompare(b?.datetime ?? '')).map((item, index) => {
                return (
                    FeedbackCard({index, comment: item.comment ?? '', datetime:item.datetime ?? '', url:item.url ?? ''})
                );}
            )}
            </Flex>
        }
        />
    );
};

export default Feedback;