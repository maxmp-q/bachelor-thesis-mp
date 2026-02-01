import csv
import requests
import json
import random

data = []

# GitHub API Token
GIT_TOKEN = ""
HEADERS = {"Authorization": f"token {GIT_TOKEN}"}


def safe_get(_url, headers=None):
    """GET-Request mit Timeout + Fehlerbehandlung."""
    try:
        _response = requests.get(_url, headers=headers)
        _response.raise_for_status()
        return _response
    except requests.exceptions.RequestException as e:
        print(f"Request-Fehler bei {_url}: {e}")
    return None


def get_lang(_name, _lang):
    """Sprache über GitHub API holen."""
    _author, _repo = _name.split('_', 1)
    _URL = f"https://api.github.com/repos/{_author}/{_repo}/languages"

    _response = safe_get(_URL, headers=HEADERS)
    if not _response:
        return None, None

    _data = _response.json()
    if _data and isinstance(_data, dict):
        _main_lang = max(_data, key=_data.get)
        return _main_lang, _data

    return _lang, _data


print("Starte die CSV zu lesen!")

with open('dataset/dataset.csv', mode='r') as file:
    csvFile = list(csv.reader(file))

    header, rows = csvFile[0], csvFile[1:]

    random_rows = random.sample(rows, 200)

    for idx, lines in enumerate(random_rows, start=1):
        print(idx)

        result = lines[0].split(';')
        name = result[0]
        user, repo = name.split("_", 1)

        url = f"https://github.com/{user}/{repo}"

        # GitHub Repo checken
        response = safe_get(url)
        if not response:
            continue

        print(url)

        _language, _used_data = get_lang(name, result[13])
        if not _language or not _used_data:
            continue

        entry = {
            "name": name,
            "url": url,
            "lang": _language,
            "lang_from_csv": result[13],
            "_data": _used_data
        }

        # Nur speichern, wenn Sprache abweicht
        if _language != result[13]:
            if (_language in ["C", "C++"]) and result[13] == "C/C++":
                continue

            data.append(entry)
            print(f"Wir sind bei {len(data)} Datenpunkten!")

print("Mach alles ins Json!")

with open("lang/language.json", mode="w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Habe fertig!")