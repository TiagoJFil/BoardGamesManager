'use strict';


const guest = require('./borga-config').guest

/**
 * object with user token as key and its name as value
 */
const tokens = {
	[guest.token] : guest.user
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
	[guest.user]: {
		groups : {},
		token: guest.token
	}
};

/**
 * checks if the user already has a group with that name 
 * @param {String} user 
 * @param {String} groupId 
 * @returns {Boolean} true if the user has certain group
 */
const hasGroup = async (user,groupId) => users[user].groups.hasOwnProperty(groupId);

/**
 * checks if a certain user's group has a the same gameId
 * @param {String} user 
 * @param {String} groupId 
 * @param {String} gameId 
 * @returns {Boolean} true if certain group of a user has the same game identified by the gameId
 */
const doesGroupHaveGame = async (user,groupId,gameId) => users[user].groups[groupId].games.includes(gameId);

/**
 * checks if username is already in use
 * @returns {Boolean} true if users object has certain user
 * @param Username
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
 * Verifies if the storage contains a certain game
 * @param {String} gameId the id of the game to be checked
 */
async function isGameInStorage(gameId){
	return games.hasOwnProperty(gameId);
}

/**
 * Adds a game received from the services to the storage
 * @param {Object} game  the game to add to the storage
 */
async function addGameToStorage(game){
	const gameId = game.id;
	games[gameId] = game;
}

/**
 * Creates a new user group with the provided name and description
 * @param {String} user 
 * @param {String} name 
 * @param {String} description 
 * @param {String} id the id given from the services
 * @returns {Object} a new group object with the information provided
 */
async function createGroup(user,name,description,id){

	users[user].groups[id] = {
		name: name,
		description: description,
		games: []
	};

	return {
		id: id,
		name: name,
		description: description,
		games: {}
	};
}

/**
 * edits a user's group name and description
 * @param {String} user
 * @param groupId
 * @param {String} newName group's new name
 * @param {String} description
 * @returns {Object} the new edited group
 */
async function editGroup(user,groupId,newName,description){
	const oldGamesList = users[user].groups[groupId].games;
	const updatedGroup =  {
		name : newName,
		description : description,
		games : oldGamesList	
	};
	
	delete users[user].groups[groupId];
	users[user].groups[groupId] = updatedGroup;
	
	return getGroup(user,groupId);
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
	delete users[user].groups[groupId];
	return listGroups(user);

}

/**
 * Displays a group with all the games as an object
 * @param {String} user 
 * @param {String} groupId 
 * @returns {Object} the same group but with all the information of its games
 */
async function getGroup(user,groupId){
	let GamesObjFromIds = {};
	
	users[user].groups[groupId].games.forEach( it => GamesObjFromIds[it] = games[it]);

	return {
		id: groupId,
		name: users[user].groups[groupId].name,
		description: users[user].groups[groupId].description,
		games: GamesObjFromIds
	};
}

async function getDisplayableGroupsWithGameObjs(user){
	let obj = {}
	for(const key in users[user].groups){
		
		obj[key] = await getGroup(user,key) 
	
	}
	return obj
}

/**
 * Adds a game to a user's group
 * @param {String} user
 * @param {String} groupId
 * @param {String} gameId the id of the game
 * @returns {Object} group with games updated
 */
async function addGameToGroup(user,groupId,gameId){
	
	users[user].groups[groupId].games.push(gameId);
		
	return await getGroup(user,groupId);
}

/**
 * Removes a game from a user's group 
 * @param {String} user 
 * @param {String} groupId 
 * @param {String} gameId 
 * @returns {Object} group with games updated
 */
async function removeGameFromGroup(user,groupId,gameId){
	users[user].groups[groupId].games = users[user].groups[groupId].games.filter(it => it !== gameId);
	
	return await getGroup(user,groupId);
}

/**
 * Gets an object with the user's name and password
 * @param {String} user 
 * @returns {Object} with the user's name and password
 */
  async function getUser(user){
	  return {
		  username : user,
		  password : users[user].password,
		  token : users[user].token
	  };
}

/**
 * Creates a new user
 * @param {String} Username user's name
 * @param Password user's password
 * @param Id user's token
 * @returns {Object} an object with the id of the user and its name
 */
async function createUser(Username,Password, Id){
	tokens[Id] = Username

	users[Username] = {
		groups : {},
		token : Id
	}
	
	if(Password)
		users[Username]['password'] = Password

	console.log(users)

	return {
		token: Id,
		username: Username
	};

}



module.exports = {
	doesGroupHaveGame,
	hasGroup,
	hasUser,
	isGameInStorage,
	addGameToStorage,
	createUser,
	tokenToUsername,
	createGroup,
	editGroup,
	listGroups,
	deleteGroup,
	getGroup,
	addGameToGroup,
	removeGameFromGroup,
	getUser,
}