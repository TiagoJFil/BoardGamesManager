'use strict';

const crypto = require('crypto');

const errors = require('./borga-errors');

const fetch = require('node-fetch');


module.exports = function(es_spec){


    /**
     * gets the list of groups from a user and determines what is the next
     * @param {String} user 
     * @returns the next group id
     */
    async function getGroupCounter(user){
        try{
            const response = await fetch(
                `${userGroupsUrl(user)}/_search`
            );
            if (response.status === 404) {
                return 0;
            }
            const answer = await response.json();
            const count = answer.hits.total.value;
            return count;
        }catch(err){
            throw errors.DATABASE_ERROR(err);
        }
    }


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
     * checks if a certain user's group has a the same gameId
     * @param {String} user 
     * @param {String} groupId 
     * @param {String} gameId 
     * @returns {Boolean} true if certain group of a user has the same game identified by the gameId
     */
    async function hasGame(user,groupId,gameId){
        try {
            
            const response =await fetch(
                 `${userGroupsUrl(user)}/_doc/${groupId}?refresh=wait_for`);
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
            name : name,
            description : description,
            games : []	
        };

       // users[user][name] = newGroup;

        const displayableGroup =  {
            name : name,
            description : description,
            games : {}	
        };

        try {
			 await fetch(
				`${userGroupsUrl(user)}/_doc/${await getGroupCounter(user)}?refresh=wait_for`,
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
            const group = await fetch(`${userGroupsUrl(user)}/_doc/${groupId}?refresh=wait_for` );    

            const updatedGroup =  {
                        Name : newName,
                        Description : description,
                        games : group._source.games	
                    };  

            const groupResponse = await fetch(
                `${userGroupsUrl(user)}/_doc/${groupId}?refresh=wait_for`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedGroup)
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
            hits.map(hit =>{ 
                 groups[hit._id] = hit._source
             });

            
            return groups;
        }catch(err){
            throw errors.DATABASE_ERROR(err);
        }
    }

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
    /*
    async function addGameToGroup(user,groupName,game){
        try{



		const group = await fetch(
			`${userGroupsUrl(username)}/_doc/${await getGroupCounter(user)}?refresh=wait_for`



        const responseGames = await fetch(
            `${userGamesUrl(username)}/_doc/${game.id}?refresh=wait_for`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(game)
                }
        );
                
        }


       
        games[gameId] = game;
        
        users[user][groupName].games.push(gameId);


        return await getDisplayableGroupWithGameObjs(user,groupName);
    }
    
    */

    /**
     * Removes a game from a user's group 
     * @param {String} user 
     * @param {String} groupId 
     * @param {String} gameId 
     * @returns {Object} group with games updated
     */
    async function removeGameFromGroup(user,groupId,gameId){
        users[user][groupName].games = users[user][groupName].games.filter(it => it != gameId);

        return await getDisplayableGroupWithGameObjs(user,groupName);
    }

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
    }
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
    }
    return{
        hasGroup,
        hasGame,
        tokenToUsername,
        createGroup,
        deleteGroup,
        editGroup,
        listGroups,
        hasUser,
        createUser
    }
}