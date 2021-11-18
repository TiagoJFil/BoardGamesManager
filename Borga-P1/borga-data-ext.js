'use strict';
const errors= require('./borga-errors.js')
const fetch = require('node-fetch');

const RANKED = '&order_by=rank'

const LIMIT = '&limit=10'

const CLIENT_ID = process.env['ATLAS_CLIENT_ID'];

const BOARD_ATLAS_BASE_URI = 'https://api.boardgameatlas.com/api/';

 

const HTTP_SERVER_ERROR = 5;

function getStatusClass(statusCode) {
	return ~~(statusCode / 100); //como nao ha tipos em js , utilizamos o not bit a bit duas vezes para converter em inteiro
}


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

function makeGameObj(gameInfo) {

	return {
		id: gameInfo.id,
		name: gameInfo.name,
		url: gameInfo.url,
		price: gameInfo.price,
		publisher: gameInfo.publisher,
		min_age: gameInfo.min_age,
		min_players: gameInfo.min_players,
		rank: gameInfo.rank,
	};
	
}

function getGameByName(name) {
	const search_uri =BOARD_ATLAS_BASE_URI + '&name=' + name + '&client_id=' + CLIENT_ID;

	return do_fetch(search_uri)
		.then(answer => {
			if(answer.length != 0){
				return makeGameObj(answer.games[0]);
			} else {
				throw errors.NOT_FOUND({ query });
			}
		});
}

module.exports = {
	getGameByName
}



function makeListObj(answer){
	const gamesList = {}
	let k = 0
	for(games in answer.games){
		gamesList[k] = (games)
		k++
	}
	return games 
}


function getListPopularGames(limit) { 
	const search_uri =
		BOARD_ATLAS_BASE_URI + RANKED + '&limit=' + limit + '&client_id=' + CLIENT_ID;
 
	return do_fetch(search_uri)
		.then(answer => {
			if (answer.length != 0) {
				return makeListObj(answer.games);
				//return getBookById(answer.items[0].id);
			} else {
				throw errors.NOT_FOUND({ query });
			}
		});
}



console.log(getListPopularGames(10))

