const mongoose = require('mongoose');
const JobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Please provide company name'],
      minlength: [3, 'Company must be at least 3 characters (got "{VALUE}")'],
      maxlength: [50, 'Company must be at most 50 characters (got "{VALUE}")'],
    },
    position: {
      type: String,
      required: [true, 'Please provide position'],
      minlength: [3, 'Position must be at least 3 characters (got "{VALUE}")'],
      maxlength: [
        100,
        'Position must be at most 100 characters (got "{VALUE}")',
      ],
    },
    status: {
      type: String,
      enum: ['interview', 'declined', 'pending'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
