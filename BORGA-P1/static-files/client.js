'use strict';

function prepareGroupDeleteButtons() {
	const deleteButtons =
		document.querySelectorAll('.button_group_delete'); 
	deleteButtons.forEach(butDel => {
		butDel.onclick = onDeleteGroup;
	});
	return;
	
	async function onDeleteGroup(){
		const groupId = this.id.slice(8,40) ;
		const token = this.id.substr(41); //32 is the size of a token, then we add 1 for the _
		
		try {
			await deleteGroupOnApi(groupId,token);
			deleteGroupFromView(groupId);
		} catch (err) {
			alert(err);
		}
	}
	async function deleteGroupOnApi(groupId,token) {
		
		const delReqRes = await fetch(
			'/api/my/group/' + groupId,
			{
				method: 'DELETE',
				headers: {
                            'Authorization': 'bearer ' + token
                         }	
			});
		
		 
		if (delReqRes.status === 200) {
			return;
		}
		throw new Error(
			'Failed to delete group with id ' + groupId + '\n' +
			delReqRes.status + ' ' + delReqRes.statusText 
		);
	}

	function deleteGroupFromView(groupId) {
		const tableEntryId = '#entry_' + groupId;
		const tableEntry = document.querySelector(tableEntryId);
		tableEntry.parentNode.removeChild(tableEntry);
	}	
}

function prepareGameDeleteButtons() {
	const deleteButtons =
		document.querySelectorAll('.button_game_delete'); 
	deleteButtons.forEach(butDel => {
		butDel.onclick = onDeleteGame;
	});
	return;
	
	async function onDeleteGame(){

		const groupId = this.id.slice(9,41);
		const gameId = this.id.slice(42,52);
		const token = this.id.substr(53); //32 is the size of a token, then we add 1 for the -


		
		try {
			await deleteGameOnApi(groupId,gameId,token);
			deleteGameFromView(gameId);
		} catch (err) {
			alert(err);
		}
	}
	
	async function deleteGameOnApi(groupId,gameId,token) {
		
		const delReqRes = await fetch(
			'/api/my/group/' + groupId + '/games',
			{
				method: 'DELETE',
				headers: {
                            'Authorization': 'bearer ' + token,
							 'Content-Type': 'application/json'
                         },
				body: JSON.stringify({
					"gameId" : gameId
				})
						 });
		
		 
		if (delReqRes.status === 200) {
			return;
		}
		throw new Error(
			'Failed to delete game with id ' + gameId + '\n' +
			delReqRes.status + ' ' + delReqRes.statusText 
		);
	}
	
	function deleteGameFromView(gameId) {
		const tableEntryId = '#entry_' + gameId;
		const tableEntry = document.querySelector(tableEntryId);
		tableEntry.parentNode.removeChild(tableEntry);
	}

}

function prepareGroupEditButtons() {

	const editButtons =
		document.querySelectorAll('.button_group_edit'); 
	editButtons.forEach(butEdit => {
		butEdit.onclick = onEditGroup;
	});
	return;
	
	async function onEditGroup(){
		
	}
	
	
}