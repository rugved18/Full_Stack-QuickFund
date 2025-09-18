import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
});

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  purpose: String,
  duration: Number,
  status: {
    type: String,
    enum: ["Active", "Closed", "Rejected", "Pending"],
    default: "Pending",
  },
  documents: {
    aadhaarKyc: { type: Boolean, default: false },
    aadhaarCard: fileSchema,
    panCard: fileSchema,
    incomeProof: fileSchema,
    salarySlip: fileSchema,
    bankStatement: fileSchema,
    educationDocuments: fileSchema,
    otherIncomeProof: fileSchema,
  },
});

export default mongoose.model("Loan", loanSchema);
