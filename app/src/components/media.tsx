import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActions';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import InfoDialog from './info_dialog';

const dimOnTrue = (flag:boolean) => {
  return {
      opacity: flag ? 0.25 : 1,
  }
}

const disableOnTrue = (flag:boolean) => {
  return {
      pointerEvents: flag ? 'none' : 'initial'
  }
}

export function actionButton(
    text:string, 
    url:string,
  ) {
    if (text === "") {
      return null;
    } 
    if (url === "") {
      return null;
    }   
    if (text !== '' && url !== '') {
        return (
        <CardActions>
          <Button size="small" href={url}>{text}</Button>
        </CardActions>
        )
      }
  }
  

export default function VideoCard(src:string,title:string,description:string,action_text:string='',action_url:string='') {
    return (
    <Card sx={{ maxWidth: 400, height: 540 }}>
    <CardMedia
        component='video'
        height="300"
        src={src}
        controls
        />
      <CardActionArea>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {actionButton(action_text,action_url)}
      </CardContent>
      </CardActionArea>
    </Card>
  );
}


export function ImageCard(src:string,title:string,alt:string) {
  return (
  <Card>
  <CardMedia
      component='img'
      src={src}
      alt={alt}
  />
    <CardContent>
      <Typography gutterBottom variant="h5" component="div">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
      </Typography>
    </CardContent>
  </Card>
);
}

export function StoryCard(props: {
  "title": string,
  "page": string,
  "type": any,
  "img": string,
  "author": string,
  "author_url": string,
  "cols": number,
  "featured": boolean,
  "story": any,
}) {
  const query = "/"+props.type+"?pathway="+props.page
  return (
  <Card sx={{ maxWidth: 400, height: 540, ...dimOnTrue(!props.featured), ...disableOnTrue(!props.featured) }}>
  <CardMedia
      component='img'
      src={props.img}
      alt={props.title}
      />
    <CardActionArea>
    <CardContent>
        <Typography gutterBottom variant="h5" component="div">
        <Link key={"link-"+props.page} href={query}>{props.title}</Link>
        </Typography>
        <Typography variant="body2" color="text.secondary">
        <Link key={"author-link-"+props.page} href={props.author_url} target='_blank'>{props.author}</Link>
        </Typography>
    </CardContent>
    <InfoDialog
        title={props.title}
        content={
        <>
        {props.story}
        <br/><br/>
        <Link key={"link-"+props.page} href={query}>
          Explore the {props.type}</Link> or visit <Link key={"author-link-"+props.page} href={props.author_url} target='_blank'>{props.author}</Link> for more information.
        </>}
        top='-0.9em'
    />
    </CardActionArea>
  </Card>
);
}
