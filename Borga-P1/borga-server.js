'use strict';

const fetch = require('node-fetch'); //Temporary , to be removed when the other group members executes the code at least once

module.exports = function (es_spec,defined_user) {


const data_borga = require('./borga-games-data');

const data_mem = require('./borga-data-mem');

const data_elastic = require('./borga-data-elasticsearch')(es_spec);

const services = require('./borga-services')(data_borga, data_elastic);

const webapi = require('./borga-web-api')(services);
const webui = require('./borga-web-site')(services,defined_user);

const express = require('express');

const app = express();

beforeAll(es_spec,defined_user).then(()=>{


app.set('view engine', 'hbs');  

app.use('/favicon.ico',	express.static('static-files/favicon.ico'));
app.use('/public', express.static('static-files'));

app.use('/api', webapi);
app.use('/', webui);

});

return app;

}




async function beforeAll(es_spec,guest){

	try{
		const response = await fetch(`${es_spec.url}data_${es_spec.prefix}_users/_doc/${guest.user}`);
            		
		if( response.status != 200 ){
	
			const StoreTokens = await fetch(
				`${es_spec.url}data_${es_spec.prefix}_tokens/_doc/${guest.token}`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							"user": `${guest.user}`,
						})
					}
			);
			
			const StoreUser = await fetch(
				`${es_spec.url}data_${es_spec.prefix}_users/_doc/${guest.user}`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							AuthToken: guest.token
						})
					}
			);

		}

	}catch(err){
		console.log(err);
	}

};