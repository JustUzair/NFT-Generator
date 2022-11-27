const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appErrors");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const Email = require("./../utils/email");
const crypto = require("crypto");
const { crossOriginOpenerPolicy } = require("helmet");
//-------------------------------------------------------------------------------------------------------

const signToken = id => {
  /*
  |-------------------------------------------------------------------------|
  | Sign the JWT with your private signature, that indicates the validity   | 
  | and authenticity of the token                                           |    
  |-------------------------------------------------------------------------|
*/
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
//-------------------------------------------------------------------------------------------------------

const createAndSendToken = (user, statusCode, req, res) => {
  /*
  |-------------------------------------------------------------------------|
  | Get the signed token and return is as cookie in the http response header|
  |-------------------------------------------------------------------------|
*/
  const token = signToken(user._id);
  /*
  |--------------------------------------------------------------------------------------------------|
  |   The req.secure property is an Boolean property that is true if a TLS connection is established |
  |   else return false.                                                                             |
  |                                                                                                  |
  |   To get information about which protocol used between client and load balancer,                 |
  |   we can use the X-Forwarded-Proto request header.                                               |
  |   Using this header, the client can make an HTTP request to an HTTPS-only resource.              |
  |--------------------------------------------------------------------------------------------------|
*/
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 //cookie will expire after this time
    ),
    httpOnly: true, // Allow cookies to be only used by web-browsers to prevent modification
    secure: req.secure || req.headers["x-forwarded-proto"] === "https", // allow cookies to only be used with https
  };

  res.cookie("jwt", token, cookieOptions); // Set cookie with name "jwt" = token, with cookie options
  // Remove password from output
  user.password = undefined;
  //Send data of user alongside the signed JWT token
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
//-------------------------------------------------------------------------------------------------------

/*
  |-----------------------------------------|
  |             Sign-Up new users           |
  |-----------------------------------------|
*/
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  let url = `${req.protocol}://127.0.0.1:3000/me`; // Localhost
  if (process.env.NODE_ENV === "production") {
    url = `${req.protocol}://${req.get("host")}/me`; // Get Host, of the live website
  }
  // console.log(url);
  await new Email(newUser, url).sendWelcome(); //Send a welcome email to the 'url'
  createAndSendToken(newUser, 201, req, res); // Sign JWT and send it as response
});
//-------------------------------------------------------------------------------------------------------

/*
  |-----------------------------------------|
  |             Log in the users            |
  |-----------------------------------------|
*/
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //Generate an AppError when either the email or the password is not provided
  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }
  // If email and password are present, get user associated with that email from database
  const user = await User.findOne({ email }).select("+password"); // '+' sign means explicitly select the field as it is marked false for select queries

  // Check if user with given mail exist and that the combination of email and password is correct
  if (!user || !(await user.correctPassword(password, user.password)))
    // Generate error when user not found, or password is incorrect
    return next(new AppError("Incorrect email or password"), 401);
  // Login successful, create and sign new JWT token and send it as response
  createAndSendToken(user, 200, req, res);
});
//-------------------------------------------------------------------------------------------------------

/*
  |-----------------------------------------|
  |             Logout users                |
  |-----------------------------------------|
*/
exports.logout = catchAsync(async (req, res, next) => {
  /*
  |--------------------------------------------------------------------------------|
  |Set a cookie without using private signature, so that jwt is invalid / malformed|
  |resulting in logout                                                             |
  |--------------------------------------------------------------------------------|
*/
  res.cookie("jwt", "Logged Out Successfully", {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds from now
    httpOnly: true, // Allow cookies to be only used by web-browsers to prevent modification
  });
  res.status(200).json({
    status: "success",
  });
});
//-------------------------------------------------------------------------------------------------------

/*
  |---------------------------------------------------------------|
  |                 Protect Route Middleware                      |
  |     Allow only logged in users to access the route further    |    
  |---------------------------------------------------------------|
*/
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization && //Check if authorization header is set
    req.headers.authorization.startsWith("Bearer") //Check if a Bearer token is passed with authorization header
  ) {
    /*
  |-----------------------------------------------------------|
  |                 Structure of Bearer token                 |
  |  header = Bearer  ey.2352h289b33bf2384b8tb2398b2f32...    |
  |  header.split(" ")[1] <=== Gives access to the token      |
  |-----------------------------------------------------------|
*/
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt && req.cookies.jwt !== "Logged Out Successfully") {
    /*
  |---------------------------------------------------------------------------|
  |  If no bearer token is set, check if httpCookie is set, if it is check if | 
  |  JWT string is not equal to the logout's JWT string                       |
  |---------------------------------------------------------------------------|
*/

    //if http cookie is found set new value for token
    token = req.cookies.jwt;
  }

  //
  if (req.cookies.jwt === "Logged Out Successfully") return res.redirect("/"); // If user logs out redirect to homepage view
  /*If token is not set, it means user is not logged in.
   Generate an error stating user isn't logged in */
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  /*
  |---------------------------------------------------------------------------|
  |  Verify token with your jwt secret and check for validity of the token    |
  |---------------------------------------------------------------------------|
*/
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //3 Check if user still exists,
  const currentUser = await User.findById(decoded.id); // Check if the user isn't deleted and still exists in the system
  if (!currentUser) {
    return next(
      new AppError("User belonging to this token does no longer exist!") //If user doesn't exist, generate an app-error and return
    );
  }

  //4  Check if user changed password after issuing the token
  if (currentUser.changedPasswordAfter(decoded.iat))
    //   If user changed the password, after logging in, ask user to log in again
    return next(
      new AppError("User recently changed the password, please log in again")
    );
  // grant access to the protected route
  req.user = currentUser; // Add currently logged in user to req object
  res.locals.user = currentUser; // Add currently logged in user locals object; values in this object will be available directly in the view (PUG template)
  next(); //go to next middleware in the chain
});
//-------------------------------------------------------------------------------------------------------
/*
  |---------------------------------------------------------------------------|
  |  Only for rendered pages, to check if user is logged in or not            |
  |---------------------------------------------------------------------------|
*/
exports.isLoggedIn = async (req, res, next) => {
  //   console.log(req);
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        //verify jwt token with your jwt secret
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id); //Check if user still exists
      if (!currentUser) {
        //User was deleted after logging in
        return next(); // go to next middleware in the chain, rather than throwing error
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(); //If user changed password after logging in, go to next middleware in the chain
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser; // User is logged in, set locals object = currently logged in user
      return next();
    } catch (err) {
      return next(); // If error, go to next middleware in the chain
    }
  }
  next();
};
//-------------------------------------------------------------------------------------------------------

/*
  |---------------------------------------------------------------------------|
  |  Restrict route to be accessible to users of specific roles               |
  |---------------------------------------------------------------------------|
*/
exports.restrictTo = (...roles) => {
  // roles ----> allowed user roles
  return (req, res, next) => {
    // if currently logged in user's role is not in the allowed roles, reject access
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    // if currently logged in user's role is in the allowed roles, grant access to next middleware in the chain
    next();
  };
};
//-------------------------------------------------------------------------------------------------------
/*
  |--------------------------------|
  |         Forgot Password        |
  |--------------------------------|
*/
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1 Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      //user not found, generate error
      new AppError("The user with that email address does not exist!", 404)
    );
  //2 Generate random token
  const resetToken = user.createPasswordResetToken(); // create a reset token
  /*
  |------------------------------------------------------------------------------------|
  |                       STRICTLY USE validateBeforeSave: false                       |
  |   If we do not turn off validation, we will get error that the field such as       |
  |   email which is mandatory is not provided, but we don't need to provide email     |
  |   for this functionality, we need to update document, thus we turn off validators  |
  |------------------------------------------------------------------------------------|
*/
  await user.save({ validateBeforeSave: false });
  //3 send it to user's email
  let resetURL = `${req.protocol}://127.0.0.1:3000/resetPassword/${resetToken}`; //create a reset password url for localhost
  if (process.env.NODE_ENV === "production") {
    resetURL = `${req.protocol}://${req.get(
      "host"
    )}/resetPassword/${resetToken}`; //create a reset password url for hosted website
  }

  try {
    await new Email(user, resetURL).sendPasswordReset(); // send reset URL to the user's email
    res.status(200).json({
      status: "success",
      message: "Password reset link sent to your email!",
    });
  } catch (err) {
    /*
  |----------------------------------------------------------------|
  |         User does not receive reset link                       |
  |   Reset the reset token and reset token's expiration time      |
  |----------------------------------------------------------------|
*/
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); // turn off validators

    return next(new AppError("There was an error sending the email", 500)); // Acknowledge user
  }
});
//-------------------------------------------------------------------------------------------------------
/*
  |--------------------------------|
  |         Reset Password         |
  |--------------------------------|
*/
exports.resetPassword = catchAsync(async (req, res, next) => {
  //   console.log("Inside Reset Password");
  // 1. Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  /*
  |--------------------------------------------------------------------------|
  | NOTE - req.params.token is un-hashed, thus we take that un-hashed token, | 
  |  hash it and compare its value with the one stored in Database           |
  |--------------------------------------------------------------------------|
*/
  const user = await User.findOne({
    passwordResetToken: hashedToken, // find user with that hashed token
    passwordResetExpires: { $gt: Date.now() }, // find token with expiry time set in future
  });
  // 2) if no user is set, token is invalid or token has expired
  if (!user) return next(new AppError("Token is invalid or has expired", 400));

  // No error was generated, therefore a valid user exists
  user.password = req.body.password; // get password value from req.body
  user.passwordConfirm = req.body.passwordConfirm; // get password value from req.body
  user.passwordResetToken = undefined; // password is being reset, remove the resetToken
  user.passwordResetExpires = undefined; // password is being reset, remove the resetToken's expiry time
  await user.save(); // update user
  // 4. Log the user in
  createAndSendToken(user, 200, req, res); // create,sign and send new JWT token
});

//-------------------------------------------------------------------------------------------------------
/*
  |--------------------------------|
  |         Update Password        |
  |--------------------------------|
*/
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from collection
  const user = await User.findById(req.user.id).select("+password"); // Find user by id in database, id = id of currently logged in user
  // 2. Check if password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    // Current password is incorrect, deny update of password
    return next(new AppError("Please enter a correct password", 401));
  // 3. Update password
  user.password = req.body.password; // set new password
  user.passwordConfirm = req.body.passwordConfirm; // set new password
  await user.save(); // save updated document
  // 4. Log User in , send JWT
  createAndSendToken(user, 200, req, res); // Password is changed; create, sign and send new JWT token
});
