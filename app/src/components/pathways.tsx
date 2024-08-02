import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Heading from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Flex, View, Text } from '@aws-amplify/ui-react';
import { NavHeading } from './navheading.tsx';
import { Ampersand } from './vis/transporthealthimpacts.tsx';
import stories from './vis/stories/stories.json';
import InfoDialog from './info_dialog';


export default function TitlebarImageList() {
  const columns = 3;
  const fullwidth = 900;
  const width = fullwidth / columns - columns;
return (
    <ImageList 
        cols={columns} 
        gap={10} 
        sx={{ 
            margin:'auto', 
            // marginLeft: 2,
            // width: {xs: "90%", lg: fullwidth}, 
            height: '100%', 
            marginTop: 3
    }}>
        {stories.map((item: any) => (
            <ImageListItem 
                key={"story"+item.page} 
                cols={item.cols || 1} 
                rows={item.rows || 1}
            >{
                item.type === 'text' ? 
                    <Text  key={"text-"+item.page}>{item.title}</Text> :
                    <img
                    key={"image-"+item.page}
                    srcSet={`${item.img}?w=${width}&fit=crop&auto=format&dpr=2 ${columns}x`}
                    src={`${item.img}?w=${width}&fit=crop&auto=format`}
                    alt={item.title}
                    loading="lazy"
                    style={{ border: item.feature ? '2px solid red' : 'none' }}
                    />
            }
            {
                item.type === 'text' ? '' :
                    <ImageListItemBar
                        key={"story-bar-"+item.page}
                        title={<Link key={"link-"+item.page} href={"/pathways/"+item.type}>{item.title}</Link>}
                        subtitle={<Link key={"author-link-"+item.page} href={item.author_url} target='_blank'>{item.author}</Link>}
                        position="below"
                        actionIcon={InfoDialog(
                            {
                            title: item.title, 
                            content: <>{item.story}<Link key={"link-"+item.page} href={"/pathways/"+item.type}><br/><br/>Explore the {item.type}</Link> or visit <Link key={"author-link-"+item.page} href={item.author_url} target='_blank'>{item.author}</Link> for more information.</>, 
                            top: '0.3em'
                        }
                        )}
                    />
            }
            </ImageListItem>
    ))}
    </ImageList>
);
}


// [
//     {
//         "section": "Pathways",
//         "tagline": "A series of vignettes illustrating evidence on the health impacts of transport planning and policy.",
//         "description": "Data stories have not yet been implemented, but this is an experiment for how an on-going series of relevant vignettes illustrating the health impacts of transport planning and policy could be incorporated and their page layout.",
//         "stories": 


export function Pathways() {
    return (
        <>    
      <Flex direction={{ base: 'column', large: 'row'}}>
      <View  
        width={{ base: '100%', large: '570px'}}
        padding="1rem"
        >
        {NavHeading({title: 'Pathways', id: 'pathways', stub: 'pathways'})}
        <Heading variant="h4" sx={{margin: '5px'}}>A series of vignettes illustrating evidence of the pathways through which transport planning and policy impact travel behaviours and health outcomes.</Heading>
        <Text  variation="primary">Data stories have not yet been implemented, but this is an experiment for how an on-going series of relevant vignettes illustrating the health impacts of transport planning and policy could be incorporated and their page layout.</Text>
       </View>
      <View 
        padding='1rem'
        width="100%"
        marginTop={{ base: '-3rem', large: '1rem'}}
        >
        {Ampersand("70","94")}
        {TitlebarImageList()}
      </View>
      </Flex>
      </>
    );
};
