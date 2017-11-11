import nconf from 'nconf';
import express from 'express';
import path from 'path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import passport from 'passport';
import mongoose from 'mongoose';
import Promise from 'bluebird';
import publicAPI from '../server/api';
import api from './api';
import PageRouter from '../server/pageRouter';

require('../config.js');

nconf.set('APP_ENV', 'server');

mongoose.Promise = Promise;

process.on('unhandledRejection', (err) => {
  console.log('Caught unhandledRejection');
  console.log(err);
});

const app = express();
app.use(compression());

if (nconf.get('NODE_ENV') !== 'production') {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const proxy = require('http-proxy-middleware'); // eslint-disable-line global-require
  app.use(proxy(`http://${nconf.get('CLIENT_HOST')}:${nconf.get('CLIENT_PORT')}/public/assets/*`));

  app.use(require('morgan')('dev')); // eslint-disable-line global-require
} else {
  app.use(require('morgan')('tiny')); // eslint-disable-line global-require
}

app.use('/static', express.static(path.join(__dirname, '../../static')));
app.use('/bower_components', express.static(path.join(__dirname, '../../bower_components')));
app.use('/public', express.static(path.join(__dirname, '../public')));

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [nconf.get('COOKIE_SECRET')],
  maxAge: 60 * 60 * 1000, // 1 hour
}));
app.use(passport.initialize());
app.use(passport.session());
require('./auth')(app);

app.use('/api', api);
app.use('/api', publicAPI);

const routes = require('../admin_client/routes').default;
const reducers = require('../admin_client/modules').default;

app.use(PageRouter(routes, reducers, (head, content, state) => `
    <!doctype html>
    <html ${head.htmlAttributes.toString()}>
      <head>
        ${head.title.toString()}
        ${head.meta.toString()}
        ${head.link.toString()}
        <link rel="stylesheet" type="text/css" href="/bower_components/bootstrap/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" type="text/css" href="/bower_components/font-awesome/css/font-awesome.min.css" />
        <link rel="stylesheet" type="text/css" href="/public/assets/adminApp.bundle.css" />
      </head>
      <body ${head.bodyAttributes.toString()}>
        ${content}
        <script type="text/javascript">window.__INITIAL_STATE__ = ${JSON.stringify(state)}</script>
        <script type="text/javascript" src="/public/assets/manifest.js"></script>
        <script type="text/javascript" src="/public/assets/react.js"></script>
        <script type="text/javascript" src="/public/assets/adminCommon.js"></script>
        <script type="text/javascript" src="/public/assets/adminApp.js"></script>
      </body>
    </html>
  `));

mongoose.connect(nconf.get('MONGODB_URI'), { useMongoClient: true }, (err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');

  app.listen(nconf.get('SERVER_PORT'), () => {
    console.log('Server listening on port', nconf.get('SERVER_PORT'));
  });
});
