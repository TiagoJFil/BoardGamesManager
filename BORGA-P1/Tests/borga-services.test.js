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
    test('creating group without giving a name throws ERROR', async () => {
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

    test('editing group without giving old name throws ERROR', async () => {
        try{
            await default_services.editGroup(test_token,undefined,'novo','desc');
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

    test('editing group without giving a new name throws ERROR', async () => {
        try{
            await default_services.editGroup(test_token,'test',undefined,'desc');
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

    test('editing group without giving a description throws ERROR', async () => {
        try{
            await default_services.editGroup(test_token,'test','novo',undefined);
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

    test('trying to edit group that doesnt exist throws ERROR', async () => {
        try{
            await default_services.editGroup(test_token,'undefined','novo','desc');
        } catch(err){
            expect(err.name).toEqual('NOT_FOUND');
        }
    });

});

/* describe('listGroup function tests', () => {

    test('trying to access groups of a non existing token throws ERROR', async () => {
        const services =
        services_builder();
        try{
            await services.listGroup(test_token);
        } catch(err){
            expect(err.name).toEqual('UNAUTHENTICATED');
        }
    });

}); */

describe('getGroupInfo function tests', () => {

    test('trying to access group info without giving a group name throws ERROR', async () => {
        try{
            await default_services.getGroupInfo(test_token,undefined);
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

    test('trying to access group info without by giving a group name that doesnt exist throws ERROR', async () => {
        try{
            await default_services.getGroupInfo(test_token,'undefined');
        } catch(err){
            expect(err.name).toEqual('NOT_FOUND');
        }
    });

});

describe('addGameToGroup function tests', () => {

    test('trying to add a game without providing a group name throws ERROR', async () => {
        try{
            await default_services.addGameToGroup(test_token,undefined,'axsc');
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

    test('trying to add a game without providing a game id throws ERROR', async () => {
        try{
            await default_services.addGameToGroup(test_token,'undefined',undefined);
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

    test('trying to add a game giving a non existing group throws ERROR', async () => {
        try{
            await default_services.addGameToGroup(test_token,'undefined','gameID');
        } catch(err){
            expect(err.name).toEqual('NOT_FOUND');
        }
    });

});

describe('deleteAGroup function tests', () => {

    test('trying to delete a group without providing its name throws ERROR', async () => {
        try{
            await default_services.deleteAGroup(test_token,undefined);
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

    test('trying to delete a group giving a group name that doesnt exist throws ERROR', async () => {
        try{
            await default_services.deleteAGroup(test_token,'undefined');
        } catch(err){
            expect(err.name).toEqual('NOT_FOUND');
        }
    });

});

describe('removeGameFromGroup function tests', () => {

    test('trying to remove a game from a group without providing groups name throws ERROR', async () => {
        try{
            await default_services.removeGameFromGroup(test_token,undefined,'gameId');
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

    test('trying to remove a game from a group without providing games name throws ERROR', async () => {
        try{
            await default_services.removeGameFromGroup(test_token,'undefined',undefined);
        } catch(err){
            expect(err.name).toEqual('MISSING_PARAMETER');
        }
    });

    test('trying to remove a game that doesnt exist in group throws ERROR', async () => {
        try{
            await default_services.removeGameFromGroup(test_token,'test','gameId');
        } catch(err){
            expect(err.name).toEqual('NOT_FOUND');
        }
    });

});



