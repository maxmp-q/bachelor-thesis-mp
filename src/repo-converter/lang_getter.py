import csv
import json
import requests
import random


with open('../data/all_langs_git.json', 'r') as git_file:
    git = json.load(git_file)

def get_lang(_name, _lang):
    _author, _repo = _name.split('_', 1)
    _URL = f"https://api.github.com/repos/{_author}/{_repo}/languages"
    _GIT_TOKEN = "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"
    headers = {"Authorization": f"token {_GIT_TOKEN}"}
    try:
        _data = requests.get(_URL, headers=headers).json()

        if _data and isinstance(_data, dict):
            _main_lang = max(_data, key=_data.get)

            print("API:", _main_lang)
            print("Erwartet:", _lang)

            return _main_lang
        else:
            return _lang

    except requests.exceptions.RequestException as e:
        print(e)
        return _lang


with open('dataset.csv', mode='r') as file:
    csvFile = list(csv.reader(file))

    header, rows = csvFile[0], csvFile[1:]
    random_rows = random.sample(rows, 500)

    for lines in random_rows:
        result = lines[0].split(';')
        name = result[0]
        lang_for_csv = result[13]

        git.append(get_lang(name, lang_for_csv))


with open("all_langs_git.json", mode="w", encoding="utf-8") as f:
    json.dump(list(set(git)), f, indent=2)

print(set(git))
print("Habe fertig!")