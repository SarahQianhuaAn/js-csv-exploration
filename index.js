var waypointsOfRoutes;

function getWaypoints(data) {
  const rows = data.split(/\n|\r\n/).slice(1);
  var currentRouteIndex = "";
  var addresses = [];
  let waypoints = [];

  // loop through every row of the processed text to get geocoded addresses
  // and put them into different addresses groups (arrays) in the waypoints array,
  // based on their route index
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

function calcRoute(directionsService, directionsRenderer) {
  var index = parseInt(document.getElementById("index").value);

  if (!waypointsOfRoutes) {
    return;
  }

  var depot = document.getElementById("depot").value;

  // create a directions request
  const directionsRequest = {
    origin: depot,
    destination: depot,
    waypoints: waypointsOfRoutes[index - 1],
    travelMode: "DRIVING",
  };

  // use directions service to make rendering of route based on the request
  directionsService.route(directionsRequest, (result, status) => {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
      console.log(directionsRequest);
    } else {
      console.error("Direction request failed.");
    }
  });
}

function initAutocomplete(id) {
  new google.maps.places.Autocomplete(document.getElementById(id));
}

function initMap() {
  const csvFile = document.getElementById("csvFile");
  const reader = new FileReader();
  const routingButton = document.getElementById("routing");
  // set default map center to around orange county
  const mapCenter = { lat: 33.7175, lng: -117.8311 };

  // initialize a map
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 9,
    center: mapCenter,
  });

  // create google maps service and renderer objects
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();

  // set the map and directions panel on the web page
  directionsRenderer.setMap(map);
  directionsRenderer.setPanel(document.getElementById("directionsPanel"));

  initAutocomplete("depot");

  // implement reading of inputted csv files
  csvFile.addEventListener("change", (e) => {
    e.preventDefault();
    const [myCSV] = document.getElementById("csvFile").files;
    if (myCSV) {
      reader.readAsText(myCSV);
    }
  });

  // get the read result of the inputted csv files
  reader.addEventListener(
    "load",
    () => {
      let csvRoutes = reader.result;
      waypointsOfRoutes = getWaypoints(csvRoutes);
      // show users how many routes are extracted
      document.getElementById(
        "report"
      ).innerHTML = `Found ${waypointsOfRoutes.length} routes! Route Index 1 to ${waypointsOfRoutes.length}.`;
    },
    false
  );
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");

  prevButton.addEventListener("click", () => {
    if (!document.getElementById("index").value) {
      return;
    }
    if (parseInt(document.getElementById("index").value) <= 1) {
      return;
    }
    document.getElementById("index").value =
      parseInt(document.getElementById("index").value) - 1;
    calcRoute(directionsService, directionsRenderer);
  });

  nextButton.addEventListener("click", () => {
    if (!waypointsOfRoutes) {
      return;
    }
    if (
      parseInt(document.getElementById("index").value) >=
      waypointsOfRoutes.length
    ) {
      return;
    }
    document.getElementById("index").value =
      parseInt(document.getElementById("index").value) + 1;
    calcRoute(directionsService, directionsRenderer);
  });

  // implement rendering of route directions on the map
  routingButton.addEventListener("click", () => {
    calcRoute(directionsService, directionsRenderer);
  });

  let depotInput = document.getElementById("depot");
  if (sessionStorage.getItem("depot")) {
    depotInput.value = sessionStorage.getItem("depot");
  }
  depotInput.addEventListener("focusout", () => {
    sessionStorage.setItem("depot", depotInput.value);
    console.log(sessionStorage.getItem("depot"))
  });
}

window.initMap = initMap;
