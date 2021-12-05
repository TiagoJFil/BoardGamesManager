'use strict';

const crypto = require('crypto');

const mock_tokens = {
	'8b85d489-bcd3-477b-9563-5155af9f08ca': 'tiago',
	'fc6dbc68-adad-4770-ae6a-2d0e4eb1d0ea': 'joao'
};

//id : GameObject
const mock_games = {
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
const mock_users = {
	'tiago' : {
		'test' : {
			Name : 'test',
			Description:'Grupo de Teste',
			games:['cyscZjjlse']
	}},
    'manel' : {
		'test' : {
			Name : 'test',
			Description:'Grupo de Teste',
			games:['cyscZjjlse']
	}},
    'toni' : {
		'test' : {
			Name : 'test',
			Description:'Grupo de Teste',
			games:['cyscZjjlse']
	}},
};

const hasGroup = async (user,groupName) => mock_users[user].hasOwnProperty(groupName);

const hasGame = async (user,groupName,gameId) => mock_users[user][groupName].games.includes(gameId);

const hasUser = async(Username) => mock_users.hasOwnProperty(Username);

async function tokenToUsername(token) {
	return mock_tokens[token];
}

async function createGroup(user,name,description){
	var newGroup =  {
		Name : name,
		Description : description,
		games : []	
	};

	mock_users[user][name] = newGroup;

	const displayableGroup =  {
		Name : name,
		Description : description,
		games : {}	
	};

	return displayableGroup;
}

async function editGroup(user,oldName,newName,description){
	const oldGamesList = mock_users[user][oldName].games;
	const updatedGroup =  {
		Name : newName,
		Description : description,
		games : oldGamesList	
	};
	delete mock_users[user][oldName];
	mock_users[user][newName] = updatedGroup;

	return updatedGroup;
}

async function listGroups(user){
	const userGroups = Object.values(mock_users[user]);

	for (let i = 0; i < userGroups.length; i++){
		userGroups[i] = {
			Name : userGroups[i].Name,
			Description : userGroups[i].Description
		}
	};

	return Object.values(userGroups);
}

async function deleteGroup(user, groupName){

	delete mock_users[user][groupName];
	return listGroups(user);

}

async function getDisplayableGroupWithGameObjs(user,groupName){
	let GamesObjFromIds = new Object();
	mock_users[user][groupName].games.forEach( it => GamesObjFromIds[it] = mock_games[it]);
    
	const groupToDisplayWithGameObjs = {
		Name : mock_users[user][groupName].Name,
		Description : mock_users[user][groupName].Description,
		games : GamesObjFromIds
	};

	return groupToDisplayWithGameObjs;
}

async function addGameToGroup(user,groupName,game){
	const gameId = game.id;
	mock_games[gameId] = game;
	
	mock_users[user][groupName].games.push(gameId);

	return await getDisplayableGroupWithGameObjs(user,groupName);
}

async function removeGameFromGroup(user,groupName,gameId){
	mock_users[user][groupName].games = mock_users[user][groupName].games.filter(it => it != gameId);

	return await getDisplayableGroupWithGameObjs(user,groupName);
}

async function createUser(Username){ //adds user
	const id = crypto.randomUUID()
	tokens[id] = Username
	users[Username] = new Array()
	return {
		AuthToken: id,
		UserName: Username
	};
}

module.exports = {
	hasUser,
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
    mock_users,
    mock_games,
    mock_tokens,
}