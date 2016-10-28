exports.registerMail = (send, {email, token}) => send({
  to: email,
  subject: 'Registrierungsbestätigung',
  content: [{
    type: 'p',
    strong: true,
    content: 'Registrierungsbestätigung'
  }, {
    type: 'p',
    content: 'Bitte bestätigen Sie die Registrierung.'
  }, {
    type: 'link',
    link: `http://localhost:3000?confirm=${token}`,
    content: 'Jetzt bestätigen'
  }]
});

exports.forgotMail = (send, {email, token}) => send({
  to: email,
  subject: 'Passwortänderung',
  content: [{
    type: 'p',
    strong: true,
    content: 'Passwortänderung'
  }, {
    type: 'p',
    content: 'Bitte bestätigen Sie die Passwortänderung.'
  }, {
    type: 'link',
    link: `http://localhost:3000?reset=${token}`,
    content: 'Jetzt bestätigen'
  }]
});
