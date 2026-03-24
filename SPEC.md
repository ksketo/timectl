# timectl — Personal CLI Time Tracker

A minimal, local-only CLI time tracker for solo use. Track time spent on categorized tasks with an interactive terminal UI, store entries locally as JSON, and export reports for humans or agents.

## Commands

### `timectl start <description>`
Start tracking a task. Prompts for a category via an interactive selector, then launches a live animated timer (spinner + elapsed HH:MM:SS). Press **Q** to stop. The entry is saved to the local store.

### `timectl resume`
Shows a list of recent unique tasks (by category + description). Select one to start a new timer with the same category and description.

### `timectl history`
Opens an interactive tabbed view with three periods: **Today**, **This Week**, **This Month**. Navigate with **← →** arrow keys. Each tab shows a table of categories with total time and percentage breakdown, plus individual entries.

### `timectl export [options]`
Export time data to stdout.

| Flag | Values | Default |
|------|--------|---------|
| `-p, --period` | `day`, `week`, `month` | `day` |
| `-d, --date` | `YYYY-MM-DD` | today |
| `-f, --format` | `json`, `markdown` | `json` |

The `json` format is designed to be piped directly to an AI agent.

### `timectl categories`
List all configured categories.

- `timectl categories add <name>` — add a new category
- `timectl categories remove <name>` — remove a category
- `timectl categories migrate <from> <to>` — rewrite all stored entries from `<from>` to `<to>`, ensure `<to>` exists in config, and remove `<from>` from the category list

### `timectl insights`
Interactive AI-powered analysis of your time tracking data. Launches a TUI with:

1. **Period selection** — choose "This Week" or "This Month"
2. **Date picker** — scroll-based year/month/day selector (↑↓ to change, ←→ to switch segments)
3. **AI analysis** — streams insights from Claude including time allocation, gap analysis, work patterns, and recommendations

Requires `ANTHROPIC_API_KEY` in your environment or `.env` file. Uses Claude Sonnet 4.6 via the Vercel AI SDK.

## Storage

All data is stored locally under `~/.timectl/`:

```
~/.timectl/
  config.json                # list of categories
  data/
    YYYY/
      MM/
        DD.json              # array of time entries for that day
```

### Time entry format
```json
{
  "id": "uuid",
  "category": "development",
  "description": "implement auth flow",
  "startedAt": "2026-03-19T09:00:00Z",
  "stoppedAt": "2026-03-19T10:30:00Z",
  "durationMinutes": 90
}
```

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **CLI framework**: Commander
- **Interactive UI**: Ink (React for CLI)
- **Storage**: JSON files (no database)
