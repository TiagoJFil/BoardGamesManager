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

await beforeAll();

const app = require('./borga-server')(es_spec,config.guest);

 /**
 * starts a server and listens on port for connections.
 */
app.listen(default_port);



async function beforeAll(){

	if( !await app.data_elastic.hasUser(defined_user.user) ){

		const StoreTokens = await fetch(
			`${es_spec.url}data_${es_spec.prefix}_tokens/_doc/${config.guest.token}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						"user": `${config.guest.user}`,
					})
				}
		);
		
		const StoreUser = await fetch(
			`${es_spec.url}data_${es_spec.prefix}_users/_doc/${config.guest.user}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						AuthToken: config.guest.token
					})
				}
		);
	}

};