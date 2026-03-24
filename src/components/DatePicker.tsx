import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

interface Props {
  year: number;
  month: number;
  day: number;
  onChange: (year: number, month: number, day: number) => void;
  isFocused: boolean;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

type Segment = "year" | "month" | "day";
const SEGMENTS: Segment[] = ["year", "month", "day"];

export function DatePicker({ year, month, day, onChange, isFocused }: Props) {
  const [segment, setSegment] = useState<Segment>("year");
  const currentYear = new Date().getFullYear();

  useInput(
    (_input, key) => {
      if (key.leftArrow) {
        const idx = SEGMENTS.indexOf(segment);
        if (idx > 0) setSegment(SEGMENTS[idx - 1]!);
        return;
      }
      if (key.rightArrow) {
        const idx = SEGMENTS.indexOf(segment);
        if (idx < SEGMENTS.length - 1) setSegment(SEGMENTS[idx + 1]!);
        return;
      }

      if (key.upArrow) {
        if (segment === "year") {
          const newYear = Math.min(year + 1, currentYear);
          const maxDay = daysInMonth(newYear, month);
          onChange(newYear, month, Math.min(day, maxDay));
        } else if (segment === "month") {
          const newMonth = month >= 12 ? 1 : month + 1;
          const maxDay = daysInMonth(year, newMonth);
          onChange(year, newMonth, Math.min(day, maxDay));
        } else {
          const maxDay = daysInMonth(year, month);
          onChange(year, month, day >= maxDay ? 1 : day + 1);
        }
        return;
      }

      if (key.downArrow) {
        if (segment === "year") {
          const newYear = Math.max(year - 1, currentYear - 2);
          const maxDay = daysInMonth(newYear, month);
          onChange(newYear, month, Math.min(day, maxDay));
        } else if (segment === "month") {
          const newMonth = month <= 1 ? 12 : month - 1;
          const maxDay = daysInMonth(year, newMonth);
          onChange(year, newMonth, Math.min(day, maxDay));
        } else {
          const maxDay = daysInMonth(year, month);
          onChange(year, month, day <= 1 ? maxDay : day - 1);
        }
        return;
      }
    },
    { isActive: isFocused }
  );

  const yStr = year.toString();
  const mStr = month.toString().padStart(2, "0");
  const dStr = day.toString().padStart(2, "0");

  if (!isFocused) {
    return (
      <Box>
        <Text dimColor>
          {yStr}-{mStr}-{dStr}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text inverse={segment === "year"} color={segment === "year" ? "cyan" : undefined}>
        {yStr}
      </Text>
      <Text>-</Text>
      <Text inverse={segment === "month"} color={segment === "month" ? "cyan" : undefined}>
        {mStr}
      </Text>
      <Text>-</Text>
      <Text inverse={segment === "day"} color={segment === "day" ? "cyan" : undefined}>
        {dStr}
      </Text>
      <Text dimColor> ↑↓ change ←→ switch</Text>
    </Box>
  );
}
