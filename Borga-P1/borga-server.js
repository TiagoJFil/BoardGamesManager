'use strict';

/**
 * default port of the server
 */
const default_port = 8888;

const port = process.argv[2] || default_port;

const data_borga = require('./borga-games-data');

const data_mem = require('./borga-data-mem');

const services = require('./borga-services')(data_borga, data_mem);

const webapi = require('./borga-web-api')(services);
const webui = require('./borga-web-ui')(services);

const express = require('express');

const app = express();

app.set('view engine', 'hbs');

app.use('/favicon.ico',	express.static('static-files/favicon.ico'));
app.use('/public', express.static('static-files'));

app.use('/api', webapi);
app.use('/', webui);

/**
 * starts a server and listens on port for connections.
 */
app.listen(port);