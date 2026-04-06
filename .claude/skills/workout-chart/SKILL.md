---
name: workout-chart
description: >
  Generates a monthly workout frequency bar chart for the past year by querying the app's
  PostgreSQL database and producing a PNG image. Use this skill whenever the user asks to
  visualize workout history, plot workout frequency, generate a chart of workouts, see how
  many workouts they did per month, or export any chart/graph of their training data — even
  if they don't say "chart" explicitly (e.g. "show me my workout history" or "how consistent
  have I been this year" should also trigger this).
---

# Workout Chart Skill

This skill queries the `workouts` table in the app's PostgreSQL database for all entries
from the past 12 months, counts workouts per calendar month, and exports a bar chart as a
PNG image.

## How to execute

Run the bundled script, passing the database URL from the `.env` file:

```bash
# 1. Read the DATABASE_URL from .env
# 2. Install dependencies if needed
pip install psycopg2-binary matplotlib python-dotenv --quiet

# 3. Run the script from the project root so it can find .env automatically
python .claude/skills/workout-chart/scripts/generate_chart.py
```

The script:
- Reads `DATABASE_URL` from `.env` in the current working directory (project root)
- Queries `workouts` for rows where `started_at` falls within the past 12 months
- Groups by calendar month
- Renders a bar chart (x = month label like "Jan 2025", y = number of workouts)
- Saves the image to `workout_chart.png` in the current working directory

After running, tell the user where the file was saved and show a brief summary of the
data (e.g., most active month, total workouts in the period).

## Error handling

- If `DATABASE_URL` is not found in `.env`, print a clear error and stop.
- If `psycopg2` fails to connect, surface the error message so the user can debug.
- If there are zero workouts in the past year, still produce a chart (all bars at 0) and
  note this to the user.

## Output

- File: `workout_chart.png` (PNG, ~800×500px)
- Chart title: "Workouts per Month (Last 12 Months)"
- X-axis: month labels in chronological order ("Jan 2025", "Feb 2025", …)
- Y-axis: integer count of workouts, labelled "Number of Workouts"
- Bars should be a solid accent colour (default: steelblue)
- Each bar should have the count printed above it for quick reading
