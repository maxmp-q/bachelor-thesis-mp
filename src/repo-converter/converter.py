import csv
import requests
import json

data = []

with open('dataset.csv', mode='r') as file:
    csvFile = csv.reader(file)
    i = 0
    for lines in csvFile:
        if i > 0:
            result = lines[0].split(';')
            # only scientific
            if result[1] == '1':
                name = result[0]
                user, repo = name.split("_", 1)
                url = f"https://github.com/{user}/{repo}"

                response = requests.get(url)

                entry = {
                    "name" : name,
                    "url" : url,
                    "lang" : result[13]
                }

                if response.status_code == 200:
                    data.append(entry)
        i += 1
        if i >= 100:
            break

with open("data.json", mode="w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)



