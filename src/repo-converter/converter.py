import csv
import requests
import json
import random

data = {}

# Use Teamscale API to get all current projects git accounts and
# filter for them, that only new projects are created/send to data.json.
all_projects =  []
all_git_accounts = []

TEAMSCALE_URL = "https://teamscale.cs.uni-koeln.de/api/v2025.2/projects"
GIT_ACCOUNTS_URL = "https://teamscale.cs.uni-koeln.de/api/external-accounts"
USERNAME = ""
ACCESS_KEY = ""
CERTIFICATE = R""

all_current_projects = requests.get(TEAMSCALE_URL, auth=(USERNAME, ACCESS_KEY), verify=CERTIFICATE)
all_current_git_accounts = requests.get(GIT_ACCOUNTS_URL, auth=(USERNAME, ACCESS_KEY), verify=CERTIFICATE)

for project in all_current_projects.json():
    all_projects.append(project["name"])

for project in all_current_git_accounts.json():
    all_git_accounts.append(project["credentialsName"])

# A map to get all language profiles
profile_map = {
    "Ada" : "Ada (default)",
    "C/C++" : "C++ (default)",
    "C" : "C (default)",
    "C++" : "C++ (default)",
    "Cobol" : "COBOL (default)",
    "Dart" : "Dart (default)",
    "Fortran" : "Fortran (default)",
    "Go" : "Go (default)",
    "Java" : "Java (default)",
    "JavaScript" : "JavaScript/TypeScript (default)",
    "Kotlin" : "Kotlin (default)",
    "Python" : "Python (default)",
    "Sql" : "Extended SQL (ESQL)(default)",
    "Swift" : "Swift (default)",
    "TypeScript" : "JavaScript/TypeScript (default)"
}

analysis_profile_standard = "Line-based Text"

# Get the converted lang profile and if the profile doesn't exist use the standard profile.
def get_lang_profile(_lang):
    value = profile_map.get(_lang)
    return value if value is not None else analysis_profile_standard

def get_lang(_name, _lang):
    _author, _repo = _name.split('_', 1)
    _URL = f"https://api.github.com/repos/{_author}/{_repo}/languages"
    _GIT_TOKEN = ""
    headers = {"Authorization": f"token {_GIT_TOKEN}"}
    _data = requests.get(_URL, headers=headers).json()

    if _data and isinstance(_data, dict):
        _main_lang = max(_data, key=_data.get)

        print("API:", _main_lang)
        print("Erwartet:", _lang)

        return _main_lang
    else:
        return _lang


print("Starte die CSV zu lesen!")

with open('dataset.csv', mode='r') as file:
    csvFile = list(csv.reader(file))

    header, rows = csvFile[0], csvFile[1:]

    # Choose random rows
    random_rows = random.sample(rows, 500)

    for lines in random_rows:
        result = lines[0].split(';')

        # only scientific
        if result[1] == '1':
            name = result[0]
            if name not in all_projects and name not in all_git_accounts:
                user, repo = name.split("_", 1)
                url = f"https://github.com/{user}/{repo}"
                response = requests.get(url)

                _language = get_lang(name,result[13])

                entry = {
                    "name" : name,
                    "url" : url,
                    "lang_profile" : get_lang_profile(_language),
                    "lang" : _language,
                    "lang_from_csv" : result[13],
                    "authors" : result[5],
                    "forks" : result[8],
                    "files" : result[10],
                    "field" : result[28],
                }

                if response.status_code == 200:
                    data[entry["name"]] = entry
                    print(f"Wir sind bei {data.__len__()} Datenpunkten!")

        if data.__len__() >= 25:
            break

print("Mach alles ins Json!")

with open("data.json", mode="w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Habe fertig!")