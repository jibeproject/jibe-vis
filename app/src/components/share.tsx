import React from 'react';
import { Button, Fab, Tooltip } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import { FocusFeature} from './utilities';

interface ShareURLProps {
    focusFeature?: FocusFeature;
  }
  
export function ShareURL({ focusFeature }: ShareURLProps) {
    const [open, setOpen] = React.useState(false);
      
    const handleClick = () => {
        const baseUrl = `${window.location.origin}${window.location.pathname}`;
        const queryString = focusFeature ? `?${focusFeature.getQueryString()}` : '';
        const shareUrl = `${baseUrl}${queryString}`;
    
        navigator.clipboard.writeText(shareUrl);
        console.log('Copied to clipboard:', shareUrl);
        setOpen(true);
    };
    
    const handleClose = (
        _: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
        return;
        }
    
        setOpen(false);
    };

return (
    <React.Fragment>
        <Tooltip title="Share URL" placement="left">
            <Fab
                color="primary"
                aria-label="share"
                onClick={handleClick}
                size='medium'
                sx={{
                    position: 'fixed',
                    bottom: (theme) => theme.spacing(10),
                    right: (theme) => theme.spacing(2),
                }}
            >
                <ShareIcon />
            </Fab>
        </Tooltip>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message="Current URL copied to clipboard."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        // style={{ position: "fixed", bottom: 120, right: 42}}
      />
    </React.Fragment>
);
};


export function ShareButton({ focusFeature }: ShareURLProps) {
  const [open, setOpen] = React.useState(false);
      
  const handleClick = () => {
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      const queryString = focusFeature ? `?${focusFeature.getQueryString()}` : '';
      const shareUrl = `${baseUrl}${queryString}`;
  
      navigator.clipboard.writeText(shareUrl);
      console.log('Copied to clipboard:', shareUrl);
      setOpen(true);
  };
  const handleClose = (
      _: React.SyntheticEvent | Event,
      reason?: SnackbarCloseReason,
  ) => {
      if (reason === 'clickaway') {
      return;
      }
  
      setOpen(false);
  };

  return (
    <React.Fragment>
    <Button onClick={handleClick} color="primary" startIcon={<ShareIcon/>}  title="Copy URL to clipboard">
      Share
    </Button>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        message="Current URL copied to clipboard."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        // style={{ position: "fixed", bottom: 120, right: 42}}
      />
    </React.Fragment>
  );
};


export default ShareURL;