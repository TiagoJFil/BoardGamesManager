const express = require('express');

const path = require('path');

module.exports = function (services) {
	
	/**
	 * Get bearer token from autorization header
	 * @param {Promise} req 
	 * @returns {String}
	 */
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
	
	
	/**
	 * Stops the operation when theres an error 
	 * @param {Promise} req 
	 * @param {Promise} res 
	 * @param {Promise} err 
	 */
	function onError(req, res, err) {
		console.log('[ERROR]', err);
		switch (err.name) {
			case 'NOT_FOUND': 
				res.status(404);
				break;
			case 'EXT_SVC_FAIL':
				res.status(502);
				break;
			case 'MISSING_PARAMETER': 
				res.status(400);
				break;
			case 'UNAUTHENTICATED': 
				res.status(401);
				break;
			case 'USER_ALREADY_EXISTS':
				res.status(409);
			default:
				res.status(500);				
		}
		res.json({ cause: err });
	}
	
	function getHomepage(req, res) {
		res.render('home');
	} 

	function getSearchPage(req, res) {
		res.render('search');
	} 

	function getGroupsPage(req,res){
		res.render('groups')
	}

	async function findBook(req,res){
		const header = 'Find Game Result';
		const query = req.query.name;
		try{
			const game = await services.searchGame(query);
			res.render(
				'games_response',
				{header,query,game}
			);
		}catch(err){
			switch(err.name){
				case 'MISSING_PARAM':
					res.status(400).render(
						'games_response',
						{ header, error: 'no query provided' }
					);
				case 'NOT_FOUND':
					res.status(404).render(
						'games_response',
						{ header, error: 'no game found for the query provided' }
					)
				default:
					res.status(500).render(
						'games_response',
						{ header, query, error: JSON.stringify(err) }
					);
					break;	
				
			}
		}

	}
	async function getGroups(){
		
	}


	const router = express.Router();	
	
	router.use(express.urlencoded({ extended: true }));
	
	// Homepage
	router.get('/', getHomepage);

	// Search page
	router.get('/search', getSearchPage);
	
	// Groups page
	router.get('/groups', getGroupsPage);
	
	// Search_Result
	router.get('/search/result', findBook);

	router.get('/groups/list', getGroups)
	
	return router;
}