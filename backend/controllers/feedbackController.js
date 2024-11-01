const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();
 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendFeedback = async (feedback) => {
    try {
        console.log('Received feedback:', feedback); // Add this line

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RESEARCHER_EMAIL, // Add your email address here
            subject: `Feedback/Support: ${feedback.subject}`,
            text: `
Name: ${feedback.name}

Email: ${feedback.email}

Subject: ${feedback.subject}

Message: 
${feedback.message}
            `,
            attachments: feedback.attachment ? [{
                filename: feedback.attachment.originalname,
                content: feedback.attachment.buffer
            }] : []
        };

        await transporter.sendMail(mailOptions);

        console.log('Feedback email sent successfully');
    } catch (error) {
        console.error('Error sending feedback email:', error.message);
        throw error;
    }
};
