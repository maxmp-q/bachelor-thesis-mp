# Bachelor Thesis Maximilian Pickel

This is the official repo for my bachelor thesis.

*Is the Quality of Code in Business Software really better than in Research Software?*

## Src
### converter.py

In the directory '/src' you can find the converter.py. This utility creates a data.json 
file with an array of data-points. It reads the dataset.csv to get the name, the language 
and the GitHub-Url. It also checks, that the Repo is accessible. The used rows of the 
dataset.csv are picked randomly to avoid biased data-points.

Here is an example of the data.json:
```json
[
  {
    "name": "jpgattuso_seacarb-git",
    "url": "https://github.com/jpgattuso/seacarb-git",
    "lang": "Line-based Text"
  },
  {
    "name": "Nowosad_geostat_book",
    "url": "https://github.com/Nowosad/geostat_book",
    "lang": "Line-based Text"
  },
  {
    "name": "chenguanzhou_CDTStudio",
    "url": "https://github.com/chenguanzhou/CDTStudio",
    "lang": "C (default)"
  }
]
```

### add_git_to_dataset.py

In the directory '/src' you can find the add_git_to_dataset.py. This utility adds a new column to
the dataset.csv and fills it with the checked GitHub Repo Urls, as in the converter.py.

### analyzer.py

In the directory '/src' you can find the analyzer.py. This utility reads all the projects 
in Teamscale that are in data.json. It gets the following code quality metrics from the 
Teamscale-API.

The metrics are:

- Clone Coverage
- Nesting Depth
- Method Length
- Type of findings
- Test Coverage
- Lines of Code

Here is an example of the analyzed_data.json:
```json
[
  
  {
    "name": "jgomezdans_gp_emulator",
    "lang": "Python",
    "clone_coverage": 0.05303030303030303,
    "findings_count": 42.0,
    "LOC": 1981.0,
    "method_length": {
      "red": 101,
      "yellow": 103,
      "green": 465
    },
    "nesting_depth": {
      "red": 0,
      "yellow": 43,
      "green": 626
    },
    "findings_details": [
      {
        "categoryName": "Comprehensibility",
        "count": 8,
        "countRed": 0
      },
      {
        "categoryName": "Correctness",
        "count": 4,
        "countRed": 0
      },
      {
        "categoryName": "Documentation",
        "count": 21,
        "countRed": 0
      },
      {
        "categoryName": "Redundancy",
        "count": 5,
        "countRed": 0
      },
      {
        "categoryName": "Structure",
        "count": 4,
        "countRed": 1
      }
    ]
  }
]
```

### data-points.ts

Here you can find the interface for the data-points and the analyzed data.

## Automation

Here we use cypress to create all the needed projects in Teamscale.
We use the data.json to iterate all the given data-points and create 
the needed projects with the git connector.

