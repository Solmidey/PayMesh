import { createResearchApp } from "./app";

const port = Number(process.env.PORT || 7001);
const app = createResearchApp();
app.listen(port, () => console.log("research-mcp on", port));
