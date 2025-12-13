const request = require("supertest");
const app = require("../index");
const { sequelize, models } = require("../models");

describe("Auth API", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // 🔑 Seed admin user
    await models.User.createWithPassword("admin", "adminpass", true);
  });

  test("Admin can login successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "admin",
        password: "adminpass",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.isAdmin).toBe(true);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
