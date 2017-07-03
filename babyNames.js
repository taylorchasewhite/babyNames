/*
	Global vars
*/
var babyNameData,parentDivInfo;

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

function genBabyNameList(elementID,path) {
	var parentDivID;
	
	// element to build in
	if (elementID) {
		parentDivID=elementID;
	}
	else {
		parentDivID="divBabyNames";
	}
	// path
	if (!path) {
		path="./data/babyNames.csv";
	}
	
	loadBabyNameData(parentDivID,path);
}

function loadBabyNameData(parentDivID,path) {	
	console.log('loadBabyNameData:'+ parentDivID + ", " + path);
	d3.csv(path,function(error,data) {
		if (error) {
			throw error;
		}
		babyNameData=data;
		bindBabyNamesToDOM(data,parentDivID);
		generateBabyBubbleChart(data,parentDivID);
	});
}

function generateBabyBubbleChart(babyData,parentDivID) {
	if (parentDivID!=="divAllBabyNames") {
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
	
	var chart = bubbleChart().width(960).height(960).minRadius(7).maxRadius(55).forceApart(-170);
	chart.columnForColors("Sex").columnForRadius("BirthCount").unitName("babies").columnForTitle("Name");
	chart.customColors(["M","F"],["#70b7f0","#e76486"]).showTitleOnCircle(true);
	console.log(chart.showTitleOnCircle());
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
	d3.select("#"+parentDivID)
		.selectAll("ul").remove();
	var svg=d3.select("#"+parentDivID).select("svg");
	svg.selectAll("g").remove();
}

function loadYearsData() {
	d3.tsv("./data/years.tsv",function (error,data) {
		if (error) {
			throw error;
		}
		
		data.sort( function (a,b) {
			return d3.descending(a.Year,b.Year);
		});
		
		var containingDiv=d3.selectAll("body").insert("div",":nth-child(2)");
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
	});
}

function addSelectHandler() {
	var yearSelect = $("#selYear");

	yearSelect.change(function() {
		onYearChange();
	});
	
}

function onYearChange() {
	console.log("onYearChange(): ");
	console.log(parentDivInfo);
	var generationInfo=[];
	var yearSelect = $("#selYear");
	var selID;
	parentDivInfo.forEach(function(d) {
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
	console.log(parentDivInfo);
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