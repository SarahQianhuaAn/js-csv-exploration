let data;

async function getWaypoints() {
  // const response = await fetch("routes.csv");
  // const data = await response.text();
  const rows = data.split(/\n|\r\n/).slice(1);
  var currentRouteIndex = "";
  var addresses = [];
  let waypoints = [];
  rows.forEach((row) => {
    const columns = row.split(",");
    const routeIndex = columns[0];
    const geocodedAddress = columns[3];
    if (routeIndex != "DISMISSED REQUEST") {
      if (routeIndex != currentRouteIndex) {
        if (addresses.length > 0) {
          waypoints.push(addresses);
        }
        currentRouteIndex = routeIndex;
        addresses = [];
      }
      addresses.push({ location: geocodedAddress, stopover: true });
    }
  });
  if (addresses.length > 0) {
    waypoints.push(addresses);
  }
  // console.log(waypoints);
  return waypoints;
}

async function calcRoute(directionsService, directionsRenderer) {
  var depot = document.getElementById("depot").value;
  var index = parseInt(document.getElementById("index").value);
  let waypointsOfRoutes = await getWaypoints();

  const directionsRequest = {
    origin: depot,
    destination: depot,
    waypoints: waypointsOfRoutes[index - 1],
    travelMode: "DRIVING",
  };

  directionsService.route(directionsRequest, (result, status) => {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
      console.log(directionsRequest);
    } else {
      console.error("Direction request failed.");
    }
  });
}

function newAutocomplete(id) {
  new google.maps.places.Autocomplete(document.getElementById(id));
}

function initAutocomplete() {
  newAutocomplete("depot");
}

function initMap() {
  const csvFile = document.getElementById("csvFile");
  const reader = new FileReader();

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 9,
    center: { lat: 33.7175, lng: -117.8311 },
  });

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();

  directionsRenderer.setMap(map);
  directionsRenderer.setPanel(document.getElementById("directionsPanel"));

  initAutocomplete();

  // const prevButton = document.getElementById("prev");
  // const nextButton = document.getElementById("next");

  csvFile.addEventListener("change", (e) => {
    e.preventDefault();
    const [myCSV] = document.getElementById("csvFile").files;
    if (myCSV) {
      reader.readAsText(myCSV);
    }
  });

  reader.addEventListener(
    "load",
    () => {
      // console.log(reader.result)
      data = reader.result;
    },
    false
  );

  var goButton = document.getElementById("go");

  goButton.addEventListener("click", () => {
    calcRoute(directionsService, directionsRenderer);
  });
}

window.initMap = initMap;
