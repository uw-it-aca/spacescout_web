(function(g){

	$(document).ready(function() {

	   // check if a map_canvas exists... populate it
    	if ($("#map_canvas").length == 1) {
          initialize();
        }

    	// handle clicking on map centering buttons
        $('#center_all').live('click', function(e){
            window.spacescout_map.setCenter(new google.maps.LatLng(window.default_latitude, window.default_longitude));
        });

        $('#center_me').live('click', function(e){
            window.spacescout_map.setCenter(new google.maps.LatLng(window.youarehere.latitude, window.youarehere.longitude));
        });

	});




})(this);


function getSpaceMap(lat, lon) {

  if (window.space_latitude) {
    lat = window.space_latitude
  }

  if (window.space_longitude) {
    lon = window.space_longitude
  }


  var mapOptions = {
    zoom: 17,
    center: new google.maps.LatLng(lat , lon),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false
  }

  var map = new google.maps.Map(document.getElementById("spaceMap"), mapOptions);

  var image = '/static/img/pins/pin00.png';

  var spaceLatLng = new google.maps.LatLng(lat , lon);
  var spaceMarker = new google.maps.Marker({
      position: spaceLatLng,
      map: map,
      icon: image
  });

}
