import { Flex } from '@aws-amplify/ui-react';
import { Section } from './section'
import { ResourceCard } from './media';
import { Glossary } from './glossary.tsx';
import { References } from './references.tsx';
import { getResourceCategories, formatCategoryName, getCategoryId, getResourcesByCategory } from './vis/stories/resourcesUtils';

export function Resources() {
    // Dynamically get all categories from resources.json
    const categories = getResourceCategories();

    const ResourceSection = ({ items }: { items: any[] }) => (
        <>
            <Flex
                direction="row"
                justifyContent="center"
                alignItems="flex-start"
                alignContent="flex-start"
                wrap="wrap"
                gap="1.5rem"
                style={{ marginBottom: '2rem' }}
            >
                {items.map((item: any, i: number) => (
                    <ResourceCard
                        key={i + item.title}
                        title={item.title}
                        description={item.description}
                        formats={item.formats}
                        citation={item.citation}
                        licence={item.licence}
                        url={item.url}
                        journal={item.journal}
                    />
                ))}
            </Flex>
        </>
    );

    return (
        <>
            {categories.map((category) => {
                const categoryItems = getResourcesByCategory(category);
                const categoryId = getCategoryId(category);
                const categoryDisplay = formatCategoryName(category);
                
                return (
                    <Section
                        key={category}
                        stub={categoryId}
                        section={categoryId}
                        heading={categoryDisplay}
                        subheading=""
                        subtext=""
                        default_view={true}
                        content={
                            <ResourceSection items={categoryItems} />
                        }
                    />
                );
            })}
            <References />
            <Glossary />
        </>
    );
}
