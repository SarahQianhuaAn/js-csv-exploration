function getWaypoints(data) {
    // turn csvfile into an array and ignore the header row
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

function displayTable(data, index) {
  const rows = data.split(/\n|\r\n/).slice(1);
  let table = []

  rows.forEach((row) => {
    const columns = row.split(",");
    const routeIndex = columns[0];
    if (routeIndex == "Route " + index) {
      const geocodedAddress = columns[3];
      table.push(geocodedAddress);
    }
  });
  // return (<p>BYE WORLD</p>);
}

export { getWaypoints, displayTable }