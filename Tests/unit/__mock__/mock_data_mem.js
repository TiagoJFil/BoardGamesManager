'use strict';

const crypto = require('crypto');

const mock_tokens = {
	'8b85d489-bcd3-477b-9563-5155af9f08ca': 'tiago',
	'fc6dbc68-adad-4770-ae6a-2d0e4eb1d0ea': 'joao'
};

//id : GameObject
const mock_games = {
	cyscZjjlse: {
		id: 'cyscZjjlse',
		name: 'Telestrations',
		url: 'https://www.boardgameatlas.com/game/cyscZjjlse/telestrations',
		price: '22.99',
		publisher: 'USAopoly',
		min_age: 12,
		min_players: 4,
		max_players: 8,
		rank: 252
	  }  
}


//users with an array of ids of the games on the UsersList
const mock_users = {
	'tiago' : {
		'55bb5b48125d4e79893197dd45dbdce1' : {
			name : 'test',
			description:'Grupo de Teste',
			games:['cyscZjjlse']
	}},
    'manel' : {
		'39ff3d00f5fa4a1fb8389a41157ce094' : {
			name : 'test',
			description:'Grupo de Teste',
			games:['cyscZjjlse']
	}},
    'toni' : {
		'21dc3686c2244e919e9951dcc9c0691f' : {
			name : 'test',
			description:'Grupo de Teste',
			games:['cyscZjjlse']
	}},

	'zezocas' : {
		'bffe984340b943f29eb384c2a1b95ac5' : {
			name : 'test',
			description:'Grupo de Teste',
			games:['cyscZjjlse']
	}},
};

const hasGroup = async (user,groupId) => mock_users[user].hasOwnProperty(groupId);

const hasGame = async (user,groupId,gameId) => mock_users[user][groupId].games.includes(gameId);

const hasUser = async(Username) => mock_users.hasOwnProperty(Username);

async function tokenToUsername(token) {
	return mock_tokens[token];
}


async function createGroup(user,name,description){
	const id = crypto.randomUUID().replace(/-/g,'');

	mock_users[user][id] = {
		name: name,
		description: description,
		games: []
	};

	const displayableGroup =  {
		name : name,
		description : description,
		games : []	
	};
	
	//for testing purpose we will return the id
	return id;
}

async function editGroup(user,groupId,newName,description){
	const oldGamesList = mock_users[user][groupId].games;
	const updatedGroup =  {
		name : newName,
		description : description,
		games : oldGamesList	
	};
	delete mock_users[user][groupId];
	mock_users[user][groupId] = updatedGroup;

	return getDisplayableGroupWithGameObjs(user,groupId);
}

async function listGroups(user){
	return await getDisplayableGroupsWithGameObjs(user);
}

async function deleteGroup(user, groupId){
	delete mock_users[user][groupId];
	return listGroups(user);

}

async function getDisplayableGroupWithGameObjs(user,groupId){
	let GamesObjFromIds = {};
	mock_users[user][groupId].games.forEach( it => GamesObjFromIds[it] = mock_games[it]);

	return {
		name: mock_users[user][groupId].name,
		description: mock_users[user][groupId].description,
		games: GamesObjFromIds
	};
}


async function getDisplayableGroupsWithGameObjs(user){
	let obj = {}
	for(const key in mock_users[user]){
		
		obj[key] = await getDisplayableGroupWithGameObjs(user,key) 
	
	}
	return obj
}



async function addGameToGroup(user,groupId,game){
	const gameId = game.id;
	mock_games[gameId] = game;
	
	mock_users[user][groupId].games.push(gameId);

	return await getDisplayableGroupWithGameObjs(user,groupId);
}

async function removeGameFromGroup(user,groupId,gameId){
	mock_users[user][groupId].games = mock_users[user][groupId].games.filter(it => it !== gameId);

	return await getDisplayableGroupWithGameObjs(user,groupId);
}

async function createUser(Username){ //adds user
	const id = crypto.randomUUID()
	mock_tokens[id] = Username
	mock_users[Username] = []
	return {
		AuthToken: id,
		UserName: Username
	};
}

module.exports = {
	hasUser,
	hasGame,
	hasGroup,
	createUser,
	tokenToUsername,
	createGroup,
	editGroup,
	listGroups,
	deleteGroup,
	getDisplayableGroupWithGameObjs,
	addGameToGroup,
	removeGameFromGroup,
    mock_users,
    mock_games,
    mock_tokens,
}