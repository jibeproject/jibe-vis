import { Flex } from '@aws-amplify/ui-react';
import { Ampersand } from './vis/transporthealthimpacts.tsx';
import stories from './vis/stories/stories.json';
import { StoryCard } from './media';
import { Section } from './section.tsx';

export default function Stories() {
return (
    <Flex
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            alignContent="flex-start"
            wrap="wrap"
            gap="1rem"
            >
        {stories.map((item: any) => (
          <StoryCard key={item.title} title={item.title} page={item.page} type={item.type} img={item.img} author={item.author} author_url={item.author_url} cols={item.cols} featured={item.featured} story={item.story} />
        ))}
    </Flex>
);
}

export function Pathways() {
    return (
        <Section 
        stub="pathways"
        section="pathways"
        heading="Pathways"
        subheading="A series of vignettes illustrating evidence of the pathways through which transport planning and policy impact travel behaviours and health outcomes."
        subtext="Data stories have not yet been implemented, but this is an experiment for how an on-going series of relevant vignettes illustrating the health impacts of transport planning and policy could be incorporated and their page layout."
        default_view={true}
        content={<>
            {Ampersand("70","94")}
            {Stories()}
            </>}
        />
    );
};
