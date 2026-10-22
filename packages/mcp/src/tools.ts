import {
  auditPair,
  compileOneBrandTheme,
  exportThemeCss,
  type ContrastAudit,
  type OneBrandTheme,
} from "@tejsolpro/color";

export interface CompileThemeToolInput {
  readonly brand: string;
  readonly canvas?: string | undefined;
  readonly includeCss?: boolean | undefined;
}

export interface CompileThemeToolOutput {
  readonly [key: string]: unknown;
  readonly kind: "theme";
  readonly theme: OneBrandTheme;
  readonly css?: string;
}

export interface AuditContrastToolInput {
  readonly foreground: string;
  readonly background: string;
}

export interface AuditContrastToolOutput {
  readonly [key: string]: unknown;
  readonly kind: "contrast";
  readonly audit: ContrastAudit;
}

export function compileThemeTool(input: CompileThemeToolInput): CompileThemeToolOutput {
  const theme = compileOneBrandTheme(
    input.canvas ? { brand: input.brand, canvas: input.canvas } : { brand: input.brand },
  );

  return {
    kind: "theme",
    theme,
    ...(input.includeCss === false ? {} : { css: exportThemeCss(theme) }),
  };
}

export function auditContrastTool(input: AuditContrastToolInput): AuditContrastToolOutput {
  return {
    kind: "contrast",
    audit: auditPair(input.foreground, input.background),
  };
}
