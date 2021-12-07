'use strict';

const errors= require('./borga-errors.js');

const fetch = require('node-fetch');

/**
 * reads the client id so it can access board games atlas api
 */
const CLIENT_ID = process.env['ATLAS_CLIENT_ID'];

/**
 * default uri of the requests that will be made
 */
const BOARD_ATLAS_BASE_URI = 'https://api.boardgameatlas.com/api/search?';

/**
 * first digit of the server errors code
 */
const HTTP_SERVER_ERROR = 5;

/**
 * 
 * @param {code of the status received} statusCode 
 * @returns code divided by 100, so can identify errors with only one digit
 */
function getStatusClass(statusCode) {
	return ~~(statusCode / 100); //como nao ha tipos em js , utilizamos o not bit a bit duas vezes para converter em inteiro
}

/**
 * 
 * @param {uri that we want to make requests from} uri 
 * @returns the object received from the request 
 */
function do_fetch(uri) {
	return fetch(uri)
		.catch (err => { throw errors.EXT_SVC_FAIL(err); })
		.then(res => {
			if (res.ok) {
				return res.json();
			} else {
				if (getStatusClass(res.status) === HTTP_SERVER_ERROR) {
					return res.json()
						.catch (err => err) 
						.then(info => { throw errors.EXT_SVC_FAIL(info); });
				} else {
					throw errors.FAIL(res); 
				}
			}
		});
}

/**
 * 
 * @param {game object with its information} gameInfo 
 * @returns a smaller object with the games most important information
 */
function makeGameObj(gameInfo) {
	return {
		id: gameInfo.id,
		name: gameInfo.name,
		url: gameInfo.url,
		price: gameInfo.price,
		publisher: gameInfo.primary_publisher.name,
		min_age: gameInfo.min_age,
		min_players: gameInfo.min_players,
		max_players: gameInfo.max_players,
		rank: gameInfo.rank,
	};
	
}

/**
 * 
 * @param {name of game that we want to obtain its informations from the request} name 
 * @returns a game object with its information
 */
function getGameByName(name) {
	const search_uri =BOARD_ATLAS_BASE_URI + '&name=' + name + '&client_id=' + CLIENT_ID;

	return do_fetch(search_uri)
		.then(answer => {
			if(answer.length != 0 && answer.count != 0){
				return makeGameObj(answer.games[0]);
			} else {
				throw errors.NOT_FOUND({ name });
			}
		});
}

/**
 * 
 * @param {id of the game that we want to obtain its information from the request} id 
 * @returns a game object with its information
 */
function getGameById(id) {
	const search_uri =BOARD_ATLAS_BASE_URI + '&ids=' + id + '&client_id=' + CLIENT_ID;
	
	return do_fetch(search_uri)
		.then(answer => {
			if(answer.length != 0 && answer.count != 0){
				return makeGameObj(answer.games[0]);
			} else {
				throw errors.NOT_FOUND({ id });
			}
		});
}

/**
 * 
 * @param {response from the requests made} answer 
 * @returns returns an object with the information of the games received
 */
function makeListObj(answer){
	const gamesList = {};
	let it = 0;
	const size = answer.length;
	while(it < size){
		gamesList[it + 1] = makeGameObj(answer[it]);
		it++;
	}
	return gamesList;
}

/**
 * 
 * @returns an object with the most popular games according to the board games atlas website
 */
function getListPopularGames() { 
	const search_uri =BOARD_ATLAS_BASE_URI + '&order_by=rank&limit=10&client_id=' + CLIENT_ID;
	return do_fetch(search_uri)
		.then(answer => {
			if (answer.length != 0 && answer.count != 0) {
				return makeListObj(answer.games);
			} else {
				throw errors.FAIL();
			}
		});
}

module.exports = {
	getGameByName,
	getListPopularGames,
	getGameById
}
