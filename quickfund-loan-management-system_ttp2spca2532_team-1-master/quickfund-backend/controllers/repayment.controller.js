import * as repaymentService from "../services/repayment.service.js";

export const createRepayment = async (req, res) => {
  const user = req.user;
  let { loanId, amount } = req.body || {};

  // Support path param loanId for /loans/:loanId/repayments and legacy /loan/:loanId/pay
  if (!loanId && req.params?.loanId) {
    loanId = req.params.loanId;
  }

  try {
    const repayment = await repaymentService.createRepaymentForLoan({
      user,
      loanId,
      amount,
    });

    return res.status(201).json({
      id: String(repayment._id),
      loanId: String(repayment.loanId),
      amount: repayment.amount,
      date: repayment.date.toISOString(),
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message });
  }
};

export const listMine = async (req, res) => {
  const user = req.user;

  try {
    const repayments = await repaymentService.listMyRepayments(user);
    return res.json(
      repayments.map((r) => ({
        id: String(r._id),
        loanId: String(r.loanId),
        amount: r.amount,
        date: r.date.toISOString(),
      }))
    );
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message });
  }
};

export const getLoanSummary = async (req, res) => {
  const user = req.user;

  try {
    const { loans, repayments } = await repaymentService.getMyLoanSummary(user);

    return res.json({
      loans: loans.map((l) => ({
        id: String(l._id),
        userId: String(l.userId),
        amount: l.amount,
        purpose: l.purpose,
        duration: l.duration,
        status: l.status,
      })),
      repayments: repayments.map((r) => ({
        id: String(r._id),
        loanId: String(r.loanId),
        amount: r.amount,
        date: r.date.toISOString(),
      })),
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message });
  }
};
