'use strict';

const errors = require('./borga-errors.js');

module.exports = function (data_borga, data_mem) {

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
	
	async function getPopularGames(){
		const list =  data_borga.getListPopularGames();
		  
		return list;
	}

	async function searchGame(name){
		if(!name){
			throw(errors.MISSING_PARAMETER('Name of the game to search'));
		}
		
		const game = data_borga.getGameByName(name);
		return game ;
	}
	
	async function addUser(name){
		if(!name){
			throw(errors.MISSING_PARAMETER('Name of user missing'));
		}

		if(await data_mem.hasUser(name));
			throw errors.USER_ALREADY_EXISTS(name);

		return data_mem.createUser(name);
	}
	
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

	async function listGroups(token){
		const username = await getUsername(token);

		return data_mem.listGroups(username);
	}

	async function getGroupInfo(token,groupName){
		const username = await getUsername(token);

		if(!groupName){
			throw(errors.MISSING_PARAMETER('Group name missing'));
		}
		if( !await data_mem.hasGroup(username, groupName) ){
			throw(errors.NOT_FOUND(`The group you were trying to get the info does not exist`));
		}

		return data_mem.getDisplayableGroupWithGameObjs(username,groupName);
	}

	async function addGameToGroup(token,groupName,gameId){
		const username = await getUsername(token);

		if(!groupName){
			throw(errors.MISSING_PARAMETER('Group name missing'));
		}

		if(!gameId){
			throw(errors.MISSING_PARAMETER('Game Id is missing'));
		}

		if( !await data_mem.hasGroup(username, groupName) ){
			throw(errors.NOT_FOUND(`The group you were trying to get the info does not exist`));
		}
		
		const game = await data_borga.getGameById(gameId);
		
		return await data_mem.addGameToGroup(username,groupName,game);

	}

	async function deleteAGroup(token,groupName){
		const username = await getUsername(token);

		if(!groupName){
			throw(errors.MISSING_PARAMETER('Group name missing'));
		}

		if( !await data_mem.hasGroup(username, groupName) ){
			throw(errors.NOT_FOUND(`The group you were trying to delete does not exist`));
		}

		const groups = await data_mem.deleteGroup(username,groupName);
		return groups;
	}

	async function removeGameFromGroup(token,groupName,gameID){
		const username = await getUsername(token);

		if(!groupName){
			throw(errors.MISSING_PARAMETER('Group name missing'));
		}

		if(!gameID){
			throw(errors.MISSING_PARAMETER('Game Id is missing'));
		}

		if( !await data_mem.hasGroup(username, groupName) ){
			throw(errors.NOT_FOUND(`The group you were trying to delete the game from does not exist`));
		}

		if( !await data_mem.hasGame(username, groupName, gameID) ){
			throw(errors.NOT_FOUND(`The Game you are trying to remove was not found`));
		}

		const group = await data_mem.removeGameFromGroup(username,groupName,gameID);
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