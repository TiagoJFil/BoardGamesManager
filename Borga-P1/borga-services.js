'use strict';

const errors = require('./borga-errors.js');

module.exports = function (data_borga, data_int) {
	
	async function getPopularGames(){
		const list =  data_borga.getListPopularGames()
		
		return list
	}

	async function searchGame(name){
		if(!name){
			throw(errors.MISSING_PARAMETER('name of the game to search'));
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
	
	return {
		getPopularGames,
		searchGame,
		addUser
	};
}