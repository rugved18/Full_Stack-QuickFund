import mongoose from "mongoose";

const repaymentSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: "Loan" },
  amount: Number,
  date: Date
});

export default mongoose.model("Repayment", repaymentSchema);
