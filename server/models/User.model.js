const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      validate: {
        validator: function (value) {
          return value !== null && value !== undefined;
        },
        message: "Email cannot be null or undefined.",
      },
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // This will remove the password from queries made to the DB
      select: false,
    },
    role: {
      enum: ["admin", "user"],
      type: String,
      default: "user",
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
