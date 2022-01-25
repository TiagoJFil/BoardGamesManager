'use strict';


const express  = require('express');
const session  = require('express-session');
const passport = require('passport');

passport.serializeUser((userInfo, done) => { done(null, userInfo); });
passport.deserializeUser((userInfo, done) => { done(null, userInfo); });

module.exports = function (es_spec) {


	const data_borga = require('./borga-games-data');

	const data_mem = require('./borga-data-mem');

	const data_elastic = require('./borga-data-elasticsearch')(es_spec);

	const services = require('./borga-services')(data_borga, data_elastic);

	const webapi = require('./borga-web-api')(services);
	const webui = require('./borga-web-site')(services);



	const app = express();

	app.use(session({
		secret: 'isel-ipw',
		resave: false,
		saveUninitialized: false
	}));
	app.use(passport.initialize());
	app.use(passport.session());




	app.set('view engine', 'hbs');  

	app.use('/favicon.ico',	express.static('static-files/favicon.ico'));
	app.use('/public', express.static('static-files'));

	app.use('/api', webapi);
	app.use('/', webui);



return app;

}
