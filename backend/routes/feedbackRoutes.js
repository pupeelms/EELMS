const express = require('express');
const router = express.Router(); 
const upload = require('../utils/upload');
const feedbackController = require('../controllers/feedbackController');

router.post('/feedback', upload.single('attachment'), (req, res) => {

    feedbackController.sendFeedback({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject, 
        message: req.body.message,
        attachment: req.file
    })
    .then(() => res.status(200).send('Feedback submitted successfully'))
    .catch(err => {
        console.error('Error in feedback route:', err);
        res.status(500).send('Error submitting feedback');
    });
});

module.exports = router;
