import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { MdArrowDownward as ArrowDownwardIcon } from "react-icons/md";
import { useState, SyntheticEvent } from 'react';

export function FormattedItem(
  title:string, 
  description:string,
  mt:number=2,
  fontStyle:string='normal'
) {
  if (description === "") {
    return null;
  } 
  if (title === 'URL') {
    return (
      <Typography>
        <Box sx={{ fontWeight: 'bold', mt: mt }}>{title}</Box>
        <Link href={description} target="_blank" rel="noreferrer">{description}</Link>
      </Typography>
    );
  } else return (
    <Typography>
      <Box sx={{ fontWeight: 'bold', mt: mt }}>{title}</Box>
      <Box sx={{ fontStyle:fontStyle }}>{description}</Box>
    </Typography>
  );
}


export function DataCitations(
    title:string, 
    description:string, 
    formats:string, 
    citation:string, 
    licence:string, 
    url:string
  ) {
  const [expanded, setExpanded] = useState<string | false>(title);
  const handleChange =
    (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };
  return (
    <>
    <Accordion expanded={expanded === title} onChange={handleChange(title)}>
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon />}
        aria-controls={title+"-content"}
        id={title+"-header"}
        sx={{
          backgroundColor: "#d2ecd5"
        }}
      >
        <Typography variant="h6">
        <Box sx={{ fontWeight: 'bold'}}>{title}</Box>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {FormattedItem('Description',description,0)}
        {FormattedItem('Formats',formats)}
        {FormattedItem('Licence',licence)}
        {FormattedItem('URL',url)}
        {FormattedItem('Citation',citation,2,'italic')}
        <br/>
          <Button 
            variant="outlined"
            onClick={() => {navigator.clipboard.writeText(citation)}}
          >
            Copy citation to clipboard
          </Button>
        
      </AccordionDetails>
        </Accordion>
    </>
  );
}
