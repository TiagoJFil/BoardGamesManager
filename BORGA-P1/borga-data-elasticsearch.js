'use strict';

const crypto = require('crypto');

const errors = require('./app-errors');

const fetch = require('node-fetch');

module.exports = function(es_host, es_port,idx_prefix,guest_user, guest_token){

    const baseUrl = `http://${es_host}:${es_port}`;

	const userGamesUrl = username =>
		`${baseUrl}/${idx_prefix}_${username}_books`;

    /**
     * object with user token as key and its name as value
     */
    const tokens = {
        '8b85d489-bcd3-477b-9563-5155af9f08ca': 'tiago',
        'fc6dbc68-adad-4770-ae6a-2d0e4eb1d0ea': 'joao'
    };

    /**
     * object with all game's id's as keys and the repective information as values
     */
    const games = {
        cyscZjjlse: {
            id: 'cyscZjjlse',
            name: 'Telestrations',
            url: 'https://www.boardgameatlas.com/game/cyscZjjlse/telestrations',
            price: '22.99',
            publisher: 'USAopoly',
            min_age: 12,
            min_players: 4,
            max_players: 8,
            rank: 252
        }  
    }

    /**
     * object with all users with their respective information such as its groups
     */
    const users = new Set(['tiago']);

    /**
     * checks if the user already has a group with that name 
     * @param {String} user 
     * @param {String} groupName 
     * @returns {Boolean} true if the user has certain group
     */
/*     async function hasGroup(user,groupName){

		}
    } */
    /**
     * checks if a certain user's group has a the same gameId
     * @param {String} user 
     * @param {String} groupName 
     * @param {String} gameId 
     * @returns {Boolean} true if certain group of a user has the same game identified by the gameId
     */
/*    async function hasGame(user,groupName,gameId){

    }  */

    /**
     * checks if username is already in use
     * @param {String}} Username 
     * @returns {Boolean} true if users object has certain user
     */
    function hasUser(username){	
        if (!users.has(username)) {
            throw errors.UNAUTHENTICATED(username);
        }
    }
    /**
     * gets username from unique token
     * @param {String} token 
     * @returns {Object} the name of user identified by the token
     */
    async function tokenToUsername(token) {
        return tokens[token];
    }

    /**
     * Creates a new user group with the provided name and description
     * @param {String} user 
     * @param {String} name 
     * @param {String} description 
     * @returns {Object} a new group object with the information provided
     */
    async function createGroup(user,name,description){
        var newGroup =  {
            Name : name,
            Description : description,
            games : []	
        };

        users[user][name] = newGroup;

        const displayableGroup =  {
            Name : name,
            Description : description,
            games : {}	
        };

        return displayableGroup;
    }

    /**
     * edits a user's group name and description
     * @param {String} user 
     * @param {String} oldName group's old name
     * @param {String} newName griups's new name
     * @param {String} description 
     * @returns {Object} the new edited group
     */
    async function editGroup(user,oldName,newName,description){
        const oldGamesList = users[user][oldName].games;
        const updatedGroup =  {
            Name : newName,
            Description : description,
            games : oldGamesList	
        };
        delete users[user][oldName];
        users[user][newName] = updatedGroup;
        
        return getDisplayableGroupWithGameObjs(user,newName);
    }

    /**
     * Lists all groups of a certain user 
     * @param {String} user 
     * @returns {Object} containing all groups
     */
    async function listGroups(user){
        const userGroups = Object.values(users[user]);

        let displayableObject = {}
        for (let i = 0; i < userGroups.length; i++){
            
            userGroups[i] = {
                Name : userGroups[i].Name,
                Description : userGroups[i].Description
            }
            
            displayableObject[userGroups[i].Name] = userGroups[i]
        }
        
        return displayableObject;
    }

    /**
     * Deletes a group from a user
     * @param {String} user 
     * @param {String} groupName 
     * @returns {Object} user's groups updated
     */
    async function deleteGroup(user, groupName){

        delete users[user][groupName];
        return listGroups(user);

    }

    /**
     * Displays a group with all the games as an object
     * @param {String} user 
     * @param {String} groupName 
     * @returns {Object} the same group but with all the information of its games
     */
    async function getDisplayableGroupWithGameObjs(user,groupName){
        let GamesObjFromIds = new Object();
        users[user][groupName].games.forEach( it => GamesObjFromIds[it] = games[it]);
        
        const groupToDisplayWithGameObjs = {
            Name : users[user][groupName].Name,
            Description : users[user][groupName].Description,
            games : GamesObjFromIds
        };

        return groupToDisplayWithGameObjs;
    }

    /**
     * Adds a game to a user's group 
     * @param {String} user 
     * @param {String} groupName 
     * @param {Object} game 
     * @returns {Object} group with games updated
     */
    async function addGameToGroup(user,groupName,game){
        const gameId = game.id;
        games[gameId] = game;
        
        users[user][groupName].games.push(gameId);

        return await getDisplayableGroupWithGameObjs(user,groupName);
    }

    /**
     * Removes a game from a user's group 
     * @param {String} user 
     * @param {String} groupName 
     * @param {String} gameId 
     * @returns {Object} group with games updated
     */
    async function removeGameFromGroup(user,groupName,gameId){
        users[user][groupName].games = users[user][groupName].games.filter(it => it != gameId);

        return await getDisplayableGroupWithGameObjs(user,groupName);
    }

    /**
     * Creates a new user 
     * @param {String} Username user's name   
     * @returns {Object} an object with the id of the user and its name
     */
    async function createUser(Username){
        const id = crypto.randomUUID()
        tokens[id] = Username
        users[Username] = new Array()
        return {
            AuthToken: id,
            UserName: Username
        };
    }
}