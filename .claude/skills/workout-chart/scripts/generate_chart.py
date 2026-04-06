#!/usr/bin/env python3
"""
generate_chart.py
Queries the liftingdiary workouts table for the past 12 months and exports
a monthly bar chart as workout_chart.png in the current working directory.
"""

import os
import sys
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from pathlib import Path

# ---------------------------------------------------------------------------
# 1. Load DATABASE_URL from .env
# ---------------------------------------------------------------------------
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(".env"))
except ImportError:
    # dotenv not available — fall back to os.environ only
    pass

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found. Make sure .env exists in the project root "
          "and contains a DATABASE_URL entry.", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# 2. Query the database
# ---------------------------------------------------------------------------
try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("ERROR: psycopg2 is not installed. Run:\n  pip install psycopg2-binary",
          file=sys.stderr)
    sys.exit(1)

now = datetime.now(timezone.utc)
one_year_ago = now - relativedelta(years=1)

SQL = """
SELECT
    DATE_TRUNC('month', started_at) AS month,
    COUNT(*) AS workout_count
FROM workouts
WHERE started_at >= %(start)s
GROUP BY 1
ORDER BY 1
"""

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute(SQL, {"start": one_year_ago})
    rows = cur.fetchall()
    cur.close()
    conn.close()
except Exception as e:
    print(f"ERROR: Could not connect to or query the database.\n{e}", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# 3. Build a complete 12-month series (fill months with 0 workouts)
# ---------------------------------------------------------------------------
# Generate the 12 month buckets in order
months = []
for i in range(12):
    m = (one_year_ago + relativedelta(months=i + 1)).replace(day=1,
                                                              hour=0, minute=0,
                                                              second=0, microsecond=0)
    months.append(m)

# Map query results by month start
data = {row["month"].replace(tzinfo=timezone.utc): row["workout_count"] for row in rows}

labels = []
counts = []
for m in months:
    labels.append(m.strftime("%b %Y"))
    counts.append(data.get(m, 0))

# ---------------------------------------------------------------------------
# 4. Plot and export
# ---------------------------------------------------------------------------
try:
    import matplotlib
    matplotlib.use("Agg")  # non-interactive backend — safe for headless environments
    import matplotlib.pyplot as plt
    import matplotlib.ticker as ticker
except ImportError:
    print("ERROR: matplotlib is not installed. Run:\n  pip install matplotlib",
          file=sys.stderr)
    sys.exit(1)

fig, ax = plt.subplots(figsize=(10, 5))

bars = ax.bar(labels, counts, color="steelblue", edgecolor="white", linewidth=0.5)

# Print count above each bar
for bar, count in zip(bars, counts):
    if count > 0:
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.1,
            str(count),
            ha="center", va="bottom", fontsize=9, color="#333333"
        )

ax.set_title("Workouts per Month (Last 12 Months)", fontsize=14, pad=14)
ax.set_xlabel("Month", fontsize=11)
ax.set_ylabel("Number of Workouts", fontsize=11)
ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))
ax.set_ylim(bottom=0)
plt.xticks(rotation=45, ha="right", fontsize=8)
plt.tight_layout()

output_path = Path("workout_chart.png")
fig.savefig(output_path, dpi=150)
plt.close(fig)

# ---------------------------------------------------------------------------
# 5. Summary
# ---------------------------------------------------------------------------
total = sum(counts)
print(f"Chart saved to: {output_path.resolve()}")
print(f"Total workouts in the last 12 months: {total}")
if total > 0:
    peak_idx = counts.index(max(counts))
    print(f"Most active month: {labels[peak_idx]} ({counts[peak_idx]} workouts)")
else:
    print("No workouts found in the past 12 months — chart shows empty bars.")
