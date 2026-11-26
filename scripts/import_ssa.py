"""Import the official SSA national ZIP without third-party dependencies."""

import argparse
import csv
import hashlib
import io
import json
from pathlib import Path
import re
import zipfile


def import_archive(archive, retrieved):
    root = Path(__file__).resolve().parents[1]
    datasets = {}
    with zipfile.ZipFile(archive) as source:
        for filename in source.namelist():
            match = re.fullmatch(r"yob(\d{4})\.txt", filename)
            if not match:
                continue
            year = int(match[1])
            text = source.read(filename).decode("ascii")
            rows = list(csv.reader(io.StringIO(text)))
            seen = set()
            for row in rows:
                if (len(row) != 3 or not re.fullmatch(r"[A-Za-z]+", row[0])
                        or row[1] not in ("F", "M")
                        or not row[2].isdigit() or int(row[2]) < 5):
                    raise ValueError(f"Invalid SSA record in {filename}: {row}")
                key = (row[0], row[1])
                if key in seen:
                    raise ValueError(f"Duplicate name/sex in {filename}: {key}")
                seen.add(key)
            if not rows or {row[1] for row in rows} != {"F", "M"}:
                raise ValueError(f"Incomplete dataset: {filename}")
            datasets[year] = "\r\n".join(",".join(row) for row in rows) + "\r\n"
        years = sorted(datasets)
        if not years or years != list(range(1880, years[-1] + 1)):
            raise ValueError("Expected continuous national data from 1880.")
        existing = [int(p.stem[3:]) for p in (root / "data/names").glob("yob*.txt")]
        if existing and years[-1] < max(existing):
            raise ValueError("Refusing to replace the dataset with an older release.")
        readme = source.read("NationalReadMe.pdf")

    # Validate every input before updating any of the checked-in data files.
    for year, text in datasets.items():
        (root / f"data/names/yob{year}.txt").write_bytes(
            ("Name,Sex,BirthCount\n" + text).encode("ascii"))
    (root / "data/years.tsv").write_text(
        "Year\n" + "\n".join(map(str, years)) + "\n", encoding="ascii", newline="\n")
    (root / "data/names/NationalReadMe.pdf").write_bytes(readme)
    metadata = {
        "source": "https://www.ssa.gov/oact/babynames/names.zip",
        "documentation": "https://www.ssa.gov/oact/babynames/limits.html",
        "retrieved": retrieved,
        "archiveSha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
        "firstYear": years[0],
        "latestYear": years[-1],
        "yearCount": len(years),
        "transformation": "Original SSA rows with Name,Sex,BirthCount header; existing header-LF/row-CRLF format preserved.",
    }
    (root / "data/source.json").write_text(
        json.dumps(metadata, indent=2) + "\n", encoding="ascii", newline="\n")
    print(f"Imported {len(years)} complete years: {years[0]}-{years[-1]}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("--retrieved", required=True, help="Download date, YYYY-MM-DD")
    args = parser.parse_args()
    import_archive(args.archive, args.retrieved)
