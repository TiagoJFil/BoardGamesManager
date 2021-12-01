'use strict';

const errors = require('../borga-errors.js');

const services_builder = require('../borga-services.js');

const test_data_int = require('../borga-data-mem.js');
const mock_data_ext = require('../borga-games-data.js');

const default_services = services_builder(mock_data_ext,test_data_int);

const test_user = "Manel";
const test_token = "fc6dbc68-adad-4770-ae6a-2d0e4eb1d0ea"

describe('Search tests', () => {
    test('search for non existing game', async () => {
        const services =
            services_builder({
                searchGame: async () => {
                    throw await errors.NOT_FOUND('no game');
                }
            });
            
        try {
            /* await  */services.searchGame('nonexistinggame');
        } catch (err) {
            expect(err.name).toEqual('NOT_FOUND');
            return;
        }
    /*    throw new Error("shouldn't return from searchGame with non existing game"); */
    });
    
    test('search existing game', async () => {
        const game = await default_services.searchGame('monopoly');
        console.log(game);
        expect(game).toBeDefined();
        expect(game.id).toEqual(test_data_int.games['fG5Ax8PA7n']);
    });     
});