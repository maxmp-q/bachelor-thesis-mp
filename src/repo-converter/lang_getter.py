import json
import requests
from constants import GITHUB_ACCESS_KEY


def get_lang(_name, _lang):
    _author, _repo = _name.split('_', 1)
    _URL = f"https://api.github.com/repos/{_author}/{_repo}/languages"
    headers = {"Authorization": f"token {GITHUB_ACCESS_KEY}"}
    try:
        _data = requests.get(_URL, headers=headers).json()

        if _data and isinstance(_data, dict):
            _main_lang = max(_data, key=_data.get)

            print("API:", _main_lang)
            print("from csv::", _lang)

            return _main_lang
        else:
            return _lang

    except requests.exceptions.RequestException as e:
        print(e)
        return _lang


if __name__ == "__main__":
    langDict = {}

    with open('analyzed_data.json', mode='r') as file:
        data = json.load(file)

    for point in data.values():
        name = point['name']
        print(name)
        author, repo = name.split('_', 1)
        _GITURL = f"https://api.github.com/repos/{author}/{repo}/languages"
        _headers = {"Authorization": f"token {GITHUB_ACCESS_KEY}"}

        response = requests.get(_GITURL, headers=_headers).json()

        _main = 0
        _sum = 0
        try:
            for lang in response.values():
                _sum += lang
                if _main <= lang:
                    _main = lang

            _percentage = 0

            if _sum != 0:
                _percentage = _main / _sum

            langDict[name] = {
                "name" : name,
                "main" : _main,
                "sum" : _sum,
                "percentage" : _percentage
            }
        except:
            print("kaka am dampfen!!")

        print(f"{langDict.__len__()} von {data.values().__len__()}")


    with open("lang/langsForConc.json", mode="w", encoding="utf-8") as f:
        json.dump(langDict, f, indent=2)

    print(langDict)
    print("Habe fertig!")