import React, { useState } from "react";
import { render } from "ink";
import { v4 as uuidv4 } from "uuid";
import { loadConfig, saveConfig } from "../lib/config.ts";
import { saveEntry } from "../lib/storage.ts";
import { formatDuration } from "../lib/format.ts";
import { CategoryPicker } from "../components/CategoryPicker.tsx";
import { Timer } from "../components/Timer.tsx";
import type { TimeEntry } from "../types.ts";

interface Props {
  description: string;
  categories: string[];
}

function StartApp({ description, categories }: Props) {
  const [category, setCategory] = useState<string | null>(null);
  const [startedAt] = useState(new Date().toISOString());

  const handleStop = async (elapsedSeconds: number) => {
    const entry: TimeEntry = {
      id: uuidv4(),
      category: category!,
      description,
      startedAt,
      stoppedAt: new Date().toISOString(),
      durationMinutes: Math.round(elapsedSeconds / 60 * 100) / 100,
    };
    await saveEntry(entry);
    console.log(
      `\n✓ Tracked ${formatDuration(entry.durationMinutes)} on [${entry.category}] ${entry.description}`
    );
  };

  const handleAddCategory = async (name: string) => {
    const config = await loadConfig();
    if (!config.categories.includes(name)) {
      config.categories.push(name);
      await saveConfig(config);
    }
  };

  if (!category) {
    return (
      <CategoryPicker
        categories={categories}
        onSelect={(c) => setCategory(c)}
        onAddCategory={handleAddCategory}
      />
    );
  }

  return (
    <Timer category={category} description={description} onStop={handleStop} />
  );
}

export async function startCommand(description: string) {
  const config = await loadConfig();
  render(<StartApp description={description} categories={config.categories} />);
}
