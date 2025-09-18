import User from "../models/User.js";
import Loan from "../models/Loan.js";
import bcrypt from "bcryptjs";


export const getUserDashboard = async (userId) => {
  const user = await User.findById(userId).select("-password");

  const loansWithRepayments = await Loan.aggregate([
    { $match: { userId: user._id } }, // all loans of user
    {
      $lookup: {
        from: "repayments",
        localField: "_id",
        foreignField: "loanId",
        as: "repayments",
      },
    },
    {
      $addFields: {
        totalRepaid: { $sum: "$repayments.amount" },
        outstandingBalance: { $subtract: ["$amount", { $sum: "$repayments.amount" }] },
      },
    },
  ]);

  const activeLoans = loansWithRepayments.filter(l => l.status === "Active");

  const outstandingBalance = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);

  const totalRepaid = loansWithRepayments.reduce((sum, l) => sum + l.totalRepaid, 0);
  const recentLoan = loansWithRepayments[loansWithRepayments.length - 1];

  return {
    user,
    loans: loansWithRepayments,
    activeLoans,
    recentLoan,
    totalRepaid,
    outstandingBalance,
  };
};


export const getUserById = async (id) => {
  return await User.findById(id);
};

export const updateUser = async (id, updates) => {
  return await User.findByIdAndUpdate(id, updates, { new: true });
};


export const updatePassword = async (id, currentPassword, newPassword) => {
  
  const user = await User.findById(id);
  if (!user) {
    return { success: false, message: "User not found" };
  }

 const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return { success: false, message: "Current password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  console.log(hashedPassword)
  user.password = hashedPassword;
  await user.save();

  return { success: true };
};