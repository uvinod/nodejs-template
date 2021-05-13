const Env = use('Env');
module.exports = {  
  MAIL_SENDER: {
    host: Env.get("SMTP_HOST", "smtp.gmail.com"),
    port: Env.get("SMTP_PORT", 587),
    secure: Env.get("SMTP_SECURE", 0) != 0 ? true: false,
    user: Env.get("SMTP_USER", ""),
    password: Env.get("SMTP_PASS", ""),
    from: Env.get("SMTP_FROM", ""),
  },
  app_name: ""
};