//const nodemailer = require('nodemailer'); // https://community.nodemailer.com/
const sendGrid = use('@sendgrid/mail');
const config = use('config/app');


class Mail {
  static send({ subject,text, content, to, type = "grid" } = {}) {
    if (type == "grid") {
      this.sendBySendGrid({ subject,text, content, to })
    }
  }
  static async sendBySendGrid({ subject,text, content, to }) {
    sendGrid.setApiKey(config.SEND_GRID.API_KEY);
    sendGrid.send({
      to: to,
      from: config.SEND_GRID.FROM,
      subject: subject,
      text: text,
      html: content
    })
  }
}
module.exports = Mail
/* module.exports = {
  sendMail(ops) {
    return _sendMail(ops);
  },
};

async function _sendMail(ops) {
  const params = ValidateUtil.checkRequiredParams2(ops, ['to', 'subject']);
  if (params.error) throw Error(params.error);

  sendMail_By_SendGrid(params, function (err, result) {
    // sendMail_By_Google(params, function(err, result) {
    if (err) throw Error('Error:' + err.message);

    return result;
  })
}

function sendMail_By_Google(params, callback) {
  to = params.to;
  subject = params.subject;
  text = params.text || '';
  html = params.html || '';

  const from = config.mail_sender.user;
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: config.mail_sender.host,
    port: config.mail_sender.port,
    secure: Number(config.mail_sender.port) === 465, // true for 465, false for other ports
    auth: {
      user: from,
      pass: config.mail_sender.password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"MQ Solutions"<' + from + '>', // sender address
    to: to,                 // list of receivers
    subject: subject,       // Subject line
    text: text,             // plain text body
    html: html              // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      callback(error);
      return;
    }
    callback(null);
  });
}

function sendMail_By_SendGrid(params, callback) {
  sgMail.setApiKey(config.send_grid.api_key);
  const msg = {
    to: params.to,
    from: config.send_grid.from,
    subject: params.subject,
    text: params.text || ''
  };
  if (params.html) {
    msg.html = params.html;
  }
  sgMail.send(msg, callback);
}
 */