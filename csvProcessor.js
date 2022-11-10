export default class CSVProcessor {
  constructor() {
    this.routes_ = [];
    this.waypointsOfRoutes_ = [];
  }

  get waypointsOfRoutes() {
    return this.waypointsOfRoutes_;
  }

  set waypointsOfRoutes(waypointsOfRoutes) {
    this.waypointsOfRoutes_ = waypointsOfRoutes;
  }

  get routeCount() {
    return this.waypointsOfRoutes_.length;
  }

  set routes(csvRoutes) {
    this.routes_ = csvRoutes.split(/\n|\r\n/);
  }

  updateWaypoints() {
    this.waypointsOfRoutes_ = this.calcWaypoints(this.routes_);
  }

  calcWaypoints(csvRoutes) {
    // turn csvfile into an array and ignore the header row
    const rows = csvRoutes.slice(1);
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
        addresses.push({ location: geocodedAddress });
      }
    });

    if (addresses.length > 0) {
      waypoints.push(addresses);
    }
    return waypoints;
  }

  displayRouteAsTable(index) {
    var table = "<table>";
    var waypoints = this.waypointsOfRoutes_.at(index);
    for (var i = 0; i < waypoints.length; i++){
      table += `<tr> <td>${i + 1}</td> <td>${waypoints[i].location}</td> </tr>`
    }
    table += "</table>"
    return table
  }
}
