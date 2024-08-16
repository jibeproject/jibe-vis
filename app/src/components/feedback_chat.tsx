import React, { useState } from 'react';
import { Fab, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Typography, TextField, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
// import { a, type ClientSchema } from '@aws-amplify/backend';
import { Amplify } from 'aws-amplify';
import awsconfig from '../../amplify_outputs.json';
import { generateClient } from 'aws-amplify/data'

Amplify.configure(awsconfig);

// const schema = a.schema({
//     Feedback: a.model({
//       id: a.string(),
//       comment: a.string(),
//       datetime: a.datetime(),
//       url: a.string()
//       })
//       .authorization( allow => [allow.publicApiKey().to(['create'])] )
//   });
  
// type Schema = ClientSchema<typeof schema>;
const client = generateClient();

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
    const currentTime = currentDate.toLocaleTimeString();
    const currentUrl = window.location.href;

    const feedbackData = {
        comment: feedback,
        date: currentDate.toISOString(),
        time: currentTime,
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
            style={{ position: 'fixed', bottom: 42, right: 42 }}
        >
            <ChatIcon />
        </Fab>
        </Tooltip>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Feedback or suggestions?</DialogTitle>
                <DialogContent>
                    <Typography>If you have a comment to share, we would love to hear your thoughts.</Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="feedback"
                        label="Your Feedback"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        />
                    <Typography>Along with your comment, we'll record the date, time and URL of the current page.</Typography>
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