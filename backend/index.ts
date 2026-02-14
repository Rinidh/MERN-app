import { startServer } from "./server.js";

if (process.env.NODE_ENV !== "test") {
  // server should not start listening if is to be used by supertest agent
  await startServer();
}
