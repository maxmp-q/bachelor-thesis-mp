import json
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import pearsonr, spearmanr

# ---------------------------------------------------------
# 1. Daten laden
# ---------------------------------------------------------

with open("analyzed_data.json", "r", encoding="utf-8") as f:
    raw = json.load(f)

df = pd.DataFrame(raw).T

# numerische Felder extrahieren
df["method_red"] = df["method_length"].apply(lambda x: x["red"])
df["method_yellow"] = df["method_length"].apply(lambda x: x["yellow"])
df["method_green"] = df["method_length"].apply(lambda x: x["green"])

numeric_cols = ["LOC", "findings_count", "authors", "forks", "files"]
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

print(df.head())

# ---------------------------------------------------------
# 2. Verteilung der Method Length Kategorien
# ---------------------------------------------------------

plt.figure(figsize=(10,5))
sns.histplot(df["method_red"], kde=True, bins=20)
plt.title("Verteilung: Anzahl roter Methoden")
plt.xlabel("Anzahl roter Methoden")
plt.ylabel("Projekte")
plt.show()

plt.figure(figsize=(10,5))
sns.histplot(df["method_yellow"], kde=True, bins=20)
plt.title("Verteilung: Anzahl gelber Methoden")
plt.xlabel("Anzahl gelber Methoden")
plt.ylabel("Projekte")
plt.show()

plt.figure(figsize=(10,5))
sns.histplot(df["method_green"], kde=True, bins=20)
plt.title("Verteilung: Anzahl grüner Methoden")
plt.xlabel("Anzahl grüner Methoden")
plt.ylabel("Projekte")
plt.show()

# ---------------------------------------------------------
# 3. Method Length vs LOC
# ---------------------------------------------------------

for col in ["method_red", "method_yellow", "method_green"]:
    plt.figure(figsize=(8,6))
    sns.scatterplot(data=df, x="LOC", y=col)
    plt.title(f"{col} vs LOC")
    plt.xlabel("Lines of Code")
    plt.ylabel(col)
    plt.show()

    corr, _ = spearmanr(df["LOC"], df[col])
    print(f"Spearman-Korrelation LOC vs {col}: {corr}")

# ---------------------------------------------------------
# 4. Method Length vs Findings Count
# ---------------------------------------------------------

for col in ["method_red", "method_yellow", "method_green"]:
    plt.figure(figsize=(8,6))
    sns.scatterplot(data=df, x="findings_count", y=col)
    plt.title(f"{col} vs Findings Count")
    plt.xlabel("Findings Count")
    plt.ylabel(col)
    plt.show()

    corr, _ = spearmanr(df["findings_count"], df[col])
    print(f"Spearman-Korrelation Findings vs {col}: {corr}")

# ---------------------------------------------------------
# 5. Method Length nach Programmiersprache
# ---------------------------------------------------------

plt.figure(figsize=(12,6))
sns.barplot(data=df, x="lang", y="method_red", estimator="mean")
plt.title("Durchschnitt rote Methoden pro Sprache")
plt.xticks(rotation=45)
plt.show()

plt.figure(figsize=(12,6))
sns.barplot(data=df, x="lang", y="method_yellow", estimator="mean")
plt.title("Durchschnitt gelbe Methoden pro Sprache")
plt.xticks(rotation=45)
plt.show()

plt.figure(figsize=(12,6))
sns.barplot(data=df, x="lang", y="method_green", estimator="mean")
plt.title("Durchschnitt grüne Methoden pro Sprache")
plt.xticks(rotation=45)
plt.show()

# ---------------------------------------------------------
# 6. Method Length nach Fachgebiet (field)
# ---------------------------------------------------------

for col in ["method_red", "method_yellow", "method_green"]:
    plt.figure(figsize=(12,6))
    sns.barplot(data=df, x="field", y=col, estimator="mean")
    plt.title(f"Durchschnitt {col} pro Fachgebiet")
    plt.xticks(rotation=45)
    plt.show()

# ---------------------------------------------------------
# 7. Method Length vs Autorenanzahl
# ---------------------------------------------------------

for col in ["method_red", "method_yellow", "method_green"]:
    plt.figure(figsize=(8,6))
    sns.scatterplot(data=df, x="authors", y=col)
    plt.title(f"{col} vs Autorenanzahl")
    plt.xlabel("Autoren")
    plt.ylabel(col)
    plt.show()

    corr, _ = spearmanr(df["authors"], df[col])
    print(f"Spearman-Korrelation Autoren vs {col}: {corr}")

# ---------------------------------------------------------
# 8. Method Length vs Anzahl Dateien
# ---------------------------------------------------------

for col in ["method_red", "method_yellow", "method_green"]:
    plt.figure(figsize=(8,6))
    sns.scatterplot(data=df, x="files", y=col)
    plt.title(f"{col} vs Anzahl Dateien")
    plt.xlabel("Dateien")
    plt.ylabel(col)
    plt.show()

    corr, _ = spearmanr(df["files"], df[col])
    print(f"Spearman-Korrelation Files vs {col}: {corr}")

# ---------------------------------------------------------
# 9. Ranking der Projekte nach Method Length
# ---------------------------------------------------------

print("\nTop 10 Projekte mit den meisten roten Methoden:")
print(df.sort_values("method_red", ascending=False).head(10)[["name", "method_red"]])

print("\nTop 10 Projekte mit den meisten gelben Methoden:")
print(df.sort_values("method_yellow", ascending=False).head(10)[["name", "method_yellow"]])

print("\nTop 10 Projekte mit den meisten grünen Methoden:")
print(df.sort_values("method_green", ascending=False).head(10)[["name", "method_green"]])

# ---------------------------------------------------------
# 10. Heatmap: Method Length Korrelationen
# ---------------------------------------------------------

heatmap_df = df[["method_red", "method_yellow", "method_green", "LOC", "findings_count"]]

plt.figure(figsize=(10,7))
sns.heatmap(heatmap_df.corr(), annot=True, cmap="coolwarm")
plt.title("Heatmap: Method Length Korrelationen")
plt.show()