const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");

function loadApp(year = "2025") {
    let html;
    const context = vm.createContext({
        console,
        $: () => ({val: () => year}),
        d3: {
            ascending: (a, b) => a < b ? -1 : a > b ? 1 : 0,
            select: () => ({append: () => ({html: fn => { html = fn(); }})}),
        },
    });
    vm.runInContext(fs.readFileSync(path.join(root, "babyNames.js"), "utf8"), context);
    return {context, search(rows, name) {
        context.searchThroughBabyData(rows, "results", name);
        return html;
    }};
}

function rowsFor(year) {
    return fs.readFileSync(path.join(root, "data", "names", `yob${year}.txt`), "utf8")
        .trim().split(/\r?\n/).slice(1).map(line => {
            const [Name, Sex, BirthCount] = line.split(",");
            return {Name, Sex, BirthCount};
        });
}

test("all published years are continuous, complete, valid name/sex datasets", () => {
    const source = JSON.parse(fs.readFileSync(path.join(root, "data", "source.json")));
    const years = fs.readFileSync(path.join(root, "data", "years.tsv"), "utf8")
        .trim().split(/\r?\n/).slice(1).map(Number);
    assert.deepEqual(years, Array.from({length: source.yearCount}, (_, i) => 1880 + i));
    assert.equal(years.at(-1), source.latestYear);
    assert.ok(source.latestYear >= 2025);
    for (const year of years) {
        const rows = rowsFor(year);
        const seen = new Set();
        assert.ok(rows.some(row => row.Sex === "F") && rows.some(row => row.Sex === "M"));
        for (const row of rows) {
            assert.match(row.Name, /^[A-Za-z]+$/);
            assert.match(row.Sex, /^[FM]$/);
            assert.ok(Number.isInteger(+row.BirthCount) && +row.BirthCount >= 5);
            const key = row.Name + "," + row.Sex;
            assert.ok(!seen.has(key), `${year}: duplicate ${key}`);
            seen.add(key);
        }
    }
});

test("2025 leaders and rare names return correct within-sex ranks and counts", () => {
    const app = loadApp();
    const rows = rowsFor(2025);
    assert.match(app.search(rows.slice(), "liam"), /Liam was the 1st/);
    assert.match(app.search(rows.slice(), "Liam"), /20,818 boy babies named Liam/);
    assert.match(app.search(rows.slice(), "OLIVIA"), /Olivia was the 1st/);
    assert.match(app.search(rows.slice(), "Olivia"), /13,544 girl babies named Olivia/);
    assert.match(app.search(rows.slice(), "Gradyn"), /7 boy babies named Gradyn/);
    assert.match(app.search(rows.slice(), "Taylor"), /772 girl babies named Taylor/);
    assert.match(app.search(rows.slice(), "Taylor"), /398 boy babies named Taylor/);
});

test("ties are alphabetical and missing names are not reported as zero births", () => {
    const app = loadApp();
    const rows = [
        {Name: "Zoe", Sex: "F", BirthCount: "50"},
        {Name: "Amy", Sex: "F", BirthCount: "50"},
        {Name: "Ben", Sex: "M", BirthCount: "80"},
    ];
    assert.match(app.search(rows.slice(), "Zoe"), /Zoe was the 2nd/);
    assert.match(app.search(rows.slice(), "Amy"), /Amy was the 1st/);
    assert.match(app.search(rows.slice(), "Amy"), /No public SSA record for boys/);
    const missing = app.search(rows.slice(), "NotARecordedName");
    assert.match(missing, /fewer than five occurrences are suppressed/);
    assert.doesNotMatch(missing, /no babies born|none of them/);
});

test("year paths use the selected year and the entry point's relative data root", () => {
    const app = loadApp("1880");
    app.context.dataRoot = "../data/";
    assert.equal(app.context.getPathFromYear(), "../data/names/yob1880.txt");
    assert.throws(() => loadApp(null).context.getPathFromYear(), /Choose a loaded birth year/);
});

test("a late search response cannot overwrite the newest result", () => {
    const app = loadApp();
    const callbacks = [];
    app.context.d3.csv = (url, callback) => callbacks.push(callback);
    const rendered = [];
    app.context.searchThroughBabyData = (rows, parent, term) => rendered.push(term);
    app.context.searchBabyNameData(["results"], "data/names/yob2024.txt", "Mary");
    app.context.searchBabyNameData(["results"], "data/names/yob2025.txt", "Liam");
    callbacks[1](null, []);
    callbacks[0](null, []);
    assert.deepEqual(rendered, ["Liam"]);
});
