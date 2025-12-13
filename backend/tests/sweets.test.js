const request = require("supertest");
const app = require("../index");
const { sequelize, models } = require("../models");

let adminToken;

describe("Sweets API", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // 🔑 Seed admin user
    await models.User.createWithPassword("admin", "adminpass", true);

    // 🔐 Login as admin
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        username: "admin",
        password: "adminpass",
      });

    adminToken = loginRes.body.token;
  });

  test("Admin can add a sweet", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Sweet",
        category: "Test",
        price: 50,
        quantity: 10,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Test Sweet");
  });

  test("Duplicate sweet name returns 409", async () => {
    const res = await request(app)
      .post("/api/sweets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Sweet",
        category: "Test",
        price: 50,
        quantity: 10,
      });

    expect(res.statusCode).toBe(409);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
