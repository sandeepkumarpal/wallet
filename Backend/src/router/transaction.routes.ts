import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  newTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getMonthlySummary,
  updateMonthlyBudget,
  updateCategoryBudgets,
} from "../controller/transaction.controller.js";
import {
  listRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  runRecurring,
} from "../controller/recurring.controller.js";

const router = Router();

router.route("/new-transaction").post(verifyToken, newTransaction);
router.route("/").get(verifyToken, getTransactions);
router.route("/summary").get(verifyToken, getMonthlySummary);
router.route("/budget").put(verifyToken, updateMonthlyBudget);
router.route("/category-budgets").put(verifyToken, updateCategoryBudgets);

router.route("/recurring").get(verifyToken, listRecurring);
router.route("/recurring").post(verifyToken, createRecurring);
router.route("/recurring/run").post(verifyToken, runRecurring);
router
  .route("/recurring/:id")
  .put(verifyToken, updateRecurring)
  .delete(verifyToken, deleteRecurring);

router
  .route("/:id")
  .put(verifyToken, updateTransaction)
  .delete(verifyToken, deleteTransaction);

export default router;
