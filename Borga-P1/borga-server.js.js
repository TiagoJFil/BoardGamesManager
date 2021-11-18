'use strict';

const default_port = 8888;
const port = process.argv[2] || default_port;

const data_ext = require('./borga-data-ext');
const data_int = require('./borga-data-mem');

const services = require('./borga-services')(data_ext, data_int);

const webapi = require('./borga-web-api')(services);

const express = require('express');
const app = express();

app.use('/api', webapi);

app.listen(port);
