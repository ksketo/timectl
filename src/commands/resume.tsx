import React, { useState, useEffect } from "react";
import { render, Box, Text, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import { v4 as uuidv4 } from "uuid";
import { getRecentEntries, saveEntry } from "../lib/storage.ts";
import { formatDuration } from "../lib/format.ts";
import { Timer } from "../components/Timer.tsx";
import type { TimeEntry } from "../types.ts";

interface TaskOption {
  category: string;
  description: string;
}

function ResumeApp() {
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [selected, setSelected] = useState<TaskOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [startedAt] = useState(new Date().toISOString());
  const { exit } = useApp();

  useInput(
    (input, key) => {
      if (key.escape || input.toLowerCase() === "q") {
        exit();
      }
    },
    { isActive: !selected }
  );

  useEffect(() => {
    getRecentEntries(30).then((entries) => {
      const seen = new Set<string>();
      const unique: TaskOption[] = [];
      // Most recent first
      for (const e of [...entries].reverse()) {
        const key = `${e.category}::${e.description}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push({ category: e.category, description: e.description });
        }
      }
      setTasks(unique);
      setLoading(false);
    });
  }, []);

  const handleStop = async (elapsedSeconds: number) => {
    const entry: TimeEntry = {
      id: uuidv4(),
      category: selected!.category,
      description: selected!.description,
      startedAt,
      stoppedAt: new Date().toISOString(),
      durationMinutes: Math.round(elapsedSeconds / 60 * 100) / 100,
    };
    await saveEntry(entry);
    console.log(
      `\n✓ Tracked ${formatDuration(entry.durationMinutes)} on [${entry.category}] ${entry.description}`
    );
  };

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text dimColor>Loading recent tasks...</Text>
        <Text dimColor>Press Q to cancel</Text>
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No recent tasks to resume. Use "timectl start" first.</Text>
        <Text dimColor>Press Q to cancel</Text>
      </Box>
    );
  }

  if (!selected) {
    const items = tasks.map((t) => ({
      label: `[${t.category}] ${t.description}`,
      value: `${t.category}::${t.description}`,
    }));

    return (
      <Box flexDirection="column">
        <Text bold color="cyan">
          Select a task to resume:
        </Text>
        <SelectInput
          items={items}
          onSelect={(item) => {
            const [category, ...descParts] = item.value.split("::");
            setSelected({
              category: category!,
              description: descParts.join("::"),
            });
          }}
        />
        <Text dimColor>Press Q to cancel</Text>
      </Box>
    );
  }

  return (
    <Timer
      category={selected.category}
      description={selected.description}
      onStop={handleStop}
    />
  );
}

export async function resumeCommand() {
  render(<ResumeApp />);
}
