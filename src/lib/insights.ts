import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { TimeEntry } from "../types.ts";
import { formatDuration, formatDate } from "./format.ts";

interface InsightsData {
  period: { from: string; to: string };
  totalHours: number;
  daysTracked: number;
  avgHoursPerDay: number;
  categories: Record<string, { minutes: number; percentage: number }>;
  dailyBreakdown: Record<string, { totalMinutes: number; entries: number }>;
  gaps: { date: string; from: string; to: string; minutes: number }[];
  longestTask: { description: string; category: string; minutes: number } | null;
  shortestTask: { description: string; category: string; minutes: number } | null;
  entries: { category: string; description: string; startedAt: string; stoppedAt: string; durationMinutes: number }[];
}

export function prepareInsightsData(
  entries: TimeEntry[],
  from: Date,
  to: Date
): InsightsData {
  // Category aggregation
  const catMap = new Map<string, number>();
  let totalMinutes = 0;
  for (const e of entries) {
    catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.durationMinutes);
    totalMinutes += e.durationMinutes;
  }

  const categories: InsightsData["categories"] = {};
  for (const [cat, mins] of catMap) {
    categories[cat] = {
      minutes: mins,
      percentage: totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0,
    };
  }

  // Daily breakdown
  const dailyMap = new Map<string, { totalMinutes: number; entries: number }>();
  for (const e of entries) {
    const day = e.startedAt.split("T")[0]!;
    const existing = dailyMap.get(day) ?? { totalMinutes: 0, entries: 0 };
    existing.totalMinutes += e.durationMinutes;
    existing.entries += 1;
    dailyMap.set(day, existing);
  }

  const dailyBreakdown: InsightsData["dailyBreakdown"] = {};
  for (const [day, data] of dailyMap) {
    dailyBreakdown[day] = data;
  }

  // Gap analysis
  const gaps: InsightsData["gaps"] = [];
  const byDay = new Map<string, TimeEntry[]>();
  for (const e of entries) {
    const day = e.startedAt.split("T")[0]!;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(e);
  }

  for (const [day, dayEntries] of byDay) {
    const sorted = dayEntries.sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );
    for (let i = 1; i < sorted.length; i++) {
      const prevEnd = new Date(sorted[i - 1]!.stoppedAt).getTime();
      const nextStart = new Date(sorted[i]!.startedAt).getTime();
      const gapMins = (nextStart - prevEnd) / 60000;
      if (gapMins > 5) {
        gaps.push({
          date: day,
          from: sorted[i - 1]!.stoppedAt,
          to: sorted[i]!.startedAt,
          minutes: Math.round(gapMins),
        });
      }
    }
  }

  // Longest/shortest
  let longest: InsightsData["longestTask"] = null;
  let shortest: InsightsData["shortestTask"] = null;
  for (const e of entries) {
    if (!longest || e.durationMinutes > longest.minutes) {
      longest = { description: e.description, category: e.category, minutes: e.durationMinutes };
    }
    if (!shortest || e.durationMinutes < shortest.minutes) {
      shortest = { description: e.description, category: e.category, minutes: e.durationMinutes };
    }
  }

  const daysTracked = dailyMap.size;

  // For large datasets, send daily summaries instead of raw entries
  const entryData =
    entries.length > 200
      ? []
      : entries.map((e) => ({
          category: e.category,
          description: e.description,
          startedAt: e.startedAt,
          stoppedAt: e.stoppedAt,
          durationMinutes: e.durationMinutes,
        }));

  return {
    period: { from: formatDate(from), to: formatDate(to) },
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    daysTracked,
    avgHoursPerDay: daysTracked > 0 ? Math.round((totalMinutes / 60 / daysTracked) * 100) / 100 : 0,
    categories,
    dailyBreakdown,
    gaps,
    longestTask: longest,
    shortestTask: shortest,
    entries: entryData,
  };
}

const SYSTEM_PROMPT = `You are a time management analyst. You receive structured time tracking data and provide actionable insights.

Focus on:
1. **Time Allocation**: Where is time going? Are there categories taking disproportionate time?
2. **Tracking Gaps**: Untracked time between entries — what does this suggest?
3. **Work Patterns**: Consistency of tracking, daily rhythms, task duration patterns
4. **Recommendations**: Concrete, specific suggestions to improve productivity or time awareness

Keep your analysis concise and actionable. Use bullet points. Avoid generic advice — base everything on the actual data provided. If the dataset is small, note that and adjust confidence accordingly.`;

export function streamInsights(data: InsightsData) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY not set. Add it to your .env file or shell environment."
    );
  }

  return streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: SYSTEM_PROMPT,
    prompt: JSON.stringify(data, null, 2),
  });
}
