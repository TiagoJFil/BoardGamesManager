'use strict';

const test_data_int = require('../borga-data-mem.js');

describe('CreateGroup function tests',() => {
    test('create group with existing user creates group', async () => {
        await test_data_int.createGroup('manel','xpto','xptos');
        const cond = await test_data_int.hasGroup('manel','xpto');
        expect(cond).toEqual(true);
    });

    test('create multiple groups with different names', async () => {
        await test_data_int.createGroup('manel','xpto','xptos'); 
        await test_data_int.createGroup('manel','jogos','para jogar');
        await test_data_int.createGroup('manel','lendas','sim');

        const cond = await test_data_int.hasGroup('manel','jogos') &&
                        await test_data_int.hasGroup('manel', 'lendas') &&
                            await test_data_int.hasGroup('manel', 'xpto');
        
        expect(cond).toEqual(true);
    })
});

describe('editGroup function tests', () => {
    test('editing a user group works', async () =>{

        const oldGroupDesc = test_data_int.users['manel']['nome'];

        const oldName = oldGroupDesc.Name;

        const oldDesc = oldGroupDesc.Description;

        await test_data_int.editGroup('manel','nome','jogatana','descrição banal');

        expect(oldName).toBe(test_data_int.users['manel']['jogatana'].Description);
    })
})

describe('RemoveGameFromGroup function tests', () => {
    test('remove game from user', async () => {
        const a = await test_data_int.removeGameFromGroup('tiago', 'test', 'cyscZjjlse');
        expect(a.games).toStrictEqual({});
    })
})
