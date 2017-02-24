# Interactive Neighborhood Map

As a challenged project to accomplish the Udacity Front-End Nanodegree. This project is a Neighborhood map consists with 5 attractions in Bali, Indonesia.

## How to run?
Download all files and save to a folder, alternatively you can use git clone. Then double click the index.html file.

## Functionalities

### Map and Markers
Map displays all location markers by default, and displays the filtered subset of location markers when a filter is applied. On the filtered items of location list, corresponding map markers object by setting simply show and hide to its visibility property. The purpose of this approach is to avoid create new object at time of filter selected, and bring unsmoothness to the map.

Clicking a marker displays unique information about a location.

Icon of marker will be changed when clicked.

### Filter Locations
Type letter in the filter box, the location list will display corresponding locations, Google Map will hide non-corresponding markers as well.

### List View
A control panel shows all location names as a list in the top-left corner. Clicking each of them will activate corresponding marker on the map.

### Responsive map
The map with markers is responsive while browser window changed.

## References
https://developers.google.com/maps/documentation/javascript/
http://knockoutjs.com/documentation/introduction.html
http://stackoverflow.com/questions/17212221/google-map-multiple-markers-simple-filtering
http://stackoverflow.com/questions/11561756/knockout-how-do-i-toggle-visibility-of-multiple-divs-on-button-click
