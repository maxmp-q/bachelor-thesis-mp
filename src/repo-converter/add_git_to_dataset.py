import csv
import requests


with open('test_dataset.csv', mode='r') as file:
    csvFile = list(csv.reader(file))
    # TODO: Add writer functionality!!!
    writer = csv.writer(file)


    header, rows = csvFile[0], csvFile[1:]

    for lines in rows:
        result = lines[0].split(';')

        name = result[0]
        user, repo = name.split("_", 1)
        url = f"https://github.com/{user}/{repo}"

        response = requests.get(url)

        if response.status_code == 200:
            print(url)

