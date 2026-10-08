# WebMCP boundary

This repository currently contains a backend-oriented revenue core and tests, with no browser application. WebMCP code does not run in this TypeScript core: it only registers tools from a user-open browser page through `document.modelContext.registerTool()`.

When a real customer-facing page is added, expose only page-local, reviewable actions there. Keep prospect records, authentication, outbound communication, payments, and evidence transitions behind the existing server-side authorization and state machine. For background or headless workflows, use a separately authenticated MCP or API adapter; do not route those jobs through WebMCP.

Upstream reference: https://github.com/webmachinelearning/webmcp. Guard optional registration for browser support, validate current state at execution, visibly reflect any page change, and test that the page does not claim server persistence or revenue without verified evidence.
