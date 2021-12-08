const express = require('express');

const openApiUi = require('swagger-ui-express');
const openApiSpec = require('./docs/borga-docs.json');

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
	 * Lists top 10 popular games
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function listPopularGames(req,res){
		try{
			
			const list = await services.getPopularGames()
			res.json(list);

		}catch(err){
			onError(req, res, err);
		}
	}
	
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
		
	}

	/**
	 * Creates a group
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function createAGroup(req,res){
		try{
		const groupName = req.body.name;
		const groupDesc = req.body.description;
		const newGroup = await services.createGroup(getBearerToken(req),groupName,groupDesc)
		res.json(newGroup);

		}catch(err){
			onError(req,res,err);
		}
	}

	/**
	 * Edits a group
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function editAGroup(req,res){
		try{
		const groupOldName = req.body.name;
		const groupNewName = req.body.newname;
		const groupDesc = req.body.description;
		const newGroup = await services.editGroup(getBearerToken(req),groupOldName,groupNewName,groupDesc)
		res.json(newGroup);

		}catch(err){
			onError(req,res,err);
		}
	}

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
	}
	

	/**
	 * Gets a group detail
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function getGroupDetails(req,res){
		try{
			const groupName = req.params.name;
			const group = await services.getGroupInfo(getBearerToken(req),groupName)
			res.json(group);
		}catch(err){
			onError(req,res,err);
		}
	}


	/**
	 * Adds a user
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function addUser(req,res){
		try {
			const username = req.params.name;
			const user = await services.addUser(username)
			res.json(user)
		} catch (err) {
			onError(req, res, err);
		}
	}
	
	/**
	 * Adds a game to a group
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function addGameToGroup(req,res){
		try{
			const groupName = req.body.name;
			const gameId = req.body.gameid;
			const info = await services.addGameToGroup(getBearerToken(req),groupName,gameId)
			res.json(info)
		}catch(err){
			onError(req,res,err)
		}
	}

	/**
	 * Deletes a group
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function deleteGroup(req,res){
		try{
			const groupName = req.params.name;
			const groups = await services.deleteAGroup(getBearerToken(req),groupName)
			res.json(groups)
		}catch(err){
			onError(req,res,err)
		}
	}

	/**
	 * Removes a game from a group
	 * @param {Promise} req 
	 * @param {Promise} res 
	 */
	async function removeGameFromGroup(req,res){
		try{
			const groupName = req.body.group;
			const gameID = req.body.gameid;
			const groups = await services.removeGameFromGroup(getBearerToken(req),groupName,gameID)
			res.json(groups)
		}catch(err){
			onError(req,res,err)
		}
	}




	const router = express.Router();
	
	router.use('/docs', openApiUi.serve);
	router.get('/docs', openApiUi.setup(openApiSpec));
	
	
	router.use(express.json());
	
	// Resource: /all/games/rank
	router.get('/all/games/rank/', listPopularGames);
	// Resource: /all/games/search
	router.get('/all/games/search/', searchAnyGame);

	// Resource: /users/create/<name>
	router.post('/users/create/:name', addUser);	

	// Resource: /my/group/details/<name>
	router.get('/my/group/details/:name',getGroupDetails)
	// Resource: /my/group/list
	router.get('/my/group/list/', listGroups);
	// Resource: /my/group/create
	router.post('/my/group/create/', createAGroup);
	// Resource: /my/group/delete/<name>
	router.delete('/my/group/delete/:name', deleteGroup)
	// Resource: /my/group/edit
	router.post('/my/group/edit/', editAGroup);
	// Resource: /my/group/games/add
	router.post('/my/group/games/add', addGameToGroup);
	// Resource: /my/group/games/delete/
	router.delete('/my/group/games/delete/', removeGameFromGroup);
	
	
	
	return router;
}