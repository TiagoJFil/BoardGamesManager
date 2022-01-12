const express = require('express');


module.exports = function (services,defined_user) {
	
	/**
	 * Get bearer token from autorization header
	 * @param {Promise} req 
	 * @returns {String}
	 */
	function getBearerToken(req) {
		return defined_user.token;
		//Commented for now because we are not using bearer tokens now , but we will use it in the future, so we leave it here
		/*
		const auth = req.header('Authorization');
		if (auth) {
			const authData = auth.trim();
			if (authData.substr(0,6).toLowerCase() === 'bearer') {
				return authData.replace(/^bearer\s+/i, '');
			}
		}
		return null;
*/

	};
	
	/**
	 * Retrieves the home page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	function renderHomePage(req, res) {
		res.render('home');
	};

	/**
	 * Retrieves the search page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
 	function renderSearchPage(req, res) {
		res.render('search');
	};

	/**
	 * Retrieves the popular games page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	function renderPopularGamesPage(req, res) {
		res.render('popular_games');
	};

	/**
	 * Remders the create group page
	 * @param {Promise} req
	 * @param {Promise} res
	 */ 
	async function renderCreateGroups(req,res){
		res.render('create_groups');
	};

	/**
	 * Renders the login page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	 async function renderLoginPage(req,res){
		res.render('login');
	};
	
	/**
	 * Renders the edit group page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function renderEditGroupPage(req,res){
		res.render('edit_group');
	};

	/**
	 * Renders the delete group page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function renderDeleteGroupPage(req,res){
		res.render('delete_group');
	};

	/**
	 * Finds a game by name and renders a page with the game info and the possibility to add the game to a group
	 * @param {String} req 
	 * @param {String} res 
	 */
	async function findGame(req,res){
		const header = 'Find Game Result';
		const query_name = req.query.name;
		const token = getBearerToken(req);

		try{
			const game = await services.searchGame(query_name);
			const groups = await services.listGroups(token)

			res.render(
				'games_response',
				{header,query: query_name,game, groups:  groups}
			);
		}catch(err){
			switch(err.name){
				case 'MISSING_PARAMETER':
					res.status(400).render(
						'search',
						{ header, code: 400 , error: 'Game is required' }
					);
					break;
				case 'NOT_FOUND':
					res.status(404).render(
						'search',
						{ header, code: 404 ,error: 'No game found' }
					);
					break;
				default:
					res.status(500).render(
						'search',
						{ header, query: query_name, code: 500,error: JSON.stringify(err) }
					);
					break;	
				
			}
		};

	};

	/**
	 *  Adds a game to the user's chosen group and redirects the user to the /groups page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function addGameToGroup(req,res){
		const header = 'Add Game To Group Result';
		const gameId = req.body.gameId;
		const groupId = req.body.groupId;
		const token = getBearerToken(req);
		try{
			const game = await services.addGameToGroup(token,groupId,gameId);
			res.redirect(
				'/groups'
			);
		}catch(err){
			switch(err.name){
				case 'MISSING_PARAMETER':
					if(!gameId){
						res.status(400).render(
							'errors',
							{ header, code: 400 , error: 'no game id provided' }
						);
					}
					if(!groupId){
						res.status(400).render(
							'errors',
							{ header, code: 400 , error: 'no group id provided' }
						);
					break;
					}
				case 'FAIL':
					res.status(406).render(
						'errors',
						{ header, code: 406 , error: 'The game you are trying to add is already part of the group' }
					);
					break;
				default:
					res.status(500).render(
						'errors',
						{ header,  code: 500,error: JSON.stringify(err) }
					);
					break;	
				
			}
		}

	};

	/**
	 * Retrieves the groups page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function getGroupsPage(req,res){
		try{
			const header = 'Groups';
			const groups = await services.listGroups(getBearerToken(req));

			res.render(
				'groups',
				{header,groups}
			);
		}catch(err){
			switch(err.name){
				/*
				case 'NOT_FOUND':
					res.status(404).render(
						'groups',
						{ header, code: 404 ,error: 'no groups found please create one' }
					);
				*/
				default:
					res.status(500).render(
						'groups',
						{code: 500,error: JSON.stringify(err) }
					);
					break;	
			};
		}
	};

	/**
	 * Creates a group and if successful redirects the user to the /groups page 
	 * Otherwise renders the create_groups page with the error message
	 * @param {*Promise} req 
	 * @param {*Promise} res 
	 */
	async function createGroupAndRedirect(req,res){
		const name = req.body.name;
		const desc = req.body.desc;
		const token = getBearerToken(req);
		try{
			const group = await services.createGroup(token,name,desc);
			res.redirect('/groups');
		}catch(err){
			switch(err.name){
				case 'MISSING_PARAMETER':
					if(!name && !desc){
						res.status(400).render(
							'create_groups',
							{code: 400 , error:'No information was provided'}
						);
						break;
					}
					else if(!name ){
						res.status(400).render(
								'create_groups',
								{code: 400 , error:'No name was provided'}
							);
							break;
					}
					else if (!desc){
						res.status(400).render(
						'create_groups',
						{code: 400 , error:'No description was provided'}
						);
						break;
					}
					
				default:
					res.status(500).render(
						'errors',
						{query: name, code: 500,error: JSON.stringify(err)}
					);
					break;
			}
		}
	};

	/**
	 * Retrieves the response page of the search query to search for popular games
	 * @param {Promise} req
	 * @param {Promise} res	 
	 */ 
	async function popularGames(req,res){
		const header = 'Popular games Result';
		const count = req.query.count;
		const token = getBearerToken(req);
		try{
			const games = await services.getPopularGames(count);
			const groups = await services.listGroups(token)
			
			res.render(
				'popular_games_response',
				{header,games: games,count, groups}
			);
		}catch(err){
			switch(err.name){
				default:
					res.status(500).render(
						'popular_games_response',
						{ header, code: 500,error: 'No more than 100' }
					);
					break;	
			}
		}
	};

	/**
	 * Renders the page with the group information
	 * @param {Promise} req
	 * @param {Promise} res
	 */ 
	async function renderGroupInfo(req,res){
		const id = req.params.id;
		try{
			const groupdetails = await services.getGroupInfo(getBearerToken(req),id);

			const games = groupdetails.games;

			res.render('group_render',{id,groupdetails,games});
		}
		catch(err){
			switch(err.name){
				default:
					res.status(500).render(
						'group_render',
						{ code: 500,error: JSON.stringify(err) }
					);
					break;
			}
		}
	};

	/**
	 * Gets the group details and renders the group_render page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function getGameDetails(req,res){
		const id = req.params.id;
		try{
			const game = await services.getGameDetails(id);
			res.render('game_details',game);
		}
		catch(err){
			switch(err.name){
				default:
					res.status(500).render(
						'errors',
						{ code: 500,error: JSON.stringify(err) }
					);
					break;
			}
		};
	};


	async function editGroup(req,res){
		const groupId = req.body.id;
		const name = req.body.name;
		const desc = req.body.desc;

		try{
			const group = await services.editGroup(getBearerToken(req),groupId,name,desc);
			res.redirect('/groups');
		}catch(err){
			switch(err.name){
				case 'MISSING_PARAMETER':
					if(!name){
						res.status(400).render(
								'edit_group',
								{code: 400 , error:'no name provided'}
							);
							break;
					}
					else if (!desc){
						res.status(400).render(
						'edit_group',
						{code: 400 , error:'no desc provided'}
						);
						break;
					}
				default:
					res.status(500).render(
						'edit_group',
						{query: name, code: 500,error: JSON.stringify(err)}
					);
					break;
			}
		};
	};


	async function deleteGroup(req,res){
		const groupId = req.body.id;
		try{
			const group = await services.deleteGroup(getBearerToken(req),groupId);
			res.redirect('/groups');
		}catch(err){
			switch(err.name){
				default:
					res.status(500).render(
						'delete_group',
						{query: groupId, code: 500,error: JSON.stringify(err)}
					);
					break;
			}
		};
	};

	async function renderDeleteGameFromGroupPage(req,res){	
		res.render('delete_game');
	};

	async function deleteGameFromGroup(req,res){
		const groupId = req.body.id;
		const gameId = req.body.gameId;
		try{
			const group = await services.deleteGameFromGroup(getBearerToken(req),groupId,gameId);
			res.redirect('/groups');
		}catch(err){
			switch(err.name){
				default:
					res.status(500).render(
						'delete_game',
						{query: groupId, code: 500,error: JSON.stringify(err)}
					);
					break;
			}
		};
	};
	
	

	const router = express.Router();	
	
	router.use(express.urlencoded({ extended: true }));  //allows us to use req.body
	router


	// Edit a Group
	router.post('/groups/edit/', editGroup);

	// Edit group page
	router.get('/groups/edit/:id', renderEditGroupPage);

	// Delete a game from a group
	router.post('/groups/games/delete', deleteGameFromGroup);

	// Delete a game from a group page
	router.get('/groups/games/delete/', renderDeleteGameFromGroupPage);

	// Delete a group
	router.post('/groups/delete', deleteGroup);

	// Delete group page
	router.get('/groups/delete', renderDeleteGroupPage);

	// Login Page
	router.get('/login', renderLoginPage);

	

	// Homepage
	router.get('/', renderHomePage);

	// Details of a game
	router.get('/games/:id', getGameDetails);

	// Search page
	router.get('/search', renderSearchPage);

	// Search Result page
	router.get('/search/result', findGame);
	
	// Popular games page
	router.get('/popular', renderPopularGamesPage);

	// Adds a game to a group
	router.post('/groups/games',addGameToGroup);

	// Groups page
	router.get('/groups', getGroupsPage);

	// group creation
	router.get('/groups/create', renderCreateGroups);

	//Groups filter response
	router.post('/groups/create',createGroupAndRedirect);

	//Popular games result page
	router.get('/popular/result', popularGames);

	//Group page
	router.get('/groups/:id', renderGroupInfo);

	return router;
}