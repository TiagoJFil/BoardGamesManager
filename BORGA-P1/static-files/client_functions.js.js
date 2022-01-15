'use strict';

function prepareGroupDeleteButtons() {
	
	
	const deleteButtons =
		document.querySelectorAll('.button_delete'); 
	deleteButtons.forEach(butDel => {
		butDel.onclick = onDeleteBook;
	});
	function onDeleteBook() {
		
	}
}