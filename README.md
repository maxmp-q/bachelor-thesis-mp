# Bachelor Thesis Maximilian Pickel

This is the official repo for my bachelor thesis.

*Is Code Quality in research software really not as good as in business software?*

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


### data-points.ts

Here you can find the interface for the data-points.

## Automation

Here we use cypress to create all the needed projects in Teamscale.
We use the data.json to iterate all the given data-points and create 
the needed projects with the git connector.

