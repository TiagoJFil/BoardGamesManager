'use strict';

const test_data_int = require('../borga-data-mem.js');

describe('CreateGroup function tests',() => {
    test('create group with existing user creates group', async () => {
        await test_data_int.createGroup('manel','xpto','xptos');
        const a = await test_data_int.hasGroup('manel','xpto');
        expect(a).toEqual(true);
    });
});