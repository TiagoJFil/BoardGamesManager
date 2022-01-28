const express = require('express');
const async = require('hbs/lib/async');


module.exports = function (services) {
	
	function getUsername(req) {
		return req.user && req.user.username;
	}

	/**
	 * Get bearer token from authorization header
	 * @param {Promise} req 
	 * @returns {String}
	 */
	function getBearerToken(req) {
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
		return req.user && req.user.token
	};
	
	/**
	 * Retrieves the home page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	function renderHomePage(req, res) {
		res.render('home',{username : getUsername(req)});
	};

	/**
	 * Retrieves the search page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
 	function renderSearchPage(req, res) {
		res.render('search',{username : getUsername(req)} );
	};

	/**
	 * Retrieves the popular games page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	function renderPopularGamesPage(req, res) {
		res.render('popular_games',{username : getUsername(req)} );
	};

	/**
	 * Remders the create group page
	 * @param {Promise} req
	 * @param {Promise} res
	 */ 
	async function renderCreateGroups(req,res){
		res.render('create_groups',{username : getUsername(req)} );
	};

	/**
	 * Renders the login page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	 async function renderLoginPage(req,res){
		res.render('auth_page');
	};
	
	/**
	 * Renders the edit group page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function renderEditGroupPage(req,res){
		res.render('edit_group',{username : getUsername(req)} );
	};

	/**
	 * Renders the delete group page
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function renderDeleteGroupPage(req,res){
		res.render('delete_group',{username : getUsername(req)} );
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
		const username = getUsername(req);

		try{

			const games = await services.searchGame(query_name);
			//Make the user able to add the game to a group if the user is logged in else we can just search without adding
			if(username){
				const groups = await services.listGroups(token)
				res.render(
					'games_response',
					{header,query: query_name,games: games, groups: groups, username: username}
				);
			}else{
				res.render(
					'games_response',
					{header,query: query_name,games: games, username: username}
				);
			}

		}catch(err){
			switch(err.name){
				case 'MISSING_PARAMETER':
					res.status(400).render(
						'search',
						{ header, code: 400 , error: 'Game is required' , username: username}
					);
					break;
				case 'NOT_FOUND':
					res.status(404).render(
						'search',
						{ header, code: 404 ,error: 'No game found', username: username}
					);
					break;
				default:
					res.status(500).render(
						'search',
						{ header, query: query_name, code: 500,error: JSON.stringify(err), username: username}
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
			await services.addGameToGroup(token,groupId,gameId);

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
	async function getGroupsAndRender(req,res){
		try{
			const header = 'Groups';
			const username = getUsername(req);
			
			
			if(!username)
				res.redirect('/authenticate');
			else{
				const groups = await services.listGroups(getBearerToken(req));
				res.render(
					'groups',
					{header,groups,username,token: getBearerToken(req)}
				);
			}

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
						{code: 500,error: JSON.stringify(err),username }
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
		const username = getUsername(req);
		try{
			await services.createGroup(token,name,desc);
			res.redirect('/groups');
		}catch(err){
			switch(err.name){
				case 'MISSING_PARAMETER':
					if(!name && !desc){
						res.status(400).render(
							'create_groups',
							{code: 400 , error:'No information was provided', username: username}
						);
						break;
					}
					else if(!name ){
						res.status(400).render(
								'create_groups',
								{code: 400 , error:'No name was provided', username: username}
							);
							break;
					}
					else if (!desc){
						res.status(400).render(
						'create_groups',
						{code: 400 , error:'No description was provided', username: username}
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
		const username = getUsername(req);
		try{
			const games = await services.getPopularGames(count);
			
			//Make the user able to add the game to a group if the user is logged in else we can just search without adding
			if(username){
				const groups = await services.listGroups(token)
				
				res.render(
					'games_response',
					{header,games: games, groups : groups, username}
				);
			}else{
				res.render(
					'games_response',
					{header,games: games, username}
				);
			}

		}catch(err){
			switch(err.name){
				default:
					res.status(500).render(
						'popular_games',
						{ header, code: 500,error: 'can only search 1-100 games' , username: username}
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
		const token = getBearerToken(req);
		const username = getUsername(req);
		try{
			const groupdetails = await services.getGroupInfo(getBearerToken(req),id);

			const games = groupdetails.games;

			res.render('group_render',{id,groupdetails,games,username,token});
		}
		catch(err){
			switch(err.name){
				default:
					res.status(500).render(
						'group_render',
						{ code: 500,error: JSON.stringify(err),username: username}
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
		const username = getUsername(req);
		try{
			const game = await services.getGameDetails(id);
			res.render('game_details', {game,username} );
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


	
	/**
	 * Logs in the user if the username and password are correct and redirects to the home page
	 * (Stores on cookies the session info)
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function Dologin(req,res){
		const username = req.body.username;
		const password = req.body.password;
		try{
			const user = await services.checkAndGetUser(username,password)

			req.login({ username: user.username, token: user.token }, err => {
				if (err) {
					console.log('LOGIN ERROR', err);
				}
				res.redirect('/');
			});
		}catch(err){
			switch(err.name){
				case 'BAD_CREDENTIALS':
					res.status(401).render(
						'auth_page',
						{code: 401,error: 'Invalid credentials'}
					);
					break;
				case 'MISSING_PARAMETER':
					if(!username){
						res.status(400).render(
							'auth_page',
							{code: 400,error: 'Missing username'}
					);
					}
					else if(!password){
						res.status(400).render(
							'auth_page',
							{code: 400,error: 'Missing password'}
						);
					}
					break;
				case 'NOT_FOUND':
					res.status(404).render(
						'auth_page',
						{code: 404,error: 'User not found, please create a new account'}
					);
					break;
				default:
					res.status(500).render(
						'auth_page',
						{code: 500,error: JSON.stringify(err)}
					);
					break;
			}
		}
	};
	async function Dologout(req,res){
		req.logout();
		res.redirect('/');
	};

	async function registerUser(req,res){
		const username = req.body.username;
		const password = req.body.password;
		try{
			
			const user  = await services.addUserWithRequiredPassword(username,password); 
			
			req.login({ username: user.username, token: user.token }, err => {
				if (err) {
					console.log('LOGIN ERROR', err);
				}
				res.redirect('/');
			});
			
		}
		catch(err){
			switch(err.name){
				case 'MISSING_PARAMETER':
					if(!username){
						res.status(400).render(
							'auth_page.hbs',
							{code: 400,error: 'Missing username'}
					);
					}
					else if(!password){
						res.status(400).render(
							'auth_page.hbs',
							{code: 400,error: 'Missing password'}
						);
					}
					break;
				
				case 'USER_ALREADY_EXISTS':
					res.status(409).render(
						'auth_page.hbs',
						{code: 409,error: 'User already exists'}
					);
					break;
				default:
					res.status(500).render(
						'auth_page.hbs',
						{code: 500,error: JSON.stringify(err)}
					);
					break;
		    }
		};
	};

	const router = express.Router();	
	
	router.use(express.urlencoded({ extended: true }));  //allows us to use req.body
	


	// Login Page
	router.get('/authenticate', renderLoginPage);

	// Login
	router.post('/login', Dologin);

	// Logout
	router.post('/logout', Dologout);

	//Add user
	router.post('/register', registerUser);

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

	//Popular games result page
	router.get('/popular/result', popularGames);


	// Adds a game to a group
	router.post('/groups/games',addGameToGroup);

	// Groups page
	router.get('/groups', getGroupsAndRender);


	// Page to create a new group , must be above /groups/:id otherwise create will be seen as an id and will get us other page
	router.get('/groups/create', renderCreateGroups);

	// A Group page
	router.get('/groups/:id', renderGroupInfo);
	
	// Group creation
	router.post('/groups',createGroupAndRedirect);

	return router;
}