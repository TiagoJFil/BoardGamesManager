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
			.expect(200); // or see below
		
		expect(response.status).toBe(200); // or see above
		expect(response.body).toBeTruthy();
		expect(response.body.UserName).toEqual("miguel");
	});

	test('trying to create a user with the same name throws an error', async () => {
		const response = await request(app)
			.post('/api/users/miguel')
			.expect(500); // or see below
		
		expect(response.status).toBe(500); // or see above
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
			.expect(200); // or see below
		
		expect(response.status).toBe(200); // or see above
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
			.expect(200); // or see below

		expect(response.status).toBe(200); // or see above
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
			.expect(401); // or see below

		expect(response.status).toBe(401); // or see above
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
			.expect(400); // or see below


		expect(response.status).toBe(400); // or see above
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
			.expect(200); // or see below

		expect(response.status).toBe(200); // or see above
		expect(response.body).toBeTruthy();
		console.log(response.body);
		expect(Object.keys(response.body).length).toEqual(2);
		console.log(response.body);
		expect(response.body[0].name).toEqual("test");
		expect(response.body[1].name).toEqual("test");
		expect(response.body[0].description).toEqual("este é um grupo de teste");
		expect(response.body[1].description).toEqual("este é outro grupo de teste diferente");
	});


	
	/*
	test('Get empty bookshelf', async () => {
		const response = await request(app)
			.get('/api/my/books')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200); // or see below
		
		expect(response.status).toBe(200); // or see above
		expect(response.body).toBeTruthy();
		expect(response.body.books).toEqual([]);
	});
		
	test('Add book', async () => {
		const bookId = 'viRtzgEACAAJ';

		const addResponse = await request(app)
			.post('/api/my/books')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.send({ bookId })
			.expect('Content-Type', /json/)
			.expect(200);
		
		expect(addResponse.body).toBeTruthy();
		expect(addResponse.body.bookId).toEqual(bookId);

		const listResponse = await request(app)
			.get('/api/my/books')
			.set('Authorization', `Bearer ${config.guest.token}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		expect(listResponse.body).toBeTruthy();
		expect(listResponse.body.books).toHaveLength(1);
		expect(listResponse.body.books[0].id).toEqual(bookId);
	});

	*/
});