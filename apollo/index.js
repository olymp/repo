const createSchema = require('./graphql');
const createMail = require('./mail');

const createGoogleGql = require('./google');
const createMediaGql = require('./media');
const createAuthGql = require('./auth');
const createPagesGql = require('./pages');

const createAdapter = require('./redis');

module.exports = (server, options) => {
  const schema = createSchema();

  const adapter = options.adapter ? createAdapter(options.adapter) : null;
  if (options.sessions) {
    server.useSession('/graphql', session => ({
      store: adapter.createSessionStore(session),
      resave: false,
      saveUninitialized: false,
      secret: options.sessions.secret || options.sessions,
      cookie: { secure: options.sessions.secure || process.env.NODE_ENV === 'production', maxAge: 60000000 }
    }));
  }

  const mail = options.mail ? createMail(options.mail) : null;
  if (options.google) createGoogleGql(schema, { adapter });
  if (options.pages) createPagesGql(schema, { adapter });
  if (options.media) {
    createMediaGql(schema, { adapter, uri: options.media.uri || options.media });
    // if (options.media.test) server.get('/upload-test', media.testEndpoint());
  }

  if (options.auth) {
    const { auth } = createAuthGql(schema, { adapter, secret: options.auth.secret || options.auth, mail });
    server.all('/graphql', (req, res, next) => {
      if (req.session && req.session.userId) {
        auth.getUser(req.session.userId).then(x => {
          req.user = x;
          next();
        });
      } else {
        next();
      }
    });
  }

  server.all('/graphql', (req, res, next) => schema.runQuery(req.body, req).then(x => res.json(x)).catch(err => next(err)));
}
