'use strict';

function prepareGroupDeleteButtons() {
	const deleteButtons =
		document.querySelectorAll('.button_group_delete'); 
	deleteButtons.forEach(butDel => {
		butDel.onclick = onDeleteGroup;
	});
	return;
	
	async function onDeleteGroup(){
		const gameId = this.id.slice(8,40) ;
		const token = this.id.substr(41); //32 is the size of a token, then we add 1 for the _
		
		try {
			await deleteGroupOnApi(gameId,token);
			deleteGroupFromView(gameId);
		} catch (err) {
			alert(err);
		}
	}
	async function deleteGroupOnApi(gameId,token) {
		
		const delReqRes = await fetch(
			'/api/my/group/' + gameId,
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
			'Failed to delete game with id ' + gameId + '\n' +
			delReqRes.status + ' ' + delReqRes.statusText 
		);
	}

	function deleteGroupFromView(gameId) {
		const tableEntryId = '#entry_' + gameId;
		const tableEntry = document.querySelector(tableEntryId);
		tableEntry.parentNode.removeChild(tableEntry);
	}
	
	
	
}

function prepareGameDeleteButtons() {
	const deleteButtons =
		document.querySelectorAll('.button_game_delete'); 
	deleteButtons.forEach(butDel => {
		butDel.onclick = onDeleteBook;
	});
	return;
	
	async function onDeleteGame(){
		
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