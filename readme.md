# NFT-Generator

I took the inspiration from [Fireship.io](https://www.youtube.com/watch?v=meTpMP0J5E8) and thought of making a full fledged web app that allowed for artists to upload and generate their arts, and allowed for users to buy them/mint them.

The project is supposed to be a crossover between Web2 and Web3, where artists can upload their arts and generate unique
NFTs from them.

The logics / features that are implemented on top of [Fireship.io](https://www.youtube.com/watch?v=meTpMP0J5E8)'s exisitng one are:

- Dynamically calculated the no. of layers that are uploaded by the artists, based on them generated the arts.

- Storing the data about generated arts in database

- Allow artists to upload their arts through the form given on frontend.

- Refactored Fireship.io's synchronous art generation logic to asynchronous (non-blocking), so that the server can continue to handle the requests, while generating the arts.

- Sign Up user according to their preferred roles

- Send welcome emails to newly created users.

- Hashing User's password as a security measure before storing it into the database.

- Login functionality implemented from scratch using JWT.

- Restricting users from performing un-authorized actions, for example:

  - Allow only artists to upload and generate arts
  - Allow only admin(s) to view all the users of the system
  - All the user can update their own data, but only can admin(s) can update other user's data including their own.

- Reset password and forgot functionality by sending the password reset link over to the Users's email.

- Uploading and Resizing User's PFPs.

- All the views of the above functionalities are implemented as views using Pug template engine (SSR - Server Side Rendering).

- Global Error Handling, both on server as well as the client side.

## Acknowledgements

- Inspiration [Fireship.io](https://www.youtube.com/watch?v=meTpMP0J5E8)

## Screenshots

![Home Page](/Screenshots/1.JPG?raw=true "Home Page")
![Home Page (Artists Section)](/Screenshots/2.JPG?raw=true "Home Page (Artists Section)")
![Home Page (After Login)](/Screenshots/3.JPG?raw=true "Home Page (After Login)")
![Login Page](/Screenshots/4.JPG?raw=true "Login Page")
![Login Auth](/Screenshots/5.JPG?raw=true "Login Auth")
![Signup Page](/Screenshots/6.JPG?raw=true "Signup Page")
![Forgot Password Page](/Screenshots/7.JPG?raw=true "Forgot Password Page")
![Password Reset Link Sent to Email](/Screenshots/8.JPG?raw=true "Password Reset Link Sent to Email")
![Reset Password Page](/Screenshots/9.JPG?raw=true "Reset Password Page")
![Global Error Handling Page](/Screenshots/10.JPG?raw=true "Global Error Handling Page")
![Arts Generated By Artists](/Screenshots/11.JPG?raw=true "Arts Generated By Artists")
![User Profile Page](/Screenshots/12.JPG?raw=true "User Profile Page")
![Upload New Profile Photo of user](/Screenshots/13.JPG?raw=true "Upload New Profile Photo of user")
![User Profile Page Change Password Section](/Screenshots/14.JPG?raw=true "User Profile Page Change Password Section")

## Installation

Install my-project with npm

```bash
  git clone https://github.com/JustUzair/NFT-Generator.git
  cd NFT-Generator
  npm i
```

## Environment Variables

To run this project, you will need to add the following environment variables to your config.env file

`PORT`=3000

`NODE_ENV`=development/production (use any one of the two, CASE SENSITIVE)

`DATABASE`= `MONGODB_DATABASE_URL`

`DATABASE_PASSWORD`= `MONGODB_DATABASE_PASSWORD`

`JWT_SECRET`=`CUSTOM_JWT_SIGNATURE`

`JWT_EXPIRES_IN`=90d (`JWT token expires after 90 days`)

`JWT_COOKIE_EXPIRES_IN`=90 (`COOKIE expires after 90 days`)

[Nodemailer Doc](https://nodemailer.com/smtp/#authentication)

`EMAIL_USERNAME`=`MAILTRAP_SMTP_USERNAME`

`EMAIL_PASSWORD`=`MAILTRAP_SMTP_PASSWORD`

`EMAIL_HOST`=smtp.mailtrap.io

`EMAIL_PORT`=2525

`EMAIL_FROM`=`EMAIL_HOST`

[SendGrid Email API Doc](https://app.sendgrid.com/guide/integrate/langs/smtp)

`SENDGRID_USERNAME`=`SENDGRID_EMAIL_API_USERNAME`

`SENDGRID_PASSWORD`=`SENDGRID_EMAIL_API_PASSWORD`

## Tech Stack

**Client:** Pug Template Engine (SSR - Server Side Rendering)

**Server:** Node.js, Express, MongoDB
