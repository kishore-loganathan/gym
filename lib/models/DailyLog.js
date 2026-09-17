import mongoose from 'mongoose';

const DailyLogSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  displayDate: {
    type: String,
    required: true
  },
  daysLeft: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    default: null
  },
  proteinGrams: {
    type: Number, // Protein intake in grams (e.g. 120)
    default: null
  },
  cardioMinutes: {
    type: Number, // Cardio duration in numeric minutes (e.g. 30, 45, 60)
    default: null
  },
  cardioTiming: {
    type: String, // Time of day note (e.g. "Morning", "Evening")
    default: ''
  },
  sleepHoursNum: {
    type: Number, // Sleep duration in numeric hours (e.g. 7.5, 8.0)
    default: null
  },
  sleepHours: {
    type: String, // Sleep notes / timing (e.g. "11 PM - 7:30 AM")
    default: ''
  },
  workout: {
    type: Boolean,
    default: false
  },
  homeFood: {
    type: Boolean,
    default: false
  },
  noSweets: {
    type: Boolean,
    default: false
  },
  noMaida: {
    type: Boolean,
    default: false
  },
  noHotelFood: {
    type: Boolean,
    default: false
  },
  sleepTarget: {
    type: Boolean,
    default: false
  },
  dailyNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.models.DailyLog || mongoose.model('DailyLog', DailyLogSchema);
