'use strict';

const fetch = require('node-fetch');

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
