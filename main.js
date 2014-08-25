var sources = require( './config/sources.js' ),
	ffmpeg = require('fluent-ffmpeg'),
	fs = require( 'fs' ),
	outputPath = './output';

var setupDirectoryStructure = function( sources, path, callback ){
	var subdirCount = 0;
	var makeSubdir = function( index, source ){
		var data = {
			raw: source,
			url: 'http://' + source,
			ip: source.substring( 0, source.indexOf( '/' ) )
		};
		fs.mkdir( path + '/source-' + index, function(){
			fs.writeFile( path + '/source-' + index + '/data.json', JSON.stringify( data ), function(){
				console.log( 'Saved data file for source ' + index + '.');
				subdirCount++;
				if( subdirCount >= sources.length && typeof callback === 'function'){
					console.log( 'directory tree setup complete' );
					callback();
				}
			});			
		});
	};
	fs.mkdir( outputPath, function(){		
		for( var i = 0; i < sources.length; i++ ){
			makeSubdir( i, sources[i] );
		}
	});
};

var getAllScreenshots = function( sources, path, callback ){
	var timestamp = (new Date().getTime());
	var index = -1;
	var next = function(){
		index++;
		if( index < sources.length ){
			getScreenshot( 'http://' + sources[ index ], path + '/source-' + index, function(){
				next();
			});
		} else {
			if( typeof callback === 'function' ){
				console.log( 'screenshots complete' );
				callback();
			}
		}
	};
	var getScreenshot = function( url, outputPath, callback ){
		var command = ffmpeg({ timeout: 300 });
		console.log( 'getting from: ' + url );
		command.addInput( url )
			.size('1280x?')
			.outputOptions([
				'-r 1',
				'-vframes 1',
				'-f image2'
			])
			.output( outputPath + '/' + timestamp + '.jpg' )
			.on('error', function(err, stdout, stderr) {
    			console.log('Cannot process video at ' + url + ': ' + err.message);
    			if( typeof callback === 'function' ){
    				callback();
    			}
  			})
			.on('end', callback)
			.run();
	};

	console.log( "Running at " + timestamp );
	for( var i = 0; i < 15; i++ ){
		next();
	}
	
	// for( var i = 0; i < sources.length; i++ ){
	// 	var index = i;
	// 	// ( function( index ){
	// 	// 	setTimeout( function(){
	// 		try{
	// 			getScreenshot( 'http://' + sources[ index ], path + '/source-' + index );
	// 		} catch( e ){
	// 			console.log( 'Error: ', e );
	// 		}
	// 	// 	}, index * 250 );			
	// 	// })( i );		
	// }

};


setupDirectoryStructure( sources, outputPath, function(){
	getAllScreenshots( sources, outputPath );
});



// for( var i = 0; i < sources.length; i++ ){
// 	console.log( 'http://' + sources[i] );
// }

// equivalent of ffmpeg command:
// ffmpeg -f mjpeg -i http://"$p" -r 1  -s 640x480  -vframes 1 -f image2 "dest"/"$count".jpeg
// var command = ffmpeg()
// 				.addInput('http://213.196.182.244/mjpg/video.mjpg')
// 				.size('1280x?')
// 				.outputOptions([
// 					'-r 1',
// 					'-vframes 1',
// 					'-f image2'
// 				])
// 				.output( 'test.png' )
// 				.run();

