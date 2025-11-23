import csv
import requests
import json

data = []

possible_analysis_profiles = [
    'Go', 'PHP', 'JavaScript', 'Lua', 'Clojure',
    'Rust', 'Python', 'OCaml', 'Java', 'R', 'fml',
    'Julia', 'Perl', 'Lisp', 'Sql', 'Cobol', 'Scala',
    'C/C++', 'TypeScript', 'Ada', 'other', 'Basic',
    'Kotlin', 'Fortran', 'Swift', 'Erlang', 'Ruby', 'Dart'
]

not_possible = [
    "Basic", "Clojure", "Erlang", "fml", "Julia",
    "Lisp", "Lua", "OCaml", "other", "Perl",
    "R", "Ruby", "Rust", "Scala"
]

possible = [
    "Ada", "C/C++", "Cobol", "Dart", "Fortran",
    "Go", "Java", "JavaScript", "Kotlin", "Python",
    "Sql", "Swift", "TypeScript"
]

transformed_profiles = [
    "Ada", "C", "COBOL", "Dart", "Fortran",
    "Go", "Java", "JavaScript/TypeScript", "Kotlin"
    "Python", "Extended SQL (ESQL)", "Swift", "JavaScript/TypeScript"
]

analysis_profile_standard = "Line-based Text"

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


# TODO: Make possible a map!
def get_lang(_lang):
    if _lang in not_possible:
        return analysis_profile_standard

    if _lang in possible:

        return




