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
 * convert status code to int
 * @param statusCode 
 * @returns {Number}
 */
function getStatusClass(statusCode) {
	return ~~(statusCode / 100); //como nao ha tipos em js , utilizamos o not bit a bit duas vezes para converter em inteiro
}

/**
 * fetches uri's
 * @param {String} uri 
 * @returns {Object} response or error
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
 * transforms game object response to a more simplified object
 * @param {Object} gameInfo 
 * @returns {Object}
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
 * returns a game from the api searching by name
 * @param {String} name 
 * @returns {Object} game or error
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
 * searches a game by its id in the api
 * @param {String} id 
 * @returns {Object} game or error
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
 * transforms a rank query from the api in a object 
 * @param {Int} count
 * @returns {Object} top x games
 */
function getListPopularGames(count) { 
	const search_uri =BOARD_ATLAS_BASE_URI + '&order_by=rank&limit=' + count  +'&client_id=' + CLIENT_ID;
	return do_fetch(search_uri)
		.then(answer => {
			if (answer.length != 0 && answer.count != 0) {
				return makeListObj(answer.games);
			} else {
				throw errors.FAIL();
			}
		});
}


/**
 * Adds all games to an object
 * @param {Object} answer 
 * @returns {Object} gamesList
 */
 function makeListObj(answer){
	const gamesList = {}
	let it = 0
	const size = answer.length
	while(it < size){
		gamesList[it + 1] = makeGameObj(answer[it])
		it++
	}
	return gamesList
}


module.exports = {
	getGameByName,
	getListPopularGames,
	getGameById
}
