import User from "../models/User.js";
import Loan from "../models/Loan.js";
import Repayment from "../models/Repayment.js";

/**
 * Get all users
 */
export const getAllUsersService = async () => {
  return await User.find();
};

/**
 * Get all loans with repayments populated
 */
export const getAllLoansService = async () => {
  const loans = await Loan.find().lean();

  // add repayments for each loan
  const loansWithRepayments = await Promise.all(
    loans.map(async (loan) => {
      const repayments = await Repayment.find({ loanId: loan._id }).lean();
      const totalRepaid = repayments.reduce((sum, r) => sum + r.amount, 0);
      const outstandingBalance = loan.amount - totalRepaid;

      return {
        ...loan,
        repayments,
        totalRepaid,
        outstandingBalance,
      };
    })
  );

  return loansWithRepayments;
};

/**
 * Get all repayments
 */
export const getAllRepaymentsService = async () => {
  return await Repayment.find();
};

/**
 * Get user details (with loans + repayments summary)
 */
export const getUserDetailsService = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found");

  const loans = await Loan.find({ userId }).lean();

  const loansWithRepayments = await Promise.all(
    loans.map(async (loan) => {
      const repayments = await Repayment.find({ loanId: loan._id }).lean();
      const totalRepaid = repayments.reduce((sum, r) => sum + r.amount, 0);
      const outstandingBalance = loan.amount - totalRepaid;

      return {
        ...loan,
        repayments,
        totalRepaid,
        outstandingBalance,
      };
    })
  );

  const totalLoaned = loansWithRepayments.reduce((sum, l) => sum + l.amount, 0);
  const totalRepaid = loansWithRepayments.reduce((sum, l) => sum + l.totalRepaid, 0);

  return {
    user,
    loans: loansWithRepayments,
    totalLoaned,
    totalRepaid,
  };
};

/**
 * Approve a loan
 */
export const approveLoanService = async (loanId) => {
  return await Loan.findByIdAndUpdate(
    loanId,
    { status: "Active" },
    { new: true }
  );
};

/**
 * Reject a loan
 */
export const rejectLoanService = async (loanId) => {
  return await Loan.findByIdAndUpdate(
    loanId,
    { status: "Rejected" },
    { new: true }
  );
};
