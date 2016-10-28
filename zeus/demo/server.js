module.exports = app => {
  console.log('JAPP');
  app.get('/test', (req, res, next) => {
    res.send('Hello World');
  });
}
