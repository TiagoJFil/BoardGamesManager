'use strict';
const crypto = require('crypto')

const games = {};

const tokens = {
	'8b85d489-bcd3-477b-9563-5155af9f08ca': 'tiago',
	'fc6dbc68-adad-4770-ae6a-2d0e4eb1d0ea': 'joao'
};

const userGamesIds = {
	"id" : ["1234","etc"]
}
const users = {
	'tiago' : userGamesIds
};

const hasGame = async (gameId) => !!games[gameId];


/*
async function saveGame(gamesObj) {
	const gameId = gameObj.id;
	game[gameId] = gameObj;
	return gameId;
}

async function loadGame(gameId) {
	const gameObj = games[gameId];
	if (!gameObj) {
		const err = errors.NOT_FOUND({ id: gameId })
		throw err;
	}
	return gameObj;
}

async function deletegame(gameId) {
	const gameObj = games[gameId];
	if (!gameObj) {
		throw errors.NOT_FOUND({ id: gameId });
	}
	delete games[gameId];
	return gameId;
}

async function listGames() {
	return Object.values(games);
}
*/

async function createUser(Username){ //ads user
	const id = crypto.randomUUID()
	tokens[id] = Username
	return 
}

//test
createUser("Mario")
console.log(tokens)
createUser("Manel")
console.log(tokens)
console.log(Object.keys(tokens))


async function addGameToUser(token,id){ //not right ?
	const t = Object.keys(tokens) 
	if(token in t) users[token] = id
	return users
}


//test
addGameToUser('8b85d489-bcd3-477b-9563-5155af9f08ca','123465')
console.log(users)






