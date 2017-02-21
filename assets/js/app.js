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
    mapTypeId: 'terrain'
};

var viewModel = {

    locations: ko.observableArray(Model.locations),

    // Get the pre-defined coordinate as map centre
    getMapCenter: function() {
        var mapCenter = Model.mapCenter();
        return mapCenter[0];
    },
    // Update map centre with new coordinate
    setMapCenter: function(lat, lng) {
        console.log("Clicked");
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
        var mapOptions = {
          zoom: 10,
          disableDefaultUI: true,
          center: this.getMapCenter(),
          mapTypeId: this.getMapTypeId()
        };
        this.map = new google.maps.Map(Model.mapDiv, mapOptions);
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
              infoWindowIndex: i
            });
            //marker.setMap(this.map);
            this.markers.push(marker);

            google.maps.event.addListener(marker, 'click', function() {
                return function() {
                    viewModel.displayMarker(marker, this.markerInfo);
                }
            }(i));
        }
        // Centering and fitting all markers on the screen
        map.fitBounds(this.latLngBounds);
    },
    displayMarker: function(marker, markerInfo) {
        this.updateInfobox(marker);
        this.infobox.close();
        console.log(this.markerInfo);
        // Reset all markers with default icons
        this.resetMarkers();
        this.infobox.setContent(this.markerInfo);
        this.infobox.open(this.map, marker);
        //this.map.setCenter(this.getPosition());
    },
    resetMarkers: function() {
        var i, markerLen = this.markers.length;
        for (i = 0; i < markerLen; i += 1) {
            this.markers[i].setIcon('assets/images/map-pin-default.png');
        }
    }
};
// ko.bindingHandlers.googlemap = {
//     init: function(element, valueAccessor) {
//       var value = valueAccessor(),
//           myLatLng = new google.maps.LatLng(value.latitude, value.longitude),
//           mapOptions = {
//             zoom: 4,
//             center: myLatLng,
//             mapTypeId: 'terrain'
//           },
//           map = new google.maps.Map(element, mapOptions),
//           marker = new google.maps.Marker({
//             position: myLatLng,
//             map: map
//           });
//     }
// };

window.onload = function() {
    ko.applyBindings(viewModel);
    viewModel.init();
};
