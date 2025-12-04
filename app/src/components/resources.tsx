import { Flex, Text } from '@aws-amplify/ui-react';
import { Section } from './section'
import { ResourceCard } from './media';
import { Glossary } from './glossary.tsx';
import { References } from './references.tsx';
import resources from './vis/stories/resources.json';

export function Resources() {
    // Group resources by category
    const presentations = resources.filter((item: any) => item.category === 'presentations');
    const data = resources.filter((item: any) => item.category === 'data');
    const articles = resources.filter((item: any) => item.category === 'articles');

    const ResourceSection = ({ items }: { title: string; items: any[] }) => (
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
                    />
                ))}
            </Flex>
        </>
    );

    return (
        <>
            <Section
                stub="resources"
                section="gallery"
                heading="JIBE Resources"
                subheading=""
                subtext=""
                default_view={true}
                content={
                    <Flex direction="column" style={{ width: '100%' }}>
                      <Flex direction="row" gap="1rem" wrap="wrap" justifyContent="left" alignItems="center" style={{ marginBottom: '2rem' }}>
                        <Text>Skip to: </Text>
                        {presentations.length > 0 && (
                          <a href="#presentations" style={{ textDecoration: 'none', color: '#047d95', fontWeight: 600 }} onMouseEnter={(e) => { e.currentTarget.style.color = '#2caa4a'; e.currentTarget.style.textDecoration = 'underline'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#047d95'; e.currentTarget.style.textDecoration = 'none'; }}>
                            Presentations
                          </a>
                        )}
                        {data.length > 0 && (
                          <a href="#data" style={{ textDecoration: 'none', color: '#047d95', fontWeight: 600 }} onMouseEnter={(e) => { e.currentTarget.style.color = '#2caa4a'; e.currentTarget.style.textDecoration = 'underline'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#047d95'; e.currentTarget.style.textDecoration = 'none'; }}>
                            Data
                          </a>
                        )}
                        {articles.length > 0 && (
                          <a href="#articles" style={{ textDecoration: 'none', color: '#047d95', fontWeight: 600 }} onMouseEnter={(e) => { e.currentTarget.style.color = '#2caa4a'; e.currentTarget.style.textDecoration = 'underline'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#047d95'; e.currentTarget.style.textDecoration = 'none'; }}>
                            Articles
                          </a>
                        )}
                        <a href="#references" style={{ textDecoration: 'none', color: '#047d95', fontWeight: 600 }} onMouseEnter={(e) => { e.currentTarget.style.color = '#2caa4a'; e.currentTarget.style.textDecoration = 'underline'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#047d95'; e.currentTarget.style.textDecoration = 'none'; }}>
                          References
                        </a>
                        <a href="#key-terms" style={{ textDecoration: 'none', color: '#047d95', fontWeight: 600 }} onMouseEnter={(e) => { e.currentTarget.style.color = '#2caa4a'; e.currentTarget.style.textDecoration = 'underline'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#047d95'; e.currentTarget.style.textDecoration = 'none'; }}>
                          Glossary
                        </a>
                      </Flex>
                    </Flex>
                }
            />
            {presentations.length > 0 && (
            <Section
                stub="presentations"
                section="presentations"
                heading="Presentations"
                subheading=""
                subtext=""
                default_view={true}
                content={
                    <ResourceSection title="Presentations" items={presentations} />
                }
            />
            )}
            {data.length > 0 && (
            <Section
                stub="data"
                section="data"
                heading="Data"
                subheading=""
                subtext=""
                default_view={true}
                content={
                    <ResourceSection title="Data" items={data} />
                }
            />
            )}
            {articles.length > 0 && (
            <Section
                stub="articles"
                section="articles"
                heading="Articles"
                subheading=""
                subtext=""
                default_view={true}
                content={
                    <ResourceSection title="Articles" items={articles} />
                }
            />
            )}
            <References />
            <Glossary />
        </>
    );
}
