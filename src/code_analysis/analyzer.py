import requests
import json
import constants

print("Read current analyzed_data.json!")
with open('../data/analyzed_data.json', 'r') as data_file:
    data = json.load(data_file)
    print(f"We start at {data.__len__()}  entries!")

# Constants for API
BASE_URL = "https://teamscale.cs.uni-koeln.de/"

# Helper Functions
def api_get(url):
    """Wrapper for GET-Requests with RequestException."""
    try:
        response = requests.get(url, auth=(constants.USERNAME, constants.ACCESS_KEY), verify=constants.CERTIFICATE)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API-Request not good: {e}")


def get_all_findings(_findings_categories):
    """Converts all findings to my used format and return it for the data entry"""
    _findings = []
    for finding in _findings_categories:
        _findings_entry = {
            "categoryName" : finding["categoryName"],
            "count" : finding["count"],
            "countRed" : finding["countRed"]
        }

        _findings.append(_findings_entry)
    return _findings

def extract_mapping(_mapping, red = 0, yellow = 2, green = 3):
    """Extract the mapping from nesting_depth and method_length"""
    return {
        "red" : _mapping[red],
        "yellow" : _mapping[yellow],
        "green" : _mapping[green]
    }

print("Read data.json!")
# Gets the data from data.json with the projects in Teamscale.
with open('../data/data.json', 'r') as file:
    _data = json.load(file)

    for data_point in _data.values():
        print(data_point["name"])
        # URLS
        FINDINGS_URL = f"{BASE_URL}api/projects/{data_point["name"].lower()}/findings/summary?uniform-path=&baseline=1&t={data_point["default_branch"]}%3AHEAD&blacklisted=EXCLUDED"
        ALL_FINDINGS_URL = f"{BASE_URL}api/v2025.2/projects/{data_point["name"].lower()}/findings/list?case-insensitive-path=false&start=0&max=1000"
        ALL_METRICS_URL = f"{BASE_URL}api/projects/{data_point["name"].lower()}/metrics?t={data_point["default_branch"]}%3AHEAD&uniform-path="

        # Do API requests
        findings_json = api_get(FINDINGS_URL)
        metrics_json = api_get(ALL_METRICS_URL)

        if not findings_json or not metrics_json or not metrics_json['metricValues']:
            continue

        # Get the metrics
        metrics_values = metrics_json['metricValues']
        loc = metrics_values[1]
        findings_count = metrics_values[11]
        clone_coverage = metrics_values[17]
        # [red, 0, yellow, green, 0, 0]
        method_length = metrics_values[5]['mapping']
        # [red, 0, yellow, green, 0, 0]
        nesting_depth = metrics_values[7]['mapping']
        findings_categories = findings_json['categoryInfos']

        # Create entry
        entry = {
            "name" : data_point["name"],
            "lang" : data_point["lang"],
            "clone_coverage" : clone_coverage,
            "findings_count" : findings_count,
            "LOC" : loc,
            "method_length" : extract_mapping(method_length),
            "nesting_depth" : extract_mapping(nesting_depth),
            "findings_details" : get_all_findings(findings_categories),
            "authors" : int(data_point["authors"]),
            "forks" : int(data_point["forks"]),
            "files" : int(data_point["files"]),
            "field" : data_point["field"],
        }

        data[data_point["name"]] = entry
        print(f"We have {data.__len__()} entries!")

print("Dump data into json!")
# Dump the data to analyzed_data.json
with open("analyzed_data.json", mode="w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

