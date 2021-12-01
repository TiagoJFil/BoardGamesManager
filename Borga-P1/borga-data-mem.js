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
	'tiago' : {games:{'EL3YmDLY6W':'Risk'}}
};

const hasGame = async (gameId) => !!games[gameId];

async function tokenToUsername(token) {
	return tokens[token];
}

async function saveGame(username,gameObj) {
	const gameId = gameObj.id;
	users[username].games[gameId] = gameObj.name
	game[gameId] = gameObj;
	return gameId;
}

async function loadGame(username,gameId) {
	const gameId = users[username].games[gameId].key;
	if (!gameId) {
		const err = errors.NOT_FOUND({ id: gameId })
		throw err;
	}
	return games[gameId].value;
}
/* TEM UM ERRO */
async function deletegame(username,gameId) {
	const gameId = users[username].games[gameId].key;
	if (!gameId) {
		throw errors.NOT_FOUND({ id: gameId });
	}
	delete users[username].games[gameId];
	return gameId;
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

async function addGameToUser(token,game){ 
	const tokenList = Object.keys(tokens) 
	if(token in tokenList) userGamesIds[token].push(game.id);
}



module.exports = {
	createUser,
	addGameToUser
}