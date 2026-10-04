#!/usr/bin/env node

import { auditPair } from "@tejsolpro/color";

const [, , command, foreground, background] = process.argv;

if (command !== "contrast" || !foreground || !background) {
  console.error("Usage: solpro-color contrast <foreground> <background>");
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(auditPair(foreground, background), null, 2));
}
