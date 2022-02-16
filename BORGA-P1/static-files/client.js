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

function pagination(gamesArr,groups){
	const list_element = document.getElementById('list');
	const pagination_element = document.getElementById('pagination');

	let current_page = 1;
	let rows = 5;

	function displayList (items, wrapper, rows_per_page, page){
		wrapper.innerHTML = "";
		page--;

		let start = rows_per_page * page;
		let end = start+rows_per_page;

		let paginatedItems = items.slice(start,end);

		for(let i = 0; i < paginatedItems.length; i++){
			let items = paginatedItems[i];

			let item_element = document.createElement('table');
			item_element.classList.add('item');
			let gameInfoToAdd = `<td><img src=${items.image} class='images'></td>
					<tr><td  class='gameInfoSearch'>Title:</td><td>${items.name}</td></tr>
					<h2></h2>`;

			if(items.publisher) gameInfoToAdd +=`<tr><td class='gameInfoSearch'>Publisher:</td><td>${items.publisher}</td></tr>`;
			if(items.min_age) gameInfoToAdd += `<tr><td class='gameInfoSearch'>Min Age:</td><td>${items.min_age}</td></tr>`;
			if(items.min_players) gameInfoToAdd += `<tr><td class='gameInfoSearch'>Min Players:</td><td>${items.min_players}</td></tr>`
			if(items.max_players) gameInfoToAdd += `<tr><td class='gameInfoSearch'>Max Players:</td><td>${items.max_players}</td></tr>`
			if(items.price) gameInfoToAdd += `<tr><td class='gameInfoSearch'>Price:</td><td>${items.price}$</td></tr>`
			if(items.url) gameInfoToAdd += `<tr><td class='gameInfoSearch'>Url:</td><td><a href=${items.url} target="_blank" rel="noopener noreferrer">${items.url}</a></td></tr>`
			gameInfoToAdd += `<tr><td><form action='/games/${items.id}' method = "GET"><input type="submit" required value="Get more details"></form>`

			if (groups){
				gameInfoToAdd += `<label>Choose a group to add to:</label><form action="/groups/games" id= "form_for_${items.name}" method = "POST"><input type='hidden' name='gameId' value=${items.id}><label><select required name="groupId" form ="form_for_${items.name}"><option selected></option>`
				const noGroups = Object.values(groups);
				console.log(noGroups);
				noGroups.forEach(function(game) {
					gameInfoToAdd += `<option value=${game.id}>${game.name}</option>`;
				})
				gameInfoToAdd += `</select></label><input type="submit" required value="Add To Group"></form></td></tr>`
			}

			item_element.innerHTML = gameInfoToAdd;

			wrapper.appendChild(item_element);
		}
	}

	function setupPagination(items, wrapper, rows_per_page){
		wrapper.innerHTML = "";

		let page_count = Math.ceil(items.length / rows_per_page)

		for(let i = 1; i < page_count+1; i++){
			let btn = paginationButton(i, items);
			wrapper.appendChild(btn);
		}
	}

	function paginationButton(page,items){
		let button = document.createElement('button');
		button.classList.add('pagination')
		button.innerHTML = page;

		if(current_page == page) button.classList.add('active');

		button.addEventListener('click', function(){
			current_page = page;
			displayList(items,list_element,rows,current_page);
			let current_btn = document.querySelector('.pagination button.active');
			current_btn.classList.remove('active');
			button.classList.add('active');
			window.scrollTo(0, 0);
		})

		return button
	}
	displayList(gamesArr,list_element,rows,current_page);
	setupPagination(gamesArr,pagination_element,rows);
}