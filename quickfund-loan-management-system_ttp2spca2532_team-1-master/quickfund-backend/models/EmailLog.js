
import mongoose from 'mongoose';
const emailLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  purpose:{type: String, required: true},
  loanDue: { type: Number, required: true },
  sentAt: { type: Date, default: Date.now },
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
export default EmailLog;
