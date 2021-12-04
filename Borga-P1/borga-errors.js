'use strict';

function buildErrorList() {
	const errors = {};

	function addError(code, name, message) {
		errors[name] = info => {
			return { code, name, message, info };
		};
	}
	
	addError(1000, 'FAIL', 'An error occurred');
	addError(1001, 'NOT_FOUND', 'The item does not exist');
	addError(1002, 'EXT_SVC_FAIL', 'External service failure');
	addError(1003, 'MISSING_PARAMETER', 'A required parameter is missing');
	addError(1004, 'USER_ALREADY_EXISTS', 'The user you wanted to add already exists');
	addError(1005, 'GROUP_ALREADY_EXISTS', 'The group you wanted already exists');
	addError(1006, 'UNAUTHENTICATED', 'Invalid or missing token');
	
	return errors;
}

const errorList = buildErrorList();

module.exports = errorList;

