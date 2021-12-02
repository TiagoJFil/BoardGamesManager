'use strict';

const crypto = require('crypto')
const errors= require('./borga-errors.js')

const tokens = {
	'8b85d489-bcd3-477b-9563-5155af9f08ca': 'tiago',
	'fc6dbc68-adad-4770-ae6a-2d0e4eb1d0ea': 'joao'
};

//id : GameObject
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

//users with an array of ids of the games on the UsersList
const users = {
	'tiago' : {
		'test' : {
			Name : 'test',
			Description:'Grupo de Teste',
			games:['cyscZjjlse']
		}},
	
};

const hasGroup = async (user,groupName) => users[user].hasOwnProperty(groupName);

const hasGame = async (user,groupName,gameId) => users[user][groupName].gamesList.includes(gameId);

async function tokenToUsername(token) {
	return tokens[token];
}

async function createGroup(user,name,description){
	var newGroup =  {
		Name : name,
		Description : description,
		games : []	
	};
	users[user][name] = newGroup

	const displayableGroup =  {
		Name : name,
		Description : description,
		games : {}	
	};
	return displayableGroup;
}

async function editGroup(user,oldName,newName,description){
	const oldGamesList = users[user][oldName].gamesList;
	const updatedGroup =  {
		Name : newName,
		Description : description,
		games : oldGamesList	
	};
	delete users[user][oldName];
	users[user][newName] = updatedGroup;
	return updatedGroup;
}

async function listGroups(user){
	const userGroups = Object.values(users[user]);

	for (let i = 0; i < userGroups.length; i++){
		userGroups[i] = {
			Name : userGroups[i].Name,
			Description : userGroups[i].Description
		}
	  }

	return Object.values(userGroups);
}

async function deleteGroup(user, groupName){
	delete users[user][groupName];
}

async function getDisplayableGroupWithGameObjs(user,groupName){
	let GamesObjFromIds = new Object()
	users[user][groupName].games.forEach( it => GamesObjFromIds[it] = games[it])
	
	const groupToDisplayWithGameObjs = {
		Name : users[user][groupName].Name,
		Description : users[user][groupName].Description,
		games : GamesObjFromIds
	};
	return groupToDisplayWithGameObjs
}

async function addGameToGroup(user,groupName,game){
	const gameId = game.id
	games[gameId] = game
	
	users[user][groupName].games.push(gameId);

	return await getDisplayableGroupWithGameObjs(user,groupName);
}

async function removeGameFromGroup(user,groupName,gameId){
	users[user][groupName].games.filter(it == gameId);
}

async function listGames(username) {
	return Object.values(users[username]);
}

async function createUser(Username){ //adds user
	if(users[Username]) throw errors.USER_ALREADY_EXISTS('Username')
	const id = crypto.randomUUID()
	tokens[id] = Username
	users[Username] = new Array()
	return {
		AuthToken: id,
		UserName: Username
	}
}




module.exports = {
	hasGame,
	hasGroup,
	createUser,
	tokenToUsername,
	createGroup,
	editGroup,
	listGroups,
	deleteGroup,
	getDisplayableGroupWithGameObjs,
	addGameToGroup,
	removeGameFromGroup,
	listGames
}