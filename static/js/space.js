function getSpaceMap() {

  var mapOptions = {
    zoom: 17,
    center: new google.maps.LatLng(window.space_latitude , window.space_longitude),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  }

  var map = new google.maps.Map(document.getElementById("spaceMap"), mapOptions);

  var image = '/static/img/pins/pin00.png';

  var spaceLatLng = new google.maps.LatLng(window.space_latitude , window.space_longitude);
  var spaceMarker = new google.maps.Marker({
      position: spaceLatLng,
      map: map,
      icon: image
  });

}