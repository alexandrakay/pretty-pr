export const SECTIONS = [
  "PR Title",
  "PR Description",
  "Changelog Entry",
  "Reviewer Notes",
  "Testing Checklist",
  "Risk Flag",
  "Coverage Gaps",
] as const;

export type SectionName = (typeof SECTIONS)[number];

export type ParsedOutput = Partial<Record<SectionName, string>>;

export function parseOutput(text: string): ParsedOutput {
  const result: ParsedOutput = {};

  for (let i = 0; i < SECTIONS.length; i++) {
    const heading = `## ${SECTIONS[i]}`;
    const start = text.indexOf(heading);
    if (start === -1) continue;

    const contentStart = start + heading.length;
    const nextHeading = SECTIONS
      .slice(i + 1)
      .map((s) => `## ${s}`)
      .reduce<number>((earliest, h) => {
        const idx = text.indexOf(h, contentStart);
        return idx !== -1 && idx < earliest ? idx : earliest;
      }, text.length);

    result[SECTIONS[i]] = text.slice(contentStart, nextHeading).trim();
  }

  return result;
}
