// Catch all /api/* methods and paths without rewriting the original URL.
// Express therefore receives routes such as POST /api/auth/signup unchanged.
export { default } from "../artifacts/api-server/src/app.js";