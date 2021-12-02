'use strict';

const errors = require('./borga-errors.js');

module.exports = function (data_borga, data_int) {

	async function getUsername(token) {
		if (!token) {
			throw errors.UNAUTHENTICATED('no token');
		}
		const username = await data_int.tokenToUsername(token);
		if(!username) {
			throw errors.UNAUTHENTICATED('bad token');
		}
		return username;
	}

	/*
	//checks if the function received the name and desc params , otherwise throws a missing parrameter exception
	async function checkGroupParams(name,desc){
		if(!name){
			throw(errors.MISSING_PARAMETER('group name'));
		}
		if(!desc){
			throw(errors.MISSING_PARAMETER('group description'));	
		}
	}
	*/
	
	
	async function getPopularGames(){
		const list =  data_borga.getListPopularGames()
		
		return list
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
			throw(errors.MISSING_PARAMETER('user name'));
		}
		
		return data_int.createUser(name);
		
	}
	
	async function createGroup(token,name,desc){
		if(!name){
			throw(errors.MISSING_PARAMETER('group name'));
		}
		if(!desc){
			throw(errors.MISSING_PARAMETER('group description'));	
		}
		
		const username = getUsername(token)
		
		if( await data_int.haGroup(username, name) ){
			throw(errors.GROUP_ALREADY_EXISTS(`$name is already a group`))
		}
		
		return data_int.createGroup(token,name,desc)
	}

	async function editGroup(token,name,desc){
		if(!name){
			throw(errors.MISSING_PARAMETER('group name'));
		}
		if(!desc){
			throw(errors.MISSING_PARAMETER('group description'));	
		}
		return data_int.editGroup(token,name,desc)
	}

	


	return {
		getPopularGames,
		searchGame,
		addUser,
		createGroup,
		editGroup
	};
}