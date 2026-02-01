import json
import constants
import requests

# Constants for API
BASE_URL = "https://teamscale.cs.uni-koeln.de/"

with open('../data/analyzed_data.json', 'r') as data_file:
    data = json.load(data_file)

    print(f"Wir haben {data.__len__()}  Einträgen zum löschen!")

    for k in data:
        print(f"wir löschen gerade: {k}")
        DELETE_API = f"{BASE_URL}api/v2025.2/projects/{k}"
        print(DELETE_API)
        responses = requests.delete(DELETE_API, auth=(constants.USERNAME, constants.ACCESS_KEY), verify=constants.CERTIFICATE)
        print(responses.status_code)
