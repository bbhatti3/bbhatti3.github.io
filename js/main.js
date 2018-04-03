var locations = [
    {title:'Veracruz',location:{lat: 30.257933,lng: -97.725928}},
    {title:'The Liberty',location:{lat: 30.262704,lng: -97.72508}},
    {title:'Nasha',location:{lat: 30.263756,lng: -97.724835}},
    {title:'Tamale House East',location: {lat: 30.261517, lng: -97.724368}},
    {title:'The White Horse',location: {lat: 30.262563, lng: -97.726914}},
    {title:"Whisler's",location: {lat: 30.261933, lng: -97.722738}}
];

var locationInformation = function (data) {
    this.title = (data.title);
    this.location = (data.location);
    this.marker = (data.marker);
    this.visible = ko.observable(true);
    this.showList = ko.computed(function () {
        if (this.visible() === true) {
            if (this.marker) {
                this.marker.setVisible(true);}
        } else {this.marker.setVisible(false);}
        return true;
    }, this);
};

var infowindow;

var map;

// initial blank array
var markers = [];

var ViewModel = function () {
    var self = this;
    this.searchTitle = ko.observable('');
    this.locationList = ko.observableArray([]);
    locations.forEach(function (locale) {
        self.locationList.push(new locationInformation(locale));
    });
    this.changeLocation = function (clicked) {
        populateInfoWindow(clicked.marker, infowindow);
  };

// search function
    this.filteredLocations = ko.computed(function () {
        var sorter = self.searchTitle().toLowerCase();
        if (!sorter) {
            self.locationList().forEach(function (locale) {
                locale.visible(true);
            });
            return self.locationList();
        }
        else {
            return ko.utils.arrayFilter(self.locationList(), function (locale) {
                var text = locale.title.toLowerCase();
                var outcome = (text.search(sorter) >= 0);
                locale.visible(outcome);
                return outcome;
            });
        }
    });
};

function initMap() {
    // Initialize Google map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:30.261517,lng:-97.724368},
        zoom: 15
    });

// Initialize infowindow
    infowindow = new google.maps.InfoWindow();

// The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {

    // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;

    // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });

    // Add marker as a property of each Location.
    vm.locationList()[i].marker = marker;

    // Push the marker to our array of markers.
    markers.push(marker);

    // Create an onclick event to open an window at each marker.
    marker.addListener('click', function() {
        populateInfoWindow(this, infowindow);
});
}
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {

  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('');

    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function () {
        infowindow.setMarker = null;
    });
//fourquare api call
    $.ajax({
        url: "https://api.foursquare.com/v2/venues/search?query=" +
        marker.title + '&ll=' + marker.position.lat() + ',' + marker.position.lng() +
        '&client_id=US1AIPJE31KBXDXZQHD0MDCMW2IV1G4XZA5EQ1PNOZVTSBKZ' +
        '&client_secret=GHZH4NUGUP0DX5JN2FDD5RVJCVIMIQJEE2TWLSFNIUCBIH13&v=20180308',
        dataType: "jsonp", type: "GET",
        success: function (data) {
            var venueFromFourSquare = data.response.venues[0];
            infowindow.setContent('<p><h2>' + venueFromFourSquare.name + '</h2>' +
            venueFromFourSquare.location.address + '</p>' +
            venueFromFourSquare.location.city + ','+
            venueFromFourSquare.location.state + ' '+
            venueFromFourSquare.location.postalCode);
        },
        error: function () {
            alert("Foursquare is not loading properly.");
        }
    });


    // Open the infowindow on the marker
    infowindow.open(map, marker);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        marker.setAnimation(null);
    },800);

  }
}

// Initialize the Knockout View Model
var vm = new ViewModel();
ko.applyBindings(vm);

//Map loading failure
function GoogleMapsFail () {
	alert("Google Maps is not loading.");
}
var places = document.querySelector('#list');
var items = document.querySelector('.steer');
places.addEventListener('click', function(e) {
    items.classList.toggle('open');
    e.stopPropagation();
});
$('.steer').on("click",function(){
    $('.steer').removeClass('open');
});
