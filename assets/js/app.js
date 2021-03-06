/*jslint for:true, this:true, multivar:true, white:true, browser:true */
/*global window, $, google, console, ko */
var Model = {
    // The container to display Google Map
    mapDiv: document.getElementById('map'),
    // The coordinate of Bali. :)
    mapCenter: ko.observableArray([{
        lat: -8.408867,
        lng: 115.186756
    }]),
    // All locations for visiting
    locations: [{
            name: 'Campuhan Ridge Walk',
            lat: -8.503543,
            lng: 115.25471,
            review: 'https://www.tripadvisor.com/Attraction_Review-g297701-d2662551-Reviews-Campuhan_Ridge_Walk-Ubud_Bali.html',
            img: 'assets/images/locations/campuhan-ridge-walk.jpg'
        },
        {
            name: 'Taco Casa',
            lat: -8.521212,
            lng: 115.26292,
            review: 'https://www.tripadvisor.com/Restaurant_Review-g297701-d2005133-Reviews-Taco_Casa-Ubud_Bali.html',
            img: 'assets/images/locations/taco-casa.jpg'
        },
        {
            name: 'Sacred Monkey Forest Sanctuary',
            lat: -8.518013,
            lng: 115.25945,
            review: 'https://www.tripadvisor.com/Attraction_Review-g297701-d378969-Reviews-Sacred_Monkey_Forest_Sanctuary-Ubud_Bali.html',
            img: 'assets/images/locations/monkey-forest.jpg'
        },
        {
            name: 'Tegalalang Rice Terrace',
            lat: -8.432813,
            lng: 115.27882,
            review: 'https://www.tripadvisor.com/Attraction_Review-g297701-d1515658-Reviews-Tegalalang_Rice_Terrace-Ubud_Bali.html',
            img: 'assets/images/locations/rice-terraces-of-tegalalang.jpg'
        },
        {
            name: 'Bebek Bengil - Dirty Duck Diner',
            lat: -8.523056,
            lng: 115.27268,
            review: 'https://www.tripadvisor.com/Restaurant_Review-g297701-d1953278-Reviews-Bebek_Tepi_Sawah-Ubud_Bali.html',
            img: 'assets/images/locations/bebek-bengil-dirty-duck-diner.jpg'
        }
    ],

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
    filter: ko.observable(''),
    activeMarker: null,
    markerIconDefault: Model.markerIcons.defaultIcon,
    markerIconActive: Model.markerIcons.activeIcon,
    // Error message while initialising Google Map failed
    mapErrInfo: ko.observable(''),

    // Flag for the visibility of location list
    listVisible: ko.observable(true),

    // Flag for the visibility of loading nearby list
    nearbyLoadingVisible: ko.observable(true),
    // Unicode arrows
    // &#8689 North west arrow to corner -- click to hide the list
    // &#8690 South east arrow to corner -- click to show the list
    toggleText: ko.observable('⇱'),

    activeNearbyList: ko.observableArray(),

    activeLocationTitle: ko.observable(''),
    activeLocationImg: ko.observable(''),

    // Get the pre-defined coordinate as map centre
    getMapCenter: function () {
        var mapCenter = Model.mapCenter();
        return mapCenter[0];
    },

    getMapTypeId: function () {
        return Model.mapTypeId;
    },

    // init: function(){
    //     this.initMap();
    //     this.displayLocations();
    // },
    // Initialise the Google Map with pre-defined centre
    initMap: function () {
        //Google Map settings
        var mapOptions = {
            zoom: 10,
            mapTypeControl: true,
            center: this.getMapCenter(),
            mapTypeId: this.getMapTypeId()
        };

        this.map = new google.maps.Map(Model.mapDiv, mapOptions);

        // Default content in the infoWindow
        this.infobox = new google.maps.InfoWindow({
            content: ''
        });

        this.latLngBounds = new google.maps.LatLngBounds();

        // An array to store all location markers
        this.markers = [];
    },
    // Add the first marker on the map
    initMarker: function () {
        this.marker = new google.maps.Marker({
            position: this.getMapCenter(),
            map: this.map
        });
    },

    updateInfoboxTemplate: function (location) {
        // Check if Wiki nearby list has been retrived and stored locally
        // Increase performance
        if (location.nearbyList.length) {
            this.nearbyLoadingVisible(false);
            this.activeNearbyList(location.nearbyList);
        } else {
            // Show the 'Loading' text and then retrive nearby from Wikimedia
            this.nearbyLoadingVisible(true);
            this.wikiNearbyRequest(location);
        }
        this.activeLocationTitle(location.name);
        this.activeLocationImg(location.img);
    },

    updateInfobox: function (marker) {
        marker = marker || this.activeMarker;
        this.activeMarkerInfo = $('#infoBoxTemplate').html();
        this.infobox.close();
        // Update infoWindow content
        this.infobox.setContent(this.activeMarkerInfo);
        this.infobox.open(this.map, marker);
    },
    // Iterate over locations array and create markers on the map
    displayLocations: function () {

        // Set the map bounds and zoom level according to markers position
        var i, location, latLng, marker;
        var map = this.map;

        // Avoid any problems with this being redefined to mean something else in event handlers or Ajax request callbacks.
        var self = this;
        var locationLen = this.locations().length;

        // Use for instead of Array.forEach
        // Performance comparison http://jsperf.com/fast-array-foreach
        // As JSLint suggested to use += instead of ++
        for (i = 0; i < locationLen; i += 1) {
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
            google.maps.event.addListener(marker, 'click', (function (marker, location) {
                return function () {
                    self.displayInfobox(marker, location);
                };
            }(marker, location)));

            // Reset marker icon to the default when infoWindow is closed.
            google.maps.event.addDomListener(this.infobox, 'closeclick', (function (latLngBounds, marker, markerIconDefault) {
                return function () {
                    marker.setIcon(markerIconDefault);
                    map.fitBounds(latLngBounds);
                };
            }(this.latLngBounds, marker, this.markerIconDefault)));
        }
        // Centering and fitting all markers on the screen
        map.fitBounds(this.latLngBounds);

        // Reset markers while clicked on the map beside of markers
        google.maps.event.addListener(this.map, 'click', function () {
            map.fitBounds(self.latLngBounds);
        });

        // Centering bounds when browser window is resized. Make the map responsive
        google.maps.event.addDomListener(window, 'resize', function () {
            map.fitBounds(self.latLngBounds);
        });
    },

    displayInfobox: function (marker, location) {
        if (this.activeMarker) {
            // Reset the last activated marker's icon
            this.activeMarker.setIcon(this.markerIconDefault);
        }
        // Set current clicked marker as active
        this.activeMarker = marker;

        this.updateInfoboxTemplate(location);
        // Update infoWindow content
        this.updateInfobox(marker);

        // Change the pin icon for active marker
        marker.setIcon(this.markerIconActive);

        // Set the current marker as the map center
        this.map.setCenter(marker.getPosition());
    },

    wikiNearbyRequest: function (location) {
        var errorMsg = [{
            activeNearbyListItem: 'Incorrect location coordinates'
        }];
        if (!location.lat || !location.lng) {
            return this.activeNearbyList(errorMsg);
        }
        this.activeNearbyList([]);
        var self = this;
        var wikiURL = 'https://en.wikipedia.org/w/api.php';
        $.ajax({
            url: wikiURL,
            data: {
                'action': 'query',
                'list': 'geosearch',
                'gscoord': location.lat + '|' + location.lng,
                'gsradius': 5000,
                'gslimit': 5,
                'format': 'json'
            },
            type: 'GET',
            dataType: 'jsonp',
            // Handle error
            timeout: 2000
        })
        .done(function (data) {
            var i;
            var geosearch = data.query.geosearch;
            var nearbyLen = geosearch.length;
            for (i = 0; i < nearbyLen; i += 1) {
                location.nearbyList.push({
                    activeNearbyListItem: '<span class="dist">' + geosearch[i].dist + 'm</span>' + geosearch[i].title
                });
            }
            self.activeNearbyList(location.nearbyList);
            self.nearbyLoadingVisible(false);
            self.updateInfobox();
        })
        .fail(function (parsedjson, textStatus, errorThrown) {
            console.log('parsedJson status: ' + parsedjson.status, 'errorStatus: ' + textStatus, 'errorThrown: ' + errorThrown);
            errorMsg = [{
                activeNearbyListItem: 'Oops! Loading data from Wikimedia failed!'
            }];
            self.activeNearbyList(errorMsg);
            self.nearbyLoadingVisible(false);
            self.updateInfobox();
        });
    }
};

viewModel.mappingLocations = function () {
    var i;
    var locs = [];
    var mLoc = Model.locations;
    for (i = 0; i < mLoc.length; i += 1) {
        mLoc[i].ID = i;
        mLoc[i].nearbyList = [];
        locs.push(mLoc[i]);
    }
    return locs;
};

viewModel.filteredLocations = ko.computed(function () {
    // Avoid any problems with this being redefined to mean something else in event handlers or Ajax request callbacks.
    var self = this;
    this.locations(this.mappingLocations());
    var filter = this.filter().toLowerCase();
    return ko.utils.arrayFilter(this.locations(), function (location) {
        if (location.name.toLowerCase().indexOf(filter) >= 0) {
            // The Array of markers will not be ready before locations are marked
            if (self.markers) {
                // Only display corresponding markers
                self.markers[location.ID].setVisible(true);
            }
            return location;
        }
        // Close active infoWindow
        self.infobox.close();
        // Hide non-corresponding marker
        self.markers[location.ID].setVisible(false);
    });
}, viewModel);

viewModel.locationClick = function (filteredLocation) {
    // Trigger a click event on each marker when the corresponding marker link is clicked
    google.maps.event.trigger(viewModel.markers[filteredLocation.ID], 'click');
};

viewModel.listToggle = function () {
    this.listVisible(!this.listVisible());
    // Unicode arrows
    // &#8689 North west arrow to corner -- click to hide the list
    // &#8690 South east arrow to corner -- click to show the list
    if (this.listVisible()) {
        this.toggleText('⇱');
    } else {
        this.toggleText('⇲');
    }
};

function init() {
    viewModel.initMap();
    viewModel.displayLocations();
}

function mapError() {
    viewModel.mapErrInfo('Oops! <br> Error on initialising Google Map');
}

ko.applyBindings(viewModel);
