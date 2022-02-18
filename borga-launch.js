'use strict';

const config = require('./borga-config')


/**
 * default port of the server
 */
const default_host = "localhost";
const port = process.env['PORT'] || 8888;

const es_spec = {
	url:  process.env['BONSAI_URL'] || config.devl_es_url,   //env from heroku to db
	prefix: 'prod'
};
const app = require('./borga-server')(es_spec);

		
/**
 * starts a server and listens on port for connections.
 */
app.listen(port);



