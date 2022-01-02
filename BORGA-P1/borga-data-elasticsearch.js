'use strict';

const crypto = require('crypto');

const errors = require('./borga-errors');

const fetch = require('node-fetch');


module.exports = function(es_spec){


    const baseUrl = es_spec.url;

	const userGroupsUrl = username =>
		`${baseUrl}${es_spec.prefix}_${username}_groups`;

    const allUsersUrl = `${baseUrl}data_${es_spec.prefix}_users`
        
    const allGamesUrl = `${baseUrl}data_${es_spec.prefix}_games`

    const allTokensUrl = `${baseUrl}data_${es_spec.prefix}_tokens`


    /**
     * checks if the user already has a group with that name 
     * @param {String} user 
     * @param {String} groupId 
     * @returns {Boolean} true if the user has certain group
     */
    async function hasGroup(user,groupId){
         try{
            const response = await fetch(
                `${userGroupsUrl(user)}/_doc/${groupId}`
            );
            return response.status === 200;

        }catch(err){
            throw errors.DATABASE_ERROR(err);
        }
    }; 

    /**
     * checks if a certain user's group has the same gameId
     * @param {String} user 
     * @param {String} groupId 
     * @param {String} gameId 
     * @returns {Boolean} true if certain group of a user has the same game identified by the gameId
     */
    async function hasGame(user,groupId,gameId){
        try {
            const response =await fetch(
                 `${userGroupsUrl(user)}/_doc/${groupId}`);
            const body = await response.json();

       return body._source.games.includes(gameId);
       }
       catch(err){
           throw errors.DATABASE_ERROR(err);
       }
    };

    /**
     * gets username from unique token
     * @param {String} token 
     * @returns {Object} the name of user identified by the token
     */
    async function tokenToUsername(token) {
        try {
            
			const response = await fetch(`${allTokensUrl}/_doc/${token}`);
            const body = await response.json()
    
			return response.status === 404 ? null : body._source.user;
		} catch (err) {
			throw errors.DATABASE_ERROR(err);
		}
       
    };

    /**
     * Creates a new user group with the provided name and description
     * @param {String} user 
     * @param {String} name 
     * @param {String} description 
     * @returns {Object} a new group object with the information provided
     */
    async function createGroup(user,name,description){
        var newGroup =  {
            name : name,
            description : description,
            games : []	
        };

        const displayableGroup =  {
            name : name,
            description : description,
            games : {}	
        };
        const id = crypto.randomUUID()
        const groupId = id.replace(/-/g,'');


        try {
			 await fetch(
				`${userGroupsUrl(user)}/_doc/${groupId}?refresh=wait_for`,
					{
						method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newGroup)
					}
			);
        return displayableGroup
        }
        catch(err){
            throw errors.DATABASE_ERROR(err);
        }
    };

    /**
     * edits a user's group name and description
     * @param {String} user 
     * @param {String} groupId group's id
     * @param {String} newName griups's new name
     * @param {String} description 
     * @returns {Object} the new edited group
     */
    async function editGroup(user,groupId,newName,description){
        try{
            const response = await fetch(`${userGroupsUrl(user)}/_doc/${groupId}` );    
            const group = await response.json();
            const updatedGroup =  {
                        name : newName,
                        description : description,
                        games : await gameArrayToObject(group._source.games)
                    };  

            const infoToSend =  {
                doc :{
                    name : newName,
                    description : description
                }
            };
            await fetch(
                `${userGroupsUrl(user)}/_update/${groupId}?refresh=wait_for`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(infoToSend)
                    
                }
                  
            );
            
        return updatedGroup;  
        }catch(err){
            throw errors.DATABASE_ERROR(err);
        }
    };

    /**
     * Lists all groups of a certain user 
     * @param {String} user 
     * @returns {Object} containing all groups
     */
    async function listGroups(user){
        try{
            const response = await fetch(
                `${userGroupsUrl(user)}/_search`
            );
            
            if (response.status === 404) {
                return {};
            }
            const answer = await response.json();
            let groups = {};
            const hits = answer.hits.hits;
            for(let hit of hits){
                groups[hit._id] = {
                    id: hit._id,
                    name : hit._source.name,
                    description : hit._source.description,
                    games : await gameArrayToObject(hit._source.games)
                };
             };

            
            return groups;
        }catch(err){
            throw errors.DATABASE_ERROR(err);
        }
    };

    /**
     * Gets a group's information
     * @param {String} user
     * @param {String} groupId
     * @returns {Object} containing the group's information
     */ 
    async function getGroup(user,groupId){
        try{
            const response = await fetch(
               `${userGroupsUrl(user)}/_doc/${groupId}`
            );
            const group = await response.json();

            return {
                name : group._source.name,
                description : group._source.description,
                games : await gameArrayToObject(group._source.games)
            };

       }catch(err){
           throw errors.DATABASE_ERROR(err);
       }
   }; 

    /**
     * Deletes a group from a user
     * @param {String} user      the user to delete the group from
     * @param {String} groupId   the groupId to reach the group to delete 
     * @returns {Object} user's groups updated
     */
    async function deleteGroup(user, groupId){
        try{
        const response = await fetch(`${userGroupsUrl(user)}/_doc/${groupId}?refresh=wait_for`,
        {
            method: 'DELETE',
        } 
        );
        return listGroups(user);
        }catch(err){
            throw errors.DATABASE_ERROR(err);
        }

    };

    /**
     * Checks wheter a Game exists in the db or not
     * @param {String} gameId
     * @returns {Boolean} true if the game exists
     * @throws {Error} if the game doesn't exist
     */
    async function dbHasGame(gameID){
        try{
            const response = await fetch(`${allGamesUrl}/_doc/${gameID}`);
            return response.status === 404 ? false : true;
        }catch(err){
            throw errors.DATABASE_ERROR(err);
        }
    };
    
    /**
     * Adds a game to a user's group 
     * @param {String} user 
     * @param {String} groupId 
     * @param {Object} game 
     * @returns {Object} group with games updated
     */
    async function addGameToGroup(user,groupId,game){
        try{
            const response = await fetch(`${userGroupsUrl(user)}/_doc/${groupId}` );    
            const group = (await response.json())._source;
           

            if(!(await dbHasGame(game.id))){
                 await fetch(
                    `${allGamesUrl}/_doc/${game.id}?refresh=wait_for`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(game)
                        }
                );
            };
            group.games.push(game.id);

            await fetch(
                `${userGroupsUrl(user)}/_update/${groupId}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            doc :{
                                games : group.games
                            }
                        })
                    }
            );

            return {
                name : group.name,
                description : group.description,
                games : await gameArrayToObject(group.games)
            };
                
        }catch(err){
            throw errors.DATABASE_ERROR(err);
        }
    };

    /**
     * Removes a game from a user's group 
     * @param {String} user 
     * @param {String} groupId 
     * @param {String} gameId 
     * @returns {Object} group with games updated
     */
    async function removeGameFromGroup(user,groupId,gameId){
        try{
            const response = await fetch(`${userGroupsUrl(user)}/_doc/${groupId}` );    
            const group = (await response.json())._source;
           
            group.games = group.games.filter(game => game !== gameId);
            
            await fetch(
                `${userGroupsUrl(user)}/_update/${groupId}/?refresh=wait_for`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body:  JSON.stringify(
                            {
                                doc :{
                                    games : group.games
                            }
                        })
                        
                    }
            );
            
            return {
                name : group.name,
                description : group.description,
                games : await gameArrayToObject(group.games)
            };
                
        }catch(err){
            throw errors.DATABASE_ERROR(err);
        }
    };

    /**
    * checks if username is already in use
    * @param {String}} Username 
    * @returns {Boolean} true if users object has certain user
    */
    async function hasUser(Username){
        try {
			const response = await fetch(`${allUsersUrl}/_doc/${Username}`);
            
			return response.status === 200;
		} catch (err) {
			throw errors.DATABASE_ERROR(err);
		}
    };

    /**
     * Creates a new user 
     * @param {String} Username user's name   
     * @returns {Object} an object with the id of the user and its name
     */
    async function createUser(Username){

        const id = crypto.randomUUID();
        const newUser = {
            AuthToken: id,
            UserName: Username
        };
        const idToUser ={
            user: Username 
        }
        try {
            const TokensResponse = await fetch(
                `${allTokensUrl}/_doc/${id}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(idToUser)
                    }
            );

            const UserResponse = await fetch(
                `${allUsersUrl}/_doc/${Username}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            AuthToken: id
                        })
                    }
            );
            return newUser;
        
        }catch(err){
			throw errors.DATABASE_ERROR(err);
        }

    };


    /**
     * Transforms an array of game ids into an object of games
     * @param {Array} gameArray 
     * @returns  {Object} containing all games objects
     */
     async function gameArrayToObject(gameArray){
        let gameObj = {};
       
        for(let game of gameArray){
            const response = await fetch(`${allGamesUrl}/_doc/${game}`);
            const body = await response.json();
          
           gameObj[game] = body._source;
        }

        return gameObj;
    };

    return{
        hasGroup,
        hasGame,
        tokenToUsername,
        createGroup,
        addGameToGroup,
        removeGameFromGroup,
        deleteGroup,
        editGroup,
        getGroup,
        listGroups,
        hasUser,
        createUser
    }
}