import csv
import requests


woc_ids = []
urls =[]


with open('dataset.csv', mode='r') as file:
    csvFile = csv.reader(file)
    i = 0
    for lines in csvFile:
        if i > 0:
            result = lines[0].split(';')
            # only scientific
            if result[1] == '1':
                woc_ids.append(result[0])
                print(result[0])
                print(result[13])
        i += 1
        if i >= 30:
            break

for woc_id in woc_ids:
    user, repo = woc_id.split("_", 1)
    url = f"https://github.com/{user}/{repo}"
    response = requests.get(url)
    if response.status_code == 200:
        urls.append(url)
        # print(f"https://github.com/{user}/{repo}")


print(f"all urls: {urls}")
print(f"how many urls? {urls.__len__()} ")
print(f"how many woc_ids? {woc_ids.__len__()} ")


