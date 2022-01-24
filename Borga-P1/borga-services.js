'use strict';

const errors = require('./borga-errors.js');

module.exports = function (data_borga, data_mem) {

	/**
	 * Get's username using a token
	 * @param {String} token 
	 * @returns {Object} user or error
	 * @throws {UNAUTHENTICATED} if token is not valid or there is no token received by the function
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
	};

	async function checkAndGetUser(username, password) {
		
		if (!username) {
			throw errors.MISSING_PARAMETER('missing username');
		}
		if (!password) {
			throw errors.MISSING_PARAMETER('missing password');
		}
		
		if (!await data_mem.hasUser(username)) {
			throw errors.NOT_FOUND('user not found');
		}
		
		const userInfo = await data_mem.getUser(username);
		if(!userInfo){
			throw errors.DATABASE_ERROR('error getting user info');
		}
		if (userInfo.password !== password) {
		
			throw errors.BAD_CREDENTIALS();
		}
		
		return userInfo;
	};
	
	/**
 	* Gets the top x popular games
	* @param {Int} count many games to get
 	* @returns {Object} top x games
	* if there is no count sent then the function will return the top 10 ranked games
 	*/
	async function getPopularGames(count){
		if(!count) count = 10
		if(count <=0) throw errors.INVALID_PARAMETER('the ranked count cant be 0 or bellow');
		return data_borga.getListPopularGames(count);
	};

	/**
 	* Searches a game by the name
 	* @param {String} name 
 	* @returns {Object} game or error
 	*/
	async function searchGame(name){
		if(!name){
			throw(errors.MISSING_PARAMETER('Name of the game to search'));
		}

		return data_borga.getGameByName(name);
	};

	/**
	* Gets the details of a game using the game id
	* @param {String} id
	* @returns {Object} game or error
	* @throws {Error} if the game id is missing
	*/
	async function getGameDetails(id){
		if(!id){
			throw(errors.MISSING_PARAMETER('Id of the game to get the details'));
		}

		return data_borga.getGameDetails(id);
	};

	/**
	 * Adds a user to the data base
	 * @param {String} name 
	 * @returns {Object} new user
	 * @throws {Object} error if the user already exists
	 */
	async function addUser(name,password){
		if(!name){
			throw(errors.MISSING_PARAMETER('Name of the user is missing'));
		}
		if(await data_mem.hasUser(name))
			throw errors.USER_ALREADY_EXISTS(name);

		return data_mem.createUser(name,password);
	};

	/**
	 * Adds a user that has a required password to the data base
	 * @param {String} name 
	 * @param {String} password 
	 * @returns {Object} new user
	 * @throws {Object} error if the user already exists
	 */
	async function addUserWithRequiredPassword(name,password){
		if(!password){
			throw(errors.MISSING_PARAMETER('Password of the user is missing'));
		}
		return await addUser(name,password);
	};

	
	/**
	 * Creates a new user's group
	 * @param {String} token 
	 * @param {String} name name of the group 
	 * @param {String} desc description of the group
	 * @returns {Object} new group
	 * @throws {GROUP_ALREADY_EXISTS} error if the group already exists
	 * @throws {MISSING_PARAMETER} error if the group name is missing
	 * @throws {MISSING_PARAMETER} error if the group description is missing
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
	
	};

	/**
	 * Edits a user's group 
	 * @param {String} token 
	 * @param {String} groupId 
	 * @param {String} newName 
	 * @param {String} desc 
	 * @returns {Object} edited group
	 * @throws {MISSING_PARAMETER} error if the group id is missing
	 * @throws {MISSING_PARAMETER} error if the group name is missing
	 * @throws {MISSING_PARAMETER} error if the group description is missing
	 * @throws {GROUP_NOT_FOUND} error if the group does not exist
	 */
	async function editGroup(token,groupId,newName,desc){
		const username = await getUsername(token);

		if(!groupId){
			throw(errors.MISSING_PARAMETER('Group id to edit'));
		}
		if(!newName){
			throw(errors.MISSING_PARAMETER('Name to rename group missing'));
		}
		if(!desc){
			throw(errors.MISSING_PARAMETER('Group description missing'));	
		}
		
		if(!await data_mem.hasGroup(username, groupId) ){
			throw(errors.NOT_FOUND(`The group you were trying to edit does not exist`));
		}

		return data_mem.editGroup(username,groupId,newName,desc);
	};

	/**
	 * Lists all user's groups in a object 
	 * @param {String} token user's token 
	 * @returns {Object} all group
	 * @throws {NOT_FOUND} error if there is no groups
	 */
	async function listGroups(token){
		const username = await getUsername(token);
		//if (groups == {}) throw(errors.NOT_FOUND(`There were no groups found`));

		return await data_mem.listGroups(username);
	};

	/**
	 * Gets a group information
	 * @param {String} token 
	 * @param {String} groupId  group id to get the info from
	 * @returns {Object} group information
	 * @throws {MISSING_PARAMETER} error if the group id is missing
	 * @throws {NOT_FOUND} error if the group does not exist
	 */
	async function getGroupInfo(token,groupId){
		const username = await getUsername(token);

		if(!groupId){
			throw(errors.MISSING_PARAMETER('Group id is missing'));
		}
		if(!await data_mem.hasGroup(username, groupId) ){
			throw(errors.NOT_FOUND(`The group you were trying to get the info does not exist`));
		}

		return data_mem.getGroup(username,groupId);
	};

	/**
	 * Adds a gameId to a group
	 * @param {String} token 
	 * @param {String} groupId the group id to add the game to
	 * @param {Number} gameId the game id to add to the group
	 * @returns {Object} updated group
	 * @throws {MISSING_PARAMETER} error if the group id is missing
	 * @throws {MISSING_PARAMETER} error if the game id is missing
	 * @throws {NOT_FOUND} error if the group does not exist or if the game was not found
	 * @throws {FAIL} error if the game is already in the group
	 * 
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
			throw(errors.NOT_FOUND(`The group you are trying to add the game to does not exist`));
		}

		if( await data_mem.hasGame(username,groupId,gameId) ){
			throw(errors.FAIL('The game you are trying to add is already part of the group'))
		}
		
		const game = await data_borga.getGameById(gameId);
		
		return await data_mem.addGameToGroup(username,groupId,game);

	};

	/**
	 * Deletes a user's group
	 * @param {String} token 
	 * @param {String} groupId 
	 * @returns {Object} list of updated groups
	 * @throws {MISSING_PARAMETER} error if the group id is missing
	 * @throws {NOT_FOUND} error if the group does not exist
	 */
	async function deleteAGroup(token,groupId){
		const username = await getUsername(token);

		if(!groupId){
			throw(errors.MISSING_PARAMETER('Group id is missing'));
		}

		if( !await data_mem.hasGroup(username, groupId) ){
			throw(errors.NOT_FOUND(`The group you were trying to delete does not exist`));
		}

		return await data_mem.deleteGroup(username, groupId);
	};

	/**
	 * Removes a game from a user's group
	 * @param {String} token 
	 * @param {String} groupId 
	 * @param {String} gameID 
	 * @returns {Object} updated group
	 * @throws {MISSING_PARAMETER} error if the group id is missing
	 * @throws {MISSING_PARAMETER} error if the game id is missing
	 * @throws {NOT_FOUND} error if the group does not exist
	 * @throws {NOT_FOUND} error if the game does not exist in the group
	 */
	async function removeGameFromGroup(token,groupId,gameID){
		const username = await getUsername(token);
		

		if(!groupId){
			throw(errors.MISSING_PARAMETER('Group Id missing'));
		}


		if(!gameID){
			throw(errors.MISSING_PARAMETER('Game Id is missing'));
		}

		if( !await data_mem.hasGroup(username, groupId) ){
			throw(errors.NOT_FOUND(`The group you were trying to delete the game from does not exist`));
		}

		if( !await data_mem.hasGame(username, groupId, gameID) ){
			throw(errors.NOT_FOUND(`The Game you are trying to remove was not found`));
		}

		return await data_mem.removeGameFromGroup(username, groupId, gameID);
	};

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
		removeGameFromGroup,
		getGameDetails,
		checkAndGetUser,
		addUserWithRequiredPassword
	};
}