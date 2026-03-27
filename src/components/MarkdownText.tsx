import React from "react";
import { Text } from "ink";
import chalk from "chalk";
import { marked, type MarkedExtension } from "marked";
// @ts-ignore -- marked-terminal has no type declarations
import { markedTerminal } from "marked-terminal";

// Bun reports chalk level 0 even in a TTY — force color support
// since we're always running inside Ink (which requires a terminal).
if (chalk.level === 0) {
  chalk.level = 3;
}

const ext = markedTerminal({
  reflowText: true,
  showSectionPrefix: false,
}) as MarkedExtension & { renderer: Record<string, Function> };

// Patch: marked-terminal's text renderer doesn't call parseInline on
// inline tokens (e.g. bold inside list items). This fixes that.
const origText = ext.renderer.text!;
ext.renderer.text = function (this: any, token: any) {
  if (typeof token === "object" && token.tokens) {
    return this.parser.parseInline(token.tokens);
  }
  return origText.call(this, token);
};

marked.use(ext);

interface Props {
  children: string;
}

export function MarkdownText({ children }: Props) {
  const rendered = marked.parse(children) as string;
  return <Text>{rendered.trim()}</Text>;
}
