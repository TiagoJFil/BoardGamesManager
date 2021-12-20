'use strict';

const crypto = require('crypto')

let count = 0;

/**
 * object with user token as key and its name as value
 */
const tokens = {
	'8b85d489-bcd3-477b-9563-5155af9f08ca': 'tiago',
	'fc6dbc68-adad-4770-ae6a-2d0e4eb1d0ea': 'joao'
};

/**
 * object with all game's id's as keys and the repective information as values
 */
const games = {
	cyscZjjlse: {
		id: 'cyscZjjlse',
		name: 'Telestrations',
		url: 'https://www.boardgameatlas.com/game/cyscZjjlse/telestrations',
		price: '22.99',
		publisher: 'USAopoly',
		min_age: 12,
		min_players: 4,
		max_players: 8,
		rank: 252
	  }  
}

/**
 * object with all users with their respective information such as its groups
 */
const users = {
	'tiago': {}
};

/**
 * checks if the user already has a group with that name 
 * @param {String} user 
 * @param {String} groupId 
 * @returns {Boolean} true if the user has certain group
 */
const hasGroup = async (user,groupId) => users[user].hasOwnProperty(groupId);

/**
 * checks if a certain user's group has a the same gameId
 * @param {String} user 
 * @param {String} groupId 
 * @param {String} gameId 
 * @returns {Boolean} true if certain group of a user has the same game identified by the gameId
 */
const hasGame = async (user,groupId,gameId) => users[user][groupId].games.includes(gameId);

/**
 * checks if username is already in use
 * @param {String}} Username 
 * @returns {Boolean} true if users object has certain user
 */
const hasUser = async(Username) => users.hasOwnProperty(Username);

/**
 * gets username from unique token
 * @param {String} token 
 * @returns {Object} the name of user identified by the token
 */
async function tokenToUsername(token) {
	return tokens[token];
}

/**
 * Creates a new user group with the provided name and description
 * @param {String} user 
 * @param {String} name 
 * @param {String} description 
 * @returns {Object} a new group object with the information provided
 */
async function createGroup(user,name,description){
	var newGroup =  {
		name : name,
		description : description,
		games : []	
	};

	users[user][count] = newGroup;

	const displayableGroup =  {
		name : name,
		description : description,
		games : {}	
	};

	count++

	return displayableGroup;
}

/**
 * edits a user's group name and description
 * @param {String} user 
 * @param {String} oldName group's old name
 * @param {String} newName griups's new name
 * @param {String} description 
 * @returns {Object} the new edited group
 */
async function editGroup(user,groupId,newName,description){
	const oldGamesList = users[user][groupId].games;
	const updatedGroup =  {
		name : newName,
		description : description,
		games : oldGamesList	
	};

	delete users[user][groupId];
	users[user][groupId] = updatedGroup;
	
	return getDisplayableGroupWithGameObjs(user,groupId);
}

/**
 * Lists all groups of a certain user 
 * @param {String} user 
 * @returns {Object} containing all groups
 */
async function listGroups(user){
	return await getDisplayableGroupsWithGameObjs(user);
}

/**
 * Deletes a group from a user
 * @param {String} user 
 * @param {String} groupId 
 * @returns {Object} user's groups updated
 */
async function deleteGroup(user, groupId){

	delete users[user][groupId];
	return listGroups(user);

}

/**
 * Displays a group with all the games as an object
 * @param {String} user 
 * @param {String} groupId 
 * @returns {Object} the same group but with all the information of its games
 */
async function getDisplayableGroupWithGameObjs(user,groupId){
	let GamesObjFromIds = new Object();

	users[user][groupId].games.forEach( it => GamesObjFromIds[it] = games[it]);
	
	const groupToDisplayWithGameObjs = {
		name : users[user][groupId].name,
		description : users[user][groupId].description,
		games : GamesObjFromIds
	};

	return groupToDisplayWithGameObjs;
}

async function getDisplayableGroupsWithGameObjs(user){
	let obj = new Object()
	for(const key in users[user]){
		
		obj[key] = await getDisplayableGroupWithGameObjs(user,key) 
	
	}
	return obj
}


/**
 * Adds a game to a user's group 
 * @param {String} user 
 * @param {String} groupId 
 * @param {Object} game 
 * @returns {Object} group with games updated
 */
async function addGameToGroup(user,groupId,game){
	const gameId = game.id;
	games[gameId] = game;
	
	users[user][groupId].games.push(gameId);

	return await getDisplayableGroupWithGameObjs(user,groupId);
}

/**
 * Removes a game from a user's group 
 * @param {String} user 
 * @param {String} groupId 
 * @param {String} gameId 
 * @returns {Object} group with games updated
 */
async function removeGameFromGroup(user,groupId,gameId){
	users[user][groupId].games = users[user][groupId].games.filter(it => it != gameId);
	
	return await getDisplayableGroupWithGameObjs(user,groupId);
}

/**
 * Creates a new user 
 * @param {String} Username user's name   
 * @returns {Object} an object with the id of the user and its name
 */
async function createUser(Username){
	const id = crypto.randomUUID()
	tokens[id] = Username
	users[Username] = new Array()
	return {
		AuthToken: id,
		UserName: Username
	};
}

module.exports = {
	hasGame,
	hasGroup,
	hasUser,
	createUser,
	tokenToUsername,
	createGroup,
	editGroup,
	listGroups,
	deleteGroup,
	getDisplayableGroupWithGameObjs,
	addGameToGroup,
	removeGameFromGroup,
}