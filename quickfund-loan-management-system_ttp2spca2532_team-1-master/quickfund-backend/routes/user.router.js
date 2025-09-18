import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getUserDashboard, getUser, updateUser,  updatePassword  } from "../controllers/user.controller.js";
import { createRepayment, listMine, getLoanSummary} from "../controllers/repayment.controller.js";
import upload from "../middleware/upload.middleware.js";
import { createLoanApplication, getLoanApplicationById, getLoanApplications, updateLoanApplication } from "../controllers/loanApplication.controller.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
]);


router.use(protect, authorizeRoles("user"));
// User repayment routes (specific routes first)
router.get("/repayment", listMine);
router.get("/loan-summary", getLoanSummary);
router.post("/repayment", createRepayment);

router.patch("/:id/password", updatePassword);

router.post("/loan-applications", uploadFields, createLoanApplication);
router.get("/loan-applications", getLoanApplications);
router.get("/loan-applications/:loanId", getLoanApplicationById);
router.patch("/loan-applications/:loanId", updateLoanApplication);


// User profile routes (parameterized routes last)
router.get("/:userId/dashboard", getUserDashboard);
router.get("/:id", getUser); 
router.patch("/:id", updateUser);


export default router;
