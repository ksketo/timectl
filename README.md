# ⏱️ timectl

Track how you spend your time from the terminal—by project or theme—without signing up for anything or opening a browser app.

**Minimal by design.** One person, one computer. No accounts, no cloud service, no database to manage. The goal is a small tool that stays out of the way: start when you begin, stop when you’re done, and look back when you want to understand your week or month.

**🤖 AI Analysis**: Ask for a plain-language read on how your time actually went: where the hours went, blind spots, patterns, and ideas to adjust, not just numbers in a table. That step talks to an AI service using only the slice of data you choose; the rest of your history stays on your machine.

**What you can do**

- Start and stop timers tied to categories you define  
- Jump back into recent tasks without retyping descriptions  
- Browse summaries for today, recent days, weeks, and months  
- Export your data for your own notes, reports, or other tools  
- Rename or merge categories across past entries when your system evolves  
- Open an "insights" view for AI-backed reflection on a week or month  

---

## 🚀 Getting started

### Requirements

- [Bun](https://bun.com) 1.x

### Install

Clone the repository, install dependencies, then run the CLI from the project root:

> Clone via SSH (or use `https://github.com/ksketo/timectl.git` if you prefer HTTPS)

```bash
git clone git@github.com:ksketo/timectl.git
cd timectl
bun install
bun run src/index.ts --help
```

#### Compile to a standalone binary

```bash
bun run bundle
```

This compiles a single executable and installs it to `/usr/local/bin/timectl` (requires `sudo`). After that, use `timectl` anywhere.

### Setting up AI analysis

Insights use [Anthropic](https://www.anthropic.com/)’s API (Claude). You need an API key before `timectl insights` can run.

1. Create a key in the [Anthropic Console](https://console.anthropic.com/) (or your team’s usual workflow).
2. Expose it as **`ANTHROPIC_API_KEY`**:
   - **Shell / OS environment:** `export ANTHROPIC_API_KEY='your-key'` (or set the variable in your shell profile or system settings). Use this especially if you run a compiled `timectl` binary from anywhere on your machine.
   - **`.env` file:** In the directory where you run the CLI (for example the cloned repo), create or edit `.env` with `ANTHROPIC_API_KEY=your-key`. Bun loads `.env` automatically when you use `bun run …`.
3. Run **`timectl insights`** and choose **This Week** or **This Month**. You need some saved time entries in that range, or the command will report that there’s nothing to analyze.

Only structured data for the period you pick is sent to the API; the rest of your history stays in files under `~/.timectl/`.

## 🧰 Commands

### `timectl start <description>`

Start tracking a task. You’ll pick a category interactively, then see a live timer (spinner + elapsed time). Press **Q** to stop; the entry is saved under `~/.timectl/`.

### `timectl resume`

Lists your recent unique tasks (category + description) from the last 30 days. Select one to start a new timer with the same details. Press **Q** to cancel.

### `timectl history`

Interactive tabbed view: **Today**, **Yesterday**, **This Week**, **This Month**.

| Key | Action |
|-----|--------|
| `← →` | Switch tabs |
| `↑ ↓` | Select an entry |
| `E` / `Enter` | Edit the selected entry |
| `Q` | Quit |

Each tab shows category totals, percentages, and individual entries.

### `timectl export [options]`

Prints time data to stdout.

| Flag | Values | Default |
|------|--------|---------|
| `-p, --period` | `day`, `week`, `month` | `day` |
| `-d, --date` | `YYYY-MM-DD` | today |
| `-f, --format` | `json`, `markdown` | `json` |

The JSON output is intended to be easy to pipe into other tools or AI workflows.

### `timectl categories`

| Subcommand | Description |
|------------|-------------|
| `categories list` | List all configured categories |
| `categories add <name>` | Add a new category |
| `categories remove <name>` | Remove a category |
| `categories migrate <from> <to>` | Move all entries from `<from>` to `<to>`, add `<to>` if needed, remove `<from>` |

**Default categories** (created on first run): `development`, `it-support`, `sync`, `planning`, `external-meeting`

### `timectl insights`

**AI-powered review** of how you actually spent time. Pick **This Week** or **This Month**, then read streamed output from Claude: where your hours went, what’s missing from the picture, recurring patterns, and practical recommendations—not just raw tables.

Configure your API key first. See [Setting up AI analysis](#setting-up-ai-analysis) (uses Claude through the Vercel AI SDK).

## 🗂️ Where data lives

Everything under `~/.timectl/` on your machine—no hosted backend.

```
~/.timectl/
  config.json          # categories
  data/
    YYYY/MM/DD.json    # time entries for that calendar day
```

Each day file is a JSON array of entries. One entry looks like this:

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

`config.json` holds your category list (and is updated when you add, remove, or migrate categories).

## 🧱 Tech stack

Bun · TypeScript · Commander · Ink (React) · flat JSON files (no database) · optional Claude for `insights`

## 🤝 Contributing

Issues and pull requests are welcome.
