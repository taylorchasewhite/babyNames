/*
	Global vars
*/
var babyNameData,parentDivID;

function babyNamesInitialize(elementID) {
	if (elementID) {
		parentDivID=elementID;
	}
	else {
		parentDivID="divBabyNames";
	}
	loadBabyNameData();
}

function loadBabyNameData() {
	d3.tsv("./babyNames.tsv",function(error,data) {
		if (error) {
			throw error;
		}
		data.sort(function(a,b) {
			return d3.ascending(a.Name,b.Name);
		});
		babyNameData=data;
		bindBabyNamesToDOM(data);
	});
}

function bindBabyNamesToDOM(babyData) {
	if(!babyData) {
		babyData=babyNameData;
	}
	var list=d3.select("#"+parentDivID).append("ul");
	list.selectAll("li")
	.data(babyData)
	.enter()
	.append("li")
	.text(function(d) {
		return d.Name;
	})
	.attr("class",function(d) {
		if (d.Sex==="Girl") {
			return "girl";
		}
		else if (d.Sex==="Boy") {
			return "boy";
		}
		else {
			return "both";	
		}
	});
}