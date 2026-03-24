import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import Spinner from "ink-spinner";
import { getEntriesRange } from "../lib/storage.ts";
import { startOfWeek, startOfMonth } from "../lib/format.ts";
import { prepareInsightsData, streamInsights } from "../lib/insights.ts";

type Step = "period" | "analyzing" | "done" | "error";
type Period = "week" | "month";

const PERIOD_ITEMS = [
  { label: "This Week", value: "week" as Period },
  { label: "This Month", value: "month" as Period },
];

export function InsightsView() {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>("period");
  const [period, setPeriod] = useState<Period>("week");
  const [errorMsg, setErrorMsg] = useState("");
  const [output, setOutput] = useState("");

  // Handle period selection → go straight to analyzing
  const handlePeriodSelect = (item: { value: Period }) => {
    setPeriod(item.value);
    setStep("analyzing");
  };

  // Quit handler
  useInput(
    (input, key) => {
      if (key.escape || input.toLowerCase() === "q") {
        exit();
      }
    },
    { isActive: step === "done" || step === "error" }
  );

  // Run analysis when step becomes "analyzing"
  useEffect(() => {
    if (step !== "analyzing") return;

    let cancelled = false;

    async function run() {
      try {
        const now = new Date();
        const from =
          period === "week" ? startOfWeek(now) : startOfMonth(now);

        const entries = await getEntriesRange(from, now);

        if (entries.length === 0) {
          if (!cancelled) {
            setOutput("No time entries found for this period.");
            setStep("done");
          }
          return;
        }

        const data = prepareInsightsData(entries, from, now);
        const result = streamInsights(data);

        for await (const delta of (await result).textStream) {
          if (cancelled) break;
          setOutput((prev) => prev + delta);
        }

        if (!cancelled) setStep("done");
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err.message ?? "Unknown error");
          setStep("error");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [step, period]);

  // Period selection
  if (step === "period") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color="cyan">
          AI Insights — Select period:
        </Text>
        <SelectInput items={PERIOD_ITEMS} onSelect={handlePeriodSelect} />
      </Box>
    );
  }

  // Analyzing
  if (step === "analyzing") {
    return (
      <Box flexDirection="column" gap={1}>
        {output.length === 0 ? (
          <Box gap={1}>
            <Spinner type="dots" />
            <Text>Analyzing your time data...</Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            <Text>{output}</Text>
          </Box>
        )}
      </Box>
    );
  }

  // Error
  if (step === "error") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="red" bold>
          Error: {errorMsg}
        </Text>
        <Text dimColor>Q/Esc: Quit</Text>
      </Box>
    );
  }

  // Done
  return (
    <Box flexDirection="column" gap={1}>
      <Text>{output}</Text>
      <Text dimColor>Q/Esc: Quit</Text>
    </Box>
  );
}
