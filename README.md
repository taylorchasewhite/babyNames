[![](babyNamesScreenshot.png)](https://taylorchasewhite.github.io/babyNames/)
[![](searchScreenshot.png)](https://taylorchasewhite.github.io/babyNames/search.html)

## November 25, 2026 data refresh

The chart and checker now cover **1880-2025**, using the complete official
[SSA national archive](https://www.ssa.gov/oact/babynames/names.zip)
downloaded November 25, 2026. **2025 is the latest available birth year**;
2026 birth counts are not yet available. All historical files were refreshed
from the same release, including SSA's revisions to earlier years.

Both tools select the newest year from `data/years.tsv` after it loads, rather
than hardcoding a year. The list displays the top 1,000 name/sex entries; the
bubble chart shows entries with at least 30% of the most popular name's count.
The checker searches the complete published year file, including rare names.
Ranks start at 1 within each sex and ties are ordered alphabetically.

SSA excludes names with fewer than five occurrences and does not cover every
U.S. birth. A missing name is not proof of zero births. Percentages use the
total counts in the public file, not all births. See
[SSA's limitations](https://www.ssa.gov/oact/babynames/limits.html) and the
included `data/names/NationalReadMe.pdf`.

### Refreshing the data

Download `names.zip` from SSA's National data link, then run:

```powershell
python scripts\import_ssa.py C:\Downloads\names.zip --retrieved YYYY-MM-DD
node --test tests\babyNames.test.cjs
```

The dependency-free importer validates every record and year before writing,
adds the CSV header expected by D3, regenerates the year manifest, and records
the source URL, retrieval date, coverage, and archive SHA-256 in `data/source.json`.
Original row order and the repository's header-LF/row-CRLF format are preserved.
No runtime request to SSA is needed; GitHub Pages serves the imported files.

For browser checks, serve this directory over HTTP (for example,
`python -m http.server 8000 --bind 127.0.0.1`) and open `/`, `/search.html`, and
`/chart/`. Confirm the newest year loads, switch to 1880 and back, and search
for Liam, Olivia, Taylor, and a missing name.

## Members

<dl>
<dt><a href="#babyNameData">babyNameData</a></dt>
<dd><p>Using data from the US Social Security Administration, this file will generate an SVG
bubble chart that displays the frequency of the occurrence of that name in a given year.
Available years and the default year come from the imported SSA year manifest.</p>

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
<dt><a href="#babyNameSearchInitialize">babyNameSearchInitialize(generationData)</a></dt>
<dd><p>Initialize HTML elements needed to trigger searches</p>
</dd>
<dt><a href="#getReturnString">getReturnString(maleNameResults, femaleNameResults, sizeOfSet)</a> ⇒</dt>
<dd><p>Return back a friendly string that details how popular a given name was for both boys and girls</p>
</dd>
<dt><a href="#getSexAheadString">getSexAheadString(birthCount)</a> ⇒</dt>
<dd><p>Add the ordinal suffix to numbers greater than zero, otherwise return empty string</p>
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
Available years and the default year come from the imported SSA year manifest.

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

<a name="babyNameSearchInitialize"></a>

## babyNameSearchInitialize(generationData)
Initialize HTML elements needed to trigger searches

**Kind**: global function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| generationData | <code>Object</code> | Array of JSON data structured like so: |
| generationData.id | <code>Array.&lt;string&gt;</code> | An array of div IDs indicating where to render content 							[0] - The div ID to contain the ordered list 										[1] - The div ID to containt the bubble chart |
| generationData.path | <code>string</code> | Path to the file with data to load |
| generationData.searchTerm | <code>string</code> | The term we are to search for |

<a name="getReturnString"></a>

## getReturnString(maleNameResults, femaleNameResults, sizeOfSet) ⇒
Return back a friendly string that details how popular a given name was for both boys and girls

**Kind**: global function  
**Returns**: string - A nicely formatted string detailing the popularity of a name  

| Param | Type | Description |
| --- | --- | --- |
| maleNameResults | <code>Array.&lt;Object&gt;</code> | Contains the search result data for males born in a given year |
| femaleNameResults | <code>Array.&lt;Object&gt;</code> | Contains the search result data for females born in a given year |
| sizeOfSet | <code>number</code> | The total size of the number of names born in a given year |

<a name="getSexAheadString"></a>

## getSexAheadString(birthCount) ⇒
Add the ordinal suffix to numbers greater than zero, otherwise return empty string

**Kind**: global function  
**Returns**: - The ordinal suffix of a number  

| Param | Type | Description |
| --- | --- | --- |
| birthCount | <code>any</code> | number of babies born |

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
