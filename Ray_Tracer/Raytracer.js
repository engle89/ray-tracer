// CS 174a Project 3 Ray Tracer Skeleton
function Ball( )
{                                 // *** Notice these data members. Upon construction, a Ball first fills them in with arguments:
  var members = [ "position", "size", "color", "k_a", "k_d", "k_s", "n", "k_r", "k_refract", "refract_index" ];
  for( i in arguments )    this[ members[ i ] ] = arguments[ i ];
  this.construct();
}

//second step finish
Ball.prototype.construct = function()
{
  // TODO:  Give Ball any other data members that might be useful, assigning them according to this Ball's this.position and this.size members.
  this.model_transform = mat4();
  this.model_transform = mult(this.model_transform, translation(this.position[0],this.position[1],this.position[2]));
  this.model_transform = mult(this.model_transform, scale(this.size[0],this.size[1],this.size[2]));
  this.inverse_matrix = inverse(this.model_transform);
 //this.inverse_transform = inverse(this.model_transform);
}

Ball.prototype.intersect = function( ray, existing_intersection, minimum_dist )
{
  // TODO:  Given a ray, check if this Ball is in its path.  Recieves as an argument a record of the nearest intersection found 
  //        so far, updates it if needed and returns it.  Only counts intersections that are at least a given distance ahead along the ray.
  //        An interection object is assumed to store a Ball pointer, a t distance value along the ray, and a normal
  
  var s_new = mult_vec(this.inverse_matrix, vec4 (ray.origin[0],ray.origin[1],ray.origin[2],1));
  var c_new = mult_vec(this.inverse_matrix, vec4 (ray.dir[0],ray.dir[1],ray.dir[2],0) );
  
  var A = dot(c_new,c_new);
  var B = dot(s_new,c_new);
  var C = dot(s_new,s_new)-2;
  
  var t_h = existing_intersection.distance;
  var t1;
  var t2;
  var determinant = B*B-A*C;
  
  
  var nointersection = false;
  var inside = false;
  
  if( determinant < 0)
	  nointersection = true;
  
  else if (determinant == 0)
  {
	  t_h = -B/A;
	  if(t_h < minimum_dist)
		  nointersection = true;
  }
 else
 {
	 t1 = -B/A + (Math.sqrt(determinant))/A;	
	 t2 = -B/A - (Math.sqrt(determinant))/A;
	 
	 //behind camera
	 if(t1 <minimum_dist && t2 <minimum_dist)
	   nointersection = true;
	 
	 t_h = Math.min(t1,t2);
	 if(t1 < minimum_dist && t2 > minimum_dist)
	 { 
        t_h = t2;
		inside = true;
	 }
	 if(t1> minimum_dist && t2 < minimum_dist)
	 { 
        t_h = t1;
		inside = true;
	 }
 }
 
 
 if (nointersection == true)
	 return existing_intersection;
 
 
 
// var ball_intersection = vec4((ray.origin[0] + t_h*ray.dir[0]),(ray.origin[1] + t_h*ray.dir[1]),(ray.origin[2] + t_h*ray.dir[2]),1 );
 var ball_intersection = vec4((s_new[0]+t_h*c_new[0]),(s_new[1]+t_h*c_new[1]),(s_new[2]+t_h*c_new[2]),1);
// var ball_intersection = mult_vec(this.model_transform, intersection);
 var normal = vec4(0,0,0,0);
 
 
 
 
 if(inside == true) 
 {
   // ball_intersection =subtract((0,0,0,1),ball_intersection);
    normal = vec4(-ball_intersection[0],-ball_intersection[1],-ball_intersection[2],0);
    normal = mult_vec(transpose(this.inverse_matrix), normal);
	normal = vec3(normal[0],normal[1],normal[2]);
    normal = normalize(normal);
	normal = vec4(normal[0],normal[1],normal[2],0);
 }
 else
 {
	// ball_intersection = subtract(ball_intersection,(0,0,0,1));
     normal = vec4(ball_intersection[0],ball_intersection[1],ball_intersection[2],0);
     normal = mult_vec(transpose(this.inverse_matrix), normal);
     normal = vec3(normal[0],normal[1],normal[2]);
     normal = normalize(normal);
	 normal = vec4(normal[0],normal[1],normal[2],0);
 }

 
 
 if(t_h < existing_intersection.distance)
 {
	 existing_intersection.distance = t_h;
	 existing_intersection.ball = this;
	 existing_intersection.normal=normal;
 }
  return existing_intersection;
  
}



var mult_3_coeffs = function( a, b ) { return [ a[0]*b[0], a[1]*b[1], a[2]*b[2] ]; };       // Convenient way to combine two color vectors

var background_functions = {                // These convert a ray into a color even when no balls were struck by the ray.
waves: function( ray, distance )
{
  return Color( .5 * Math.pow( Math.sin( 2 * ray.dir[0] ), 4 ) + Math.abs( .5 * Math.cos( 8 * ray.dir[0] + Math.sin( 10 * ray.dir[1] ) + Math.sin( 10 * ray.dir[2] ) ) ),
                .5 * Math.pow( Math.sin( 2 * ray.dir[1] ), 4 ) + Math.abs( .5 * Math.cos( 8 * ray.dir[1] + Math.sin( 10 * ray.dir[0] ) + Math.sin( 10 * ray.dir[2] ) ) ),
                .5 * Math.pow( Math.sin( 2 * ray.dir[2] ), 4 ) + Math.abs( .5 * Math.cos( 8 * ray.dir[2] + Math.sin( 10 * ray.dir[1] ) + Math.sin( 10 * ray.dir[0] ) ) ), 1 );
},
lasers: function( ray, distance ) 
{
  var u = Math.acos( ray.dir[0] ), v = Math.atan2( ray.dir[1], ray.dir[2] );
  return Color( 1 + .5 * Math.cos( Math.floor( 20 * u ) ), 1 + .5 * Math.cos( Math.floor( 20 * v ) ), 1 + .5 * Math.cos( Math.floor( 8 * u ) ), 1 );
},
mixture:       function( ray, distance ) { return mult_3_coeffs( background_functions["waves"]( ray, distance ), background_functions["lasers"]( ray, distance ) ).concat(1); },
ray_direction: function( ray, distance ) { return Color( Math.abs( ray.dir[ 0 ] ), Math.abs( ray.dir[ 1 ] ), Math.abs( ray.dir[ 2 ] ), 1 );  },
color:         function( ray, distance ) { return background_color;  }
};
var curr_background_function = "color";
var background_color = vec4( 0, 0, 0, 1 );

// *******************************************************
// Raytracer class - gets registered to the window by the Animation object that owns it
function Raytracer( parent )  
{
  var defaults = { width: 32, height: 32, near: 1, left: -1, right: 1, bottom: -1, top: 1, scanline: 0, visible: true, anim: parent, ambient: vec3( .1, .1, .1 ) };
  for( i in defaults )  this[ i ] = defaults[ i ];
  
  this.m_square = new N_Polygon( 4 );                   // For texturing with and showing the ray traced result
  this.m_sphere = new Subdivision_Sphere( 4, true );    // For drawing with ray tracing turned off
  
  this.balls = [];    // Array for all the balls
    
  initTexture( "procedural", true, true );      // Our texture for drawing the ray trace    
  textures["procedural"].image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"   // Blank gif file
  
  this.scratchpad = document.createElement('canvas');   // A hidden canvas for assembling the texture
  this.scratchpad.width  = this.width;
  this.scratchpad.height = this.height;
  
  this.scratchpad_context = this.scratchpad.getContext('2d');
  this.imageData          = new ImageData( this.width, this.height );     // Will hold ray traced pixels waiting to be stored in the texture
  
  this.make_menu();
}

Raytracer.prototype.toggle_visible = function() { this.visible = !this.visible; document.getElementById("progress").style = "display:inline-block;" };

Raytracer.prototype.make_menu = function()      // The buttons
{
  document.getElementById( "raytracer_menu" ).innerHTML = "<span style='white-space: nowrap'><button id='toggle_raytracing' class='dropbtn' style='background-color: #AF4C50'>Toggle Ray Tracing</button> \
                                                           <button onclick='document.getElementById(\"myDropdown2\").classList.toggle(\"show\"); return false;' class='dropbtn' style='background-color: #8A8A4C'>Select Background Effect</button><div id='myDropdown2' class='dropdown-content'>  </div>\
                                                           <button onclick='document.getElementById(\"myDropdown\").classList.toggle(\"show\"); return false;' class='dropbtn' style='background-color: #4C50AF'>Select Test Case</button><div id='myDropdown' class='dropdown-content'>  </div> \
                                                           <button id='submit_scene' class='dropbtn'>Submit Scene Textbox</button> \
                                                           <div id='progress' style = 'display:none;' ></div></span>";
  for( i in test_cases )
  {
    var a = document.createElement( "a" );
    a.addEventListener("click", ( function( i, self ) { return function() { load_case( i ); self.parseFile(); }; } )( i, this ), false);
    a.innerHTML = i;
    document.getElementById( "myDropdown" ).appendChild( a );
  }
  for( j in background_functions )
  {
    var a = document.createElement( "a" );
    a.addEventListener("click", ( function( j ) { return function() { curr_background_function = j; } } )( j ), false);
    a.innerHTML = j;
    document.getElementById( "myDropdown2" ).appendChild( a );
  }
  
  document.getElementById( "input_scene" ).addEventListener( "keydown", function(event) { event.cancelBubble = true; }, false );
  
  window.addEventListener( "click", function(event) {  if (!event.target.matches('.dropbtn')) {    
  document.getElementById( "myDropdown"  ).classList.remove("show");
  document.getElementById( "myDropdown2" ).classList.remove("show"); } }, false );

  document.getElementById( "toggle_raytracing" ).addEventListener("click", this.toggle_visible.bind( this ), false);
  document.getElementById( "submit_scene" ).addEventListener("click", this.parseFile.bind( this ), false);
}

//first finish this
Raytracer.prototype.getDir = function( ix, iy ) {
  
  // TODO:  Maps an (x,y) pixel to a corresponding xyz vector that reaches the near plane.  This function, once finished,
  //        will help cause everything under the "background functions" menu to start working. 
  
 //   return vec4( 0, 0, 1, 0 ); 
//dont know why but it seems this.left this.right and this.top and this.bottom does not work so i plug n origin value 
 a = ix/this.width;
 b = iy/this.height;
 px = -1+2*a;
 py = -1+2*b;
 return vec4(px,py,-this.near,0);
}
  
Raytracer.prototype.trace = function( ray, color_remaining, shadow_test_light_source )
{
  // TODO:  Given a ray, return the color in that ray's path.  Could be originating from the camera itself or from a secondary reflection 
  //        or refraction off a ball.  Call Ball.prototype.intersect on each ball to determine the nearest ball struck, if any, and perform
  //        vector math (namely the Phong reflection formula) using the resulting intersection record to figure out the influence of light on 
  //        that spot.  
  //
  //        Arguments include some indicator of recursion level so you can cut it off after a few recursions.  Or, optionally,
  //        instead just store color_remaining, the pixel's remaining potential to be lit up more... proceeding only if that's still significant.  
  //        If a light source for shadow testing is provided as the optional final argument, this function's objective simplifies to just 
  //        checking the path directly to a light source for obstructions.
  
  if( length( color_remaining ) < .3 )    return Color( 0, 0, 0, 1 );  // Is there any remaining potential for brightening this pixel even more?

  //get nearest intersection
  var closest_intersection = { distance: Number.POSITIVE_INFINITY }    // An empty intersection object
 /* var compare = vec4(0,0,0,1);
  var dist;
  if(equal(ray.origin, compare))
	  dist=1;
  else
	  dist=0.0001;
  */

  for (var i =0; i < this.balls.length; i++)
    this.balls[i].intersect(ray,closest_intersection, 0.0001);
 
  if( !closest_intersection.ball )
    return mult_3_coeffs( this.ambient, background_functions[ curr_background_function ] ( ray ) ).concat(1);

  //local color
  var local_color = vec4 ((closest_intersection.ball.color[0]*closest_intersection.ball.k_a),(closest_intersection.ball.color[1]*closest_intersection.ball.k_a),(closest_intersection.ball.color[2]*closest_intersection.ball.k_a),1);

  var surface_color = local_color;
  var t_h = closest_intersection.distance;
  var ball_intersection =  vec4((ray.origin[0] + t_h*ray.dir[0]),(ray.origin[1] + t_h*ray.dir[1]),(ray.origin[2] + t_h*ray.dir[2]),1 );
 
  for (var j=0; j<this.anim.graphicsState.lights.length; j++)
  {
	  //diffuse
	  
	  //get light and do the string to float transformation
	  var light_origin = vec4(parseFloat(this.anim.graphicsState.lights[j].position[0]),parseFloat(this.anim.graphicsState.lights[j].position[1]),parseFloat(this.anim.graphicsState.lights[j].position[2]) ,1);
	  var light_dir = subtract(light_origin, ball_intersection);
	  var L = vec3(light_dir[0],light_dir[1],light_dir[2]);
	  //light vector L	  
	   L = normalize(L);
	  L = vec4(L[0],L[1],L[2],0);
	  var light_ray = {origin:ball_intersection, dir:light_dir};
	  var light_intersection = {distance:1};
	  
	  for (var i =0; i < this.balls.length; i++)
             this.balls[i].intersect(light_ray,light_intersection, 0.0001);
	  
	  if(light_intersection.ball == null)
	  {
		  //diffuse
	     var D = dot(L,closest_intersection.normal);

	    if(D > 0)
	    {
		 var a = closest_intersection.ball.k_d*D;
		 var diffuse = mult_3_coeffs( this.anim.graphicsState.lights[j].color.slice(0, 3),scale_vec( a,  closest_intersection.ball.color ) );
		 diffuse = vec4 (diffuse[0],diffuse[1],diffuse[2],0);
		 surface_color = add (surface_color,diffuse);
	    }
		
		//light vector r
		var r = scale_vec(2*D, closest_intersection.normal);
		r = subtract(r, L);
		r = vec3(r[0],r[1],r[2]);
		r = normalize(r);
		r = vec4(r[0],r[1],r[2],0);
		
		//light vector V
		var v = vec4(ray.origin[0],ray.origin[2],ray.origin[2],1);
		v = subtract(v, ball_intersection);
		v = vec3(v[0],v[1],v[2]);
		v = normalize(v);
		v= vec4(v[0],v[1],v[2],0);
		
		//specular
		var R = dot(r,v);
		if(R >0)
		{
			var b = closest_intersection.ball.k_s* Math.pow(Math.max(0,R), closest_intersection.ball.n);
			var specular = scale_vec(b, this.anim.graphicsState.lights[j].color.slice(0,3));
			specular = vec4(specular[0],specular[1],specular[2],0);
      surface_color = add(surface_color, specular);		
      //console.log(specular);	
		}    	   
	  } 	 
  }
  
 
  //reflection
  var reflect_origin = ball_intersection;
  var c = vec4(ray.dir[0], ray.dir[1], ray.dir[2],0);
  c = vec3(c[0],c[1],c[2]);
  c = normalize(c);
  c = vec4(c[0],c[1],c[2],0);
  var coefficient = -2*dot(c,closest_intersection.normal);
  
  var reflect_dir = scale_vec(coefficient, closest_intersection.normal);
  reflect_dir = add(reflect_dir, c);
  var reflect = {origin:reflect_origin, dir:reflect_dir};

  
  var pixel_color = surface_color;
  color_remaining2 = vec4(color_remaining[0], color_remaining[1], color_remaining[2], 0);
  
  var color_tmp = subtract(vec4(1,1,1,0), surface_color);
  var color_tmp2 = mult_3_coeffs(color_tmp, color_remaining2);
  color_tmp2 = vec4(color_tmp2[0], color_tmp2[1],color_tmp2[2],0);
  color_tmp3 = scale_vec(closest_intersection.ball.k_r, color_tmp2);
  
  //recursion for reflection
  var reflect_color = this.trace(reflect, color_tmp3).slice(0,3);
  reflect_color = scale_vec(closest_intersection.ball.k_r,reflect_color);
  reflect_color = mult_3_coeffs(color_tmp, reflect_color);
  reflect_color = vec4(reflect_color[0], reflect_color[1], reflect[2],0);  
  
  pixel_color = add(pixel_color, reflect_color);
  
  //refraction
  var refract_origin = ball_intersection;
  var C = -dot(closest_intersection.normal, c);
  C = closest_intersection.ball.refract_index*C - Math.sqrt(1 - closest_intersection.ball.refract_index*closest_intersection.ball.refract_index*(1- C*C));
  var refract_dir = scale_vec(C, closest_intersection.normal);
  refract_dir = add(refract_dir, scale_vec(closest_intersection.ball.refract_index, c ));
  var refract = {origin:refract_origin, dir:refract_dir};
  
  //recursion for refraction
  var color_tmp4 = scale_vec(closest_intersection.ball.k_refract, color_tmp2);
  var refract_color = this.trace(refract, color_tmp4).slice(0,3);
  refract_color = scale_vec(closest_intersection.ball.k_refract, refract_color);
  refract_color = mult_3_coeffs(color_tmp, refract_color);
  refract_color = vec4(refract_color[0], refract_color[1], refract_color[2], 0);
  
  pixel_color = add(pixel_color, refract_color);
  
  
  
  return pixel_color;
}

Raytracer.prototype.parseLine = function( tokens )            // Load the text lines into variables
{
  switch( tokens[0] )
    {
        case "NEAR":    this.near   = tokens[1];  break;
        case "LEFT":    this.left   = tokens[1];  break;
        case "RIGHT":   this.right  = tokens[1];  break;
        case "BOTTOM":  this.bottom = tokens[1];  break;
        case "TOP":     this.top    = tokens[1];  break;
        case "RES":     this.width  = tokens[1];  
                        this.height = tokens[2]; 
                        this.scratchpad.width  = this.width;
                        this.scratchpad.height = this.height; 
                        break;
        case "SPHERE":
          this.balls.push( new Ball( vec3( tokens[1], tokens[2], tokens[3] ), vec3( tokens[4], tokens[5], tokens[6] ), vec3( tokens[7], tokens[8], tokens[9] ), 
                             tokens[10], tokens[11], tokens[12], tokens[13], tokens[14], tokens[15], tokens[16] ) );
          break;
        case "LIGHT":
          this.anim.graphicsState.lights.push( new Light( vec4( tokens[1], tokens[2], tokens[3], 1 ), Color( tokens[4], tokens[5], tokens[6], 1 ), 100000 ) );
          break;
        case "BACK":     background_color = Color( tokens[1], tokens[2], tokens[3], 1 );  gl.clearColor.apply( gl, background_color ); break;
        case "AMBIENT":
          this.ambient = vec3( tokens[1], tokens[2], tokens[3] );          
    }
}

Raytracer.prototype.parseFile = function()        // Move through the text lines
{
  this.balls = [];   this.anim.graphicsState.lights = [];
  this.scanline = 0; this.scanlines_per_frame = 1;                            // Begin at bottom scanline, forget the last image's speedup factor
  document.getElementById("progress").style = "display:inline-block;";        // Re-show progress bar
  this.anim.graphicsState.camera_transform = mat4();                          // Reset camera
  var input_lines = document.getElementById( "input_scene" ).value.split("\n");
  for( var i = 0; i < input_lines.length; i++ ) this.parseLine( input_lines[i].split(/\s+/) );
}

Raytracer.prototype.setColor = function( ix, iy, color )        // Sends a color to one pixel value of our final result
{
  var index = iy * this.width + ix;
  this.imageData.data[ 4 * index     ] = 255.9 * color[0];    
  this.imageData.data[ 4 * index + 1 ] = 255.9 * color[1];    
  this.imageData.data[ 4 * index + 2 ] = 255.9 * color[2];    
  this.imageData.data[ 4 * index + 3 ] = 255;  
}

Raytracer.prototype.display = function(time)
{
  var desired_milliseconds_per_frame = 100;
  if( ! this.prev_time ) this.prev_time = 0;
  if( ! this.scanlines_per_frame ) this.scanlines_per_frame = 1;
  this.milliseconds_per_scanline = Math.max( ( time - this.prev_time ) / this.scanlines_per_frame, 1 );
  this.prev_time = time;
  this.scanlines_per_frame = desired_milliseconds_per_frame / this.milliseconds_per_scanline + 1;
  
  if( !this.visible )  {                         // Raster mode, to draw the same shapes out of triangles when you don't want to trace rays
    for( i in this.balls )
        this.m_sphere.draw( this.anim.graphicsState, this.balls[i].model_transform, new Material( this.balls[i].color.concat( 1 ), 
                                                                              this.balls[i].k_a, this.balls[i].k_d, this.balls[i].k_s, this.balls[i].n ) );
    this.scanline = 0;    document.getElementById("progress").style = "display:none";     return; }; 
  if( !textures["procedural"] || ! textures["procedural"].loaded ) return;      // Don't display until we've got our first procedural image
  
  this.scratchpad_context.drawImage(textures["procedural"].image, 0, 0 );
  this.imageData = this.scratchpad_context.getImageData(0, 0, this.width, this.height );    // Send the newest pixels over to the texture
  var camera_inv = inverse( this.anim.graphicsState.camera_transform );
   
  for( var i = 0; i < this.scanlines_per_frame; i++ )     // Update as many scanlines on the picture at once as we can, based on previous frame's speed
  {
    var y = this.scanline++;
    if( y >= this.height ) { this.scanline = 0; document.getElementById("progress").style = "display:none" };
    document.getElementById("progress").innerHTML = "Rendering ( " + 100 * y / this.height + "% )..."; 
    for ( var x = 0; x < this.width; x++ )
    {
     var ray = { origin: mult_vec( camera_inv, vec4( 0, 0, 0, 1 ) ), dir: mult_vec( camera_inv, this.getDir( x, y ) ) };   // Apply camera
      this.setColor( x, y, this.trace( ray, vec3( 1, 1, 1 ) ) );                                    // ******** Trace a single ray *********
    }
  }
  
  this.scratchpad_context.putImageData( this.imageData, 0, 0);                    // Draw the image on the hidden canvas
  textures["procedural"].image.src = this.scratchpad.toDataURL("image/png");      // Convert the canvas back into an image and send to a texture
  
  this.m_square.draw( new GraphicsState( mat4(), mat4(), 0 ), mat4(), new Material( Color( 0, 0, 0, 1 ), 1,  0, 0, 1, "procedural" ) );

  if( !this.m_text  ) { this.m_text  = new Text_Line( 45 ); this.m_text .set_string("Open some test cases with the blue button."); }
  if( !this.m_text2 ) { this.m_text2 = new Text_Line( 45 ); this.m_text2.set_string("Click and drag to steer."); }
  
  var model_transform = rotation( -90, vec3( 0, 1, 0 ) );                           
      model_transform = mult( model_transform, translation( .3, .9, .9 ) );
      model_transform = mult( model_transform, scale( 1, .075, .05) );
  
  this.m_text .draw( new GraphicsState( mat4(), mat4(), 0 ), model_transform, true, vec4(0,0,0, 1 - time/10000 ) );         
      model_transform = mult( model_transform, translation( 0, -1, 0 ) );
  this.m_text2.draw( new GraphicsState( mat4(), mat4(), 0 ), model_transform, true, vec4(0,0,0, 1 - time/10000 ) );   
}

Raytracer.prototype.init_keys = function()   {  shortcut.add( "SHIFT+r", this.toggle_visible.bind( this ) );  }

Raytracer.prototype.update_strings = function( debug_screen_object )    // Strings that this displayable object (Raytracer) contributes to the UI:
  { }