// Use at least Nodemailer v4.1.0
const nodemailer = require("nodemailer");

module.exports = async (recipient, url) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "terry.brekke29@ethereal.email",
      pass: "hjd3uqQKXAvY9gfrDx",
    },
  });

  // Message object
  const message = {
    from: "Sender Name <sender@example.com>",
    to: `Recipient <${recipient}>`,
    subject: "Nodemailer is unicode friendly ✔",
    text: "Hello to myself!",
    html: `
    <html>
      <body>
      <p>Testing intreecate mailing system</p>
      <a href="${url}">forgot password</a>
      </body>
    </html>`,
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log("Error occurred. " + err.message);
    }

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });
};
