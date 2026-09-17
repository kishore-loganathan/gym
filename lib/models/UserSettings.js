import mongoose from 'mongoose';

const UserSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'default_goal'
  },
  startWeight: {
    type: Number,
    default: 90.0
  },
  targetWeight: {
    type: Number,
    default: 80.0
  },
  startDate: {
    type: String,
    default: '2026-09-17'
  },
  endDate: {
    type: String,
    default: '2027-01-01'
  }
}, { timestamps: true });

export default mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
