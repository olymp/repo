const shortID = require('shortid');
const bluebird = require('bluebird');
const redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
var s = require('searchjs');
const createSessionStore = require('./session');

module.exports = config => {
  const client = redis.createClient(config);

  const storage = {};
  const write = (kind, data) => {
    let _replace = data._replace;
    delete data.replace;

    if (!data.id) {
      data.id = shortID.generate();
    } else {
      const dbVal = storage[`${kind}/${data.id}`];
      if (!_replace && dbVal) {
        data = Object.assign(data, dbVal);
      }
    }

    return client.hsetAsync(kind, data.id + '', JSON.stringify(data)).then(() => data);
  };

  const read = (kind, options = {}) => {
    if (options.id) return client.hgetAsync(kind, options.id).then(x => {
      if (!x) return x;
      return JSON.parse(x);
    }); return list(kind, options).then(x => x[0]);
  };

  const list = (kind, options = {}) => {
    return client.hgetallAsync(kind).then(obj => {
      if (!obj) return [];
      let list = Object.keys(obj).map(x => JSON.parse(obj[x]));
      if (options.filter) {
        list = s.matchArray(list, options.filter);
      } return list;
    });
  };

  const remove = (kind, {id}) => new Promise(yay => {
    delete storage[`${kind}/${id}`];
    yay({success: true});
  });

  return {
    read,
    write,
    list,
    remove,
    client,
    createSessionStore: session => {
      const Session = createSessionStore(session);
      return new Session({ client });
    },
  };
};
