class APIFeatures {
	constructor(query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}
	filter() {
		// console.log(
		// 	`Tour find : ${this.query}\n req.query : ${this.queryString}`
		// );
		// 1) Filter the query and remove the keywords not in database model
		const queryObj = { ...this.queryString };
		const excludedFields = ['page', 'sort', 'limit', 'fields']; //keywords not in database model
		excludedFields.forEach((field) => delete queryObj[field]); // delete the field from query object which are not included in database models
		// 2) Find and Prefix the MongoDB operators
		//Operators used for advanced filtering gte, gt, lt, lte
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(
			/\b(gte|gt|lte|lt)\b/g,
			(match) => `$${match}` //if a match is found then return the keyword with '$' sign prefixed
		);
		/* NOTE - 
        In above regex,
        \b indicates exact word 
        g indicates that the string will be replaced if more than one keywords are present in the same query
        */
		this.query = this.query.find(JSON.parse(queryStr));
		return this;
	}
	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.query = this.query.sort(sortBy); // sort() method takes in the field based on which the sorting is to be performed
		} else {
			this.query = this.query.sort('-createdAt'); // '-' minus indicates descending order sort. ex: -price indicated sort by price from high to low
		}
		return this;
	}
	limitFields() {
		//3) Select Particular Fields
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			this.query = this.query.select(fields); // Select specific fields from database
		} else {
			this.query = this.query.select('-__v'); //Here '-' in select function means exclude a field.
			//Also we can use select:false option in schema to disable the access of se sensitive data fields
		}
		return this;
	}
	paginate() {
		// 4) Pagination
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 100;
		const skip = (page - 1) * limit;
		this.query = this.query.skip(skip).limit(limit); // skip indicates the number of fields to be skipped and limit indicates the limit of documents to be fetched
		return this;
	}
}
module.exports = APIFeatures;
