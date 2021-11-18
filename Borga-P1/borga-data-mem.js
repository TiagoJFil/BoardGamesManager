'use strict';
const crypto = require('crypto')

const games = {};

const users = {};

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

async function createUser(Username){
	const id = crypto.randomUUID()
	const user = {
		name : Username,
		uuid : id
	}

	users[id] = user
	return user
}
createUser("tiago")
console.log(users)

