'use strict';

const config = require('./borga-config')


/**
 * default port of the server
 */
const default_host = "localhost";
const default_port = 8888;

const es_spec = {
	url: config.devl_es_url,
	prefix: 'prod'
};
const app = require('./borga-server')(es_spec,config.guest);

		
/**
 * starts a server and listens on port for connections.
 */
app.listen(default_port);



