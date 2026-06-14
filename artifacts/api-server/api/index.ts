import app from "../src/app";

// Vercel serverless entrypoint.
// Do not import src/index.ts here because that file starts a long-running listener
// and requires PORT. Vercel invokes this exported Express app as a function.
export default app;

