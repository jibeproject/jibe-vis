import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import { MdClose as CloseIcon } from "react-icons/md";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export function CustomizedDialogs(title: string, article: string) {
const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    // function get_citation() {
    //   const citation: HTMLElement | "test" = document.getElementsByClassName("fs-tab-code")[1] as HTMLIFrameElement | null;
    //   return (
    //     <React.Fragment>
    //     <>
    //     {citation}    
    //     </>
    // </React.Fragment>
    //   )
    // }
  return (
    <div min-width="400px">
      <Button variant="outlined" onClick={handleClickOpen}>
        { title }
      </Button>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        Get the data on FigShare
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers min-width="400px">
                <>
        <iframe id='iframe' src={"https://widgets.figshare.com/articles/"+article+"/embed?show_title=1&"} width="500px" height="500px" allowFullScreen></iframe>
            </>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Find out more
          </Button>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
}