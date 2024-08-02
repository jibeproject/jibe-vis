import { Fragment, useState } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
import { MdInfo } from 'react-icons/md';
import './info_dialog.css'

export default function InfoDialog(props: {'title': string, 'content': any, 'top': string}) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <MdInfo style={{top: props.top ? props.top : '1.5em'}} id="InfoDialog-Symbol" onClick={handleClickOpen}/>
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
