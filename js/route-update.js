mapboxgl.accessToken = 'pk.eyJ1IjoibWlrdGciLCJhIjoiY2t2MDR2ZTA5MGlxaTJ2cjJycXJtbnR5cSJ9.y7w6xV_k61ni3N72ehbV3A';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v11', // style URL
  center: [-112.0740, 33.4484], // starting position [lng, lat]
  zoom: 13 // starting zoom
});

let url = 'https://app.mecatran.com/utw/ws/gtfsfeed/vehicles/valleymetro?apiKey=4f22263f69671d7f49726c3011333e527368211f&asJson=true';

var userLat = 0;
var userLong = 0;

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
}

function success(pos) {
  var crd = pos.coords;
  userLat = pos.coords.latitude;
  userLong = pos.coords.latitude;
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);

let getLocationPromise = new Promise((resolve, reject) => {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      let userMarker = new mapboxgl.Marker({
        color: '#0000FF',
        draggable: true
      }).setLngLat([position.coords.longitude, position.coords.latitude])
          .addTo(map);
    })
  }
});

let phoenixTransitData;
let busPositions = [];
let currentMarkers = [];

function update(){
  setInterval(() => {
    run();
  }, 10000);
};

let fetchTransitData = async (url) => {
  let response = await fetch(url);
  let results = await response.json();
  return results;
};


function run() {
  fetchTransitData(url).then((data) => {
    phoenixTransitData = data;

    for (let i=0; i<phoenixTransitData.entity.length; i++){
      let tempIndividualBusPosition = [phoenixTransitData.entity[i].vehicle.position.longitude, phoenixTransitData.entity[i].vehicle.position.latitude];
      busPositions.push(tempIndividualBusPosition);
    }

    if (currentMarkers !== null) {
      for (var i = currentMarkers.length - 1; i >= 0; i--) {
        currentMarkers[i].remove();
        currentMarkers.splice(i);
      }
    }

    for (let i = 0; i<busPositions.length; i++) {
      createMarker(busPositions[i]);
    }
    busPositions = [];
  })
}

// Mapbox Marker factory
function createMarker(busLngLat) {
  let marker = new mapboxgl.Marker({
    color: "#0000FF"
  }).setLngLat([busLngLat[0], busLngLat[1]])
      .addTo(map);
  currentMarkers.push(marker);
};

run();
update();