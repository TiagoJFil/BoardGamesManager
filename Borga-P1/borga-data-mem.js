'use strict';

const crypto = require('crypto')

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
	'tiago' : {
		'test' : {
			Name : 'test',
			Description:'Grupo de Teste',
			games:['cyscZjjlse']
	}},
};

/**
 * 
 * @param {user name that will act has key to access its values on users object} user 
 * @param {name of the group} groupName 
 * @returns true if the user has certain group
 */
const hasGroup = async (user,groupName) => users[user].hasOwnProperty(groupName);

/**
 * 
 * @param {user name that will act has key to access its values on users object} user 
 * @param {name of the group} groupName 
 * @param {game identification} gameId 
 * @returns true if certain group of a user has the same game identified byt the gameId
 */
const hasGame = async (user,groupName,gameId) => users[user][groupName].games.includes(gameId);

/**
 * 
 * @param {user name that will act has key to access its values on users object} Username 
 * @returns true if users object has certain user
 */
const hasUser = async(Username) => users.hasOwnProperty(Username);

/**
 * 
 * @param {token of the user} token 
 * @returns the name of user identified by the token
 */
async function tokenToUsername(token) {
	return tokens[token];
}

/**
 * 
 * @param {name of user that will get a new group} user 
 * @param {name of the group we want to create} name 
 * @param {description that defines the group} description 
 * @returns a new group object with the information provided
 */
async function createGroup(user,name,description){
	var newGroup =  {
		Name : name,
		Description : description,
		games : []	
	};

	users[user][name] = newGroup;

	const displayableGroup =  {
		Name : name,
		Description : description,
		games : {}	
	};

	return displayableGroup;
}

/**
 * 
 * @param {user name that will get its group edited} user 
 * @param {name of the group we want to edit} oldName 
 * @param {the new name we will give to the group} newName 
 * @param {new description that we will give to thr group} description 
 * @returns the new edited group
 */
async function editGroup(user,oldName,newName,description){
	const oldGamesList = users[user][oldName].games;
	const updatedGroup =  {
		Name : newName,
		Description : description,
		games : oldGamesList	
	};
	delete users[user][oldName];
	users[user][newName] = updatedGroup;
	
	return getDisplayableGroupWithGameObjs(user,newName);
}

/**
 * 
 * @param {name of the user that we want the groups} user 
 * @returns the groups of certain user
 */
async function listGroups(user){
	const userGroups = Object.values(users[user]);

	let displayableObject = {}
	for (let i = 0; i < userGroups.length; i++){
		
		userGroups[i] = {
			Name : userGroups[i].Name,
			Description : userGroups[i].Description
		}
		
		displayableObject[userGroups[i].Name] = userGroups[i]
	  }
	
	return displayableObject;
}

/**
 * 
 * @param {user name that will get its group deleted} user 
 * @param {group name that will get deleted} groupName 
 * @returns the groups of the user minus the deleted one
 */
async function deleteGroup(user, groupName){

	delete users[user][groupName];
	return listGroups(user);

}

/**
 * 
 * @param {name of the user we want to tranform the group} user 
 * @param {name of the group we want to access} groupName 
 * @returns the same group but with all the information of its games
 */
async function getDisplayableGroupWithGameObjs(user,groupName){
	let GamesObjFromIds = new Object();
	users[user][groupName].games.forEach( it => GamesObjFromIds[it] = games[it]);
	
	const groupToDisplayWithGameObjs = {
		Name : users[user][groupName].Name,
		Description : users[user][groupName].Description,
		games : GamesObjFromIds
	};

	return groupToDisplayWithGameObjs;
}

/**
 * 
 * @param {name of the user we want to add the game} user 
 * @param {name of the group that will get the game} groupName 
 * @param {object of the game we want to add} game 
 * @returns the group with the game added
 */
async function addGameToGroup(user,groupName,game){
	const gameId = game.id;
	games[gameId] = game;
	
	users[user][groupName].games.push(gameId);

	return await getDisplayableGroupWithGameObjs(user,groupName);
}

/**
 * 
 * @param {name of the user that will get the game removed} user 
 * @param {name of the group that will get the game removed} groupName 
 * @param {id of the game that will get deleted} gameId 
 * @returns the group without the game
 */
async function removeGameFromGroup(user,groupName,gameId){
	users[user][groupName].games = users[user][groupName].games.filter(it => it != gameId);

	return await getDisplayableGroupWithGameObjs(user,groupName);
}

/**
 * 
 * @param {name of the user we want to create} Username 
 * @returns an object with the id of the user and its name
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