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

export function FeedbackCard(params: {index: number, comment:string,datetime:string,url:string,resolved:boolean}) {
  return (
  <Card key={params.index} sx={{ maxWidth: 345 }} style={{backgroundColor: params.resolved?"#2caa4a30":"lightgoldenrodyellow"}}>
    <CardContent>
      <Typography variant="body2" color="text.secondary">
        {params.datetime && new Date(params.datetime).toLocaleString('en-AU')}
        {params.resolved?" (resolved)":""}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <Link href={params.url}>{params.url}</Link>
      </Typography>
      <Typography gutterBottom variant="h6" component="div">
        {params.comment.charAt(0).toUpperCase() + params.comment.slice(1)}
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
  "authors": { [key: string]: string },
  "cols": number,
  "featured": boolean,
  "story": any,
}) {
  const query = "/" + props.type + "?pathway=" + props.page;
  const authors = props.authors && Object.entries(props.authors).map(([key, value],i) => {
    return (
    <span key={i}><Link key={"author-link-" + key} href={value as string} target='_blank'>
      {key}
    </Link>&nbsp;&nbsp;</span>
    );
  });
  return (
    <Card sx={{ width: 380, height: 400, ...dimOnTrue(!props.featured), ...disableOnTrue(!props.featured) }}>
      <Link key={"link-" + props.page} href={query}>
      <CardMedia
        component='img'
        height="280"
        src={props.img}
        alt={props.title}
        sx={{ objectPosition: 'top' }}
      />
      </Link>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            <Link key={"link-" + props.page} href={query}>{props.title}</Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {authors}
              </Typography>
            </CardContent>
            <InfoDialog
              title={props.title}
              content={
              <span key={props.title}>
                {props.story}
                <br /><br />
                <Link key={"link-" + props.page} href={query}>
                Explore the {props.type}</Link> or for more information visit:
                {authors}
            </span>
          }
          top='-0.9em'
        />
      </CardActionArea>
    </Card>
  );
}

export function ResourceCard(props: {
  "title": string,
  "description": string,
  "formats": string,
  "citation": string,
  "licence": string,
  "url": string,
  "img"?: string,
}) {
  const truncateText = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <Card sx={{ width: 380, height: 'auto' }}>
      {props.img && (
        <CardMedia
          component='img'
          height="200"
          src={props.img}
          alt={props.title}
          sx={{ objectPosition: 'top' }}
        />
      )}
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            <Link 
              href={props.url} 
              target="_blank" 
              rel="noreferrer"
              sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: '#1976d2' } }}
            >
              {props.title}
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {truncateText(props.description, 120)}
          </Typography>
          <Typography variant="caption" display="block" sx={{ color: '#1976d2', mb: 0.5 }}>
            <strong>Format:</strong> {truncateText(props.formats, 80)}
          </Typography>
          <Typography variant="caption" display="block" sx={{ color: '#666', mb: 1 }}>
            <strong>Citation:</strong> {truncateText(props.citation, 100)}
          </Typography>
          <Typography variant="caption" display="block" sx={{ color: '#666' }}>
            <strong>Licence:</strong> {props.licence}
          </Typography>
        </CardContent>
        <InfoDialog
          title={props.title}
          content={
            <div key={props.title}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                {props.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Description:</strong> {props.description}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Format:</strong> {props.formats}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Licence:</strong> {props.licence}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>URL:</strong>{' '}
                <Link href={props.url} target="_blank" rel="noreferrer">
                  {props.url}
                </Link>
              </Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic', mb: 2, display: 'block' }}>
                <strong>Citation:</strong> {props.citation}
              </Typography>
              <Button 
                variant="outlined"
                size="small"
                onClick={() => {navigator.clipboard.writeText(props.citation)}}
                sx={{ mt: 1 }}
              >
                Copy Citation
              </Button>
            </div>
          }
          top='-0.9em'
        />
      </CardActionArea>
    </Card>
  );
}
