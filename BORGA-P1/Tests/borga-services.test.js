'use strict';

const errors = require('../borga-errors.js');

const services_builder = require('../borga-services.js');

const test_data_int = require('../borga-data-mem.js');
const mock_data_ext = require('../mock/mock_data_mem.js');

const default_services = services_builder(mock_data_ext,test_data_int);

const test_user = "tiago";
const test_token = '8b85d489-bcd3-477b-9563-5155af9f08ca';

describe('getUsername function tests', () => {
    test('no token provided throws ERROR', async () => {
        const services = services_builder();
        try{
            await services.getUsername(undefined);
        }catch(err) {
            expect(err.name).toEqual('UNAUTHENTICATED');
        }
    });

    test('provided token with no username returns ERROR', async () => {
        try{
            await default_services.getUsername('8b85d489-bcd3-477b-9563-5155af9f0c8a')
        } catch(err){
            expect(err.name).toEqual('UNAUTHENTICATED');
        }
    });
});

describe('Search tests', () => {

    test('searching a game without writting parameter throws ERROR', async () => {
        const services = services_builder();
        try {
            await services.searchGame(undefined);
        } catch (err) {
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

});

describe('addUser function tests', () => {

    test('adding user without input throws ERROR', async () => {
        const services = services_builder();
        try{
            await services.addUser(undefined);
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

    test('adding an user that already exists throws ERROR', async () => {
        try{
            await default_services.addUser('manel')
        } catch(err){
            expect(err.name).toEqual('USER_ALREADY_EXISTS');
        }
    })

});

describe('createGroup function tests', () => {
    test('creating group without giving parameter throws ERROR', async () => {
        try{
            await default_services.createGroup(test_token,undefined,'');
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });
    test('creating group without providing description throws ERROR', async () => {
        try{
            await default_services.createGroup(test_token,'teste2',undefined);
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });
    test('trying to create a group that already exists throws ERROR', async () => {
        try{
            await default_services.createGroup(test_token,'teste','pao');
        } catch(err){
            expect(err.name).toEqual('GROUP_ALREADY_EXISTS');
        }
    });
});

describe('editGroup function tests', () => {

});

describe('listGroup function tests', () => {

});

describe('getGroupInfo function tests', () => {

});

describe('addGameToGroup function tests', () => {

});

describe('deleteAGroup function tests', () => {

});

describe('removeGameFromGroup function tests', () => {

});



