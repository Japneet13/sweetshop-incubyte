// run using: npm run seed
const { models, sequelize } = require("../models/index");

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    const adminExists = await models.User.findOne({
      where: { username: "admin" },
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const admin = await models.User.createWithPassword(
      "admin",
      process.env.ADMIN_PASSWORD || "adminpass",
      true
    );

    console.log("Admin user created:", admin.username);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

run();
