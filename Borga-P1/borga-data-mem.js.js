'use strict';

const games = {};

const hasGame = async (gameId) => !!games[gameId];



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