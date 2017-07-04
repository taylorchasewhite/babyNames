/*
	Global vars
*/
var chart,babyNameData,parentDivInfo,currentlyRemovedElement;
var yearSelect;

function babyNamesInitialize(generationData) {
	loadYearsData();
	parentDivInfo=generationData;
	genMultipleBabyNameLists(parentDivInfo);
}

function genMultipleBabyNameLists(generationData) {
	generationData.forEach(function(d) {
		genBabyNameList(d.id,d.path);
	});
}

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
	
	chart = bubbleChart().width(960).height(960).minRadius(7).maxRadius(55).forceApart(-170);
	chart.columnForColors("Sex").columnForRadius("BirthCount").unitName("babies").columnForTitle("Name");
	chart.customColors(["M","F"],["#70b7f0","#e76486"]).showTitleOnCircle(true);
	chart.title('Most popular baby names in ' + $("#selYear").val());
	d3.select("#"+parentDivID)
		.data(newData)
		.call(chart);
	return;
}

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

function removeBabyNamesFromDOM(parentDivID) {
	var list=d3.select("#"+parentDivID).selectAll("ol");
	list.remove();
}

function removeBabyChart(parentDivID) {
	var svg=d3.select("#"+parentDivID).select("svg");
	
	/* need this so our callback onYearChangeAfterRemoving
	 * only actually does anything after the last parent div has been
	 * updated
	 */
	currentlyRemovedElement=parentDivID; 
	chart.remove();

	svg.selectAll("text").remove();
}

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

function addSelectHandler() {
	yearSelect = $("#selYear");

	yearSelect.change(function() {
		onYearChange();
	});
	
}

function onYearChange() {
	onYearChangeNotGeneric();
	return;

}

function onYearChangeGeneric() {
	console.log("onYearChange(): ");
	console.log(parentDivInfo);
	var generationInfo=[];
	var yearSelect = $("#selYear");
	var selID;
	parentDivInfo.forEach(function(d) {
		if (d.id==="divTaylorsBabyNames") {
			return;
		}
		removeBabyNamesFromDOM(d.id);
		if (!d.selRelated) {
			generationInfo.push({
				id:d.id,
				selRelated:false
			});
		}
		else {
			generationInfo.push({
				id:d.id,
				path:"data/names/yob"+yearSelect.val()+".txt",
				selRelated:true
			});
		}
	});
	parentDivInfo=generationInfo;
	//console.log(parentDivInfo);
	genMultipleBabyNameLists(parentDivInfo);
}

function onYearChangeNotGeneric() {
	console.log("onYearChangeNotGeneric(): ");
	//console.log(parentDivInfo);
	yearSelect = $("#selYear");

	removeBabyNamesFromDOM("divAllBabyNames");
	removeBabyChart("divBabyBubbleChart");
	
	setTimeout(onYearChangeAfterRemoving,550);
}

function onYearChangeAfterRemoving() {
	yearSelect = $("#selYear");
	//console.log("onYearChangeAfterRemoving: " +currentlyRemovedElement);
	/*if (currentlyRemovedElement!=="divBabyBubbleChart") {
		return;
	}*/
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