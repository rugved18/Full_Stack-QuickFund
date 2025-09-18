import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Loan from "../models/Loan.js";
import Repayment from "../models/Repayment.js";

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quickfund";
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected for seeding");

    // Clear old data
    await User.deleteMany();
    await Loan.deleteMany();
    await Repayment.deleteMany();
    console.log("🧹 Old data cleared");

    // Create 25 users
    const users = [];
    for (let i = 1; i <= 25; i++) {
      const hashedPassword = await bcrypt.hash(`Password${i}`, 10);

      users.push({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        phone: `90000000${i.toString().padStart(2, "0")}`,
        password: hashedPassword,
        role: i === 1 ? "admin" : "user",
        details: {
          creditScore: 650 + (i % 100),
          dateJoined: new Date(2021, i % 12, (i % 28) + 1),
          dob: new Date(1990 + (i % 10), i % 12, (i % 28) + 1),
          aadharNumber: `1111222233${i.toString().padStart(2, "0")}`,
          occupation: i % 2 === 0 ? "Software Engineer" : "Freelancer",
          countryCode: "+91",
          firstName: `User${i}`,
          lastName: `Test`,
          addressDetails: {
            street: `Street ${i}`,
            city: `City ${i}`,
            state: `State ${i}`,
            pinCode: `5600${i.toString().padStart(2, "0")}`,
          },
          employment: {
            employer: i % 2 === 0 ? "CTS" : "Infosys",
            jobTitle: i % 2 === 0 ? "PAT" : "Developer",
            annualIncome: 400000 + i * 10000,
            employmentType: i % 2 === 0 ? "full-time" : "part-time",
            yearsEmployed: 2 + (i % 5),
          },
          education: {
            institution: `Institute ${i}`,
            degree: "B.Tech",
            fieldOfStudy: "CS",
            yearOfStudy: `202${i % 10}`,
            expectedGraduation: `202${i % 10}`,
            feeStructure: "50000",
          },
          otherOccupation: {
            occupationDescription: "",
            sourceOfIncome: "",
            monthlyIncome: null,
          },
        },
      });
    }

    const createdUsers = await User.insertMany(users);
    console.log("👥 Users inserted:", createdUsers.length);

    // Create loans for each user
    const statuses = ["Active", "Pending", "Rejected", "Closed"];

    for (const user of createdUsers) {
      for (const status of statuses) {
        const loan = await Loan.create({
          userId: user._id,
          amount: 40000 + Math.floor(Math.random() * 100000),
          purpose:
            status === "Rejected"
              ? "Car Loan"
              : status === "Closed"
              ? "Education Loan"
              : "Personal Loan",
          duration: [6, 12, 18][Math.floor(Math.random() * 3)], // random duration
          status: status,
          documents: {
            aadhaarKyc: false,
            aadhaarCard: {},
            panCard: {},
            incomeProof: {},
            salarySlip: {},
            bankStatement: {},
            educationDocuments: {},
            otherIncomeProof: {},
          },
        });

        // Add repayments only for Active and Closed loans
        if (status === "Active" || status === "Closed") {
          await Repayment.insertMany([
            {
              loanId: loan._id,
              amount: Math.floor(loan.amount / 3),
              date: new Date("2024-01-10"),
            },
            {
              loanId: loan._id,
              amount: Math.floor(loan.amount / 4),
              date: new Date("2024-02-10"),
            },
          ]);
        }
      }
    }

    console.log("✅ Dummy data for 25 users and 4 loans each inserted successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err.message);
    process.exit(1);
  }
};

seedData();
