'use strict';

module.exports = function (es_spec) {


const data_borga = require('./borga-games-data');

const data_mem = require('./borga-data-mem');

const data_elastic = require('./borga-data-elasticsearch')(es_spec);

const services = require('./borga-services')(data_borga, data_elastic);

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