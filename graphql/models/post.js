const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId;

const postSchema = new mongoose.Schema(
    {
      posterId: {
        type: ObjectID,
        required: true,
        ref: "User",
      },
      name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      description: {
        type: String,
        trim: true,
        lowercase: true,
      },
      likes: [
        {
            friendsId: {
                type: ObjectID,
                ref: "User",
            },
            like: {
                type: Boolean,
                default: true
            }
        }
      ],
      comments: [
        {
           friendsId: {
            type: ObjectID,
            ref: "User",
           },
           message: {
            type: String,
            trim: true,
            lowercase: true
           }
        }
      ],
      privacy: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'friends',
      },
      tags: [
        {
            userId: {   
                type: ObjectID,
                ref: "User",
            }
        }
      ]
    },
    {
       timestamps: true,
    }
);

module.exports = mongoose.model('Post', postSchema);