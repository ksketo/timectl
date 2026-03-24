#!/usr/bin/env bun
import { Command } from "commander";
import { startCommand } from "./commands/start.tsx";
import { resumeCommand } from "./commands/resume.tsx";
import { historyCommand } from "./commands/history.tsx";
import { exportCommand } from "./commands/export.ts";
import { insightsCommand } from "./commands/insights.tsx";
import {
  listCategories,
  addCategory,
  removeCategory,
  migrateCategory,
} from "./commands/categories.ts";

const program = new Command();

program
  .name("timectl")
  .description("Personal CLI time tracker")
  .version("0.1.0");

program
  .command("start")
  .description("Start tracking a task")
  .argument("<description>", "Task description")
  .action(async (description: string) => {
    await startCommand(description);
  });

program
  .command("resume")
  .description("Resume a recent task")
  .action(async () => {
    await resumeCommand();
  });

program
  .command("history")
  .description("View time tracking history")
  .action(async () => {
    await historyCommand();
  });

program
  .command("export")
  .description("Export time data")
  .option("-p, --period <period>", "Period: day, week, month", "day")
  .option("-d, --date <date>", "Date (YYYY-MM-DD)")
  .option("-f, --format <format>", "Format: json, markdown", "json")
  .action(async (options) => {
    await exportCommand(options);
  });

program
  .command("insights")
  .description("AI-powered analysis of your time tracking data")
  .action(async () => {
    await insightsCommand();
  });

const categories = program
  .command("categories")
  .description("Manage categories");

categories
  .command("list")
  .description("List all categories")
  .action(async () => {
    await listCategories();
  });

categories
  .command("add")
  .description("Add a category")
  .argument("<name>", "Category name")
  .action(async (name: string) => {
    await addCategory(name);
  });

categories
  .command("remove")
  .description("Remove a category")
  .argument("<name>", "Category name")
  .action(async (name: string) => {
    await removeCategory(name);
  });

categories
  .command("migrate")
  .description("Move all time entries from one category to another")
  .argument("<from>", "Source category name")
  .argument("<to>", "Target category name")
  .action(async (from: string, to: string) => {
    await migrateCategory(from, to);
  });

// Default action for `timectl categories` (no subcommand) → list
categories.action(async () => {
  await listCategories();
});

program.parse();
