const handler = new Proxy({}, {
  get: () => () => null
});
module.exports = handler;
