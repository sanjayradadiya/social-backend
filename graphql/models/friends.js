const mongoose = require('mongoose');
const { Schema } = mongoose;

const friendsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    friendList: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequests: [
      {
        senderId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'User',
        },
        receiverId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
          default: 'PENDING',
        },
      },
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Friends', friendsSchema);
