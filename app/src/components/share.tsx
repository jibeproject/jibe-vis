import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';

export function ShareURL() {
    const [open, setOpen] = React.useState(false);
      
    const handleClick = () => {
        navigator.clipboard.writeText(window.location.href);
        console.log('Copied to clipboard:', window.location.href);
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

export default ShareURL;