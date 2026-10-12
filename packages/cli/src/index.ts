#!/usr/bin/env node

import { auditPair, compileOneBrandTheme, exportThemeCss } from "@tejsolpro/color";

const [, , command, ...args] = process.argv;
const usage = `Usage:
  solpro-color contrast <foreground> <background>
  solpro-color theme <brand> [--canvas <color>] [--format json|css]`;

function fail(message?: string): void {
  if (message) console.error(message);
  console.error(usage);
  process.exitCode = 1;
}

function run(): void {
  if (command === "contrast") {
    const [foreground, background, ...rest] = args;
    if (!foreground || !background || rest.length > 0) fail();
    else console.log(JSON.stringify(auditPair(foreground, background), null, 2));
  } else if (command === "theme") {
    const [brand, ...options] = args;
    if (!brand) {
      fail();
      return;
    }

    let canvas: string | undefined;
    let format = "json";
    let valid = true;

    for (let index = 0; index < options.length; index += 1) {
      const option = options[index];
      const value = options[index + 1];
      if (option === "--canvas" && value) {
        canvas = value;
        index += 1;
      } else if (option === "--format" && (value === "json" || value === "css")) {
        format = value;
        index += 1;
      } else {
        valid = false;
        break;
      }
    }

    if (!valid) {
      fail("Invalid theme option.");
      return;
    }

    const theme = compileOneBrandTheme(canvas ? { brand, canvas } : { brand });
    console.log(format === "css" ? exportThemeCss(theme) : JSON.stringify(theme, null, 2));
  } else {
    fail();
  }
}

try {
  run();
} catch (error) {
  if (error instanceof TypeError) fail(error.message);
  else throw error;
}
