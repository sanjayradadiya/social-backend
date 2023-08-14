const mongoose = require('mongoose');
const { Schema } = mongoose;

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    groupType: {
      type: String,
      enum: ['public', 'private', 'secret'],
      default: 'private',
    },
    members: [
      {
        memberId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'User',
        },
      },
    ],
    admins: [
      {
        adminId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'User',
        },
      },
    ],
    posts: [
      {
        postId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Post',
        },
      },
    ],
    privacySettings: {
      type: String,
      enum: ['public', 'private', 'custom'],
      default: 'public',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Group', groupSchema);
