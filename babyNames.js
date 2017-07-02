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
	loadYearsData();
	loadBabyNameData();
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
	})
}

function loadBabyNameData() {
	d3.tsv("./data/babyNames.tsv",function(error,data) {
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

function addSelectHandler() {
	var yearSelect = $("#selYear");
	
	yearSelect.change(function() {
		//generateDropdown(appSelect.val());
		window.location.href = "http://taylorchasewhite.com/d3/nabu/Shared/?app="+yearSelect.val();
	});
	
}