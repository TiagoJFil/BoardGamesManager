const express = require('express');

//const openApiUi = require('swagger-ui-express');
//const openApiSpec = require('./docs/borga-spec.json');

module.exports = function (services) {
	
	function getBearerToken(req) {
		const auth = req.header('Authorization');
		if (auth) {
			const authData = auth.trim();
			if (authData.substr(0,6).toLowerCase() === 'bearer') {
				return authData.replace(/^bearer\s+/i, '');
			}
		}
		return null;
	}
	
	
	//not done yet
	function onError(req, res, err) {
		console.log('[ERROR]', err);
	}
	
	
	async function listPopularGames(req,res){
		try{
			
		const list = await services.getPopularGames()
		res.json(list);
		}catch(err){
			onError(req, res, err);
		}
	}
	
	async function searchAnyGame(req,res){
		try {
			const gameName = req.params.name
			const game = await services.searchGame(gameName);
			res.json(game);
		} catch (err) {
			onError(req, res, err);
		}
		
	}
	
	
	
	async function addUser(req,res){
		try {
			const username = req.params.user;
			const user = await services.addUser(username)
			res.json(user)
		} catch (err) {
			onError(req, res, err);
		}
	}
	
	
	const router = express.Router();
	
	//router.use('/docs', openApiUi.serve);
	//router.get('/docs', openApiUi.setup(openApiSpec));
	
	
	router.use(express.json());
	
	// Resource: /global/games/ranks
	router.get('/global/games/ranks', listPopularGames);
	// Resource: /global/games/search/<name>
	router.get('/global/games/search/:name', searchAnyGame);
	
	// Resource: /users/add/<user>
	router.post('/users/add/:user', addUser);
	
	
	
	
	return router;
}