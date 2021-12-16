'use strict';

const errors = require('./borga-errors.js');

module.exports = function (data_borga, data_mem) {

	/**
	 * Get's username using a token
	 * @param {String} token 
	 * @returns {Object} user or error
	 */
	async function getUsername(token) {
		if (!token) {
			throw errors.UNAUTHENTICATED('no token');
		}
		const username = await data_mem.tokenToUsername(token);
		if(!username) {
			throw errors.UNAUTHENTICATED('bad token');
		}
		return username;
	}
	
	/**
 	* Gets the popular games
 	* @returns {Object} top x games
	  if there is no count sent then the function will return the top 10 ranked games
 	*/
	async function getPopularGames(count){
		if(!count) count = 10
		if(count <=0) throw errors.INVALID_PARAMETER('the ranked count cant be 0 or bellow');
		const list =  data_borga.getListPopularGames(count);
		return list;
	}

	/**
 	* Searches a game 
 	* @param {String} name 
 	* @returns {Object} game or error
 	*/
	async function searchGame(name){
		if(!name){
			throw(errors.MISSING_PARAMETER('Name of the game to search'));
		}
		
		const game = data_borga.getGameByName(name);
		return game;
	}
	
	/**
	 * Adds a user to the local db
	 * @param {String} name 
	 * @returns {Object} new user
	 */
	async function addUser(name){
		if(!name){
			throw(errors.MISSING_PARAMETER('Name of user missing'));
		}

		if(await data_mem.hasUser(name))
			throw errors.USER_ALREADY_EXISTS(name);

		return data_mem.createUser(name);
	}
	
	/**
	 * Creates a new user's group
	 * @param {String} token 
	 * @param {String} name name of the group 
	 * @param {String} desc description of the group
	 * @returns {Object} new group
	 */
	async function createGroup(token,name,desc){
		const username = await getUsername(token);

		if(!name){
			throw(errors.MISSING_PARAMETER('Group name missing'));
		}
		if(!desc){
			throw(errors.MISSING_PARAMETER('Group description missing'));	
		}
		
		if( await data_mem.hasGroup(username, name) ){
			throw(errors.GROUP_ALREADY_EXISTS(`The group you were trying to add already exists`));
		}
		
		return data_mem.createGroup(username,name,desc);
	
	}


	/**
	 * Edits a user's group 
	 * @param {String} token 
	 * @param {String} oldName 
	 * @param {String} newName 
	 * @param {String} desc 
	 * @returns {Object} edited group
	 */
	async function editGroup(token,oldName,newName,desc){
		const username = await getUsername(token);

		if(!oldName){
			throw(errors.MISSING_PARAMETER('Group name to edit'));
		}
		if(!newName){
			throw(errors.MISSING_PARAMETER('Name to rename group missing'));
		}
		if(!desc){
			throw(errors.MISSING_PARAMETER('Group description missing'));	
		}
		
		if(!await data_mem.hasGroup(username, oldName) ){
			throw(errors.NOT_FOUND(`The group you were trying to edit does not exist`));
		}

		return data_mem.editGroup(username,oldName,newName,desc);
	}


	/**
	 * Lists all user's groups in a object 
	 * @param {String} token user's token 
	 * @returns {Object} all group
	 */
	async function listGroups(token){
		const username = await getUsername(token);

		return data_mem.listGroups(username);
	}


	/**
	 * Gets a group information
	 * @param {String} token 
	 * @param {String} groupId 
	 * @returns {Object} group information
	 */
	async function getGroupInfo(token,groupId){
		const username = await getUsername(token);

		if(!groupId){
			throw(errors.MISSING_PARAMETER('Group name missing'));
		}
		if( !await data_mem.hasGroup(username, groupId) ){
			throw(errors.NOT_FOUND(`The group you were trying to get the info does not exist`));
		}

		return data_mem.getDisplayableGroupWithGameObjs(username,groupId);
	}

	/**
	 * Adds a gameId to a group
	 * @param {String} token 
	 * @param {String} groupId 
	 * @param {Number} gameId 
	 * @returns {Object} updated group
	 */
	async function addGameToGroup(token,groupId,gameId){
		const username = await getUsername(token);

		if(!groupId){
			throw(errors.MISSING_PARAMETER('Group name missing'));
		}

		if(!gameId){
			throw(errors.MISSING_PARAMETER('Game Id is missing'));
		}

		if( !await data_mem.hasGroup(username, groupId) ){
			throw(errors.NOT_FOUND(`The group you were trying to get the info does not exist`));
		}
		
		const game = await data_borga.getGameById(gameId);
		
		return await data_mem.addGameToGroup(username,groupId,game);

	}


	/**
	 * Deletes a user's group
	 * @param {String} token 
	 * @param {String} groupId 
	 * @returns {Object} list of updated groups
	 */
	async function deleteAGroup(token,groupId){
		const username = await getUsername(token);

		if(!groupId){
			throw(errors.MISSING_PARAMETER('Group name missing'));
		}

		if( !await data_mem.hasGroup(username, groupId) ){
			throw(errors.NOT_FOUND(`The group you were trying to delete does not exist`));
		}

		const groups = await data_mem.deleteGroup(username,groupId);
		return groups;
	}

	/**
	 * Removes a game from a user's group
	 * @param {String} token 
	 * @param {String} groupId 
	 * @param {String} gameID 
	 * @returns {Object} updated group
	 */
	async function removeGameFromGroup(token,groupId,gameID){
		const username = await getUsername(token);

		console.log('debug')

		if(!groupId){
			throw(errors.MISSING_PARAMETER('Group Id missing'));
		}

		console.log('debug')

		if(!gameID){
			throw(errors.MISSING_PARAMETER('Game Id is missing'));
		}

		if( !await data_mem.hasGroup(username, groupId) ){
			throw(errors.NOT_FOUND(`The group you were trying to delete the game from does not exist`));
		}

		if( !await data_mem.hasGame(username, groupId, gameID) ){
			throw(errors.NOT_FOUND(`The Game you are trying to remove was not found`));
		}

		const group = await data_mem.removeGameFromGroup(username,groupId,gameID);
		return group;
	}

	return {
		getUsername,
		getPopularGames,
		searchGame,
		addUser,
		createGroup,
		editGroup,
		listGroups,
		getGroupInfo,
		addGameToGroup,
		deleteAGroup,
		removeGameFromGroup
	};
}