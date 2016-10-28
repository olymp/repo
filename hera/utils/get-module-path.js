const fs = require('fs');
const path = require('path');

module.exports = (module, attach = '') => {
  const p = path.resolve(__dirname, '..', 'node_modules', module);
  if (fs.existsSync(p)) return p + attach;
  return module + attach;
};
