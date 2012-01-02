/*
 * jQuery Slidawall Plugin v0.3
 * http://makesit.es/
 *
 * Copyright 2012, Makis Tracend
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
(function( $ ){

  var methods = {
     init : function( options ) {

		var settings = {
			'centerX': 640,
			'centerY': 320,
			'rows': 2
		};
		
       return this.each(function(){
         
         var $this = $(this),
		 	 items = $this.find("article"), 
			 thumbs = []; 

		 // first hide the elements while we restructure
		 $this.addClass("slidawall").hide();
		 
		 // get the thumbs
		 items.each(function(){
			 thumbs.push( $(this).attr("data-image") );
		 });
		 
		 // updating settings
		 settings.centerX = $this.width() /2;
		 settings.centerY = $this.height() /2;
		 settings.thumbs = thumbs;
		
		
		 // merging custom options with default settings
		 if (options) {
			 $.extend(settings, options);
		 }

		 // save the settings for later
		 $this.data('slidawall', settings);
				 
		 // create the wall only if there are pictures to show
		 if( thumbs.length > 0){ 
			 // find dimensions 
			 methods.wall.apply( $this );
			 // find dimensions 
			 methods.grid.apply( $this );
			 // set the thumbnails
			 methods.thumbs.apply( $this );
		 }
		 
		 // hide the descriptions
		 if( items.length > 0){ 
			items.each(function(){
				$(this).hide();
			});
		 }
		 
		 methods.perspective.apply( $this );
		 
		 // show the final result
		 $this.show();
		 
       });
     },
     wall : function( ) {

       return this.each(function(){

         var $this = $(this),
             data = $this.data('slidawall'), 
			 items = $this.find("article");
		
		// create the wall container
		$this.prepend('<ul class="wall"></ul>');
		
		var wall = $this.find(".wall");
		
		// inseret the images
		for(i in data.thumbs){
			var src = data.thumbs[i];
			wall.append('<li><img src="'+ src +'" /></li>');
		}
		
		// get the wall dimensions
		data.width = wall.width();
		data.height = wall.height();
		$this.data('slidawall', data);
		 
       });

     },
     grid : function( ) { 
		
       return this.each(function(){

         var $this = $(this),
             data = $this.data('slidawall');
		
		
	 	// automatically support layouts up to 4x4 favoring landscape version
		var grids = [
			{'x': 1, 'y': 1},
			{'x': 2, 'y': 1},
			{'x': 2, 'y': 2},
			{'x': 3, 'y': 2},
			{'x': 3, 'y': 3},
			{'x': 4, 'y': 3},
			{'x': 4, 'y': 4}
		];	
		
		for(i in grids){
			var grid = grids[i];
			// stop once we've found a grid that can contain our thumbnails
			if( grid.x * grid.y >= data.thumbs.length ) break;
			//console.log(grids[i].x);
		}
		
		// add the new options
		data.grid = grid;
		data.thumb_width = data.width/grid.x,
		data.thumb_height = data.height/grid.y;
		$this.data('slidawall', data);

       })

	 },
     thumbs : function( ) {

       return this.each(function(k){

         var $this = $(this),
             data = $this.data('slidawall'), 
			 wall = $this.find('.wall'), 
			 thumbs = wall.find("li"), 
		 	 items = $this.find("article"); 
 
 		  thumbs.each(function(k,v){
			  // set the z-index to 1
			  $(v).css("z-index", 10);
			  
			  // find the relative position based on the grid
			  var posX = k+1, posY = 1;
			  while( posX > data.grid.x){
				  posX -= data.grid.x;
				  posY += 1;
			  }
			  // save the data for later
			  $(v).data("posX", (posX-1)*data.thumb_width);
			  $(v).data("posY", (posY-1)*data.thumb_height);
			  $(v).data("zIndex", $(v).css("z-index"));
			  $(v).data("num", k);

			  // set the dimensions
			  $(v).css("width", data.thumb_width);
			  $(v).css("height", data.thumb_height);
			  $(v).css("left", $(v).data("posX"));
			  $(v).css("top", $(v).data("posY"));
			  
			  $(v).toggle(
				  function () {
					// stop any other animation that is queued
					//thumbs.each(function(){ $(this).css("z-index", 0).stop(true); });
					$(this).css("z-index", 99).animate({
						width: data.width, 
						height: data.height,
						top: 0,
						left: 0
					  }, { "duration": 500, "easing": "swing" }, function() {
						// Animation complete.
					});
					$(items[$(this).data("num")]).show();
				}, 
				function(){
					$(this).animate({
						width: data.thumb_width, 
						height: data.thumb_height,
						top: $(this).data("posY"),
						left: $(this).data("posX"), 
						zIndex: $(this).data("z-index")
					  }, { "duration": 500, "easing": "swing", queue: false }, function() {
						// Animation complete.
					});
					items.hide();
				});
		  });
		  
		  $this.mouseleave(function () {
			thumbs.each( function(){
				if( $(this).width() > data.thumb_width ){
					$(this).animate({
						width: data.thumb_width, 
						height: data.thumb_height,
						top: $(this).data("posY"),
						left: $(this).data("posX"), 
						zIndex: $(this).data("z-index")
					  }, { "duration": 500, "easing": "swing", queue: false }, function() {
						// Animation complete.
					});
				}
				});
	
			 items.each(function(){
				$(this).hide();
			});
		});
			
       });

     },
     perspective : function( ) {

       return this.each(function(){

         var $this = $(this),
		 	 data = $this.data('slidawall'),
		 	 wall = $this.find('.wall');

		$this.mousemove(function(e){

			cx = Math.ceil($('body').width() /2);
			cy = Math.ceil($('body').height() /2);
			dx = event.pageX - cx;
			dy = event.pageY - cy;
			
			tiltx = (dy / cy) /4;
			tilty = - (dx / cx);
			radius = Math.sqrt(Math.pow(tiltx,2) + Math.pow(tilty,2));
			degree = (radius * 50);
			
			// apply transformation
			wall.css('-webkit-transform','rotate3d(' + tiltx + ', ' + tilty + ', 0, ' + degree + 'deg)');
			wall.css('transform','rotate3d(' + tiltx + ', ' + tilty + ', 0, ' + degree + 'deg)');
	 
		  });

		  $this.mouseleave(function(){
				wall.css("-webkit-transform", "rotate3d(0,1,0, 0deg)");
    			wall.css("transform", "rotate3d(0,1,0, 0deg)");
		  });
	
       })

     }
  };

  $.fn.slidawall = function( method ) {
    
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.slidawall' );
    }    
  
  };

})( jQuery );