import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import chalk from "chalk";

const ADD_NEW_SENTINEL = "__new__";

interface Props {
  categories: string[];
  onSelect: (category: string) => void;
  onAddCategory?: (category: string) => void;
}

function NewCategoryInput({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = useState("");

  useInput((input, key) => {
    if (key.return) {
      onSubmit(value);
      return;
    }
    if (key.backspace || key.delete) {
      setValue((prev) => prev.slice(0, -1));
      return;
    }
    if (!key.ctrl && !key.meta && input) {
      setValue((prev) => prev + input);
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        Enter new category name:
      </Text>
      <Box>
        <Text color="green">{"> "}</Text>
        <Text>{value}</Text>
      </Box>
    </Box>
  );
}

export function CategoryPicker({ categories, onSelect, onAddCategory }: Props) {
  const [isAdding, setIsAdding] = useState(false);

  const items = [
    ...categories.map((c) => ({ label: c, value: c })),
    { label: chalk.gray("Add new category"), value: ADD_NEW_SENTINEL },
  ];

  const handleSelect = (item: { value: string }) => {
    if (item.value === ADD_NEW_SENTINEL) {
      setIsAdding(true);
      return;
    }
    onSelect(item.value);
  };

  const handleSubmitNew = (value: string) => {
    const normalized = value.trim().replace(/\s+/g, "-").toLowerCase();
    if (!normalized) return;
    onAddCategory?.(normalized);
    onSelect(normalized);
  };

  if (isAdding) {
    return <NewCategoryInput onSubmit={handleSubmitNew} />;
  }

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        Select a category:
      </Text>
      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  );
}
