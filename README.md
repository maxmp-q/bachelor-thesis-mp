# Bachelor Thesis Maximilian Pickel

This is the official repo for my bachelor thesis.

*Is the Quality of Code in Business Software really better than in Research Software?*

## Dashboard

In this small angular app you can find different charts where the analyzed data is displayed.
In Boxplots, Bar Charts, Line Charts, Scatter Plots and Word Clouds the main metrics are
displayed.

To Start this app Node.js is required.

The app is deployed in GitHub Pages: https://maxmp-q.github.io/bachelor-thesis-mp/

## Src
### converter.py

In the directory '/src' you can find the converter.py. This utility creates a data.json 
file with an array of data-points. It reads the dataset.csv to get the name, the language 
and the GitHub-Url. It also checks, that the Repo is accessible. The used rows of the 
dataset.csv are picked randomly to avoid biased data-points.

Here are example entries of the data.json:
```json
{
  "aiqm_torchani": {
    "name": "aiqm_torchani",
    "url": "https://github.com/aiqm/torchani",
    "lang_profile": "Python (default)",
    "lang": "Python",
    "lang_from_csv": "Python",
    "authors": "22",
    "forks": "57",
    "files": "7200",
    "field": "Chemistry",
    "default_branch": "main"
  },
  "google-research_planet": {
    "name": "google-research_planet",
    "url": "https://github.com/google-research/planet",
    "lang_profile": "Python (default)",
    "lang": "Python",
    "lang_from_csv": "Python",
    "authors": "25",
    "forks": "168",
    "files": "690",
    "field": "Computer Science",
    "default_branch": "master"
  }
}
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
- Lines of Code
- Type of findings
  - Comprehensibility
  - Correctness 
  - Documentation
  - Efficiency
  - Error Handling
  - Redundancy
  - Structure
  - Usability
  - Security

Here is an example entry of the analyzed_data.json:
```json
{
  "neo-x_promp": {
    "name": "neo-x_promp",
    "lang": "Python",
    "clone_coverage": 0.19676484789956541,
    "findings_count": 709.0,
    "LOC": 9397.0,
    "method_length": {
      "red": 85,
      "yellow": 925,
      "green": 2760
    },
    "nesting_depth": {
      "red": 0,
      "yellow": 393,
      "green": 3377
    },
    "findings_details": [
      {
        "categoryName": "Comprehensibility",
        "count": 138,
        "countRed": 0
      },
      {
        "categoryName": "Correctness",
        "count": 36,
        "countRed": 0
      },
      {
        "categoryName": "Documentation",
        "count": 422,
        "countRed": 1
      },
      {
        "categoryName": "Redundancy",
        "count": 64,
        "countRed": 0
      },
      {
        "categoryName": "Security",
        "count": 1,
        "countRed": 0
      },
      {
        "categoryName": "Structure",
        "count": 48,
        "countRed": 1
      }
    ],
    "authors": 20,
    "forks": 34,
    "files": 2237,
    "field": "Computer Science"
  }
}
```

### data-points.ts

Here you can find the interface for the data-points and the analyzed data.

## Automation

Here we use Cypress to create all the needed projects in Teamscale.
We use the data.json to iterate all the given data-points and create 
the needed projects with the git connector.

