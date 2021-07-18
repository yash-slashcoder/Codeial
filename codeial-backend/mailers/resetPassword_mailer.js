const nodemailer = require('../config/nodemailer');

// This is another way of exporting a method
exports.resetPassword = (user) => {
  // console.log('Error in new comment', comment);
  let htmlString = nodemailer.renderTemplate({user: user}, '/resetPassword/reset_password.ejs');

  nodemailer.transporter.sendMail(
    {
      from: 'yashpatel7615@gmail.com',
      to: user.email,
      subject: 'Reset Password',
      html: htmlString,
    },
    (err, info) => {
      if (err) {
        console.log('Error in sending mail', err);
        return;
      }

      console.log('Message sent', info);
      return;
    }
  );
};
