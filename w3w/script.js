function updateLatLonFields(lat, lon) {
    document.getElementById("latlon").innerHTML = lat + ', ' + lon;
    document.getElementById("wkt").innerHTML = 'POINT('+lon+' '+lat +')';
var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.what3words.com/v2/reverse?coords=" + lat + "%2C" + lon +"&key=GR2GDVL6&lang=en&format=json&display=full",
  "method": "GET",
  "headers": {}
}
jQuery.ajax(settings).done(function (response) {
  document.getElementById("w3w").innerHTML = response.words;
});
}

function makeInfoWindowEvent(map, infowindow, marker) {
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(marker.getTitle());
    infowindow.open(map, marker);
  });
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
    alert("no geo location");
  	}
  }

function initialize() {
		var mapOptions = {
          center: new google.maps.LatLng(-43.21218242279119, 171.71974182128906),
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
        var map = new google.maps.Map(document.getElementById("gmap"), mapOptions);
        //geo location
        // Try HTML5 geolocation
  		if(navigator.geolocation) {
    		navigator.geolocation.getCurrentPosition(function(position) {
      			var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

      			var infowindow = new google.maps.InfoWindow({
        			map: map,
        			position: pos,
        			content: 'Location found using HTML5.'
      				});
      			var marker = new google.maps.Marker({
      				position: pos,
      				map: map,
      				title:"Your Location"
  				});
				//map.setCenter(pos);
					makeInfoWindowEvent(map, infowindow, marker);
    			}, function() {
      			handleNoGeolocation(true);
    			}, function(){ /*does nothing*/}, {enableHighAccuracy: true, maximumAge:6000000, timeout:50000});
  			} else {
    			// Browser doesn't support Geolocation
    			handleNoGeolocation(false);
  		}
        
        
        //display map center
        var center = map.getCenter();
        updateLatLonFields(center.lat(), center.lng());        
        google.maps.event.addListener(map, 'center_changed', function() {
      	var center = map.getCenter();
        updateLatLonFields(center.lat(), center.lng());
 		});
        
        
      }

function loadview(area) {
	var image = '/getlatlong/star.png';
	var shadow = {
			url: '/getlatlong/star_shadow.png', 
			// This marker is 20 pixels wide by 32 pixels tall.
    		size: new google.maps.Size(25, 25),
    		// The origin for this image is 0,0.
    		origin: new google.maps.Point(0,0),
    		// The anchor for this image is the base of the flagpole at 0,32.
    		anchor: new google.maps.Point(7, 23)
			};
			
	if (area == "flock"){
    	var mapOptions = {
          center: new google.maps.LatLng(-43.18468313429795, 171.74649953842163),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
        //load new map
	   map = new google.maps.Map(document.getElementById("gmap"), mapOptions); 
	   //define markers
     	var myLatlng = new google.maps.LatLng(-43.18433696786786, 171.7460958659649);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"The Bell Boulder"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		var myLatlng = new google.maps.LatLng(-43.186171432010724, 171.74690321087837);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"100 times slab"
  		});
  		makeInfoWindowEvent(map, infowindow, marker);
  		var myLatlng = new google.maps.LatLng(-43.188786132626454, 171.74826443195343);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"Split Apple Dyno"
  		});
  		makeInfoWindowEvent(map, infowindow, marker);
  		var myLatlng = new google.maps.LatLng(-43.18133482073773, 171.74862384796143);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"Aslans Rock"
  		});
  		makeInfoWindowEvent(map, infowindow, marker);
  		  		var myLatlng = new google.maps.LatLng(-43.1857274889215, 171.74910128116608);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"Trifecta Boulder"
  		});
  		makeInfoWindowEvent(map, infowindow, marker);
  //end markers
  
    }
    else if (area == "quantum"){
        var mapOptions = {
          center: new google.maps.LatLng(-43.22881206792599, 171.71514987945557),
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
        var quantumImgBnds = new google.maps.LatLngBounds(
			new google.maps.LatLng(-43.226869440238985, 171.71248376369476),
			new google.maps.LatLng(-43.230922699861196, 171.71775966882706)
		);
		var quantumOverlay = new google.maps.GroundOverlay('http://castlehillbasin.co.nz/getlatlong/quantum.png', quantumImgBnds);
		

     //load new map
	   map = new google.maps.Map(document.getElementById("gmap"), mapOptions); 
	   quantumOverlay.setMap(map);
		//define markers
     	var myLatlng = new google.maps.LatLng(-43.229773587093796, 171.7143103480339);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"The Archway"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		var myLatlng = new google.maps.LatLng(-43.228782753078946, 171.7151015996933);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"The Pond"
  		});
  		makeInfoWindowEvent(map, infowindow, marker);
  		  		var myLatlng = new google.maps.LatLng(-43.22752806441019, 171.71663850545883);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"The Headlights Boulder"
  		});
  		makeInfoWindowEvent(map, infowindow, marker);
  //end markers
    }
     else if (area == "dry"){
         var mapOptions = {
          center: new google.maps.LatLng(-43.19493033597372, 171.75272226333618),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
        //load new map
	   map = new google.maps.Map(document.getElementById("gmap"), mapOptions); 

	   	   //define markers
     	var myLatlng = new google.maps.LatLng(-43.19320759661182, 171.75456762313843);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"Cosmic Energy"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		var myLatlng = new google.maps.LatLng(-43.19614854342095, 171.75126314163208);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"The Texas Hat"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  //end markers
    }
     else if (area == "spittle"){
         var mapOptions = {
          center: new google.maps.LatLng(-43.23150897353907, 171.71587944030762),
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
        //load new map
	   	map = new google.maps.Map(document.getElementById("gmap"), mapOptions); 
	   	//define markers
  		var myLatlng = new google.maps.LatLng(-43.23121583740516, 171.71536713838577);
     	var marker = new google.maps.Marker({
      		position: myLatlng,
      		map: map,
      		icon: image,
      		shadow: shadow,
      		title:"The Cyclops Boulder"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		var myLatlng = new google.maps.LatLng(-43.231526561662264, 171.71779185533524);
     	var marker = new google.maps.Marker({
      		position: myLatlng,
      		map: map,
      		icon: image,
      		shadow: shadow,
      		title:"The Submarine Boulder"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		//end markers
    }
     else if (area == "cave"){
         var mapOptions = {
          center: new google.maps.LatLng(-43.197120354395246, 171.7444932460785),
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
        //load new map
	   map = new google.maps.Map(document.getElementById("gmap"), mapOptions); 
	   	   	//define markers
  		var myLatlng = new google.maps.LatLng(-43.198080418047276, 171.74338281154633);
     	var marker = new google.maps.Marker({
      		position: myLatlng,
      		map: map,
      		icon: image,
      		shadow: shadow,
      		title:"The River Boulder"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		var myLatlng = new google.maps.LatLng(-43.19609770378909, 171.74488753080368);
     	var marker = new google.maps.Marker({
      		position: myLatlng,
      		map: map,
      		icon: image,
      		shadow: shadow,
      		title:"Babyfood"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		//end markers
    }
     else if (area == "dark"){
         var mapOptions = {
          center: new google.maps.LatLng(-43.22545054025083, 171.7173171043396),
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
        //load new map
	   map = new google.maps.Map(document.getElementById("gmap"), mapOptions); 
	   	   	//define markers
  		var myLatlng = new google.maps.LatLng(-43.22650592355464, 171.716850399971);
     	var marker = new google.maps.Marker({
      		position: myLatlng,
      		map: map,
      		icon: image,
      		shadow: shadow,
      		title:"Rambandit Boulder"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		//end markers
    }
     else if (area == "gorge"){
         var mapOptions = {
          center: new google.maps.LatLng(-43.2013593810166, 171.74722909927368),
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
        //load new map
	   map = new google.maps.Map(document.getElementById("gmap"), mapOptions); 
    }
     else if (area == "teapot"){
         var mapOptions = {
          center: new google.maps.LatLng(-43.212291894616754, 171.7524218559265),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
       //load new map
	   map = new google.maps.Map(document.getElementById("gmap"), mapOptions); 
    }
     else if (area == "wuthering"){
         var mapOptions = {
          center: new google.maps.LatLng(-43.220157712853414, 171.71427011489868),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
       //load new map
	   map = new google.maps.Map(document.getElementById("gmap"), mapOptions); 
	   //define markers
  		var myLatlng = new google.maps.LatLng(-43.22221000844798, 171.71128749847412);
     	var marker = new google.maps.Marker({
      		position: myLatlng,
      		map: map,
      		icon: image,
      		shadow: shadow,
      		title:"The Ark Boulder"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		var myLatlng = new google.maps.LatLng(-43.220282807133394, 171.71416819095612);
     	var marker = new google.maps.Marker({
      		position: myLatlng,
      		map: map,
      		icon: image,
      		shadow: shadow,
      		title:"The Buffolo Bill Boulder"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		//end markers
    }
    else if (area == "cook"){
        var mapOptions = {
          center: new google.maps.LatLng(-43.6924434,170.0979784),
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.HYBRID
        };
        var quantumImgBnds = new google.maps.LatLngBounds(
			new google.maps.LatLng(-43.693097,170.1022517),
			new google.maps.LatLng(-43.6901374,170.1055996)
		);
		var quantumOverlay = new google.maps.GroundOverlay('http://castlehillbasin.co.nz/getlatlong/dude.png', quantumImgBnds);
		

     //load new map
	   map = new google.maps.Map(document.getElementById("gmap"), mapOptions); 
	   quantumOverlay.setMap(map);
		//define markers
     	var myLatlng = new google.maps.LatLng(-43.6915906,170.1032691);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"Dude Incredible"
  		});
  		var infowindow = new google.maps.InfoWindow();
  		makeInfoWindowEvent(map, infowindow, marker);
  		var myLatlng = new google.maps.LatLng(-43.228782753078946, 171.7151015996933);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"The Pond"
  		});
  		makeInfoWindowEvent(map, infowindow, marker);
  		  		var myLatlng = new google.maps.LatLng(-43.22752806441019, 171.71663850545883);
     	var marker = new google.maps.Marker({
      			position: myLatlng,
      			map: map,
      			icon: image,
      			shadow: shadow,
      			title:"The Headlights Boulder"
  		});
  		makeInfoWindowEvent(map, infowindow, marker);
  //end markers
    }

 
        //display map center
        var center = map.getCenter();
        updateLatLonFields(center.lat(), center.lng());        
        google.maps.event.addListener(map, 'center_changed', function() {
      	var center = map.getCenter();
        updateLatLonFields(center.lat(), center.lng());
 		});
        
}

google.maps.event.addDomListener(window, 'load', initialize);