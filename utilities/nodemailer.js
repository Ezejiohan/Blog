const nodemailer = require('nodemailer');

const email = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD
        }
    });

    let mailOptions = {
        from: {
            name: process.env.USER,
            address: process.env.ADDRESS
        },
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transporter.sendMail(mailOptions);
}

module.exports = { email }