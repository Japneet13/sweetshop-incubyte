// routes/sweets.js
const express = require("express");
const { body, query, param, validationResult } = require("express-validator");
const router = express.Router();
const { sequelize, models } = require("../models/index");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { Op, UniqueConstraintError } = require("sequelize");

// All routes below are protected (require valid token)
router.use(authenticateToken);

/**
 * Helper: send validation errors as 400 with details
 */
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
}

/**
 * POST /api/sweets - create new sweet
 * Required body: { name, category, price, quantity }
 */
router.post(
  "/",
  [
    body("name").isString().trim().notEmpty().withMessage("name is required"),
    body("category").isString().trim().notEmpty().withMessage("category is required"),
    body("price").isFloat({ gt: 0 }).withMessage("price must be a number > 0"),
    body("quantity").isInt({ min: 0 }).withMessage("quantity must be integer >= 0"),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return; // response already sent

    try {
      const { name, category, price, quantity } = req.body;
      const created = await models.Sweet.create({ name, category, price, quantity });
      return res.status(201).json(created);
    } catch (err) {
      // handle unique name collisions gracefully
      if (err instanceof UniqueConstraintError || err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ message: "Sweet name already exists" });
      }
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * GET /api/sweets - list all sweets
 */
router.get("/", async (req, res) => {
  try {
    const sweets = await models.Sweet.findAll();
    return res.json(sweets);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});


/**
 * GET /api/sweets/:id - get single sweet by id
 */
router.get(
  "/:id",
  [ param("id").isInt().withMessage("id must be integer") ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    try {
      const sweet = await models.Sweet.findByPk(req.params.id);
      if (!sweet) return res.status(404).json({ message: "Not found" });
      return res.json(sweet);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * GET /api/sweets/search?name=...&category=...&minPrice=...&maxPrice=...
 */
router.get(
  "/search",
  [
    query("name").optional().isString(),
    query("category").optional().isString(),
    query("minPrice").optional().isFloat(),
    query("maxPrice").optional().isFloat(),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    try {
      const { name, category, minPrice, maxPrice } = req.query;
      const where = {};
      if (name) where.name = { [Op.like]: `%${name}%` };
      if (category) where.category = { [Op.like]: `%${category}%` };
      if (minPrice || maxPrice) where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);

      const results = await models.Sweet.findAll({ where });
      return res.json(results);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * PUT /api/sweets/:id - update sweet details
 * Optional fields: name, category, price, quantity
 */
router.put(
  "/:id",
  [
    param("id").isInt().withMessage("id must be integer"),
    body("name").optional().isString().trim().notEmpty(),
    body("category").optional().isString().trim().notEmpty(),
    body("price").optional().isFloat({ gt: 0 }).withMessage("price must be number > 0"),
    body("quantity").optional().isInt({ min: 0 }).withMessage("quantity must be integer >= 0"),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    try {
      const sweet = await models.Sweet.findByPk(req.params.id);
      if (!sweet) return res.status(404).json({ message: "Not found" });

      const { name, category, price, quantity } = req.body || {};
      if (name !== undefined) sweet.name = name;
      if (category !== undefined) sweet.category = category;
      if (price !== undefined) sweet.price = price;
      if (quantity !== undefined) sweet.quantity = quantity;
      await sweet.save();
      return res.json(sweet);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * DELETE /api/sweets/:id - Admin only
 */
router.delete("/:id", requireAdmin, [param("id").isInt().withMessage("id must be integer")], async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const sweet = await models.Sweet.findByPk(req.params.id);
    if (!sweet) return res.status(404).json({ message: "Not found" });
    await sweet.destroy();
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/sweets/:id/purchase - robust atomic decrement (works on SQLite/Postgres/MySQL)
router.post(
  "/:id/purchase",
  [
    param("id").isInt().withMessage("id must be integer"),
    body("qty").optional().isInt({ min: 1 }).withMessage("qty must be integer >= 1"),
  ],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    const id = parseInt(req.params.id, 10);
    const quantityToBuy = parseInt(req.body.qty || 1, 10);

    let t;
    try {
      t = await sequelize.transaction();

      // Try to atomically decrement quantity only if enough stock exists.
      // This translates to: UPDATE sweets SET quantity = quantity - :q WHERE id = :id AND quantity >= :q
      const [affectedCount] = await models.Sweet.update(
        { quantity: sequelize.literal(`quantity - ${quantityToBuy}`) },
        {
          where: { id, quantity: { [Op.gte]: quantityToBuy } },
          transaction: t,
        }
      );

      // affectedCount is number of rows updated. If 0 => not enough stock or id missing.
      if (!affectedCount || affectedCount === 0) {
        // check if sweet exists
        const sweetCheck = await models.Sweet.findByPk(id, { transaction: t });
        await t.commit();
        if (!sweetCheck) return res.status(404).json({ message: "Not found" });
        return res.status(400).json({ message: "Insufficient stock" });
      }

      // Success: fetch updated sweet to return in response
      const updatedSweet = await models.Sweet.findByPk(id, { transaction: t });
      await t.commit();
      return res.json({ message: "Purchased", sweet: updatedSweet });
    } catch (err) {
      if (t) await t.rollback();
      console.error("Purchase error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * POST /api/sweets/:id/restock - Admin only - increase quantity
 */
router.post(
  "/:id/restock",
  requireAdmin,
  [param("id").isInt().withMessage("id must be integer"), body("qty").isInt({ min: 1 }).withMessage("qty must be integer >= 1")],
  async (req, res) => {
    const validationError = handleValidation(req, res);
    if (validationError) return;

    try {
      const sweet = await models.Sweet.findByPk(req.params.id);
      if (!sweet) return res.status(404).json({ message: "Not found" });

      const quantityToAdd = parseInt(req.body.qty, 10);
      sweet.quantity += quantityToAdd;
      await sweet.save();
      return res.json({ message: "Restocked", sweet });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
