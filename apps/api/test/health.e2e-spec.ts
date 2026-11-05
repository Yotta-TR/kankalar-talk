import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/configure-app";
import { PrismaService } from "../src/database/prisma.service";

describe("GET /v1/health", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns a minimal health response", async () => {
    await request(app.getHttpServer())
      .get("/v1/health")
      .expect(200)
      .expect({ status: "ok" });
  });

  it("publishes the OpenAPI document", async () => {
    const response = await request(app.getHttpServer())
      .get("/openapi.json")
      .expect(200);

    expect(response.body.paths).toHaveProperty("/v1/health");
  });
});
