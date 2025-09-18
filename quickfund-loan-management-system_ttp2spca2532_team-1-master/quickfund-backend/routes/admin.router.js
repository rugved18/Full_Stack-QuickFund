import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  getAllUsers,
  getAllLoans,
  getAllRepayments,
  getUserDetails,
  approveLoan,
  rejectLoan,
} from "../controllers/admin.controller.js";
import { getReportData, getRepaymentHistory } from "../controllers/report.admin.controller.js";
import { sendLoanEmail } from '../controllers/emailController.js';
const router = express.Router();


router.use(protect, authorizeRoles("admin"));


// Admin routes
router.get("/users", getAllUsers);
router.get("/loans", getAllLoans);
router.get("/repayments", getAllRepayments);
router.get("/users/:userId/details", getUserDetails);

// Loan approval/rejection
router.patch("/loans/:loanId/approve", approveLoan);
router.patch("/loans/:loanId/reject", rejectLoan);

// Admin report routes
router.get("/reports/:reportType", getReportData);
router.get("/reports/repayments/history", getRepaymentHistory);

//email routes 
router.post('/send', sendLoanEmail);

export default router;
