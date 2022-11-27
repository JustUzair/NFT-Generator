module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err));
    // if first argument of next is of type Error, express automatically call the error handling middleware in errorController
  };
};
