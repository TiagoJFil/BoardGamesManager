'use strict';

const fetch   = require('node-fetch');
const request = require('supertest');

const config = require('../../../borga-config');
const server = require('../../../borga-server');

/**
 * Use a different prefix for the test DB.
 */
const es_spec = {
	url: config.devl_es_url,
	prefix: 'test'
};

test('Confirm database is running', async () => {
	const response = await fetch(`${es_spec.url}_cat/health`);
	expect(response.status).toBe(200);
});
const userToBeAddedGroups = "joao"

describe('Integration tests', () => {

	const app = server(es_spec, config.guest);
	
	beforeAll(async () => {
		const StoreTokens = await fetch(
			`${es_spec.url}data_${es_spec.prefix}_tokens/_doc/${config.guest.token}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						"user": "tiago"
					})
				}
		);

		const StoreUser = await fetch(
			`${es_spec.url}data_${es_spec.prefix}_users/_doc/${config.guest.user}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						AuthToken: config.guest.token
					})
				}
		);
	});
	
	afterAll(async () => {
		await fetch(
			`${es_spec.url}${es_spec.prefix}_${config.guest.user}_groups`,
			{ method: 'DELETE' }
		);
		await fetch(
			`${es_spec.url}${es_spec.prefix}_${userToBeAddedGroups}_groups`,
			{ method: 'DELETE' }
		);
		await fetch(
			`${es_spec.url}data_${es_spec.prefix}_games`,
			{ method: 'DELETE' }
		);
		await fetch(
			`${es_spec.url}data_${es_spec.prefix}_users`,
			{ method: 'DELETE' }
		);
		await fetch(
			`${es_spec.url}data_${es_spec.prefix}_tokens`,
			{ method: 'DELETE' }
		);
	});
	

	test('find a game by name',async() => {
	
		const response = await request(app)
			.get('/api/all/games')
			.query({ name: 'Root' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			"id": "TAAifFP590",
			"name": "Root",
			"url": "https://www.boardgameatlas.com/game/TAAifFP590/root",
			"price": "48.00",
			"publisher": "Leder Games",
			"min_age": 10,
			"min_players": 2,
			"max_players": 4,
			"rank": 1
			});
	});

	test('find game details by id',async() => {
		
		const response = await request(app)
			.get('/api/all/games/TAAifFP590')
		
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual(
			{
				"id": "TAAifFP590",
				"name": "Root",
				"description": "<p>Find adventure in this marvelous asymmetric game. Root provides limitless replay value as you and your friends explore the unique factions all wanting to rule a fantastic forest kingdom. Play as the Marquise de Cat and dominate the woods, extracting its riches and policing its inhabitants, as the Woodland Alliance, gathering supporters and coordinate revolts against the ruling regime, the Eyrie Dynasties, regaining control of the woods while keeping your squabbling court at bay, or as the Vagabond, seeking fame and fortune as you forge alliances and rivalries with the other players. Each faction has its own play style and paths to victory, providing an immersive game experience you will want to play again and again.</p>",
				"url": "https://www.boardgameatlas.com/game/TAAifFP590/root",
				"image_url": "https://s3-us-west-1.amazonaws.com/5cc.images/games/uploaded/1629324760985.jpg",
				"mechanics": {
					"PGjmKGi26h": {
						"name": "Action / Movement Programming",
						"url": "https://www.boardgameatlas.com/mechanic/PGjmKGi26h/action--movement-programming"
					},
					"ckCp1oTVMy": {
						"name": "Action Queue",
						"url": "https://www.boardgameatlas.com/mechanic/ckCp1oTVMy/action-queue"
					},
					"05zCZoLvQJ": {
						"name": "Area Control",
						"url": "https://www.boardgameatlas.com/mechanic/05zCZoLvQJ/area-control"
					},
					"R0bGq4cAl4": {
						"name": "Dice Rolling",
						"url": "https://www.boardgameatlas.com/mechanic/R0bGq4cAl4/dice-rolling"
					},
					"yu3eas6v7A": {
						"name": "Engine Building",
						"url": "https://www.boardgameatlas.com/mechanic/yu3eas6v7A/engine-building"
					},
					"WPytek5P8l": {
						"name": "Hand Management",
						"url": "https://www.boardgameatlas.com/mechanic/WPytek5P8l/hand-management"
					},
					"MEAoOygZsA": {
						"name": "Point to Point Movement",
						"url": "https://www.boardgameatlas.com/mechanic/MEAoOygZsA/point-to-point-movement"
					},
					"qZx4PEzKKz": {
						"name": "Race",
						"url": "https://www.boardgameatlas.com/mechanic/qZx4PEzKKz/race"
					},
					"XM2FYZmBHH": {
						"name": "Variable Player Powers",
						"url": "https://www.boardgameatlas.com/mechanic/XM2FYZmBHH/variable-player-powers"
					}
				},
				"categories": {
					"KUBCKBkGxV": {
						"name": "Adventure",
						"url": "https://www.boardgameatlas.com/category/KUBCKBkGxV/adventure"
					},
					"MWoxgHrOJD": {
						"name": "Animals",
						"url": "https://www.boardgameatlas.com/category/MWoxgHrOJD/animals"
					},
					"Bq6M0TJyg7": {
						"name": "Asymmetric",
						"url": "https://www.boardgameatlas.com/category/Bq6M0TJyg7/asymmetric"
					}
				}
			
			});
	});

	test('find top 10 ranked games', async () => {
		
		const response = await request(app)
			.get('/api/all/games/rank')

		expect(response.statusCode).toBe(200);
		expect(response.body).toBeTruthy();
		//did not test for the actual data because it maybe be changed and we cant control it
	});

	test('Create a new User', async () => {
		const response = await request(app)
			.post('/api/users/miguel')
			.expect(200);
		

		expect(response.body).toBeTruthy();
		expect(response.body.UserName).toEqual("miguel");
	});

	test('trying to create a user with the same name throws an error', async () => {
		const response = await request(app)
			.post('/api/users/miguel')
			.expect(500); 
		

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			"cause": {
				"code": 1004,
				"name": "USER_ALREADY_EXISTS",
				"message": "The user you wanted to add already exists",
				"info": "miguel"
			}
		});
	});

	test('list groups without any group returns {}', async () => {

		const response = await request(app)
			.get('/api/my/group')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200); 

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({});
	});

	test('Create a new Group', async () => {
		const response = await request(app)
			.post('/api/my/group')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.send({
				"name": "test",
				"desc": "este é um grupo de teste"
			  })
			.expect(200); 
		

		expect(response.body).toBeTruthy();
		expect(response.body.name).toEqual('test');
	    expect(response.body.description).toEqual('este é um grupo de teste');
	});

	test('Create a new Group with the same name', async () => {
		const response = await request(app)
			.post('/api/my/group')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({
				"name": "test",
				"desc": "este é outro grupo de teste diferente"
			  })
			.expect('Content-Type', /json/)
			.expect(200);


		expect(response.body).toBeTruthy();
		
		expect(response.body.name).toEqual('test');
	    expect(response.body.description).toEqual('este é outro grupo de teste diferente');
	});

	test('try to create a group without the bearer token', async () => {
		const response = await request(app)
			.post('/api/my/group')
			.set('Accept', 'application/json')
			.send({
				"name": "test",
				"desc": "este é outro grupo de teste diferente"
			  })
			.expect('Content-Type', /json/)
			.expect(401); 


		expect(response.body).toEqual(
			{
				"cause": {
					code: 1006,
					name: 'UNAUTHENTICATED',
					message: 'Invalid or missing token',
					info: 'no token'
			  	}
			}
		);
	});

	test('trying to create a group without the body returns an error', async () => {
		const response = await request(app)
			.post('/api/my/group')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(400); 

		expect(response.body).toBeTruthy();
		expect(response.body).toEqual(
			{
				"cause": {
					"code": 1003,
					"name": "MISSING_PARAMETER",
					"message": "A required parameter is missing",
					"info": "Group name missing"
				}
			}
		);
	});

	test('list groups returns the groups created', async () => {

		const response = await request(app)
			.get('/api/my/group')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);


		expect(response.body).toBeTruthy();
		
		expect(Object.keys(response.body).length).toEqual(2);
		const groups = Object.keys(response.body);


		expect(response.body[groups[0]].name).toEqual("test");
		expect(response.body[groups[1]].name).toEqual("test");
		expect(response.body[groups[0]].description).toEqual("este é um grupo de teste");
		expect(response.body[groups[1]].description).toEqual("este é outro grupo de teste diferente");
	});

	test('gets a details from the first group created', async () => {
		
		const groupList = await request(app)
			.get('/api/my/group')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		const groupId = Object.keys(groupList.body)[0];

		const response = await request(app)
			.get(`/api/my/group/${groupId}`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200); 
	

		expect(response.body).toBeTruthy();
		expect(response.body.name).toEqual("test");
		expect(response.body.description).toEqual("este é um grupo de teste");
	});

	test('try to get details from a group that doesnt exists', async () => {
		
		const response = await request(app)
			.get('/api/my/group/60')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(404); 
		

		expect(response.body).toEqual(
			{
				"cause": {
					"code": 1001,
					"name": 'NOT_FOUND',
					"message": 'The item does not exist',
					"info": 'The group you were trying to get the info does not exist'
			  }
			});
	});

	test('delete second group created  works',async () => {
		
		const groupList = await request(app)
			.get('/api/my/group')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		const groupId = Object.keys(groupList.body)[1];
		const groupIdThatStays = Object.keys(groupList.body)[0];


		const response = await request(app)
			.delete(`/api/my/group/${groupId}`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200); 


		expect(response.body).toBeTruthy();
		expect(response.body).toEqual({
			[groupIdThatStays]: {
				"id": groupIdThatStays,
				"name": "test",
				"description": "este é um grupo de teste",
				"games": {}
			}
		})	
	});

	test('delete second group doesnt work because it doesnt exist',async () => {
		
		const groupList = await request(app)
			.get('/api/my/group')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		const groupId = Object.keys(groupList.body)[1];


		const response = await request(app)
			.delete(`/api/my/group/${groupId}`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(404); 

			
		expect(response.body).toBeTruthy();
		expect(response.body).toEqual(
			{
				"cause": {
					"code": 1001,
					"name": 'NOT_FOUND',
					"message": 'The item does not exist',
					"info": 'The group you were trying to delete does not exist'
			  }
			});
	});

	test('edit first group works', async () => {
		
		const groupList = await request(app)
			.get('/api/my/group')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		const groupId = Object.keys(groupList.body)[0];

		const response = await request(app)
			.put('/api/my/group/')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({
				"groupId": `${groupId}`,
				"name": "changedName",
				"desc": "changedDescription"
			})
			.expect('Content-Type', /json/)
			.expect(200);

			expect(response.body).toBeTruthy();
			expect(response.body).toEqual(
				{
					"name": "changedName",
					"description": "changedDescription",
					"games": {}
				
				});
	
	});

	test('edit second group doesnt work because it doesnt exists', async () => {
		
		const groupList = await request(app)
		.get('/api/my/group')
		.set('Authorization', `Bearer ${config.guest.token}`)
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200);

		const groupId = Object.keys(groupList.body)[1];

		const response = await request(app)
			.put('/api/my/group/')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({
				"groupId": `${groupId}`,
				"name": "changedName",
				"desc": "changedDescription"
			})
			.expect('Content-Type', /json/)
			.expect(404);

			expect(response.body).toBeTruthy();
			expect(response.body).toEqual(
				{
					"cause": {
						"code": 1001,
						"name": 'NOT_FOUND',
						"message": 'The item does not exist',
						"info": 'The group you were trying to edit does not exist'
				  }
				});
	});

	test('successfully add a game to group 0', async () => {
	
		const groupList = await request(app)
		.get('/api/my/group')
		.set('Authorization', `Bearer ${config.guest.token}`)
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200);

		const groupId = Object.keys(groupList.body)[0];

		const response = await request(app)
			.post('/api/my/group/games')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({
				"groupId": `${groupId}`,
				"gameId": "dFC1lnGINr"
			})
			.expect('Content-Type', /json/)
			.expect(200);
			
			expect(response.body).toBeTruthy();
			expect(response.body.games.dFC1lnGINr.name).toEqual('Cards Against Humanity');
	})

	test('Remove a game from a group that has the game', async () => {
	
		const groupList = await request(app)
		.get('/api/my/group')
		.set('Authorization', `Bearer ${config.guest.token}`)
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200);

		const groupId = Object.keys(groupList.body)[0];

		const response = await request(app)
			.delete(`/api/my/group/games/${groupId}/dFC1lnGINr`)
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

			expect(response.body).toBeTruthy();
			expect(response.body).toEqual(
				{
					name: 'changedName',
					description: 'changedDescription',
					games: {}
				});
	
	});

	test('Create a new user add a group and list of groups will be different from other user',async() =>{

		const user = await request(app)
			.post(`/api/users/${userToBeAddedGroups}`)
			.expect(200);
	

		const groupCreation = await request(app)
			.post('/api/my/group')
			.set('Authorization', `Bearer ${user.body.AuthToken}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.send({
				"name": "grupo A",
				"desc": `descriçao do grupo A do ${userToBeAddedGroups}`
			  })
			.expect(200); 

		const groupId = groupCreation.body.id;	

		const groupList = await request(app)
			.get('/api/my/group')
			.set('Authorization', `Bearer ${user.body.AuthToken}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		expect(groupList.body).toBeTruthy();
		expect(groupList.body).toEqual( {[groupId]:{
			"description": "descriçao do grupo A do joao",
		  	"games": {},
		   	"id": groupId,
		    "name": "grupo A"}
		});
	});


});