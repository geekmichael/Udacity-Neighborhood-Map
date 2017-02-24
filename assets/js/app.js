var Model = {
    // The container to display Google Map
    mapDiv: document.getElementById('map'),
    // The coordinate of Bali. :)
    mapCenter: ko.observableArray([
        {
          lat: -8.408867,
          lng: 115.186756
        }
    ]),
    // All locations for visiting
    locations: [
        {
            name: "Campuhan Ridge Walk",
            lat: -8.503543,
            lng: 115.25471,
            review: "https://www.tripadvisor.com/Attraction_Review-g297701-d2662551-Reviews-Campuhan_Ridge_Walk-Ubud_Bali.html",
            img: "assets/images/locations/campuhan-ridge-walk.jpg"
        },
        {
            name: "Taco Casa",
            lat: -8.521212,
            lng: 115.26292,
            review: "https://www.tripadvisor.com/Restaurant_Review-g297701-d2005133-Reviews-Taco_Casa-Ubud_Bali.html",
            img: "assets/images/locations/taco-casa.jpg",
        },
        {
            name: "Sacred Monkey Forest Sanctuary",
            lat: -8.518013,
            lng: 115.25945,
            review: "https://www.tripadvisor.com/Attraction_Review-g297701-d378969-Reviews-Sacred_Monkey_Forest_Sanctuary-Ubud_Bali.html",
            img: "assets/images/locations/monkey-forest.jpg"
        },
        {
            name: "Tegalalang Rice Terrace",
            lat: -8.432813,
            lng: 115.27882,
            review: "https://www.tripadvisor.com/Attraction_Review-g297701-d1515658-Reviews-Tegalalang_Rice_Terrace-Ubud_Bali.html",
            img: "assets/images/locations/rice-terraces-of-tegalalang.jpg"
        },
        {
            name: "Bebek Bengil - Dirty Duck Diner",
            lat: -8.523056,
            lng: 115.27268,
            review: "https://www.tripadvisor.com/Restaurant_Review-g297701-d1953278-Reviews-Bebek_Tepi_Sawah-Ubud_Bali.html",
            img: "assets/images/locations/bebek-bengil-dirty-duck-diner.jpg"
        }
    ],

    infoboxHTML: '<div class="marker-info"><h2 class="marker-title">%title%</h2><div class="marker-content"><img src="%image%" class="location-photo" width="200"><p><a href="%reviewurl%" target="_blank" class="review-link">TripAdvisor Review</a></p></div></div>',
    /* Set Google map type by following https://developers.google.com/maps/documentation/javascript/maptypes
      roadmap: displays the default road map view. This is the default map type.
      satellite: displays Google Earth satellite images
      hybrid: displays a mixture of normal and satellite views
      terrain: displays a physical map based on terrain information.
    */
    mapTypeId: 'terrain',
	//The default icon of a Google maps marker
	markerIcons: {
		defaultIcon: 'assets/images/map-pin-default.png',
		activeIcon: 'assets/images/map-pin-active.png'
	}
};

var viewModel = {

    locations: ko.observableArray(),
	filter: ko.observable(""),
    activeMarker: null,
	markerIconDefault: Model.markerIcons.defaultIcon,
	markerIconActive: Model.markerIcons.activeIcon,

    // Flag for the visibility of location list
    listVisible: ko.observable(true),
    // Unicode arrows
    // &#8689 North west arrow to corner -- click to hide the list
    // &#8690 South east arrow to corner -- click to show the list
    toggleText: ko.observable("⇱"),

    // Get the pre-defined coordinate as map centre
    getMapCenter: function() {
        var mapCenter = Model.mapCenter();
        return mapCenter[0];
    },
    // Update map centre with new coordinate
    setMapCenter: function(lat, lng) {
        Model.mapCenter([{lat, lng}]);
    },

    getMapTypeId: function(){
        return Model.mapTypeId;
    },

    init: function(){
        this.currentLocation = ko.observable(this.locations()[0]);
        this.initMap();
        //this.initMarker();
        this.displayLocations();
    },
    // Initialise the Google Map with pre-defined centre
    initMap: function(){
		//Google Map settings
        var mapOptions = {
          zoom: 10,
          disableDefaultUI: true,
          center: this.getMapCenter(),
          mapTypeId: this.getMapTypeId()
        };

        this.map = new google.maps.Map(Model.mapDiv, mapOptions);

		// Default content in the infoWindow
        this.infobox = new google.maps.InfoWindow({
            content: "Loading ...."
        });

        this.latLngBounds = new google.maps.LatLngBounds();

        // An array to store all location markers
        this.markers = [];
    },
    // Add the first marker on the map
    initMarker: function() {
        this.marker = new google.maps.Marker({
            position: this.getMapCenter(),
            map: this.map
        });
    },

    updateInfobox: function(location) {
        var locationInfo = '';
        locationInfo = Model.infoboxHTML.replace("%title%", location.name);
        locationInfo = locationInfo.replace("%reviewurl%", location.review);
        this.markerInfo = locationInfo.replace("%image%", location.img);
    },
    // Iterate over locations array and create markers on the map
    displayLocations: function() {

        //Set the map bounds and zoom level according to markers position
        var i, location, latLng, marker;
        var map = this.map;
        var octopus = this;
        var locationLen = this.locations().length;
        // Use for instead of Array.forEach
        // Performance comparison http://jsperf.com/fast-array-foreach
        for ( i = 0; i < locationLen; i += 1){
            location = this.locations()[i];
            latLng = new google.maps.LatLng(location.lat, location.lng);
            this.latLngBounds.extend(latLng);
            marker = new google.maps.Marker({
              position: latLng,
              map: map,
              title: location.name,
              icon: this.markerIconDefault,
              infoWindowIndex: i
            });

            this.markers.push(marker);

            // Click the marker to show a pop-up window with location information
            google.maps.event.addListener(marker, 'click', function(marker, location){
                return function(){octopus.displayInfobox(marker, location)};
            }(marker, location));

            // Reset marker icon to the default when infoWindow is closed.
            google.maps.event.addDomListener(this.infobox, 'closeclick', function(latLngBounds, marker, markerIconDefault) {
                return function(){
                    marker.setIcon(markerIconDefault)
                    map.fitBounds(latLngBounds);
                }
            }(this.latLngBounds, marker, this.markerIconDefault));
        }
        // Centering and fitting all markers on the screen
        map.fitBounds(this.latLngBounds);

		// Centering bounds when browser window is resized. Make the map responsive
		google.maps.event.addDomListener(window, 'resize', function(latLngBounds) {
			return function(){
				map.fitBounds(latLngBounds);
			}
		}(this.latLngBounds));

    },

    // Set the map on given markers in the array.
    setMapOnAll: function(map, markers) {
        var i;
        if (!markers) markers = this.markers;
        for (i = 0; i < markers.length; i += 1) {
            markers[i].setMap(map);
        }
    },

    // Remove the markers from the map, but keeps them in the array.
    clearMarkers: function(){
        setMapOnAll(null);
    },

    // Show all markers in the array
    showMarkers: function() {
        setMaponAll(this.map);
    },

    displayInfobox: function(marker, location) {
        this.updateInfobox(location);
        this.infobox.close();

        if (this.activeMarker) {
            // Reset the last activated marker's icon
            this.activeMarker.setIcon(this.markerIconDefault);
        }
        // Set current clicked marker as active
        this.activeMarker = marker;

        // Load location information
        this.infobox.setContent(this.markerInfo);
        this.infobox.open(this.map, marker);

		// Change the pin icon for active marker
		marker.setIcon(this.markerIconActive);

		// Set the current marker as the map center
        this.map.setCenter(marker.getPosition());
    }
};

viewModel.mappingLocations = function(){
	var i;
	var locs = [];
	var mLoc = Model.locations;
	for (i = 0; i < mLoc.length; i += 1) {
		mLoc[i].ID = i;
		mLoc[i].locationClick = 'javascript:viewModel.locationClick(' + i + ')';
		locs.push(mLoc[i]);
	}
	return locs;
	//return ko.observableArray(Model.locations);
};

viewModel.filteredLocations = ko.computed(function() {
    this.locations(this.mappingLocations());
    var self = this;
	var filter = self.filter().toLowerCase();
	return ko.utils.arrayFilter(self.locations(), function(location){
		if (location.name.toLowerCase().indexOf(filter) >= 0) {
            // The Array of markers will not be ready before locations are marked
            if (self.markers) {
                // Only display corresponding markers
                self.markers[location.ID].setVisible(true);
            }
			return location;
		}else{
			// Close active infoWindow
			self.infobox.close();
			// Hide non-corresponding marker
            self.markers[location.ID].setVisible(false);
        }
	})
}, viewModel);

viewModel.locationClick = function(i) {
    // Trigger a click event on each marker when the corresponding marker link is clicked
    google.maps.event.trigger(this.markers[i], 'click');
};

viewModel.listToggle = function() {
    this.listVisible(!this.listVisible());
    // Unicode arrows
    // &#8689 North west arrow to corner -- click to hide the list
    // &#8690 South east arrow to corner -- click to show the list
    if (this.listVisible()) {
        this.toggleText("⇱");
    }else{
        this.toggleText("⇲");
    }

}

window.onload = function() {
    ko.applyBindings(viewModel);
    viewModel.init();
};
