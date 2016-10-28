const Auth = require('./index');
const Token = require('./utils/token');
const Password = require('./utils/password');

module.exports = (schema, { adapter, secret, mail, useSessions } = {}) => {
  const token = Token({ secret });
  const password = Password({ });
  const auth = Auth({ adapter, password, token, mail, confirm: false });

  schema.addSchema({
    name: 'user',
    adapter,
    query: `
      checkToken(token: String): Boolean
      verify(token: String): userAndToken
      verifyCookie: user
    `,
    mutation: `
      confirm(token: String): Boolean
      forgot(email: String): Boolean
      register(input: userInput, password: String): user
      reset(token: String, password: String): Boolean
      login(email: String, password: String): userAndToken
      loginCookie(email: String, password: String): user
      logoutCookie: Boolean
    `,
    resolvers: {
      Query: {
        checkToken: (source, args, x, { fieldASTs }) => {
          return auth.checkToken(args.token);
        }, verifyCookie: (source, args, context, { fieldASTs }) => {
          return context.session && context.session.userId ? auth.getUser() : null;
        }, verify: (source, args, x, { fieldASTs }) => {
          return auth.verify(args.token);
        },
      },
      Mutation: {
        forgot: (source, args, x, { fieldASTs }) => {
          return auth.forgot(args.email);
        }, reset: (source, args, x, { fieldASTs }) => {
          return auth.reset(args.token, args.password).then(() => true);
        }, loginCookie: (source, args, context, { fieldASTs }) => {
          return auth.login(args.email, args.password).then(userAndToken => {
            context.session.userId = userAndToken.user.id;
            return userAndToken.user;
          });
        }, logoutCookie: (source, args, context, { fieldASTs }) => {
          delete context.session.userId;
          return true;
        }, login: (source, args, context, { fieldASTs }) => {
          return auth.login(args.email, args.password);
        }, register: (source, args, x, { fieldASTs }) => {
          return auth.register(args.input, args.password).then(x => x.user);
        }, confirm: (source, args, x, { fieldASTs }) => {
          return auth.confirm(args.token);
        },
      }
    },
    typeDefs: {
      user: `
        type {
          id: String
          email: String
          token: String
          name: String
        }
      `,
      userAndToken: `
        type {
          user: user
          token: String
        }
      `
    }
  });
  return { auth };
};
