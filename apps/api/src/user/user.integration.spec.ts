import "dotenv/config";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";

describe("User Integration", () => {
  let app: INestApplication;
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL?.replace(/\/[^/]+$/, "/life_rpg_test") ??
      "postgresql://haitianhong:@localhost:5433/life_rpg_test";

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    // Clean up created users
    // for (const id of createdUserIds) {
    //   await request(app.getHttpServer()).delete(`/users/${id}`);
    // }
    await app.close();
  });

  it("POST /users then GET /users/:id", async () => {
    const createBody = {
      email: "integration-test@example.com",
      firstName: "Integration",
      lastName: "Test",
      displayName: "IntegrationTest",
    };

    // Create user
    const createRes = await request(app.getHttpServer())
      .post("/users")
      .send(createBody)
      .expect(201);

    const created = createRes.body;
    createdUserIds.push(created.id);

    expect(created).toHaveProperty("id");
    expect(created).toHaveProperty("fullName");
    expect(created).toHaveProperty("email", createBody.email);
    expect(created).toHaveProperty("createdAt");
    expect(created).toHaveProperty("updatedAt");

    // Fetch user
    const getRes = await request(app.getHttpServer())
      .get(`/users/${created.id}`)
      .expect(200);

    const fetched = getRes.body;

    expect(fetched.id).toBe(created.id);
    expect(fetched.email).toBe(created.email);
    expect(fetched.fullName).toBe(created.fullName);
    expect(fetched.createdAt).toBe(created.createdAt);
    expect(fetched.updatedAt).toBe(created.updatedAt);
  });
});
