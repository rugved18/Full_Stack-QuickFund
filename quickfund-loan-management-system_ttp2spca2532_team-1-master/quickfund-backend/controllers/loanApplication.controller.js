import * as loanService from "../services/loan.service.js";

// Create new loan application
export const createLoanApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const frontendData = req.body;
    const files = req.files;

    console.log("Hi")

    const loan = await loanService.createLoan(userId, frontendData, files);
    res.status(201).json({ success: true, loan });
    console.log("Bye")
  } catch (err) {
    console.error("Error creating loan:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Update loan application
export const updateLoanApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const loanId = req.params.loanId;
    const frontendData = req.body;
    const files = req.files;

    const updatedLoan = await loanService.updateLoan(userId, loanId, frontendData, files);

    if (!updatedLoan)
      return res.status(404).json({ success: false, message: "Loan not found" });

    res.status(200).json({ success: true, loan: updatedLoan });
  } catch (err) {
    console.error("Error updating loan:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all loans for logged-in user
export const getLoanApplications = async (req, res) => {
  try {
    const loans = await loanService.getLoansByUser(req.user._id);
    res.status(200).json({ success: true, loans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single loan
export const getLoanApplicationById = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await loanService.getLoanById(req.user._id, loanId);

    if (!loan) return res.status(404).json({ success: false, message: "Loan not found" });

    res.status(200).json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
