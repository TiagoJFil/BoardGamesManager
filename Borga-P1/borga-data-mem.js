'use strict';

const crypto = require('crypto')
const errors= require('./borga-errors.js')

const tokens = {
	'8b85d489-bcd3-477b-9563-5155af9f08ca': 'tiago',
	'fc6dbc68-adad-4770-ae6a-2d0e4eb1d0ea': 'joao'
};

//id : GameObject
const games = {
	
	"EL3YmDLY6W" : {
		"id": "EL3YmDLY6W",
		"name": "Risk",
		"url": "https://www.boardgameatlas.com/game/EL3YmDLY6W/risk",
		"price": "24.26",
		"publisher": "Hasbro",
		"min_age": 10,
		"min_players": 2,
		"max_players": 6,
		"rank": 317
	}

}

//users with an array of ids of the games on the UsersList
const users = {
	'tiago' : {
		'nome' : {
			Name : 'nome',
			Description:'',
			gamesList:['EL3YmDLY6W0','TAAifFP590']
		}},
	'manel' : {
		'nome' : {
			Name : 'nome',
			Description:'',
			gamesList:['EL3YmDLY6W0','TAAifFP590']
		}},
};

const hasGroup = async (user,groupName) => users[user].hasOwnProperty(groupName);

const hasGame = async (user,groupName,gameId) => users[user][groupName].gamesList.includes(gameId);

async function tokenToUsername(token) {
	return tokens[token];
}

async function createGroup(user,name,description){
	const groupObj = {name : {Name : name, Description : description, gamesList : []}};
	users[user] = groupObj;
}

async function editGroup(user,oldName,newName,description){
	const oldGamesList = users[user][oldName].gamesList;
	const groupObj = {name : {Name : newName, Description : description, oldGamesList}};
	users[user] = groupObj;
}

async function listGroups(user){
	return Object.value(users[user]);
}

async function deleteGroup(user, groupName){
	delete users[user][groupName];
}

async function getDetailsFromGroup(user,groupName){
	return Object.value(users[user][groupName]);
}

async function addGameToGroup(user,groupName,gameId){
	users[user][groupName].gamesList.push(gameId);
}

async function removeGameFromGroup(user,groupName,gameId){
	users[user][groupName].gamesList.filter(it == gameId);
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
	getDetailsFromGroup,
	addGameToGroup,
	removeGameFromGroup,
	listGames
}