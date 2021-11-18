'use strict'

const fun = require('../borga-data-ext.js')

test('getBookByName works', () => {
	const name = "monopoly"
	const expectedRes = {
  id: 'fG5Ax8PA7n',
  name: 'Monopoly',
  url: 'https://www.boardgameatlas.com/game/fG5Ax8PA7n/monopoly',
  price: '17.96',
  publisher: 'Hasbro Games',
  min_age: 8,
  min_players: 2,
  rank: 528
};
	const obj = fun.getGameByName(name)
.then(it =>
  expect(it).toEqual(expectedRes)
)
	
	
});

test('getListPopularGames test', () => {
    const lenght =  10 
    const obj = fun.getListPopularGames()
  .then(it => 
    expect(it.length.toEqual(lenght)))

})





