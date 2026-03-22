import csv
import requests

# TODO: Change .csv files to real files!!

# Read the input file
with open('dataset/dataset.csv', mode='r', newline='') as infile:
    csvFile = list(csv.reader(infile))
    header, rows = csvFile[0], csvFile[1:]

# Write to a new output file
with open('dataset/valid_repos.csv', mode='w', newline='') as outfile:
    writer = csv.writer(outfile)

    _header = header[0].split(';')
    _header.append("GitHubRepos")
    writer.writerow(_header)  # header row

    for lines in rows:
        result = lines[0].split(';')

        name = result[0]
        user, repo = name.split("_", 1)
        url = f"https://github.com/{user}/{repo}"

        response = requests.get(url)
        if response.status_code == 200:
            result.append(url)

        writer.writerow(result)