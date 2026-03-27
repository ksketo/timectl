import { createElement } from "react";
import { render } from "ink";
import { InsightsView } from "../components/InsightsView.tsx";

export async function insightsCommand() {
  render(createElement(InsightsView));
}
