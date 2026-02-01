import json
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import spearmanr, pearsonr

# ---------------------------------------------------------
# 1. Daten laden
# ---------------------------------------------------------

with open("analyzed_data.json", "r", encoding="utf-8") as f:
    raw = json.load(f)

df = pd.DataFrame(raw).T

# numerische Felder konvertieren
numeric_cols = ["LOC", "findings_count", "authors", "forks", "files"]
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# ---------------------------------------------------------
# 2. Findings-Kategorien extrahieren
# ---------------------------------------------------------

def extract_finding(df, category):
    return df["findings_details"].apply(
        lambda x: next((item["count"] for item in x if item["categoryName"] == category), 0)
    )

categories = [
    "Comprehensibility",
    "Correctness",
    "Documentation",
    "Redundancy",
    "Structure",
    "Security",
    "Error Handling",
    "Efficiency",
    "Usability"
]

for cat in categories:
    df[f"find_{cat}"] = extract_finding(df, cat)

print(df.head())

# ---------------------------------------------------------
# 3. Verteilung aller Findings-Kategorien
# ---------------------------------------------------------

for cat in categories:
    plt.figure(figsize=(10,5))
    sns.histplot(df[f"find_{cat}"], kde=True, bins=20)
    plt.title(f"Verteilung: {cat}-Findings")
    plt.xlabel(f"{cat}-Findings")
    plt.ylabel("Projekte")
    plt.show()

# ---------------------------------------------------------
# 4. Findings vs LOC
# ---------------------------------------------------------

for cat in categories:
    col = f"find_{cat}"
    plt.figure(figsize=(8,6))
    sns.scatterplot(data=df, x="LOC", y=col)
    plt.title(f"{cat}-Findings vs LOC")
    plt.xlabel("Lines of Code")
    plt.ylabel(f"{cat}-Findings")
    plt.show()

    corr, _ = spearmanr(df["LOC"], df[col])
    print(f"Spearman-Korrelation LOC vs {cat}: {corr}")

# ---------------------------------------------------------
# 5. Findings vs Autorenanzahl
# ---------------------------------------------------------

for cat in categories:
    col = f"find_{cat}"
    plt.figure(figsize=(8,6))
    sns.scatterplot(data=df, x="authors", y=col)
    plt.title(f"{cat}-Findings vs Autorenanzahl")
    plt.xlabel("Autoren")
    plt.ylabel(f"{cat}-Findings")
    plt.show()

    corr, _ = spearmanr(df["authors"], df[col])
    print(f"Spearman-Korrelation Autoren vs {cat}: {corr}")

# ---------------------------------------------------------
# 6. Findings vs Anzahl Dateien
# ---------------------------------------------------------

for cat in categories:
    col = f"find_{cat}"
    plt.figure(figsize=(8,6))
    sns.scatterplot(data=df, x="files", y=col)
    plt.title(f"{cat}-Findings vs Anzahl Dateien")
    plt.xlabel("Dateien")
    plt.ylabel(f"{cat}-Findings")
    plt.show()

    corr, _ = spearmanr(df["files"], df[col])
    print(f"Spearman-Korrelation Files vs {cat}: {corr}")

# ---------------------------------------------------------
# 7. Findings nach Programmiersprache
# ---------------------------------------------------------

for cat in categories:
    col = f"find_{cat}"
    plt.figure(figsize=(12,6))
    sns.barplot(data=df, x="lang", y=col, estimator="mean")
    plt.title(f"Durchschnittliche {cat}-Findings pro Sprache")
    plt.xticks(rotation=45)
    plt.show()

# ---------------------------------------------------------
# 8. Findings nach Fachgebiet (field)
# ---------------------------------------------------------

for cat in categories:
    col = f"find_{cat}"
    plt.figure(figsize=(12,6))
    sns.barplot(data=df, x="field", y=col, estimator="mean")
    plt.title(f"Durchschnittliche {cat}-Findings pro Fachgebiet")
    plt.xticks(rotation=45)
    plt.show()

# ---------------------------------------------------------
# 9. Ranking der Projekte nach Findings
# ---------------------------------------------------------

for cat in categories:
    col = f"find_{cat}"
    print(f"\nTop 10 Projekte mit den meisten {cat}-Findings:")
    print(df.sort_values(col, ascending=False).head(10)[["name", col]])

# ---------------------------------------------------------
# 10. Heatmap aller Findings-Korrelationen
# ---------------------------------------------------------

heatmap_cols = [f"find_{cat}" for cat in categories] + ["LOC", "findings_count"]

plt.figure(figsize=(14,10))
sns.heatmap(df[heatmap_cols].corr(), annot=True, cmap="coolwarm")
plt.title("Heatmap: Findings-Korrelationen")
plt.show()