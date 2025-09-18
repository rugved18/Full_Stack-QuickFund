import {
  getAllUsersService,
  getAllLoansService,
  getAllRepaymentsService,
  getUserDetailsService,
  approveLoanService,
  rejectLoanService,
} from "../services/admin.service.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllLoans = async (req, res) => {
  try {
    const loans = await getAllLoansService();
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllRepayments = async (req, res) => {
  try {
    const repayments = await getAllRepaymentsService();
    res.json(repayments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const details = await getUserDetailsService(userId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await approveLoanService(loanId);
    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await rejectLoanService(loanId);
    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
