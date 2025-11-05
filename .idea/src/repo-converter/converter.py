import csv

with open('dataset.csv', mode='r') as file:
    csvFile = csv.reader(file)
    i = 0
    for lines in csvFile:
        result = lines[0].split(';')
        print(result[0])
        i += 1
        if i >= 5:
            break