import requests
import json

data = []

project = {
    "name": "00mjk_filter_functions",
    "lang": "Python"
}

FINDINGS_URL = f"https://teamscale.cs.uni-koeln.de/api/projects/{project["name"]}/findings/summary?uniform-path=&baseline=1&t=master%3AHEAD&blacklisted=EXCLUDED"
ALL_FINDINGS_URL = f"https://teamscale.cs.uni-koeln.de/api/v2025.2/projects/{project["name"]}/findings/list?case-insensitive-path=false&start=0&max=1000"
ALL_METRICS_URL = f"https://teamscale.cs.uni-koeln.de/api/projects/{project["name"]}/metrics?t=master%3AHEAD&uniform-path="
USERNAME = ""
ACCESS_KEY = ""
CERTIFICATE = R"C:\Users\maxmp\teamscale.cs.uni-koeln.de.crt"

findings_json = requests.get(FINDINGS_URL, auth=(USERNAME, ACCESS_KEY), verify=CERTIFICATE).json()
metrics_json = requests.get(ALL_METRICS_URL, auth=(USERNAME, ACCESS_KEY), verify=CERTIFICATE).json()

metrics_values = metrics_json['metricValues']
loc = metrics_values[1]
findings_count = metrics_values[11]
clone_coverage = metrics_values[17]

# [red, 0, yellow, green, 0, 0]
method_length = metrics_values[5]['mapping']
m_red = method_length[0]
m_yellow = method_length[2]
m_green = method_length[3]
used_method_length = {
    "red" : m_red,
    "yellow" : m_yellow,
    "green" : m_green
}

# [red, 0, yellow, green, 0, 0]
nesting_depth = metrics_values[7]['mapping']
n_red = nesting_depth[0]
n_yellow = nesting_depth[2]
n_green = nesting_depth[3]
used_nesting = {
    "red" : n_red,
    "yellow" : n_yellow,
    "green" : n_green
}

findings_categories = findings_json['categoryInfos']


# print(loc)
# print(method_length)
# print(nesting_depth)
# print(findings_count)
# print(findings_categories)
# print(method_length_yellow)

entry = {
    "name" : project["name"],
    "lang" : project["lang"],
    "clone_coverage" : clone_coverage,
    "findings_count" : findings_count,
    "LOC" : loc,
    "method_length" : used_method_length,
    "nesting_depth" : used_nesting,
    "findings_details" : 0 # TODO: muss das array noch machen
}

data.append(entry)

with open("analyzed_data.json", mode="w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

