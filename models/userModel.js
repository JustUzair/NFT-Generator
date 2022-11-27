const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { existsSync, mkdirSync } = require("fs");
const { mkdir } = require("fs/promises");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is mandatory"],
  },
  email: {
    type: String,
    required: [true, "Email is mandatory"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email!!"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "artist"],
  },
  password: {
    type: String,
    required: [true, "A password is mandatory"],
    minlength: 8,
    validate: {
      validator: function (val) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/.test(
          val
        );
      },
      message:
        "A password must contain, a lowercase, an uppercase, a special character and should be at least 8 characters long",
    },
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      //Only works on create or save
      validator: function (val) {
        return val === this.password;
      },
      message: "Password and Confirm Password should be the same!!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, // this field isn't visible while querying the User Model
  },
});

/*
  |-------------------------------------------------------------------------|
  |                 Encrypt password, if it was modified                    |
  |-------------------------------------------------------------------------|
*/
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if password isn't modified, go to next middleware in the chain
  this.password = await bcrypt.hash(this.password, 12); // here '12' indicates the cost parameter and higher the value, the better the encryption will be
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next(); // if password is not changed or document is new, go to next middleware in the chain
  this.passwordChangedAt = Date.now() - 1000; // work around for the case where sometimes due to processing delay the jwt is set before the value for this field is set.
  /*
  |-------------------------------------------------------------------------|
  |                 Suppose that jwt is set at 10s                          |
  | But the password changed at 11th second, it will show JWT has expired   |
  | even though a valid JWT is set                                          |
  |-------------------------------------------------------------------------|
*/
  next();
});

/*
  |-------------------------------------------------------------------------|
  |                 When querying User model, select only active users      |
  |-------------------------------------------------------------------------|
*/
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
/*
  |-------------------------------------------------------------------------|
  |           If a new artist is registered, create the directory for them  |
  |-------------------------------------------------------------------------|
*/
userSchema.pre("save", async function (next) {
  try {
    if (this.role !== "artist") return next(); // prevent making of dirs if the new user's role isn't artist
    if (!existsSync(`./public/img/arts/${this._id}`)) {
      await mkdir(`./public/img/arts/${this._id}`);
    }
    if (existsSync(`./public/img/arts/${this._id}`)) {
      await mkdir(`./public/img/arts/${this._id}/layers`);
    }
    if (existsSync(`./public/img/arts/${this._id}`)) {
      await mkdir(`./public/img/arts/${this._id}/out`);
    }
  } catch (err) {
    return next();
  }
});

userSchema.methods.correctPassword = async function (
  candidatePassword, //entered password
  userPassword // original password
) {
  return await bcrypt.compare(candidatePassword, userPassword); //compare the passwords
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000, //get time in seconds, because JWT stores time in seconds
      10
    );

    return JWTTimestamp < changedTimestamp; // Password was changed before JWT token was issued
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex"); // Create a random 32 byte string
  this.passwordResetToken = crypto // set hashed token in database
    .createHash("sha256") // encrypt resetToken with SHA256 algorithm
    .update(resetToken) // update its value
    .digest("hex"); // store it as hex value

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Set expiry time to 10 mins from current time
  // console.log('Token : ' + resetToken);
  return resetToken; // return un-hashed token to user
};
const User = mongoose.model("User", userSchema);

module.exports = User;
