const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const myForm = document.getElementById("myForm");
const reader = new FileReader();
let waypointsOfRoutes = [];

myForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const [ myCSV ] = document.getElementById("csvFile").files;
    if (myCSV) {
        reader.readAsText(myCSV);
    }
})

reader.addEventListener('load', () => {
    // console.log(reader.result)
    const data = reader.result;
    getData(data).catch( error => { console.error(error); });
}, false)

async function getData(data) {
  // const response = await fetch("test.csv");
  // const data = await response.text();
  const rows = data.split(/\n|\r\n/).slice(1);
  rows.forEach((row) => {
    const columns = row.split(",");
    const routeIndex = columns[0];
    const stopIndex = columns[1];
    const geocodedAddress = columns[3];
    if (routeIndex != "DISMISSED REQUEST") {
      waypointsOfRoutes.push([routeIndex, stopIndex, geocodedAddress]);
    }
  });
}

function getWaypoints() {
    let waypoints = []
    waypointsOfRoutes.forEach(waypoint => {
        let address = waypoint[2];
        waypoints.push({location: address});
    })
    console.log(waypoints);
    return waypoints;
}

function calcRoute(directionsService, directionsRenderer) {
  var depot = { lat: 33.7175, lng: -117.8311 };
  const directionsRequest = {
    origin: depot,
    destination: depot,
    waypoints: getWaypoints(),
    travelMode: "DRIVING",
  };
  directionsService.route(directionsRequest, (result, status) => {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
    } else {
        console.error("Direction request failed.");
    }
  });
}

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 9,
    center: { lat: 33.7175, lng: -117.8311 },
  });

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
  directionsRenderer.setPanel(document.getElementById("directionsPanel"));
  calcRoute(directionsService, directionsRenderer);
    var goButton = document.getElementById("go");
    goButton.addEventListener("click", () =>
      calcRoute(directionsService, directionsRenderer)
    );
}

window.initMap = initMap;
