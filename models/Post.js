var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Post Model
 * ==========
 */

var Post = new keystone.List('Post', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true }
});

Post.add({
	title: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
	image: { type: Types.CloudinaryImage },
	rating: {type: Number},
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
	},
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true },
	imageExifData: {type: String }
});

Post.schema.virtual('content.full').get(function() {
	return this.content.extended || this.content.brief;
});


Post.schema.pre('save', function(next) {
	// populate exif metadata with exif module
	var ExifImage = require('exif').ExifImage;
	console.log(this.image);


	// download image

	var request = require('request'), fs = require('fs');

	request({
		url : this.image.url,
		//make the returned body a Buffer
		encoding : null
	}, function(error, response, body) {

		try {
			new ExifImage({ image : body }, function (error, exifData) {
				if (error)
					console.log('Error: '+error.message);
				else
					console.log(exifData); // Do something with your data!

					console.log(this);
					this.imageExifData = JSON.stringify(exifData);
			});
		} catch (error) {
			console.log('Error: ' + error.message);
		}

	});

    //
	//console.log(this);

	next();
});


Post.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Post.register();
