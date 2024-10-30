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
        {stories.map((item: any, i) => (
          <StoryCard key={i+item.title} title={item.title} page={item.page} type={item.type} img={item.img} authors={item.authors} cols={item.cols} featured={item.featured} story={item.story} />
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
        subtext="The Transport Health Impacts platform is under active development, and access to the included data story vignettes currently requires login details provided by the developers upon request."
        default_view={true}
        content={<>
            {Ampersand("70","94")}
            {Stories()}
            </>}
        />
    );
};
