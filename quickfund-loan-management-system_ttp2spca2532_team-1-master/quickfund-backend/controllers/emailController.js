import transporter from "../config/mailConfig.js";
import EmailLog from "../models/EmailLog.js";

export const sendLoanEmail = async (req, res) => {
  const { userId, name, email, purpose, loanDue } = req.body;

  if (!userId || !name || !email || !purpose || loanDue === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Loan Due Notification",
    text: `Hello ${name},\n\nThis is a notification regarding your loan for "${purpose}". Please be informed that the outstanding due amount is ₹${loanDue}.\n\nThank you!`,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);

    // Store email log
    const emailLog = new EmailLog({ userId, name, email, purpose, loanDue });
    await emailLog.save();

    res.status(200).json({ message: "Email sent and logged successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
  }
};
