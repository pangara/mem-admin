'use strict';

angular.module('core')
.filter('filterPluralText', filterPluralText);

/*
A filter to select from a set of text content based on the plurality of a given array
In controller:
 $scope.lists = [
 [],
 ['file1'],
 ['file1', 'file2'],
 ['file1', 'file2', 'file3']
 ]
In markup
 <h3>{{ list | filterPluralText : ['No files can be published', 'Confirm Publish File','Confirm Publish Files']}}</h3>
 Or with a boolean input
 <h3>{{ true | filterPluralText : ['true text','false text']}}</h3>
 <h3>{{ false | filterPluralText : ['true text','false text']}}</h3>
 */
function filterPluralText() {
	return function(input, text) {
		if (!Array.isArray(text) || text.length < 2) {
			return 'Must provide array of text options to filterPluralText ';
		}
		var result = 'Invalid use of filterPluralText ';
		if (Array.isArray(input)) {
			result = text.pop();
			for (var i = 0; i < text.length; i++) {
				if (input.length === i) {
					result = text[i];
					break;
				}
			}
		} else {
			result = input ? text[0] : text[1];
		}
		return result;
	};
}