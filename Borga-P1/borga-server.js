'use strict';

module.exports = function (es_spec) {
const db_port = 9200;
const db_name = "test"

const port = process.argv[2] || default_port;

const data_borga = require('./borga-games-data');

const data_mem = require('./borga-data-mem');

const data_online = require('./borga-data-elasticsearch')(default_host,db_port,db_name);

const services = require('./borga-services')(data_borga, data_mem);

const webapi = require('./borga-web-api')(services);
const webui = require('./borga-web-site')(services);

const express = require('express');

const app = express();

app.set('view engine', 'hbs');

app.use('/favicon.ico',	express.static('static-files/favicon.ico'));
app.use('/public', express.static('static-files'));

app.use('/api', webapi);
app.use('/', webui);

return app;

}