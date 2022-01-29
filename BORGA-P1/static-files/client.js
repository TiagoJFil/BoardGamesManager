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
		//32 is the size of a token
		const groupId = this.id.slice(8,40);
		const gameId = this.id.slice(41,51);
		const token = this.id.substr(52); 


		
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

function prepareGroupEditButton() {

	const butEdit = document.querySelector('.button_group_edit'); 
	
	butEdit.onclick = openEditForm;

	return;
	
	async function onEditGroup(token,groupId,name,desc){
		try{
			editDescOnView(name,desc)
			await editDescOnApi(token,groupId,name,desc);
		}catch(error){
			alert(error);
		}
	}
	
	async function editDescOnApi(token,groupId,newName,newDesc) {
		
		const editResRes = await fetch(
			`/api/my/group/${groupId}`,
			{
				method: 'PUT',
				headers: {
                            'Authorization': 'bearer ' + token,
							'Content-Type': 'application/json'
                         },
				body: JSON.stringify
				({
					"name" : newName,
					"desc" : newDesc
				})
			});
		
		 
		if (editResRes.status === 200) {
			return;
		}
		throw new Error(
			'Failed to edit group description with id ' + groupId +" "+ token+" " + groupId+" " + newName+" " + newDesc+" "+ '\n' +
			editResRes.status + ' ' + editResRes.statusText 
		);
	}

	function editDescOnView(name,desc) {
		const group_desc = '#group_desc';
		const group_name = '#group_name';
		const page_group_desc = document.querySelector(group_desc);
		const page_group_name = document.querySelector(group_name);
		page_group_desc.innerHTML = `${desc}`;
		page_group_name.innerHTML = `${name}`;
	}
	
	function openEditForm(){
		const editButton = document.querySelector("#enable_edit_button")
		editButton.innerHTML = "";
		const groupId = this.id.slice(9,41);
		const token = this.id.substr(42);
		const form_id = '#new_form';
		const form = document.querySelector(form_id);
		form.innerHTML = 
						"<p><label >Name:</label></p>"+ 
						"<input type='text' id='form_group_name'></input>"+
						"<p><label>Description (Max 100 characters):</label></p>"+
						"<input type='text' id='form_group_desc'size='70'></input>" +
						"<input id = 'button_change_group_info' type='submit' value='Edit'>";
						


		const but_change = document.querySelector('#button_change_group_info'); 
		but_change.onclick = function() {
			const name = document.querySelector('#form_group_name').value;
			const desc = document.querySelector('#form_group_desc').value;
			onEditGroup(token,groupId,name,desc);
			editButton.innerHTML = `<input class = button_group_edit id = but_edit_${groupId}_${token} type = submit value = Edit>`;
			form.innerHTML = "";
			prepareGroupEditButton();
		}
	}
}

