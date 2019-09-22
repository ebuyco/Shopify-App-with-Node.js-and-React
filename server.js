require('isomorphic-fetch');

const dotenv = require('dotenv');

const Koa = require('koa');

const next = require('next');

const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');

const { verifyRequest } = require('@shopify/koa-shopify-auth');

const session = require('koa-session');

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  server.use(session(server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products'],
      afterAuth(ctx) {
        const { shop, accesToken } = ctx.session;
        ctx.redirect('/');
      }
    })
  );

  server.use(async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    /*eslint-disable*/
    return
  });

  server.listen(port, () => {
    console.log(`> Your app link is running at http://localhost:${port}`)
  });
});
