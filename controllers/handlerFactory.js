const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appErrors");

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id); // _id = id parameter passed in the URL

    //No document with that id exists
    if (!doc || doc == null)
      return next(new AppError("No document found with that ID", 404));
    // Document deleted successfully, send acknowledgement
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    // https://mongoosejs.com/docs/api.html#model_Model-findByIdAndUpdate
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return new, updated document
      runValidators: true, // run validation before updating document, ex: name must not be null,etc
    });
    //No document with that id exists
    if (!doc || doc == null)
      return next(new AppError("No document found with that ID", 404));
    // Document updated successfully, send acknowledgement and the new document
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    //Create new document, from body passed in the req.body
    const newDoc = await Model.create(req.body);
    // Document created successfully, send acknowledgement and the new document
    res.status(201).json({
      status: "success",
      data: {
        data: newDoc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id); // URL parameter id = id of existing user
    if (populateOptions) query = query.populate(populateOptions); // If referencing is done, populate the data of referenced document inside of referring one
    const doc = await query; // Run the query
    if (!doc || doc == null)
      // No document exist with given id in the model
      return next(new AppError("No document found with that ID", 404));

    // Document found return response
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
