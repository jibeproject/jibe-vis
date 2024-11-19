import React, { useState } from 'react';
import { Box, Fab, Dialog, DialogTitle, DialogContent, Link, DialogActions, Tooltip, Typography, TextField, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { generateClient } from 'aws-amplify/data'
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>({});

const FeedbackChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    // Handle the feedback submission logic here
    const currentDate = new Date();
    const currentUrl = window.location.href;

    const feedbackData = {
        comment: feedback,
        datetime: currentDate.toISOString(),
        url: currentUrl,
    };
    // submitFeedback(feedbackData);
    await client.models.Feedback.create(feedbackData);
    console.log('Feedback submitted:', feedbackData);
    setFeedback('');
    handleClose();
  };

return (
    <div>
        <Tooltip title="Suggestions? Leave us some feedback!" placement="left">
        <Fab
            color="primary"
            aria-label="feedback"
            onClick={handleClickOpen}
            size='medium'
            sx={{
                position: 'fixed',
                bottom: (theme) => theme.spacing(2),
                right: (theme) => theme.spacing(2),
            }}
        >
            <ChatIcon />
        </Fab>
        </Tooltip>
            <Dialog open={open} onClose={handleClose} 
            closeAfterTransition={false}>
                <DialogTitle>Feedback or suggestions?</DialogTitle>
                <DialogContent>
                    <Typography>If you have a comment to share, we would love to hear your thoughts.</Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="Your Feedback"
                        label="Your Feedback"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        />
                    <Typography>Along with your comment, we'll record the date, time and URL of the current page.</Typography>
                    <br/>
                    <Box sx={{ bgcolor: 'rgb(44 170 74 / 10%)', padding: '1em', borderRadius: '16px' }}>
                        <Typography>Optionally, subscribe to updates or register interest in previewing new functionality by completing <Link href="https://forms.office.com/r/MT8wSLAy9y" target="_blank">this brief form</Link>.</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
    </div>
);
};

export default FeedbackChat;