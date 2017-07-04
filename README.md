[![](babyNamesScreenshot.png)](https://taylorchasewhite.github.io/babyNames/)
## Members

<dl>
<dt><a href="#babyNameData">babyNameData</a></dt>
<dd><p>Using data from the US Social Security Administration, this file will generate an SVG
bubble chart that displays the frequency of the occurrence of that name in a given year.
The data goes from 1880-Present (2016) as of Summer 2017.</p>

Check out the live example [here](https://taylorchasewhite.github.io/babyNames/).
</dd>
</dl>

## Functions

<dl>
<dt><a href="#babyNamesInitialize">babyNamesInitialize(generationData)</a></dt>
<dd><p>Generates the DOM elements into specified DIVs from specified datasets.</p>
</dd>
<dt><a href="#genMultipleBabyNameLists">genMultipleBabyNameLists(generationData)</a></dt>
<dd><p>Generate baby name lists for multiple</p>
</dd>
<dt><a href="#genBabyNameList">genBabyNameList(elementIDs, path)</a></dt>
<dd><p>Generates a list and bubble chart of baby names into the DOM</p>
</dd>
<dt><a href="#generateBabyBubbleChart">generateBabyBubbleChart(babyData, parentDivID)</a></dt>
<dd><p>Generates the D3 SVG to display and renders the bubble chart</p>
</dd>
<dt><a href="#bindBabyNamesToDOM">bindBabyNamesToDOM(babyData, parentDivID)</a></dt>
<dd><p>Generates the D3 ordered list from the data.</p>
</dd>
<dt><a href="#removeBabyNamesFromDOM">removeBabyNamesFromDOM(parentDivID)</a></dt>
<dd><p>Remove the list of names from the DOM</p>
</dd>
<dt><a href="#removeBabyChart">removeBabyChart(parentDivID)</a></dt>
<dd><p>Remove the bubble chart containing the data regarding names for a year</p>
</dd>
</dl>

<a name="babyNameData"></a>

## babyNameData
Using data from the US Social Security Administration, this file will generate an SVG
bubble chart that displays the frequency of the occurrence of that name in a given year.
The data goes from 1880-Present (2016) as of Summer 2017.

**Kind**: global variable  
**Summary**: Generate a bubble chart showing frequency of US names by year.  
**Requires**: <code>module:d3.v4.js</code>, <code>module:jquery</code>  
**Since**: 07.04.17  
**Author**: Taylor White <whitetc2@gmail.com>  
<a name="babyNamesInitialize"></a>

## babyNamesInitialize(generationData)
Generates the DOM elements into specified DIVs from specified datasets.

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| generationData | <code>Object</code> | Array of JSON data structured like so: |
| generationData.id | <code>Array.&lt;string&gt;</code> | An array of div IDs indicating where to render content 							[0] - The div ID to contain the ordered list 										[1] - The div ID to containt the bubble chart |
| generationData.path | <code>string</code> | Path to the file with data to load |
| generationData.selRelated | <code>string</code> | Indicates if this dataset should be relaoded when changing years |

<a name="genMultipleBabyNameLists"></a>

## genMultipleBabyNameLists(generationData)
Generate baby name lists for multiple

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| generationData | <code>Object</code> | Array of JSON data structured like so: |
| generationData.id | <code>Array.&lt;string&gt;</code> | An array of div IDs indicating where to render content 							[0] - The div ID to contain the ordered list 										[1] - The div ID to containt the bubble chart |
| generationData.path | <code>string</code> | Path to the file with data to load |
| generationData.selRelated | <code>string</code> | Indicates if this dataset should be relaoded when changing years |

<a name="genBabyNameList"></a>

## genBabyNameList(elementIDs, path)
Generates a list and bubble chart of baby names into the DOM

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| elementIDs | <code>Array.&lt;string&gt;</code> | An array of html element IDs (length of 2) 								[0] - The div ID to contain the ordered list 								[1] - The div ID to containt the bubble chart |
| path | <code>string</code> | The path to the SSA csv data for a given year |

<a name="generateBabyBubbleChart"></a>

## generateBabyBubbleChart(babyData, parentDivID)
Generates the D3 SVG to display and renders the bubble chart

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| babyData | <code>Array.&lt;Object&gt;</code> | An array of JSONs representing the baby data |
| babyData[].Name | <code>Object</code> | Name of the child being born |
| babyData[].Sex | <code>Object</code> | The sex of the baby born (can be M/F). |
| babyData[].BirthCount | <code>Object</code> | The number of babies born thtat year |
| parentDivID | <code>string</code> | The div to containt the chart |

<a name="bindBabyNamesToDOM"></a>

## bindBabyNamesToDOM(babyData, parentDivID)
Generates the D3 ordered list from the data.

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| babyData | <code>Array.&lt;Object&gt;</code> | The array of JSON data containing names, their sex and frequency |
| babyData[].Name | <code>Object</code> | Name of the child being born |
| babyData[].Sex | <code>Object</code> | The sex of the baby born (can be M/F). |
| babyData[].BirthCount | <code>Object</code> | The number of babies born thtat year |
| parentDivID | <code>string</code> | The div to render the ordered list into. |

<a name="removeBabyNamesFromDOM"></a>

## removeBabyNamesFromDOM(parentDivID)
Remove the list of names from the DOM

**Kind**: global function  
**Access**: public  

| Param | Type |
| --- | --- |
| parentDivID | <code>string</code> | 

<a name="removeBabyChart"></a>

## removeBabyChart(parentDivID)
Remove the bubble chart containing the data regarding names for a year

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| parentDivID | <code>string</code> | HTML element ID to remove data from |
