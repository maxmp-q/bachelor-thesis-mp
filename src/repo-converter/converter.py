import csv
import requests


woc_ids = []
urls =[]


def get_data(_project_id):
    _url = f"https://worldofcode.org/api/mongo/project/search?q={_project_id}&limit=20"
    _response = requests.get(_url)
    _json_data = _response.json()
    return _json_data


with open('dataset.csv', mode='r') as file:
    csvFile = csv.reader(file)
    i = 0
    for lines in csvFile:
        if i > 0:
            result = lines[0].split(';')
            # only scientific
            if result[1] == '1':
                woc_ids.append(result[0])
        i += 1
        if i >= 20:
            break

for woc_id in woc_ids:
    data = get_data(woc_id)
    project_ids = [proj["ProjectID"] for proj in data["data"]]
    print(woc_id)

    for p in project_ids:
        user, repo = p.split("_", 1)
        url = f"https://github.com/{user}/{repo}"
        response = requests.get(url)
        if response.status_code == 200:
            urls.append(url)
            print(f"https://github.com/{user}/{repo}")


print(f"all urls: {urls}")
print(f"how many urls? {urls.__len__()} ")

