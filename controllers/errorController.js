const AppError = require('../utils/appErrors');
const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}.`;
	// const message = err;
	return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate Field Value : ${value}, Please use another value.`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);
	// console.log(errors);
	const message = `Invalid input data. ${errors.join(' ')}`;
	return new AppError(message, 400);
};
const sendDevError = (err, req, res) => {
	//Api
	if (req.originalUrl.startsWith('/api')) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack
		});
	}
	//Rendered Website
	res.status(err.statusCode).render('error', {
		title: 'Something went wrong',
		statusCode: err.statusCode,
		msg: err.message
	});
};

const sendProductionError = (err, req, res) => {
	// ------API ERROR HANDLER
	if (req.originalUrl.startsWith('/api')) {
		// Operational, trusted error: send message to client
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message
			});
			// Programming or other unknown error: don't leak error details
		}
		// 1) Log error
		console.error('ERROR 💥', err);

		// 2) Send generic message
		return res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!'
		});
	}
	//------RENDERED WEBSITE ERROR HANDLE AND RENDER
	if (err.isOperational) {
		return res.status(err.statusCode).render('error', {
			title: 'Something went wrong',
			statusCode: err.statusCode,
			msg: err.message
		});

		// Programming or other unknown error: don't leak error details
	}

	// 2) Send generic message
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong',
		statusCode: err.statusCode,
		msg: 'Please try again later'
	});
};

const handleJWTError = () =>
	new AppError('Invalid token, please login again', 401);

const handleJWTExpired = () =>
	new AppError('Your token has expired! Please log in again', 401);

module.exports = (err, req, res, next) => {
	// console.log(err.stack);
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';
	if (process.env.NODE_ENV === 'development') {
		sendDevError(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = Object.assign(err);
		// console.log(error.name);
		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError')
			error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError') error = handleJWTError();
		if (error.name === 'TokenExpiredError') error = handleJWTExpired();
		sendProductionError(error, req, res);
	}
};
