const express = require("express");
const {
  addTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getBalanceSummary,
  getMonthlySummary,
  getCategorySummary,
} = require("../controllers/transactionController");

const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.use(auth);
router.post("/", addTransaction);
router.get("/", getTransactions);
router.get("/:id", getTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary/balance", getBalanceSummary);
router.get("/summary/categories", getCategorySummary);
router.get("/summary/monthly", getMonthlySummary);

module.exports = router;
