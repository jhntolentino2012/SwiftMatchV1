// Vercel's Node function accepts every HTTP method and delegates routing to
// Express. Import the app, not src/index.ts (which starts a listening server).
export { default } from "../artifacts/api-server/src/app.js";