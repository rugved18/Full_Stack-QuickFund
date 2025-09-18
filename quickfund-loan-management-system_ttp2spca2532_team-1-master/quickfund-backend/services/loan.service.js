import Loan from "../models/Loan.js";
import User from "../models/User.js";

// Map user details from frontend payload
const mapUserDetails = (personalInfo) => ({
  firstName: personalInfo.firstName,
  lastName: personalInfo.lastName,
  dob: personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth) : null,
  aadharNumber: personalInfo.aadharNumber,
  countryCode: personalInfo.countryCode,
  occupation: personalInfo.occupationType,
  addressDetails: personalInfo.address,
  employment: personalInfo.employment,
  education: personalInfo.education,
  otherOccupation: personalInfo.otherOccupation,
  email: personalInfo.email,
  phone: personalInfo.phone,
});

// Create a new loan
export const createLoan = async (userId, frontendData, files) => {
  const personalInfo = frontendData.personalInfo;

  // Update user details first
  await User.findByIdAndUpdate(userId, {
    $set: { details: mapUserDetails(personalInfo) },
  });

  // Prepare documents
  const documents = {
    aadhaarKyc: frontendData.documents?.aadhaarKyc || false,
    aadhaarCard: files?.aadhaarCard
      ? { filename: files.aadhaarCard[0].filename, path: files.aadhaarCard[0].path }
      : null,
    panCard: files?.panCard
      ? { filename: files.panCard[0].filename, path: files.panCard[0].path }
      : null,
  };

  // Create loan
  const loan = await Loan.create({
    userId,
    amount: frontendData.amount,
    purpose: frontendData.purpose,
    duration: Number(frontendData.duration),
    status: frontendData.status || "Pending",
    documents,
  });

  return loan;
};

// Update existing loan
export const updateLoan = async (userId, loanId, frontendData, files) => {
  const personalInfo = frontendData.personalInfo;

  // Update user details
  await User.findByIdAndUpdate(userId, {
    $set: { details: mapUserDetails(personalInfo) },
  });

  // Merge documents
  const documents = {
    ...frontendData.documents,
    aadhaarCard: files?.aadhaarCard
      ? { filename: files.aadhaarCard[0].filename, path: files.aadhaarCard[0].path }
      : frontendData.documents?.aadhaarCard || null,
    panCard: files?.panCard
      ? { filename: files.panCard[0].filename, path: files.panCard[0].path }
      : frontendData.documents?.panCard || null,
  };

  // Update loan
  const updatedLoan = await Loan.findOneAndUpdate(
    { _id: loanId, userId }, 
    {
      $set: {
        amount: frontendData.amount,
        purpose: frontendData.purpose,
        duration: Number(frontendData.duration),
        documents,
        status: frontendData.status || "Pending",
      },
    },
    { new: true }
  );

  return updatedLoan;
};

// Get loans by user
export const getLoansByUser = async (userId) => {
  return await Loan.find({ userId });
};

// Get single loan
export const getLoanById = async (userId, loanId) => {
  return await Loan.findOne({ _id: loanId, userId });
};

// Simple credit score calculation
export const calculateCreditScore = (details) => {
  let score = 300; // min

  const income =
    details.employment?.annualIncome ||
    details.otherOccupation?.monthlyIncome * 12 ||
    0;

  if (income > 100000) score += 300;
  else if (income > 50000) score += 200;
  else if (income > 20000) score += 100;

  if (details.employment) {
    if (details.employment.yearsEmployed >= 5) score += 200;
    else if (details.employment.yearsEmployed >= 2) score += 100;
  } else if (details.otherOccupation?.monthlyIncome) {
    score += 50;
  }

  if (details.occupation === "Salaried") score += 100;
  else if (details.occupation === "Business") score += 50;

  return Math.min(score, 900);
};
