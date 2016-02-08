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
	state: { type: Types.Select, options: 'draft, published, archived', default: 'published', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
	image: { type: Types.CloudinaryImage },
	rating: {type: Number},
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
	},
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true },
	exif: {
		make: {type: String, noedit: true},
		model: {type: String, noedit: true},
		exposureTime: {type: Number, noedit: true},
		originalDate: {type: String, noedit: true},
		orientation: {type: Number, noedit: true},
		fNumber: {type: Number, noedit: true},
		ISO: {type: Number, noedit: true},
		colorSpace: {type: Number, noedit: true}
	}
});

Post.schema.virtual('content.full').get(function() {
	return this.content.extended || this.content.brief;
});


Post.schema.pre('save', function(next) {
	// populate exif metadata with exif module
	var ExifImage = require('exif').ExifImage;
	var that = this;

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
					that.exif.make = exifData.image.Make;
					that.exif.model = exifData.image.Model;
					that.exif.orientation = exifData.image.Orientation;
					that.exif.exposureTime = exifData.exif.ExposureTime;
					that.exif.originalDate = exifData.exif.DateTimeOriginal;
					that.exif.fNumber = exifData.exif.FNumber;
					that.exif.ISO = exifData.exif.ISO;
					that.exif.colorSpace = exifData.exif.ColorSpace;
			});
		} catch (error) {
			console.log('Error: ' + error.message);
		}
		console.log(that);
    	next();
	});
});


Post.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Post.register();
