const compose = require('./templates/default');
const request = require('superagent');

module.exports = ({from, url, name, signature, apiKey, domain}) => ({to, subject, content}) => {
  if (Array.isArray(content)) content = compose(content, {url, name, signature});
  else if (typeof content === 'string') content = { text: content, html: content };
  const { body, html } = content;

  return request
    .post(`https://api.mailgun.net/v3/${domain}/messages`)
    .send(`from=${from}`)
    .send(`to=${to}`)
    .send(`subject=${subject}`)
    .send(`text=${body}`)
    .send(`html=${html}`)
    .auth('api', apiKey);
}
