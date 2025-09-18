import mongoose from "mongoose";
import Loan from "../models/Loan.js";
import Repayment from "../models/Repayment.js";

const toId = (id) => new mongoose.Types.ObjectId(id);

export async function sumPaidForLoan(loanId) {
  const result = await Repayment.aggregate([
    { $match: { loanId: toId(loanId) } },
    { $group: { _id: "$loanId", total: { $sum: "$amount" } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
}

export async function createRepaymentForLoan({ user, loanId, amount }) {
  if (!loanId || amount === undefined || amount === null) {
    throw new Error("loanId and amount are required");
  }
  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    throw new Error("amount must be a positive number");
  }

  const loan = await Loan.findById(loanId);
  if (!loan) {
    const err = new Error("Loan not found");
    err.statusCode = 404;
    throw err;
  }

  const isAdmin = user?.role === "admin";
  if (!isAdmin && String(loan.userId) !== String(user._id)) {
    const err = new Error("Not authorized to repay this loan");
    err.statusCode = 403;
    throw err;
  }

  if (loan.status && loan.status.toLowerCase() === "closed") {
    const err = new Error("Loan is already closed");
    err.statusCode = 409;
    throw err;
  }

  const totalPaid = await sumPaidForLoan(loan._id);
  const outstanding = Number(loan.amount) - Number(totalPaid);
  if (amountNum > outstanding + 1e-6) {
    const err = new Error("Repayment exceeds outstanding amount");
    err.statusCode = 409;
    throw err;
  }

  const repayment = await Repayment.create({
    loanId: loan._id,
    amount: amountNum,
    date: new Date(),
  });

  const newTotalPaid = totalPaid + amountNum;
  if (newTotalPaid >= Number(loan.amount) - 1e-6) {
    loan.status = "Closed";
    await loan.save();
  }

  return repayment;
}

export async function listMyRepayments(user) {
  const loans = await Loan.find({ userId: user._id }).select({ _id: 1 });
  const loanIds = loans.map((l) => l._id);
  if (loanIds.length === 0) return [];
  return Repayment.find({ loanId: { $in: loanIds } }).sort({ date: 1 });
}

export async function getMyLoanSummary(user) {
  const loans = await Loan.find({ userId: user._id });
  const loanIds = loans.map((l) => l._id);
  const repayments = loanIds.length
    ? await Repayment.find({ loanId: { $in: loanIds } }).sort({ date: 1 })
    : [];
  return { loans, repayments };
}
