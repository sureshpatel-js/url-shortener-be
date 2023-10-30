const nodemailer = require("nodemailer");
const sendMail = async (sendTo, subject, text, html) => {
    let transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: 'enlytical@nuvoretail.com',
            pass: 'Nuvo@123'
        }
    });
    try {
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '<enlytical@nuvoretail.com>', // sender address
            to: sendTo, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }


}

module.exports = sendMail;