const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    bio: {
        highSchools: [
            {
              name: {
                type: String,
                default: ''
              },
              joinDate: {
                type: Date,
              },
              endDate: {
                type: Date,
              },
            }
        ],
        colleges: [
          {
            name: {
              type: String,
              default: ''
            },
            joinDate: {
              type: Date,
            },
            endDate: {
              type: Date,
            },
            semesters: {
              type: [String],
              default: [],
            },
            lastYear: {
              type: Boolean,
              default: false
            }
          }
        ],
        hometown: {
          type: String,
          default: '',
        },
        currentCity: {
          type: String,
          default: '',
        },
        birth:{
          type: Date,
        },
        maritalStatus: {
          type: Boolean,
          default: false,
        },
    },
    role: {
        type: String,
        default: 'user'
    },
    password: {
      type: String,
      required: true,
      unique: true,
      minLength: 8,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("password must not contain password");
        }
      },
    },
    token: {
      type: String
    },
    interests: [String],
    privacy: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'deactivated', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET, { expiresIn: '12d' })
  user.token = token
  await user.save()
  return token
}

//login in users
userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({email})
    if (!user) {
      throw new Error('User does not exist');
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error("password does not match");
    }
    return user
}

// hash plain password saving
userSchema.pre('save', async function(next) {
    const user = this
    if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model("User", userSchema)
module.exports = User;
