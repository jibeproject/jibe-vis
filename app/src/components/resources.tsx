import { Flex } from '@aws-amplify/ui-react';
import { Section } from './section'
import { ResourceCard } from './media';
import { Glossary } from './glossary.tsx';
import { References } from './references.tsx';
import { getResourceCategories, formatCategoryName, getCategoryId, getResourcesByCategory } from './vis/stories/resourcesUtils';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export function Resources() {
    // Dynamically get all categories from resources.json
    const categories = getResourceCategories();
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleCopyAllCitations = (items: any[]) => {
        const citations = items
            .map(item => item.citation)
            .filter(citation => citation) // Filter out undefined/null citations
            .join('\n\n');
        
        if (citations) {
            navigator.clipboard.writeText(citations).then(() => {
                setSnackbarOpen(true);
            });
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const ResourceSection = ({ items }: { items: any[] }) => (
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
                        stub="resources"
                        section={categoryId}
                        heading={categoryDisplay}
                        subheading=""
                        subtext={
                            <Button
                                variant="text"
                                size="small"
                                startIcon={<ContentCopyIcon />}
                                onClick={() => handleCopyAllCitations(categoryItems)}
                                sx={{ 
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                Copy all {formatCategoryName(category).toLowerCase()} citations to clipboard
                            </Button>
                        }
                        default_view={true}
                        content={
                            <ResourceSection items={categoryItems} />
                        }
                    />
                );
            })}
            <References />
            <Glossary />
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    Citations copied to clipboard
                </Alert>
            </Snackbar>
        </>
    );
}

