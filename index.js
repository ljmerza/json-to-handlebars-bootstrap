$('#jsonForm').submit(event => {
	event.preventDefault();

	// reset form view
	const $result = $('#json-form-result');
	$result.addClass('d-none');
	const $errorMessage = $('#error-message');
	$errorMessage.addClass('d-none');

	// get form values
	let json = $('#json-input').val();
	const columnLength = $('#column-length').val() || 3;
	const objectPath = $('#object-path').val() || '';

	// validate column length
	if(isNaN(columnLength)){
		$errorMessage.text('Column Length needs to be a number!');
		$errorMessage.removeClass('d-none');
		return;
	}

	// validate JSON text
	try {
		json = JSON.parse(json);
	} catch(e){
		$errorMessage.text('Could not parse JSON!');
		$errorMessage.removeClass('d-none');
		return;
	}

	// convert to table and show data
	const bootstrapTable = convertToTable(json, columnLength, objectPath);
	$('#json-form-result textarea').val(bootstrapTable);
	$result.removeClass('d-none');
});


/**
 * this function converts an object to a bootstrap table for handlebars
 * @param {Object} json the json to convert to a bootstrap table
 * @param {Number} columnLength the length of each column (col-md-x)
 * @param {String=''} objectPath if given an object path then is added
 *		when adding the object value ( if objectPath=model.team then {{model.team.user}} )
 *
 * @return {string}
 *
 */
function convertToTable(json, columnLength, objectPath=''){
	const bootstrapColMax = 12;

	// bootstrap specific HTML elements
	const bootstrapRowBegin = `<div class="row">`;
	const bootstrapRowEnd = `</div>`;
	const bootstrapColBegin = `<div class="col-md-${columnLength}">`
	const bootstrapColEnd = `</div>`;

	// label and input HTML elements
	const labelBegin = `<label>`
	const labelEnd = `</label>`;
	const inputBegin = `<p>`
	const inputEnd = `</p>`;

	// the HTML that will be returned - start with an open row
	let bootstrapHtml = `
${bootstrapRowBegin}`;
	
	// keep track of what column number we are at so we can 
	// know when to close the row and start a new one
	let currentNumberOfColumnsInRow = 0;

	// this is the loop where we build the HTML
	for(let key in json){

		// if we have maxed out the number of columns then 
		// close the current row and create a new row
		if(currentNumberOfColumnsInRow >= bootstrapColMax){
			bootstrapHtml += `
${bootstrapRowEnd}

${bootstrapRowBegin}`;
			
			// reset the current number of column we are at since we created a new row
			currentNumberOfColumnsInRow = 0;
		}

		// get the current property value
		// if we have an object path then add it here else just use the prop value
		const keyValue = _convertKey(json[key]);
		const valueTemplate = objectPath ? `${objectPath}.${keyValue}` : keyValue;

		// add the current property value - create col, add label then value, close col
		bootstrapHtml += `
	${bootstrapColBegin}
		${labelBegin}${key}${labelEnd}
		${inputBegin}{{${valueTemplate}}}${inputEnd}
	${bootstrapColEnd}`;

		// increment what column we are on
		currentNumberOfColumnsInRow += columnLength;

	}


	// after we are done building the table close the last row here
	bootstrapHtml += `
${bootstrapRowEnd}
`;
	
	return bootstrapHtml;
}

/**
 * replaces camel case and snake case to regular sentence form
 * @param {String} key the key to convert
 * @return {String} 
 */
function _convertKey(key){
	key = key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase()) // replace snake case with spaces
	key = key.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
  	key = key.charAt(0).toUpperCase() + key.slice(1); // make sure the first letter is capitalized

  	// double check - make sure each word is capitalized
  	key = key.split(' ')
	    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
	    .join(' ');

	 // get rid of any extra spaces
  	return key.replace(/ {2,}/g, ' ').trim();
}