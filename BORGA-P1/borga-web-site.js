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

	/**
	 * Retrieves the home page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	function getHomepage(req, res) {
		res.render('home');
	} 
	/**
	 * Retrieves the search page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	function getSearchPage(req, res) {
		res.render('search');
	} 

		/**
	 * Retrieves the popular page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	function getPopularPage(req, res) {
		res.render('popular_games');
	} 

	/**
	 * Retrieves the groups page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function getGroupsPage(req,res){
		try{
		//const groups = await services.listGroups(getBearerToken(req))
		
		res.render(
			'groups',
			
			);
		}catch(err){


		};
	}

	async function findGame(req,res){
		const header = 'Find Game Result';
		const query_name = req.query.name;
		try{
			const game = await services.searchGame(query_name);
			res.render(
				'games_response',
				{header,query: query_name,game}
			);
		}catch(err){
			switch(err.name){
				case 'MISSING_PARAMETER':
					res.status(400).render(
						'games_response',
						{ header, code: 400 , error: 'no query provided' }
					);
				case 'NOT_FOUND':
					res.status(404).render(
						'games_response',
						{ header, code: 404 ,error: 'no game found for the query provided' }
					)
				default:
					res.status(500).render(
						'games_response',
						{ header, query: query_name, code: 500,error: JSON.stringify(err) }
					);
					break;	
				
			}
		}

	}
	async function createGroup(req,res){
		try{

		}catch(err){

		}
	}

	async function popularGames(req,res){
		const header = 'Popular games Result';
		const count = req.query.count;
		try{
			const games = await services.getPopularGames(count);
			res.render(
				'popular_games_response',
				{header,games: games,count}
			);
		}catch(err){
			switch(err.name){
				default:
					res.status(500).render(
						'popular_games_response',
						{ header, query: query_name, code: 500,error: JSON.stringify(err) }
					);
					break;	
			}
		}
	}


	const router = express.Router();	
	
	router.use(express.urlencoded({ extended: true }));
	
	// Homepage
	router.get('/', getHomepage);

	// Search page
	router.get('/search', getSearchPage);
	
	// Groups page
	router.get('/groups', getGroupsPage);

	//Popular games page
	router.get('/popular', getPopularPage);

	// Search Result page
	router.get('/search/result', findGame);

	// group creation
	router.get('/groups/create', createGroup);

	//Popular games result page
	router.get('/popular/result', popularGames)
	
	return router;
}