import mongoose from 'mongoose';

const WeeklyCheckinSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true,
    unique: true
  },
  weekLabel: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  displayDate: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    default: null
  },
  waistCm: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.models.WeeklyCheckin || mongoose.model('WeeklyCheckin', WeeklyCheckinSchema);
