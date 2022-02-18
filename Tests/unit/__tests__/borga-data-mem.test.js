'use strict';

/**
 * All data-mem tests require a mock of data-mem located on mock folder
 */


//TO BE UPDATED, FUNCTIONS LIKE HASGROUP AND EDITGROUP ARE DIFERENT

const mock_data_int = require('../__mock__/mock_data_mem');

describe('CreateGroup function tests',() => {

    test('create group with existing user creates group', async () => {

        const group = await mock_data_int.createGroup('tiago','xpto','xptos');
        const cond = await mock_data_int.hasGroup('tiago',group);

        expect(cond).toEqual(true);

        expect(mock_data_int.mock_users['tiago'][group]).toStrictEqual( {
			name : 'xpto',
			description:'xptos',
			games:[]
	    });

    });
    
    test('create multiple groups with different names', async () => {

        const manelGroupId1 = await mock_data_int.createGroup('manel','xpto','xptos'); 
        const manelGroupId2 = await mock_data_int.createGroup('manel','jogos','para jogar');
        const manelGroupId3 = await mock_data_int.createGroup('manel','lendas','sim');


        const cond = await mock_data_int.hasGroup('manel',manelGroupId1) &&
                        await mock_data_int.hasGroup('manel', manelGroupId2) &&
                            await mock_data_int.hasGroup('manel', manelGroupId3);
        
        expect(cond).toEqual(true);

        expect(mock_data_int.mock_users['manel'][manelGroupId1]).toStrictEqual( {
			name : 'xpto',
			description:'xptos',
			games:[]
	    });

        expect(mock_data_int.mock_users['manel'][manelGroupId2]).toStrictEqual( {
			name : 'jogos',
			description:'para jogar',
			games:[]
	    });

        expect(mock_data_int.mock_users['manel'][manelGroupId3]).toStrictEqual( {
			name : 'lendas',
			description:'sim',
			games:[]
	    });

    });

    test('create multiple groups for different users', async () => {
        const tiagoId = await mock_data_int.createGroup('tiago','xpto','xptos'); 
        const manelId = await mock_data_int.createGroup('manel','jogos','para jogar');
        const toniId  = await mock_data_int.createGroup('toni','lendas','sim');

        const cond = await mock_data_int.hasGroup('manel',manelId) &&
                        await mock_data_int.hasGroup('toni', toniId) &&
                            await mock_data_int.hasGroup('tiago', tiagoId);
        
        expect(cond).toEqual(true);

        expect(mock_data_int.mock_users['tiago'][tiagoId]).toStrictEqual( {
			name : 'xpto',
			description:'xptos',
			games:[]
	    });
        
        expect(mock_data_int.mock_users['manel'][manelId]).toStrictEqual( {
			name : 'jogos',
			description:'para jogar',
			games:[]
	    });
        expect(mock_data_int.mock_users['toni'][toniId]).toStrictEqual( {
			name : 'lendas',
			description:'sim',
			games:[]
	    });

    });

});

describe('editGroup function tests', () => {

    test('editing a user group works', async () =>{

        const newDesc = await mock_data_int.editGroup('manel','39ff3d00f5fa4a1fb8389a41157ce094','jogatana','descrição banal');

        expect(mock_data_int.mock_users['manel'].test).toBe(undefined);

        expect(mock_data_int.mock_users['manel']['39ff3d00f5fa4a1fb8389a41157ce094'].description).toBe("descrição banal");
        expect(mock_data_int.mock_users['manel']['39ff3d00f5fa4a1fb8389a41157ce094'].name).toBe("jogatana");
    });

    test('editing multiple groups of an user works', async () => {
        const manelId = await mock_data_int.createGroup('manel','testenome','teste');

        const desc1 = await mock_data_int.editGroup('manel',manelId,'nometeste','nova descrição');
        const desc2 = await mock_data_int.editGroup('manel','39ff3d00f5fa4a1fb8389a41157ce094','novo','nova desc');

        expect(mock_data_int.mock_users['manel']['testenome']).toBe(undefined);
        expect(mock_data_int.mock_users['manel'][manelId].description).toBe("nova descrição");

        expect(mock_data_int.mock_users['manel']['jogatana']).toBe(undefined);
        expect(mock_data_int.mock_users['manel']['39ff3d00f5fa4a1fb8389a41157ce094'].description).toBe("nova desc");

    });
});

/**
 * All groups used here were previously created in tests above
 */
describe('deleteGroup function tests', () => {

    test('deleting user group', async () => {
        expect(mock_data_int.mock_users['toni']['21dc3686c2244e919e9951dcc9c0691f']).toStrictEqual({name : 'test', description : 'Grupo de Teste', games: ['cyscZjjlse']});
        await mock_data_int.deleteGroup('toni','21dc3686c2244e919e9951dcc9c0691f');
        expect(mock_data_int.mock_users['toni']['21dc3686c2244e919e9951dcc9c0691f']).toBe(undefined)
    });

});

describe('listGroups function tests', () => {

    test('listing all user groups', async () => {

        expect(await mock_data_int.listGroups('zezocas')).toStrictEqual( 
            {
                "bffe984340b943f29eb384c2a1b95ac5": {
                "name": "test", 
                "description": "Grupo de Teste",
                "games": {"cyscZjjlse": {"id": "cyscZjjlse", "max_players": 8, "min_age": 12, "min_players": 4, "name": "Telestrations", "price": "22.99", "publisher": "USAopoly", "rank": 252, "url": "https://www.boardgameatlas.com/game/cyscZjjlse/telestrations"}},
                }
            }
        
        );

    });

})

describe('addGameToGroup function tests', () => {

    test('add games to user games list', async () => {
        
        expect(mock_data_int.mock_users['tiago']['55bb5b48125d4e79893197dd45dbdce1'].games).toStrictEqual(['cyscZjjlse']);

        await mock_data_int.addGameToGroup('tiago','55bb5b48125d4e79893197dd45dbdce1',	
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

        await mock_data_int.addGameToGroup('tiago','55bb5b48125d4e79893197dd45dbdce1',
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

        expect(mock_data_int.mock_users['tiago']['55bb5b48125d4e79893197dd45dbdce1'].games).toStrictEqual(['cyscZjjlse','TAAifFP590','yqR4PtpO8X']);

    });

});



describe('RemoveGameFromGroup function tests', () => {

    test('remove game from user', async () => {

        await mock_data_int.removeGameFromGroup('zezocas', 'bffe984340b943f29eb384c2a1b95ac5', 'cyscZjjlse');
        expect(mock_data_int.mock_users['zezocas']['bffe984340b943f29eb384c2a1b95ac5'].games).toStrictEqual([]);

    });

    test('remove game from user that has no games', async () => {
        
        await mock_data_int.removeGameFromGroup('zezocas', 'bffe984340b943f29eb384c2a1b95ac5', 'cyscZjjlse');
        await mock_data_int.removeGameFromGroup('zezocas', 'bffe984340b943f29eb384c2a1b95ac5', 'cyscZjjlse');
        expect(mock_data_int.mock_users['zezocas']['bffe984340b943f29eb384c2a1b95ac5'].games).toStrictEqual([]);

    });

    
    
});

