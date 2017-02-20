var Model = {
    // The coordinate of Bali. :)
    mapCenter: ko.observableArray([
        {
          lat: -8.408867,
          lng: 115.186756
        }
    ]),
    // All locations for visiting
    locations: ko.observableArray([
        {
            name: "Taco Casa",
            lat: -8.5211837,
            lng:115.260781
        },
        {
            name: "Bebek Bengil - Dirty Duck Diner",
            lat: -8.5211306,
            lng: 115.2605921
        }
    ]),
    mapTypeId: ko.observable('terrain')
};

var viewModel = {
    init: function(){
        this.initMap();
        this.initMarker();
    },

    initMap: function(){
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: this.getMapCenter(),
            mapTypeId: this.getMapTypeId(),
            mapTypeControl: false,
            streetViewControl: false
        });
    },

    initMarker: function() {
        this.marker = new google.maps.Marker({
            position: this.getMapCenter(),
            map: this.map
        });
    },

    getMapCenter: function() {
        var mapCenter = Model.mapCenter();
        return mapCenter[0];
    },

    setMapCenter: function(lat, lng) {
        Model.mapCenter([{lat, lng}]);
    },

    getMapTypeId: function(){
        return Model.mapTypeId();
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

//viewModel.init();
ko.applyBindings(viewModel.init());
