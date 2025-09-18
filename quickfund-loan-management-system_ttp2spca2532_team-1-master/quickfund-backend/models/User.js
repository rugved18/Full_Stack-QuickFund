import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String, 
  role: { type: String, enum: ["user", "admin"], default: "user" },

  details: {
    creditScore: Number,
    dateJoined: { type: Date, default: Date.now },
    dob: Date,
    aadharNumber: String,
    occupation: String,

    addressDetails: {
      street: String,
      city: String,
      state: String,
      pinCode: String
    },
    employment: {
      employer: String,
      jobTitle: String,
      annualIncome: Number,
      employmentType: String,
      yearsEmployed: Number
    },
    education: {
      institution: String,
      degree: String,
      fieldOfStudy: String,
      yearOfStudy: String,
      expectedGraduation: String,
      feeStructure: String
    },
    otherOccupation: {
      occupationDescription: String,
      sourceOfIncome: String,
      monthlyIncome: Number
    },
    countryCode: String, 
    firstName: String,   
    lastName: String     
  }
});

export default mongoose.model("User", userSchema);
