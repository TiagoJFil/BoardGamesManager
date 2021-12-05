'use strict';

/**
 * All data-mem tests require a mock of data-mem located on mock folder
 */

const mock_data_int = require('../mock/mock_data_mem');

describe('CreateGroup function tests',() => {

    test('create group with existing user creates group', async () => {

        await mock_data_int.createGroup('tiago','xpto','xptos');
        const cond = await mock_data_int.hasGroup('tiago','xpto');

        expect(cond).toEqual(true);

        expect(mock_data_int.mock_users['tiago']['xpto']).toStrictEqual( {
			Name : 'xpto',
			Description:'xptos',
			games:[]
	    });

    });

    test('create multiple groups with different names', async () => {

        await mock_data_int.createGroup('manel','xpto','xptos'); 
        await mock_data_int.createGroup('manel','jogos','para jogar');
        await mock_data_int.createGroup('manel','lendas','sim');

        const cond = await mock_data_int.hasGroup('manel','jogos') &&
                        await mock_data_int.hasGroup('manel', 'lendas') &&
                            await mock_data_int.hasGroup('manel', 'xpto');
        
        expect(cond).toEqual(true);

        expect(mock_data_int.mock_users['manel']['xpto']).toStrictEqual( {
			Name : 'xpto',
			Description:'xptos',
			games:[]
	    });

        expect(mock_data_int.mock_users['manel']['jogos']).toStrictEqual( {
			Name : 'jogos',
			Description:'para jogar',
			games:[]
	    });

        expect(mock_data_int.mock_users['manel']['lendas']).toStrictEqual( {
			Name : 'lendas',
			Description:'sim',
			games:[]
	    });

    });

    test('create multiple groups for different users', async () => {
        await mock_data_int.createGroup('tiago','xpto','xptos'); 
        await mock_data_int.createGroup('manel','jogos','para jogar');
        await mock_data_int.createGroup('toni','lendas','sim');

        const cond = await mock_data_int.hasGroup('manel','jogos') &&
                        await mock_data_int.hasGroup('toni', 'lendas') &&
                            await mock_data_int.hasGroup('tiago', 'xpto');
        
        expect(cond).toEqual(true);

        expect(mock_data_int.mock_users['tiago']['xpto']).toStrictEqual( {
			Name : 'xpto',
			Description:'xptos',
			games:[]
	    });
        
        expect(mock_data_int.mock_users['manel']['jogos']).toStrictEqual( {
			Name : 'jogos',
			Description:'para jogar',
			games:[]
	    });
        expect(mock_data_int.mock_users['toni']['lendas']).toStrictEqual( {
			Name : 'lendas',
			Description:'sim',
			games:[]
	    });

    });

});

describe('editGroup function tests', () => {

    test('editing a user group works', async () =>{

        const newDesc = await mock_data_int.editGroup('manel','test','jogatana','descrição banal');

        expect(mock_data_int.mock_users['manel'].test).toBe(undefined);

        expect(mock_data_int.mock_users['manel']['jogatana']).toBe(newDesc);
    });

    test('editing multiple groups of an user works', async () => {
        await mock_data_int.createGroup('manel','testenome','teste');

        const desc1 = await mock_data_int.editGroup('manel','testenome','nometeste','nova descrição');
        const desc2 = await mock_data_int.editGroup('manel','jogatana','novo','nova desc');

        expect(mock_data_int.mock_users['manel']['testenome']).toBe(undefined);
        expect(mock_data_int.mock_users['manel']['nometeste']).toBe(desc1);

        expect(mock_data_int.mock_users['manel']['jogatana']).toBe(undefined);
        expect(mock_data_int.mock_users['manel']['novo']).toBe(desc2);
    });
});

/**
 * All groups used here were previously created in tests above
 */
describe('deleteGroup function tests', () => {

    test('deleting user group', async () => {
        expect(mock_data_int.mock_users['manel']['nometeste']).toStrictEqual({Name : 'nometeste', Description : 'nova descrição', games: []});
        await mock_data_int.deleteGroup('manel','nometeste');
        expect(mock_data_int.mock_users['manel']['nometeste']).toBe(undefined)
    });

    test('deleting all user groups', async () => {
        await mock_data_int.deleteGroup('manel','nometeste');
        await mock_data_int.deleteGroup('manel','novo');
        await mock_data_int.deleteGroup('manel','xpto');
        await mock_data_int.deleteGroup('manel','jogos');
        await mock_data_int.deleteGroup('manel','lendas');
        expect(mock_data_int.mock_users['manel']).toStrictEqual({});
    });

});

describe('listGroups function tests', () => {

    test('listing all user groups', async () => {

        expect(await mock_data_int.listGroups('toni')).toStrictEqual([
            {
			    Name : 'test',
			    Description:'Grupo de Teste',
	        },
            {
                Name : 'lendas',
                Description : 'sim'
            }
        ]);

    });

})

describe('addGameToGroup function tests', () => {

    test('add games to user games list', async () => {
        
        expect(mock_data_int.mock_users['tiago']['test'].games).toStrictEqual(['cyscZjjlse']);

        await mock_data_int.addGameToGroup('tiago','test',	
            {
                id: 'TAAifFP590',
                name: 'Root',
                url: 'https://www.boardgameatlas.com/game/TAAifFP590/root',
                price: '59.99',
                publisher: 'USAopoly',
                min_age: 12,
                min_players: 4,
                max_players: 8,
                rank: 252
            }
        );

        await mock_data_int.addGameToGroup('tiago','test',
            {
                id: 'yqR4PtpO8X',
                name: 'Scythe',
                url: 'https://www.boardgameatlas.com/game/yqR4PtpO8X/scythe',
                price: '59.99',
                publisher: 'USAopoly',
                min_age: 12,
                min_players: 4,
                max_players: 8,
                rank: 252
            }
        );

        expect(mock_data_int.mock_users['tiago']['test'].games).toStrictEqual(['cyscZjjlse','TAAifFP590','yqR4PtpO8X']);

    });

});

describe('RemoveGameFromGroup function tests', () => {

    test('remove game from user', async () => {

        await mock_data_int.removeGameFromGroup('toni', 'test', 'cyscZjjlse');
        expect(mock_data_int.mock_users['toni']['test'].games).toStrictEqual([]);

    });
    
});
