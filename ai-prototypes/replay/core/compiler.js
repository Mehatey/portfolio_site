const quote = (value) => JSON.stringify(value);

export function validateSpec(spec) {
  const errors = [];
  if (spec?.schemaVersion !== 1) errors.push("Unsupported spec version.");
  if (!spec?.title?.trim()) errors.push("Test title is required.");
  if (!spec?.startUrl?.trim()) errors.push("Start URL is required.");
  if (!Array.isArray(spec?.steps) || spec.steps.length === 0) errors.push("At least one journey step is required.");
  if (!spec?.assertion?.kind) errors.push("One confirmed assertion is required.");
  if (spec?.assertion?.ambiguous) errors.push("Choose one exact target before export.");
  return errors;
}

export function compilePlaywright(spec) {
  const errors = validateSpec(spec);
  if (errors.length) throw new Error(errors.join(" "));
  const lines = [
    `import { test, expect } from ${quote("@playwright/test")};`,
    "",
    `test(${quote(spec.title)}, async ({ page }) => {`,
    `  await page.goto(${quote(spec.startUrl)});`,
  ];

  for (const step of spec.steps) {
    if (step.kind === "click") {
      lines.push(`  await page.getByRole(${quote(step.role)}, { name: ${quote(step.name)} }).click();`);
    }
    if (step.kind === "press") lines.push(`  await page.keyboard.press(${quote(step.key)});`);
  }

  if (spec.assertion.kind === "focus-within") {
    lines.push(
      `  const boundary = page.getByRole(${quote(spec.assertion.role)}, { name: ${quote(spec.assertion.name)} });`,
      "  await expect(boundary).toBeVisible();",
      "  await expect.poll(async () =>",
      "    boundary.evaluate((node) => node.contains(document.activeElement)),",
      `    { message: ${quote(spec.assertion.message)} },`,
      "  ).toBe(true);"
    );
  }

  lines.push("});", "");
  return lines.join("\n");
}

export function defaultSpec(startUrl) {
  return {
    schemaVersion: 1,
    title: "keyboard focus stays inside the delivery dialog",
    startUrl,
    steps: [
      { kind: "click", role: "button", name: "Change delivery method" },
      { kind: "press", key: "Tab" },
      { kind: "press", key: "Tab" },
      { kind: "press", key: "Tab" },
    ],
    assertion: {
      kind: "focus-within",
      role: "dialog",
      name: "Choose delivery method",
      message: "Focus escaped the open delivery dialog",
    },
    evidenceEventIds: [],
    confirmedAt: null,
  };
}
