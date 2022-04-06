import App from 'App';

(async () => {
  const app = new App();

  await app.initData();

  app.listen(3000);
})();
