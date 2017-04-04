/* global L */

'use strict';

var reqwest = require('reqwest');

var PoiLayer = L.GeoJSON.extend({
  /*
  _exclude: [{
    type: 'Cultural Landscape'
  }, {
    type: 'Historic District'
  }, {
    type: 'Junction'
  }, {
    type: 'Locale'
  }, {
    type: 'Populated Place'
  }],
  */
  _include: [{
    type: 'Visitor Center',
    symbol: 'visitor-center',
    minZoomFactor: 5,
    maxZoom: 22,
    priority: 1
  }, {
    type: 'Entrance Station',
    symbol: 'entrance-station',
    minZoomFactor: 6,
    maxZoom: 22,
    priority: 1
  }, {
    type: 'Information',
    symbol: 'information',
    minZoomFactor: 6,
    maxZoom: 22,
    priority: 2
  }, {
    type: 'Fee Booth',
    symbol: 'entrance-station',
    minZoomFactor: 6,
    maxZoom: 22,
    priority: 2
  }, {
    type: 'Ranger Station',
    symbol: 'ranger-station',
    minZoomFactor: 7,
    maxZoom: 22,
    priority: 2
  }, {
    type: 'Lodge',
    symbol: 'lodging',
    minZoomFactor: 7,
    maxZoom: 22,
    priority: 2
  }, {
    type: 'Lodging',
    symbol: 'lodging',
    minZoomFactor: 7,
    maxZoom: 22,
    priority: 2
  }, {
    type: 'Campground',
    symbol: 'campground',
    minZoomFactor: 7,
    maxZoom: 22,
    priority: 2
  }, {
    type: 'RV Campground',
    symbol: 'rv-campground',
    minZoomFactor: 7,
    maxZoom: 22,
    priority: 2
  }, {
    type: 'Store',
    symbol: 'store',
    minZoomFactor: 7,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Gift Shop',
    symbol: 'souvenir',
    minZoomFactor: 7,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Trailhead',
    symbol: 'trailhead',
    minZoomFactor: 8,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Gas Station',
    symbol: 'gas-station',
    minZoomFactor: 8,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Food Service',
    symbol: 'food-service',
    minZoomFactor: 8,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Picnic Area',
    symbol: 'picnic-area',
    minZoomFactor: 8,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Airport',
    symbol: 'airport',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Beach',
    symbol: 'beach-access',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Hospital',
    symbol: 'hospital',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Campsite',
    symbol: 'campsite',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Shelter',
    symbol: 'shelter',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Bus Stop / Shuttle Stop',
    symbol: 'bus-stop',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Emergency Telephone',
    symbol: 'emergency-telephone',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Bookstore',
    symbol: 'bookstore',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Trail Marker',
    symbol: 'sign',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'First Aid Station',
    symbol: 'first-aid',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Historic Marker',
    symbol: 'historic-feature',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Historic Site',
    symbol: 'historic-feature',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Horse Camp',
    symbol: 'horseback-riding',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Metro Stop / Subway Entrance',
    symbol: 'letter-m',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Library',
    symbol: 'library',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Lighthouse',
    symbol: 'lighthouse',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Marina',
    symbol: 'marina',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Museum',
    symbol: 'museum',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Post Office',
    symbol: 'post-office',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Restroom',
    symbol: 'restrooms',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Overlook',
    symbol: 'scenic-viewpoint',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Viewpoint',
    symbol: 'scenic-viewpoint',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Self Guiding Trail',
    symbol: 'self-guiding-trail',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Cabin',
    symbol: 'shelter-cabin',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Memorial',
    symbol: 'statue',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Monument',
    symbol: 'statue',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Telephone',
    symbol: 'telephone',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Cinema',
    symbol: 'theater',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Ferry Terminal',
    symbol: 'vehicle-ferry',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Waterfall',
    symbol: 'waterfall',
    minZoom: 16,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Amphitheater',
    symbol: 'amphitheater',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'ATM',
    symbol: 'atm',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Bicycle Trail',
    symbol: 'bicycle-trail',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Boat Launch',
    symbol: 'boat-launch',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Primitive Camping',
    symbol: 'campsite',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Canoe / Kayak Access',
    symbol: 'canoe-access',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Cave Entrance',
    symbol: 'cave',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Cross-Country Ski Trail',
    symbol: 'cross-country-ski-trail',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Dam',
    symbol: 'dam',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Downhill Ski Trail',
    symbol: 'downhill-skiing',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Fountain',
    symbol: 'drinking-water',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Potable Water',
    symbol: 'drinking-water',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Fishing',
    symbol: 'fishing',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Food Box / Food Cache',
    symbol: 'food-cache',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Four-Wheel Drive Trail',
    symbol: 'four-wheel-drive-road',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Motorized Trail',
    symbol: 'four-wheel-drive-road',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Golf Course',
    symbol: 'golfing',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Historic Building',
    symbol: 'historic-feature',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Historic Cabin',
    symbol: 'historic-feature',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Historic Ruins',
    symbol: 'historic-feature',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Historic Ship',
    symbol: 'historic-feature',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Wreck',
    symbol: 'historic-feature',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Historic Mine',
    symbol: 'historic-feature',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Horseback Riding',
    symbol: 'horseback-riding',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Ice Rink',
    symbol: 'ice-skating',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Interpretive Exhibit',
    symbol: 'interpretive-exhibit',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Laundry',
    symbol: 'laundry',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Litter Receptacle',
    symbol: 'litter-receptacle',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Tower',
    symbol: 'lookout-tower',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Garage',
    symbol: 'mechanic',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Motorcycle Trail',
    symbol: 'motor-bike-trail',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Parking Lot',
    symbol: 'parking',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Playground',
    symbol: 'playground',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Mailbox',
    symbol: 'post-office',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Radiator Water',
    symbol: 'radiator-water',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Recycling',
    symbol: 'recycling',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Floating Restroom',
    symbol: 'restrooms',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Sailing',
    symbol: 'sailing',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Dump Station',
    symbol: 'sanitary-disposal-station',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Scuba Diving',
    symbol: 'scuba-diving',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Seaplane Base',
    symbol: 'sea-plane',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Gazebo',
    symbol: 'shelter',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Hut',
    symbol: 'shelter',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Pavilion',
    symbol: 'shelter',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Showers',
    symbol: 'showers',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Information Board',
    symbol: 'sign',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Information Map',
    symbol: 'sign',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Directional Sign',
    symbol: 'sign',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Gateway Sign',
    symbol: 'sign',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Regulatory Sign',
    symbol: 'sign',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Sledding',
    symbol: 'sledding',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Snowmobile Trail',
    symbol: 'snowmobile-trail',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Spring',
    symbol: 'spring',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Stable',
    symbol: 'stable',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Sculpture',
    symbol: 'statue',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Swimming Area',
    symbol: 'swimming',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Non-Motorized Trail',
    symbol: 'trailhead',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Trail Register',
    symbol: 'trailhead',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Dumpster',
    symbol: 'trash-dumpster',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Tunnel',
    symbol: 'tunnel',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Webcam',
    symbol: 'webcam',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Wheelchair Accessible',
    symbol: 'wheelchair-accessible',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Wi-Fi',
    symbol: 'wi-fi',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Windsurfing Area',
    symbol: 'wind-surfing',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Zebra Mussel Decontamination Station',
    symbol: 'zebra-mussel-decontamination-station',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'All-Terrain Vehicle Trail',
    symbol: 'all-terrain-trail',
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Campfire Ring',
    symbol: 'campfire',
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Flag Pole',
    symbol: 'flagpole',
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Mile Marker',
    symbol: 'sign',
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Trail Sign',
    symbol: 'sign',
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Weather Shelter',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Picnic Table',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Barn',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Greenhouse',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Ranch',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Building',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Building Under Construction',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Bunker',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Public Building',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Administrative Office',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Commercial Building',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Headquarters',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Industrial Building',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Office',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Retail Building',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Education Center',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'School Building',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'University Building',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Cathedral',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Chapel',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Church',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Apartments',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Detached Home',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Dormitory',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'House',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Residential Building',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Row House',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Static Mobile Home',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Shed',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Warehouse',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Battlefield',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Cannon',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Battlefield Marker',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Brochure Box',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Bike Rack',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Canyoneering Route',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Climbing Route',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Park',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Grill',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Athletic Field',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Steps',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Totem Pole',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Bench',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Canal',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Cemetery / Graveyard',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Grave',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Fence',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Garden',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Gate',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Dyke (Levee)',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Lock',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Military Area',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Quarry (Mine)',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Shaft (Mine)',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Oilfield',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Point of Interest',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Reserve',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Reservoir',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Fortification',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Windmill',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Arroyo',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Reef (Bar)',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Shoal (Bar)',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Basin',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Bay',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Cape',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Cliff',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Desert',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Dune',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Forest',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Woods',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Glacier',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Grove',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Tree',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Harbor',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Island',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Isthmus',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Lake',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Lava',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Natural Feature',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Mountain Pass (Saddle / Gap)',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Peak',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Grassland',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Plain',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Prairie',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Plateau',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Rapids',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Ridge',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Arch',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Pillar',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Rock Formation',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Sea',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Strait (Channel)',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Stream',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Swamp',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Fumarole',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Geyser',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Hot Spring',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Mud Pot',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Canyon',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Valley',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Volcano',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Wetland',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Bridge',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Traffic Signals',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Turning Circle',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Airstrip',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Landing Strip',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Electric Vehicle Parking',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Roadside Pullout',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Train Station',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Fire Hydrant',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Fire Station',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Patrol Cabin',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Police',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Water Well',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Water Access',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Anchorage',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Boat Dock',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Boat Storage',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Buoy',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Mooring',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Fish Cleaning',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Fish Hatchery',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Dog Sled Trail',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Backcountry Ski Trail',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }, {
    type: 'Snowshoe Trail',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 5
  }],
  includes: [
    require('../../mixin/geojson')
  ],
  options: {
    // autoContrast: true,
    environment: 'production',
    prioritization: true,
    types: [],
    unitCodes: []
  },

  // Wipe out popup, tooltip, and styles configs if they're passed up.
  // This is a "developmental" feature, so the API is going to be a moving target for a little while.
  // Add "darkOrLight" property to each baseLayer preset.
  // If autoContrast === true, subscribe to map baselayerchange event and update color of all icons, when needed.
  // Only support two colors for now.

  rows: null,
  initialize: function (options) {
    var me = this;
    var environment;
    var query;
    var i;

    L.Util.setOptions(this, this._toLeaflet(options));

    environment = this.options.environment;
    query = 'SELECT a.minzoompoly AS m,b.name AS n,b.type AS t,b.unit_code AS u,ST_X(b.the_geom) AS x,ST_Y(b.the_geom) AS y FROM parks AS a,points_of_interest' + (environment === 'production' ? '' : '_' + environment) + ' AS b WHERE a.unit_code=b.unit_code';

    if (this.options.types.length) {
      query += ' AND (';

      for (i = 0; i < this.options.types.length; i++) {
        query += 'b.type=\'' + this.options.types[i] + '\' OR ';
      }

      query = query.slice(0, query.length - 4) + ')';

      if (this.options.unitCodes.length) {
        query += ' AND (';

        for (i = 0; i < this.options.unitCodes.length; i++) {
          query += 'a.unit_code=\'' + this.options.unitCodes[i] + '\' OR ';
        }

        query = query.slice(0, query.length - 4) + ')';
      }
    } else if (this.options.unitCodes.length) {
      query += ' AND (';

      for (i = 0; i < this.options.unitCodes.length; i++) {
        query += 'a.unit_code=\'' + this.options.unitCodes[i] + '\' OR ';
      }

      query = query.slice(0, query.length - 4) + ')';
    }

    reqwest({
      data: {
        cb: new Date().getTime(),
        q: query
      },
      error: function (error) {
        var obj = L.extend(error, {
          message: 'There was an error loading the data from Places.'
        });

        me.fire('error', obj);
        me.errorFired = obj;
      },
      success: function (response) {
        var obj;

        if (response && response.responseText) {
          me._rows = JSON.parse(response.responseText).rows;

          if (me._rows.length) {
            var i = me._rows.length;

            L.GeoJSON.prototype.initialize.call(me, null, me.options);

            while (i--) {
              var row = me._rows[i];
              var config = (function () {
                var c;

                for (var j = 0; j < me._include.length; j++) {
                  if (me._include[j].type === row.t) {
                    c = me._include[j];
                    break;
                  }
                }

                if (c) {
                  return c;
                }
              })();

              if (config) {
                var symbol = config.symbol;

                obj = {
                  lat: row.y,
                  lng: row.x,
                  minZoom: row.m,
                  name: row.n,
                  symbol: symbol,
                  type: row.t,
                  unitCode: row.u
                };
                L.Util.extend(row, obj);
                delete row.m;
                delete row.n;
                delete row.t;
                delete row.u;
                delete row.x;
                delete row.y;
                row.marker = new L.Marker({
                  lat: row.lat,
                  lng: row.lng
                }, {
                  icon: me._getIcon(true, symbol),
                  title: row.name || row.type,
                  zIndexOffset: config.priority * -1000
                }).bindPopup((function () {
                  var html = '<div class="layer" style="min-width:250px;">';

                  if (row.name) {
                    html += '<div class="title">' + row.name + '</div>';
                  }

                  html += '<div class="description"><p>' + row.type + '</p></div>';

                  return html;
                })());
                L.Util.extend(row.marker, obj);
              } else {
                me._rows.splice(i, 1);
              }
            }

            if (me.options.prioritization) {
              me._update();
            } else {
              for (i = 0; i < me._rows.length; i++) {
                me._map.addLayer(me._rows[i].marker);
              }
            }

            me.fire('ready');
            me._loaded = true;
            me.readyFired = true;
          } else {
            obj = {
              message: 'No records were returned from Places.'
            };

            me.fire('error', obj);
            me.errorFired = obj;
          }
        } else {
          obj = {
            message: 'There was an error loading the data from Places.'
          };

          me.fire('error', obj);
          me.errorFired = obj;
        }

        return me;
      },
      type: 'POST',
      url: 'https://nps.cartodb.com/api/v2/sql'
    });
  },
  onAdd: function (map) {
    var me = this;

    me._map = map;

    /*
    if (me.options.autoContrast) {
      // TODO: Need to set this dynamically.
      // TODO: Also think about storing "lightOrDark" here in this module rather than with the baselayer presets.
      me._baseLayerColor = 'light';

      me._map.on('baselayerchange', function (e) {
        if (me._rows && me._rows.length && e.layer.options) {
          var lightOrDark = e.layer.options.lightOrDark;

          if (typeof lightOrDark === 'string' && (lightOrDark !== me._baseLayerColor)) {
            for (var i = 0; i < me._rows.length; i++) {
              var row = me._rows[i];
              var symbol = (function () {
                var c;

                for (var j = 0; j < me._include.length; j++) {
                  if (me._include[j].type === row.type) {
                    c = me._include[j];
                    break;
                  }
                }

                if (c) {
                  return c.symbol;
                } else {
                  return null;
                }
              })();

              // TODO: It seems like you're going to have to rebuild the marker itself.
              // So, remove all the markers from the map.
              // Then iterate through me._rows, overwriting me._rows[i].marker with the new marker.
              // Then call _update if me.options.prioritization is true.
              // If it isn't true, just readd all the markers.

              row.marker.setIcon(me._getIcon(lightOrDark === 'dark', symbol));
            }
          }
        }
      });
    }
    */

    if (me.options.prioritization) {
      me._map.on('moveend', function () {
        if (me._rows && me._rows.length) {
          me._update();
        }
      });
    }

    L.GeoJSON.prototype.onAdd.call(this, this._map);
  },
  _getIcon: function (dark, symbol) {
    if (symbol) {
      return L.outerspatial.icon.outerspatialsymbollibrary({
        'marker-color': (dark ? '000000' : '117733'),
        'marker-size': 'medium',
        'marker-symbol': symbol + '-white'
      });
    } else {
      return L.icon({
        iconAnchor: [
          3,
          3
        ],
        iconRetinaUrl: window.L.Icon.Default.imagePath + '/dots/dot-' + (dark ? 'black' : 'green') + '-6@2x.png',
        iconSize: [
          6,
          6
        ],
        iconUrl: window.L.Icon.Default.imagePath + '/dots/dot-' + (dark ? 'black' : 'green') + '-6.png',
        popupAnchor: [
          2,
          -6
        ]
      });
    }
  },
  _update: function () {
    var me = this;
    var active = [];
    var bounds = me._map.getBounds().pad(0.1);
    var layers = me.getLayers();
    var config;
    var i;
    var marker;

    for (i = 0; i < me._include.length; i++) {
      config = me._include[i];

      if (typeof config.minZoomFactor === 'number' || (me._map.getZoom() >= config.minZoom)) {
        active.push(config.type);
      }
    }

    i = layers.length;

    while (i--) {
      marker = layers[i];

      if (active.indexOf(marker.type) === -1 || !bounds.contains(marker.getLatLng())) {
        me.removeLayer(marker);
      }
    }

    for (i = 0; i < me._rows.length; i++) {
      var type;

      marker = me._rows[i].marker;
      type = marker.type;

      if (active.indexOf(type) > -1) {
        if (bounds.contains(marker.getLatLng())) {
          var factor;

          config = (function () {
            var c;

            for (var j = 0; j < me._include.length; j++) {
              if (me._include[j].type === type) {
                c = me._include[j];
                break;
              }
            }

            if (c) {
              return c;
            }
          })();
          factor = config.minZoomFactor;

          if (typeof factor === 'number') {
            var minZoom = marker.minZoom;
            var zoom = 16;

            if (typeof minZoom === 'number' && ((minZoom + factor) < 16)) {
              zoom = minZoom + factor;
            }

            if (me._map.getZoom() >= zoom) {
              me.addLayer(marker);
            } else if (me.hasLayer(marker)) {
              me.removeLayer(marker);
            }
          } else if (!me.hasLayer(marker)) {
            me.addLayer(marker);
          }
        }
      }
    }
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'geojson';
  }

  if (options.cluster) {
    return L.outerspatial.layer._cluster(options);
  } else {
    return new PoiLayer(options);
  }
};
