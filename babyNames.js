/**
 * Using data from the US Social Security Administration, this file will generate an SVG
 * bubble chart that displays the frequency of the occurrence of that name in a given year.
 * The data goes from 1880-Present (2016) as of Summer 2017.
 * 
 * @author Taylor White <whitetc2@gmail.com>
 * @since  07.04.17
 * @summary  Generate a bubble chart showing frequency of US names by year.
 * @requires d3.v4.js
 * @requires jquery
 */

/*
	Global vars
*/
var babyNameData,chart,parentDivInfo,currentlyRemovedElement;
var yearSelect;


/**
 * Generates the DOM elements into specified DIVs from specified datasets.
 * @public
 * @param {Object} generationData - Array of JSON data structured like so:
 * @param {string[]} generationData.id - An array of div IDs indicating where to render content
 * 										[0] - The div ID to contain the ordered list
 * 										[1] - The div ID to containt the bubble chart
 * @param {string} generationData.path - Path to the file with data to load
 * @param {string} generationData.selRelated - Indicates if this dataset should be relaoded when changing years
 */
function babyNamesInitialize(generationData) {
	loadYearsData();
	parentDivInfo=generationData;
	genMultipleBabyNameLists(parentDivInfo);
}

/**
 * Generate baby name lists for multiple 
 * @public
 * @param {Object} generationData - Array of JSON data structured like so:
 * @param {string[]} generationData.id - An array of div IDs indicating where to render content
 * 										[0] - The div ID to contain the ordered list
 * 										[1] - The div ID to containt the bubble chart
 * @param {string} generationData.path - Path to the file with data to load
 * @param {string} generationData.selRelated - Indicates if this dataset should be relaoded when changing years
 */
function genMultipleBabyNameLists(generationData) {
	generationData.forEach(function(d) {
		genBabyNameList(d.id,d.path);
	});
}

/**
 * Generates a list and bubble chart of baby names into the DOM
 * @public
 * @param {string[]} elementIDs - An array of html element IDs (length of 2)
 * 								[0] - The div ID to contain the ordered list
 * 								[1] - The div ID to containt the bubble chart
 * @param {string} path - The path to the SSA csv data for a given year
 */
function genBabyNameList(elementIDs,path) {
	var parentDivIDs;
	
	// element to build in
	if (elementIDs) {
		parentDivIDs=elementIDs;
	}
	else {
		parentDivIDs=["divBabyNames"];
	}
	// path
	if (!path) {
		path="./data/babyNames.csv";
	}
	
	loadBabyNameData(parentDivIDs,path);
}

/**
 * Loads the baby name data into an array of JSONs from a filepath
 * @private
 * @param {string[]} elementIDs - An array of html element IDs (length of 2)
 * 								[0] - The div ID to contain the ordered list
 * 								[1] - The div ID to containt the bubble chart
 * @param {string} path - The path to the SSA csv data for a given year
 */
function loadBabyNameData(parentDivIDs,path) {	
	console.log('loadBabyNameData:'+ parentDivIDs[0] + ", " + parentDivIDs[1] + ", " + path);
	
	d3.csv(path,function(error,data) {
		if (error) {
			throw error;
		}
		babyNameData=data;
		bindBabyNamesToDOM(data,parentDivIDs[0]);
		if (parentDivIDs.length >1) {
			generateBabyBubbleChart(data,parentDivIDs[1]);	
		}
	});
}

/**
 * Initialize HTML elements needed to trigger searches
 * @public
 * 
 * @param {Object} generationData - Array of JSON data structured like so:
 * @param {string[]} generationData.id - An array of div IDs indicating where to render content
 * 										[0] - The div ID to contain the ordered list
 * 										[1] - The div ID to containt the bubble chart
 * @param {string} generationData.path - Path to the file with data to load
 * @param {string} generationData.searchTerm - The term we are to search for
 */
function babyNameSearchInitialize(generationData) {
	loadYearsData('search');
	parentDivInfo=generationData;
	$("#searchInput").val("Taylor");
	addSearchHandlers();
}

/**
 * Pull the relavent information needed to search from the DOM and initiate a search
 * @private
 */
function searchForBabyName() {
	var searchTerm = $("#searchInput").val();
	var path=getPathFromYear();
	var parentDivIDs=parentDivInfo.id;
	removeSearchResultsFromDOM(parentDivIDs[0]);
	searchBabyNameData(parentDivIDs,path,searchTerm);
}

/**
 * Extract the data from the specified path and call searchThroughBabyData
 * @private
 * 
 * @param {any} parentDivIDs - The parent divs to populate search results with
 * @param {any} path - The path containing the year data
 * @param {any} searchTerm - The search term entered by the user
 */
function searchBabyNameData(parentDivIDs,path,searchTerm) {	
	//console.log('searchBabyNameData:'+ parentDivIDs[0] + ", " + parentDivIDs[1] + ", " + path + ", " + searchTerm);
	
	d3.csv(path,function(error,data) {
		if (error) {
			throw error;
		}
		babyNameData=data;
		searchThroughBabyData(data,parentDivIDs[0],searchTerm);
	});
}

/**
 * Searches over the SSA data for a given year based on the params passed in.
 * @private
 * 
 * @param {Object[]} babyData - The array of JSON data containing names, their sex and frequency
 * @param {Object} babyData[].Name - Name of the child being born
 * @param {Object} babyData[].Sex - The sex of the baby born (can be M/F).
 * @param {Object} babyData[].BirthCount - The number of babies born thtat year
 * @param {string} parentDivID - The div to render the ordered list into.
 * @param {string} searchTerm - The search string entered in by the user
 */
function searchThroughBabyData(babyData,parentDivID,searchTerm) {
	if(!babyData) {
		babyData=babyNameData;
	}
	var haveCounts,sizeOfSet,list;
	/*var rscale = d3.scaleLinear()*/
	
	var sizeOfSet=babyData.length;
	
	babyData.sort(function(a,b) {
		if (a.hasOwnProperty("BirthCount")) {
			haveCounts=true;
			return b.BirthCount-a.BirthCount;
		}
		else {
			return d3.ascending(a.Name,b.Name);				
		}
	});	
	var maleName= [{sexAhead:0,sexCount:0}],femaleName = [{sexAhead:0,sexCount:0}];
	babyData.forEach(function(d,i) {
		switch (d.Sex) {
			case 'F': femaleName[0].sexCount++; break;
			case 'M': maleName[0].sexCount++; break;
		}
		if (d.Name === searchTerm) {
			if (d.Sex==='F') {
				femaleName.push(d);
			} 
			else {
				maleName.push(d);
			}
		}
		if (!femaleName[1] && d.Sex==='F') {
			femaleName[0].sexAhead++;
		}
		if (!maleName[1] && d.Sex==='M') {
			maleName[0].sexAhead++;
		}	
	});
	d3.select("#"+parentDivID)
		.append("div")
		.html(function() {
			return getReturnString(maleName,femaleName,sizeOfSet);
		});
}


/**
 * Return back a friendly string that details how popular a given name was for both boys and girls
 * 
 * @param {Object[]} maleNameResults - Contains the search result data for males born in a given year
 * @param {Object[]} femaleNameResults - Contains the search result data for females born in a given year
 * @param {number} sizeOfSet - The total size of the number of names born in a given year
 * @returns string - A nicely formatted string detailing the popularity of a name
 */
function getReturnString(maleNameResults,femaleNameResults,sizeOfSet) {
	var returnString;
	returnString = "In " + $("#selYear").val() + "...<br/><br/><ul>";
	if (maleNameResults.length > 1 || femaleNameResults.length >1) {
		if (maleNameResults.length > 1) {
			returnString += "<li class=\"boy\">For boys, " + maleNameResults[1].Name;
			returnString += " was the " + getSexAheadString(maleNameResults[0].sexAhead) + " most popular name of ";
			returnString += maleNameResults[0].sexCount + " total names of ";
			returnString += getSexClass(maleNameResults[1]) + " babies born.";
			returnString += "<br/>There were " + maleNameResults[1].BirthCount + " boy  babies named " + maleNameResults[1].Name + " born.</li>";
		}
		else {
			returnString +="<li class=\"boy\">Of the " + maleNameResults[0].sexCount + " baby boys born, none of them were named " + femaleNameResults[1].Name + "!</li>";
		}
		
		if (femaleNameResults.length > 1) {
			returnString += "<br/><br/><li class=\"girl\">"
			returnString += "For girls, " + femaleNameResults[1].Name;
			returnString += " was the " + getSexAheadString(femaleNameResults[0].sexAhead) + " most popular name of ";
			returnString += femaleNameResults[0].sexCount + " total names of ";
			returnString += getSexClass(femaleNameResults[1]) + " babies born."
			returnString += "<br/>There were " + femaleNameResults[1].BirthCount + " girl babies named " + femaleNameResults[1].Name + " born.</li>";
		}
		else {
			returnString +="<br/><br/><li class=\"girl\">Of the " + femaleNameResults[0].sexCount + " baby girls born, none of them were named " + maleNameResults[1].Name + "!</li>";
		}
	}
	else {
		returnString+="<li>There were no babies born by that name!</li>";
	}
	returnString +='</ul>';
	return returnString;
}

/**
 * Add the ordinal suffix to numbers greater than zero, otherwise return empty string
 * 
 * @param {any} birthCount - number of babies born
 * @returns - The ordinal suffix of a number
 */
function getSexAheadString(birthCount) {
	var sexAheadString="";
	function ordinal_suffix_of(i) {
		var j = i % 10,
			k = i % 100;
		if (j == 1 && k != 11) {
			return i + "st";
		}
		if (j == 2 && k != 12) {
			return i + "nd";
		}
		if (j == 3 && k != 13) {
			return i + "rd";
		}
		return i + "th";
	}
	if (birthCount>0) {
		sexAheadString=ordinal_suffix_of(birthCount);
	}
	return sexAheadString;
}

/**
 * Generates the D3 SVG to display and renders the bubble chart
 * @public
 * @param {Object[]} babyData - An array of JSONs representing the baby data
 * @param {Object} babyData[].Name - Name of the child being born
 * @param {Object} babyData[].Sex - The sex of the baby born (can be M/F).
 * @param {Object} babyData[].BirthCount - The number of babies born thtat year
 * @param {string} parentDivID - The div to containt the chart
 */
function generateBabyBubbleChart(babyData,parentDivID) {
	if (parentDivID!=="divAllBabyNames" && parentDivID!=="divBabyBubbleChart") {
		return;
	}
	babyData.sort(function(a,b) {
		return d3.ascending(a.Name,b.Name);				
	});
	
	var newData=[];
	var maxBirths=d3.max(babyData, function(d) {
		return +d.BirthCount;
	});
	babyData.forEach(function(d,i) {
		if (d.BirthCount >= 0.3*maxBirths) {
			newData.push(d);
		}
	});
	
	chart = bubbleChart().width(850).height(850).minRadius(7).maxRadius(55).forceApart(-170);
	chart.columnForColors("Sex").columnForRadius("BirthCount").unitName("babies").columnForTitle("Name");
	chart.customColors(["M","F"],["#70b7f0","#e76486"]).showTitleOnCircle(true);
	chart.title('Most popular baby names in ' + $("#selYear").val());
	d3.select("#"+parentDivID)
		.data(newData)
		.call(chart);
	return;
}

/**
 * Generates the D3 ordered list from the data.
 * @public
 * @param {Object[]} babyData - The array of JSON data containing names, their sex and frequency
 * @param {Object} babyData[].Name - Name of the child being born
 * @param {Object} babyData[].Sex - The sex of the baby born (can be M/F).
 * @param {Object} babyData[].BirthCount - The number of babies born thtat year
 * @param {string} parentDivID - The div to render the ordered list into.
 */
function bindBabyNamesToDOM(babyData,parentDivID) {
	if(!babyData) {
		babyData=babyNameData;
	}
	var haveCounts;
	/*var rscale = d3.scaleLinear()*/
	
	babyData.sort(function(a,b) {
		if (a.hasOwnProperty("BirthCount")) {
			haveCounts=true;
			return b.BirthCount-a.BirthCount;
		}
		else {
			return d3.ascending(a.Name,b.Name);				
		}
	});
	
	
	
	var list;
	if (haveCounts) {
		list=d3.select("#"+parentDivID).append("ol");
		while (babyData.length > 3000) {
			babyData.pop();
		}
	}
	else {
		list=d3.select("#"+parentDivID).append("ul");
	}

	list.classed("threeCol",true);		
	list.selectAll("li")
	.data(babyData)
	.enter()
	.append("li")
	.text(function(d) {
		if (haveCounts) {
			return d.Name + "\t - " + d.BirthCount + " births";			
		}
		else {
			return d.Name;
		}
	})
	.attr("class",function(d) {
		return getSexClass(d);
	});
}

/**
 * Remove the list of names from the DOM
 * @public
 * @param {string} parentDivID 
 */
function removeBabyNamesFromDOM(parentDivID) {
	var list=d3.select("#"+parentDivID).selectAll("ol");
	list.remove();
}

/**
 * Remove the bubble chart containing the data regarding names for a year
 * @public
 * @param {string} parentDivID - HTML element ID to remove data from
 */
function removeBabyChart(parentDivID) {
	var svg=d3.select("#"+parentDivID).select("svg");
	
	/* need this so our callback onYearChangeAfterRemoving
	 * only actually does anything after the last parent div has been
	 * updated
	 */
	currentlyRemovedElement=parentDivID; 
	chart.remove();
}

/**
 * Remove the list of names from the DOM
 * @public
 * @param {string} parentDivID 
 */
function removeSearchResultsFromDOM(parentDivID) {
	var list=d3.select("#"+parentDivID).selectAll("div");
	list.remove();
}

/**
 * Generates a select element with values from all of the years available
 * @private
 */
function loadYearsData(context) {
	d3.tsv("./data/years.tsv",function (error,data) {
		if (error) {
			throw error;
		}
		
		data.sort( function (a,b) {
			return d3.descending(a.Year,b.Year);
		});
		
		var containingDiv=d3.select("#divYearSelect").insert("div");
		containingDiv.text("Show popularity of birth name on ");
		var select=containingDiv.insert("select");
		select.attr("id","selYear");
		//select.attr("class","select_style");
		select.selectAll('option')
		.data(data)
		.enter()
		.append('option')
		.text(function(d) {
			return d.Year;
		})
		.attr('value',function(d) {
			return d.Year;
		});
		addSelectHandler(context);
		yearSelect=$("selYear");
	});
}

/**
 * Set the handlers to run based off of user events in the DOM
 * @private
 */
function addSearchHandlers() {
	var searchBtn = $("#btnSearch").click(function() {
		searchForBabyName();
	});
	$('#searchInput').bind("enterKey",function(e){
		searchForBabyName();
	});
	$('#searchInput').keyup(function(e){
		if(e.keyCode == 13)
		{
			$(this).trigger("enterKey");
		}
	});
}

/**
 * Set the handler to be called when the year selection element changes
 * @private
 * 
 * @param {string} [context='bubble'] - What do we want to bind our change event to?
 */
function addSelectHandler(context) {
	yearSelect = $("#selYear");

	yearSelect.change(function() {
		switch(context) {
			case 'bubble':
				onYearChange();
				break;
			case 'search':
				searchForBabyName();
				break;
			default:
				onYearChange();
				break;
		}
	});
	
}

/**
 * Remove the current data in the nodes on the DOM and 
 * re-render them based on the new year selected
 * @private
 */
function onYearChange() {
	onYearChangeNotGeneric();
}

/**
 * Remove the current data in the nodes on the DOM and 
 * re-render them based on the new year selected 
 * @private
 */
function onYearChangeNotGeneric() {
	//console.log("onYearChangeNotGeneric(): ");
	//console.log(parentDivInfo);
	yearSelect = $("#selYear");

	removeBabyNamesFromDOM("divAllBabyNames");
	removeBabyChart("divBabyBubbleChart");
	
	setTimeout(onYearChangeAfterRemoving,550);
}

/**
 * Reload data from the new path after changing the year select
 * @private
 */
function onYearChangeAfterRemoving() {
	yearSelect = $("#selYear");

	var generationInfo=[];
	generationInfo.push({
		id:["divAllBabyNames","divBabyBubbleChart"],
		path:getPathFromYear(),
		selRelated:true
	});
	
	parentDivInfo=generationInfo;
	//console.log(parentDivInfo);	
	genMultipleBabyNameLists(parentDivInfo);
}

function getPathFromYear() {
	var year;
	yearSelect = $("#selYear");
	year =yearSelect.val();
	if (!year) {
		year = 2016;
	}
	return "data/names/yob"+year+".txt";
}

/**
 * Get the name of the CSS class given the sex of the baby name data
 * @private
 * @param {Object} d - JSON representing baby data structured like:
 * @param {Object} d.Name - Name of the child being born
 * @param {Object} d.Sex - The sex of the baby born (can be M/F).
 * @param {Object} d.BirthCount - The number of babies born thtat year
 * @returns {string} - The mapped CSS class based on the sex of the name
 */
function getSexClass(d) {
	if (d.Sex==="Girl" || d.Sex==="F") {
		return "girl";
	}
	else if (d.Sex==="Boy" || d.Sex==="M") {
		return "boy";
	}
	else {
		return "both";	
	}
}