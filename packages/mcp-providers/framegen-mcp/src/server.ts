import { createFramegenApp } from "./app";

const port = Number(process.env.PORT || 7002);
const app = createFramegenApp();
app.listen(port, () => console.log("framegen-mcp on", port));
