import { Fragment, useState } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Tooltip from '@mui/material/Tooltip';
// import DialogTitle from '@mui/material/DialogTitle';
import Info from '@mui/icons-material/Info';
import './info_dialog.css'

export function InfoDialog(
    props: {
        'title': string, 
        'content': any, 
        'top': string
    }
) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Tooltip title="Click to view full details">
        <Info 
          style={{top: props.top ? props.top : '1.5em'}} 
          id="InfoDialog-Symbol" 
          onClick={handleClickOpen}
        />
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        id='InfoDialog-Dialog'
      >
        {/* <DialogTitle id="alert-dialog-title">
          {props.title}
        </DialogTitle> */}
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.content}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}



export function gDialog(
  props: {
      'className': string,
      'i': number, 
      'content': any, 
  }
) {
const [open, setOpen] = useState(false);

const handleClickOpen = () => {
  setOpen(true);
};

const handleClose = () => {
  setOpen(false);
};

return (
  <g className={props.className} key={props.i} onClick={() => handleClickOpen}>
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
    id='InfoDialog-Dialog'
  >
    {props.content}
    {/* <DialogTitle id="alert-dialog-title">
      {props.title}
    </DialogTitle> */}
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        {props.content}
      </DialogContentText>
    </DialogContent>
  </Dialog>
  </g>
);
}


export default InfoDialog;