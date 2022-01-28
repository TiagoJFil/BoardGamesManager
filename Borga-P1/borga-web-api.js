const express = require('express');

const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/borga-docs.json');

module.exports = function (services) {
	
	/**
	 * Gets the user token from the request 
	 * @param {Promise} req 
	 * @returns 
	 */
	function getUserToken(req) {
		return  req.user && req.user.token;
	}

	/**
	 * Get bearer token from autorization header
	 * @param {Promise} req 
	 * @returns {String} or null if the bearer token was not found
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
			case 'INVALID_PARAMETER':
				res.status(400);
				break;	
			case 'UNAUTHENTICATED': 
				res.status(401);
				break;
			case 'GROUP_ALREADY_EXISTS':
				res.status(409);
				break;
			case 'FAIL':
				res.status(406);
				break;			
			default:
				res.status(500);				
		}
		res.json({ cause: err });
	};
	
	/**
	 * Lists top x popular games
	 * @param {Promise} req 
	 * @param {Promise} res 
	 * if there is no count sent in the query then the function will return the top 10 ranked games
	 */
	async function listPopularGames(req,res){
		try{
			const count = req.query.count
			const list = await services.getPopularGames(count)
			res.json(list);

		}catch(err){
			onError(req, res, err);
		}
	};
	
	/**
	 * Searches a game
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function searchAnyGame(req,res){
		try {
			const gameName = req.query.name;
			const game = await services.searchGame(gameName);
			res.json(game);
		} catch (err) {
			onError(req, res, err);
		}	
	};

	/**
	 * Gets the details of a game using the game name
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function getGameDetails(req,res){
		try {
			const gameId = req.query.id;
			const game = await services.getGameDetails(gameId);
			res.json(game);
		} catch (err) {
			onError(req, res, err);
		}
	};

	/**
	 * Creates a group
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function createAGroup(req,res){
		try{
		const groupName = req.body.name;
		const groupDesc = req.body.desc;
		const newGroup = await services.createGroup(getBearerToken(req),groupName,groupDesc)
		res.json(newGroup);

		}catch(err){
			onError(req,res,err);
		}
	};

	/**
	 * Edits a group
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function editAGroup(req,res){
		try{
		const groupId = req.params.groupId;
		const groupNewName = req.body.name;
		const groupNewDesc = req.body.desc;
		const newGroup = await services.editGroup(getBearerToken(req),groupId,groupNewName,groupNewDesc)
		res.json(newGroup);

		}catch(err){
			onError(req,res,err);
		}
	};

	/**
	 * Lists all groups
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function listGroups(req,res){
		try{
			const groups = await services.listGroups(getBearerToken(req))
			res.json(groups);
	
		}catch(err){
			onError(req,res,err);
		}
	};
	

	/**
	 * Gets a group detail
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function getGroupDetails(req,res){
		try{
			const groupId = req.params.groupId;
			const group = await services.getGroupInfo(getBearerToken(req),groupId)
			res.json(group);
		}catch(err){
			onError(req,res,err);
		}
	};

	/**
	 * Adds a user
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function addUser(req,res){
		try {
			const username = req.body.name;
			const password = req.body.password;
			const user = await services.addUser(username,password);
			res.json(user)
		} catch (err) {
			onError(req, res, err);
		}
	};
	
	/**
	 * Adds a game to a group
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function addGameToGroup(req,res){
		try{
			const groupId = req.params.groupId;
			const gameId = req.body.gameId;
			const info = await services.addGameToGroup(getBearerToken(req),groupId,gameId)
			res.json(info)
		}catch(err){
			onError(req,res,err)
		}
	};

	/**
	 * Deletes a group
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function deleteGroup(req,res){
		try{
			const groupId = req.params.groupId;
			const groups = await services.deleteAGroup(getBearerToken(req),groupId)
			res.json(groups)
		}catch(err){
			onError(req,res,err)
		}
	};

	/**
	 * Removes a game from a group
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function removeGameFromGroup(req,res){
		try{
			const groupName = req.params.groupId;
			const gameID = req.body.gameId;
			const groups = await services.removeGameFromGroup(getBearerToken(req),groupName,gameID)
			res.json(groups)
		}catch(err){
			
			onError(req,res,err)
		}
	};


	/**
	 * Middleware function to extract the bearer token from the request into the req.user object
	 */
	function extractToken(req, res, next) {
		const bearerToken = getBearerToken(req);
		if (bearerToken) {
			req.user = { token: bearerToken };
		}
		next();
	}


	const router = express.Router();
	
	router.use('/docs', openApiUi.serve);
	router.get('/docs', openApiUi.setup(openApiSpec));
	
	
	router.use(express.json()); // for parsing application/json (recognize json body)
	router.use(extractToken);

	// Resource: /all/games/rank/
	router.get('/all/games/rank/', listPopularGames);
	// Resource: /all/games
	router.get('/all/games', searchAnyGame);
	// Resource: /all/games/details
	router.get('/all/games/details', getGameDetails);

	// Resource: /users/
	router.post('/users/', addUser);	

	// Resource: /my/group/<groupId>
	router.get('/my/group/:groupId',getGroupDetails)
	// Resource: /my/group/<groupId>
	router.delete('/my/group/:groupId', deleteGroup)
	// Resource: /my/group/<groupId>
	router.put( '/my/group/:groupId', editAGroup);

	// Resource: /my/group/
	router.get('/my/group', listGroups);
	// Resource: /my/group
	router.post('/my/group', createAGroup);

	// Resource: /my/group/<groupId>/games
	router.post('/my/group/:groupId/games', addGameToGroup);
	// Resource: /my/group/<groupId>/games/
	router.delete('/my/group/:groupId/games/', removeGameFromGroup);
	
	
	
	return router;
}