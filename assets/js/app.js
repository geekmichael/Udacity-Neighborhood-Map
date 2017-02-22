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
            lat: -8.503617,
            lng: 115.254704
        },
        {
            name: "Taco Casa",
            lat: -8.521202,
            lng: 115.262936
        },
        {
            name: "Bebek Bengil - Dirty Duck Diner",
            lat: -8.517820,
            lng: 115.263656
        }
    ],

    infoboxHTML: '<div class="marker-info"><h2 class="marker-title">%title%</h2><div class="marker-content">Loading ...</div></div>',
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
	
    locations: ko.observableArray(Model.locations),
	filter: ko.observable(""),
	markerIconDefault: Model.markerIcons.defaultIcon,
	markerIconActive: Model.markerIcons.activeIcon,

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

    updateInfobox: function(marker) {
        this.markerInfo = Model.infoboxHTML.replace("%title%", marker.title);
    },

    // Iterate over locations array and create markers on the map
    displayLocations: function(){
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
            //
            this.markers.push(marker);
			// Click the marker to show a pop-up window with location information
            google.maps.event.addListener(marker, 'click', function(marker){
				return function(){octopus.displayMarker(marker)};
			}(marker));
        }
        // Centering and fitting all markers on the screen
        map.fitBounds(this.latLngBounds);
    },
	
    displayMarker: function(marker) {
        this.updateInfobox(marker);
        this.infobox.close();
        // Reset all markers with default icons
        this.resetMarkers();
        this.infobox.setContent(this.markerInfo);
        this.infobox.open(this.map, marker);
		// Change the pin icon for current marker
		marker.setIcon(this.markerIconActive);
		
		// Set the current marker as the map center
        this.map.setCenter(marker.getPosition());
    },
	
	// Reset all markers with default icons
	resetMarkers: function() {
        var i, markerLen = this.markers.length;
        for (i = 0; i < markerLen; i += 1) {
            this.markers[i].setIcon(this.markerIconDefault);
        }
    }
};

viewModel.filteredLocations = ko.computed(function() {
		var self = this;
		var filter = self.filter().toLowerCase();
		return ko.utils.arrayFilter(self.locations(), function(location){
			return location.name.toLowerCase().indexOf(filter) !== -1;
		})
}, viewModel);

window.onload = function() {
    ko.applyBindings(viewModel);
    viewModel.init();
};
