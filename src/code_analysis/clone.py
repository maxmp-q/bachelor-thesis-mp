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

# JSON in DataFrame umwandeln
df = pd.DataFrame(raw).T

# numerische Felder konvertieren
numeric_cols = ["clone_coverage", "findings_count", "LOC", "authors", "forks", "files"]
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

print(df.head())

# ---------------------------------------------------------
# 2. Verteilung der Clone Coverage
# ---------------------------------------------------------

plt.figure(figsize=(10,5))
sns.histplot(df["clone_coverage"], kde=True, bins=20)
plt.title("Verteilung der Clone Coverage")
plt.xlabel("Clone Coverage")
plt.ylabel("Anzahl Projekte")
plt.show()

plt.figure(figsize=(6,5))
sns.boxplot(x=df["clone_coverage"])
plt.title("Boxplot Clone Coverage")
plt.show()

# ---------------------------------------------------------
# 3. Clone Coverage vs LOC
# ---------------------------------------------------------

plt.figure(figsize=(8,6))
sns.scatterplot(data=df, x="LOC", y="clone_coverage")
plt.title("Clone Coverage vs LOC")
plt.xlabel("Lines of Code")
plt.ylabel("Clone Coverage")
plt.show()

corr_loc, _ = pearsonr(df["LOC"], df["clone_coverage"])
print("Pearson-Korrelation LOC vs Clone Coverage:", corr_loc)

# ---------------------------------------------------------
# 4. Clone Coverage vs Findings Count
# ---------------------------------------------------------

plt.figure(figsize=(8,6))
sns.scatterplot(data=df, x="findings_count", y="clone_coverage")
plt.title("Clone Coverage vs Findings Count")
plt.xlabel("Findings Count")
plt.ylabel("Clone Coverage")
plt.show()

corr_findings, _ = pearsonr(df["findings_count"], df["clone_coverage"])
print("Pearson-Korrelation Findings vs Clone Coverage:", corr_findings)

# ---------------------------------------------------------
# 5. Clone Coverage nach Programmiersprache
# ---------------------------------------------------------

plt.figure(figsize=(10,6))
sns.barplot(data=df, x="lang", y="clone_coverage", estimator="mean")
plt.title("Durchschnittliche Clone Coverage pro Sprache")
plt.xticks(rotation=45)
plt.show()

# ---------------------------------------------------------
# 6. Clone Coverage nach Fachgebiet (field)
# ---------------------------------------------------------

plt.figure(figsize=(10,6))
sns.barplot(data=df, x="field", y="clone_coverage", estimator="mean")
plt.title("Durchschnittliche Clone Coverage pro Fachgebiet")
plt.xticks(rotation=45)
plt.show()

# ---------------------------------------------------------
# 7. Clone Coverage vs Autorenanzahl
# ---------------------------------------------------------

plt.figure(figsize=(8,6))
sns.scatterplot(data=df, x="authors", y="clone_coverage")
plt.title("Clone Coverage vs Autorenanzahl")
plt.xlabel("Autoren")
plt.ylabel("Clone Coverage")
plt.show()

corr_authors, _ = spearmanr(df["authors"], df["clone_coverage"])
print("Spearman-Korrelation Autoren vs Clone Coverage:", corr_authors)

# ---------------------------------------------------------
# 8. Clone Coverage vs Anzahl Dateien
# ---------------------------------------------------------

plt.figure(figsize=(8,6))
sns.scatterplot(data=df, x="files", y="clone_coverage")
plt.title("Clone Coverage vs Anzahl Dateien")
plt.xlabel("Dateien")
plt.ylabel("Clone Coverage")
plt.show()

corr_files, _ = spearmanr(df["files"], df["clone_coverage"])
print("Spearman-Korrelation Files vs Clone Coverage:", corr_files)

# ---------------------------------------------------------
# 9. Clone Coverage vs Redundancy Findings
# ---------------------------------------------------------

# Redundancy extrahieren
df["redundancy_findings"] = df["findings_details"].apply(
    lambda x: next((item["count"] for item in x if item["categoryName"] == "Redundancy"), 0)
)

plt.figure(figsize=(8,6))
sns.scatterplot(data=df, x="redundancy_findings", y="clone_coverage")
plt.title("Clone Coverage vs Redundancy Findings")
plt.xlabel("Redundancy Findings")
plt.ylabel("Clone Coverage")
plt.show()

corr_redundancy, _ = spearmanr(df["redundancy_findings"], df["clone_coverage"])
print("Spearman-Korrelation Redundancy vs Clone Coverage:", corr_redundancy)

# ---------------------------------------------------------
# 10. Ranking der Projekte
# ---------------------------------------------------------

ranking = df.sort_values("clone_coverage", ascending=False)
print("\nTop 10 Projekte mit höchster Clone Coverage:")
print(ranking.head(10)[["name", "clone_coverage"]])

print("\nBottom 10 Projekte mit niedrigster Clone Coverage:")
print(ranking.tail(10)[["name", "clone_coverage"]])

# ---------------------------------------------------------
# 11. Heatmap: Clone Coverage vs Method Length / Nesting Depth
# ---------------------------------------------------------

df["method_red"] = df["method_length"].apply(lambda x: x["red"])
df["method_yellow"] = df["method_length"].apply(lambda x: x["yellow"])
df["method_green"] = df["method_length"].apply(lambda x: x["green"])

heatmap_df = df[["clone_coverage", "method_red", "method_yellow", "method_green"]]

plt.figure(figsize=(8,6))
sns.heatmap(heatmap_df.corr(), annot=True, cmap="coolwarm")
plt.title("Heatmap: Clone Coverage vs Method Length")
plt.show()