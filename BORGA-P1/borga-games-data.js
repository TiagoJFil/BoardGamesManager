'use strict';
const errors= require('./borga-errors.js')
const fetch = require('node-fetch');

const CLIENT_ID = process.env['ATLAS_CLIENT_ID'];

const BOARD_ATLAS_BASE_URI = 'https://api.boardgameatlas.com/api/search?';

const HTTP_SERVER_ERROR = 5;

/**
 * convert status code to int
 * @param statusCode 
 * @returns {int}
 */
function getStatusClass(statusCode) {
	return ~~(statusCode / 100); //como nao ha tipos em js , utilizamos o not bit a bit duas vezes para converter em inteiro
}

/**
 * fetches uri's
 * @param {string} uri 
 * @returns {object} response or error
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
 * @param {object} gameInfo 
 * @returns {object}
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
 * @param {string} name 
 * @returns 
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
 * @param {string} id 
 * @returns {object} game or error
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
 * @returns {object} with the top 10 games
 */
function getListPopularGames() { 
	const search_uri =BOARD_ATLAS_BASE_URI + '&order_by=rank&limit=10&client_id=' + CLIENT_ID;
	return do_fetch(search_uri)
		.then(answer => {
			if (answer.length != 0 && answer.count != 0) {
				return makeListObj(answer.games);
			} else {
				throw errors.NOT_FOUND({  });
			}
		});
}


/**
 * adds all games to an object
 * @param {object} answer 
 * @returns {object} gamesList
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
