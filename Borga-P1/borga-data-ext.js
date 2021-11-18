'use strict';

const fetch = require('node-fetch');

const CLIENT_ID = process.env['ATLAS_CLIENT_ID'];

const BOARD_ATLAS_BASE_URI = https://api.boardgameatlas.com/api/;
/*
const HTTP_SERVER_ERROR = 5;

function getStatusClass(statusCode) {
	return ~~(statusCode / 100); //como nao ha tipos em js , utilizamos o not bit a bit duas vezes para converter em inteiro
}
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


function getGameByName(name) {
	const search_uri =BOARD_ATLAS_BASE_URII + '&name=' + name + '&client_id=' + CLIENT_ID;

	return do_fetch(search_uri)
		.then(answer => {
			if(answer.length != 0){
				return makeGameObj(answer[0]);
			} else {
				throw errors.NOT_FOUND({ query });
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
		min_players: gameInfo.min_player,
		rank: gameInfo.rank,
	};	
}
