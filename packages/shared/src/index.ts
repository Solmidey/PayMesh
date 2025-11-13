/**
 * Collision-proof barrel:
 *   - Namespaces for internals
 *   - Keep top-level aliases only for MCP & Storage (putJSON/getJSON)
 */
export * as MCP from "./mcp";
export * as Storage from "./thirdweb";
export * as Hashing from "./hashing";

/* Back-compat aliases used by providers */
export { postJSON, getJSON } from "./mcp";
export { putJSON } from "./thirdweb";

/* NOTE: no direct sha256 export; use Hashing.<fn> from ./hashing */

export { getJSON as httpGetJSON } from "./mcp";
