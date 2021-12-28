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
			expect(response.body).toEqual(
				{
					name: 'changedName',
					description: 'changedDescription',
					games: {
					  dFC1lnGINr: {
						id: 'dFC1lnGINr',
						name: 'Cards Against Humanity',
						url: 'https://www.boardgameatlas.com/game/dFC1lnGINr/cards-against-humanity',
						price: '21.25',
						publisher: 'Cards Against Humanity LLC.',  
						min_age: 17,
						min_players: 4,
						max_players: 30,
						rank: 313
					  }
					}
				});
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



});