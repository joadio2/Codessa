import { createServer } from "node:http";
import { handler } from "./dist/server/entry.mjs";

const port = process.env.PORT || 4321;
const host = "0.0.0.0";

const server = createServer(handler);

server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
