var keystone = require('keystone');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'blog';
	locals.filters = {
		post: req.params.post
	};
	locals.data = {
		posts: []
	};
	locals.cloudinaryUrl = function(height, width, transformation, cloudinaryUrl){
		imageString = cloudinaryUrl.replace('http://res.cloudinary.com/immist/image/upload/', '');
		baseUrl = 'http://res.cloudinary.com/immist/image/upload/';
		return baseUrl + 'c_' + transformation + ',h_' + height + ',w_'+ width + '/' + imageString;
	};
	
	// Load the current post
	view.on('init', function(next) {
		
		var q = keystone.list('Post').model.findOne({
			state: 'published',
			slug: locals.filters.post
		}).populate('author categories');
		
		q.exec(function(err, result) {
			locals.data.post = result;
			next(err);
		});
		
	});
	
	// Load other posts
	view.on('init', function(next) {
		
		var q = keystone.list('Post').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');
		
		q.exec(function(err, results) {
			locals.data.posts = results;
			next(err);
		});
		
	});
	
	// Render the view
	view.render('post');
	
};
