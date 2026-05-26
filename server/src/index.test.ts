import http from "http";

describe("server index", () => {
  it("exports app and startServer and responds on /", async () => {
    jest.resetModules();
    process.env.MISTRAL_API_KEY = "test-key";
    process.env.MISTRAL_MODEL = "test-model";

    const { default: app, startServer } = require("./index");
    expect(app).toBeDefined();
    expect(typeof startServer).toBe("function");

    const server = startServer(0);
    const addr = server.address();
    const port = typeof addr === "object" && addr?.port ? addr.port : 0;

    const body = await new Promise<string>((resolve, reject) => {
      http
        .get(
          { hostname: "127.0.0.1", port, path: "/", agent: false },
          (res) => {
            let data = "";
            res.setEncoding("utf8");
            res.on("data", (c) => (data += c));
            res.on("end", () => resolve(data));
          },
        )
        .on("error", reject);
    });

    expect(body).toMatch(/Bienvenue sur l'Appli Ingre-Scan/i);

    await new Promise<void>((resolve, reject) => {
      server.close((err: any) => (err ? reject(err) : resolve()));
    });
  });
});
