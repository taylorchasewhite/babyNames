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
var chart,babyNameData,parentDivInfo,currentlyRemovedElement;
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
 * Generates a select element with values from all of the years available
 * @private
 */
function loadYearsData() {
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
		addSelectHandler();
		yearSelect=$("selYear");
	});
}

/**
 * Set the handler to be called when the year selection element changes
 * @private
 */
function addSelectHandler() {
	yearSelect = $("#selYear");

	yearSelect.change(function() {
		onYearChange();
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
		path:"data/names/yob"+yearSelect.val()+".txt",
		selRelated:true
	});
	
	parentDivInfo=generationInfo;
	//console.log(parentDivInfo);	
	genMultipleBabyNameLists(parentDivInfo);
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