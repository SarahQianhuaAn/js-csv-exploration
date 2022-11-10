import CSVProcessor from "./csvProcessor.js";
import { initAutocomplete } from "./googleMap.js";

var processor = new CSVProcessor();

const csvFile = document.getElementById("csvFile");
const reader = new FileReader();

const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const routingButton = document.getElementById("routing");

const indexInput = document.getElementById("index");
const depotInput = document.getElementById("depot");

const printButton = document.getElementById("print");
const printAllButton = document.getElementById("print-all");

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
    processor.routes = reader.result;
    processor.updateWaypoints();
    // show users how many routes are extracted
    document.getElementById(
      "report"
    ).innerHTML = `Found ${processor.routeCount} routes! Route Index 1 to ${processor.routeCount}.`;
  },
  false
);

if (sessionStorage.getItem("depot")) {
  depotInput.value = sessionStorage.getItem("depot");
}

depotInput.addEventListener("focusout", () => {
  sessionStorage.setItem("depot", depotInput.value);
  // console.log(sessionStorage.getItem("depot"));
});

printButton.addEventListener("click", () => {
  window.print();
});
// printAllButton.addEventListener("click", () => {
// })

function calcRoute(service, renderer) {
  var index = parseInt(indexInput.value) - 1;
  var depot = depotInput.value;
  document.getElementById("directionsTable").innerHTML =
    processor.displayRouteAsTable(index);

  // create a directions request
  const directionsRequest = {
    origin: depot,
    destination: depot,
    waypoints: processor.waypointsOfRoutes[index],
    travelMode: "DRIVING",
  };

  // use directions service to make rendering of route based on the request
  service.route(directionsRequest, (result, status) => {
    if (status == google.maps.DirectionsStatus.OK) {
      renderer.setDirections(result);
      // console.log(directionsRequest);
    } else {
      console.error("Direction request failed.");
    }
  });
}

function initMap() {
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

  prevButton.addEventListener("click", () => {
    if (
      !processor.waypointsOfRoutes ||
      !indexInput.value ||
      parseInt(indexInput.value) <= 1
    ) {
      return;
    }
    indexInput.value = parseInt(indexInput.value) - 1;
    calcRoute(directionsService, directionsRenderer);
  });

  nextButton.addEventListener("click", () => {
    if (
      !processor.waypointsOfRoutes ||
      !indexInput.value ||
      parseInt(indexInput.value) >= processor.waypointsOfRoutes.length
    ) {
      return;
    }
    indexInput.value = parseInt(indexInput.value) + 1;
    calcRoute(directionsService, directionsRenderer);
  });

  // implement rendering of route directions on the map
  routingButton.addEventListener("click", () => {
    if (
      !processor.waypointsOfRoutes ||
      !indexInput.value ||
      parseInt(indexInput.value) >= processor.waypointsOfRoutes.length ||
      parseInt(indexInput.value) <= 1
    )
    calcRoute(directionsService, directionsRenderer);
  });
}

window.initMap = initMap;
