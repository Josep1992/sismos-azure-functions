const moment = require("moment");
const regions = require("../fixtures/regions");
const map = require("./map");

const GOOGLE_MAPS_API_KEY = 'AIzaSyCLHcH6_I0oUWlE3XAiXw2sPAKdbhbzqBc';

module.exports = function earthquake(source,data){
  if(source === 'rspr'){
    let [
      id, magnitude, ,
      source, date, time, latitude,
      longitude, depth, , code
    ] = data.split(" ");

    if (id) {
      return {
        id,
        magnitude: Number(magnitude),
        source: source.toLowerCase(),
        created_at: moment(date).format(),
        time: moment(time, 'HH:mm:ss').format(),
        tsunami: null,
        coords: {
          latitude,
          longitude,
          depth,
        },                             // index 0 = en index 1 = es
        place: !regions[code] ? null : regions[code]["name"][0],
        // authorize api
        map: map({ latitude, longitude, GOOGLE_MAPS_API_KEY })
      };
    }
  }

  let { properties: { mag, time, place, updated, tsunami }, geometry, id } = data;
  let { coordinates: [latitude, longitude, depth] } = geometry;

  return {
    id,
    magnitude: mag,
    source: 'usgs',
    created_at: moment(time).format(),
    updated_at: moment(updated).format(),
    time: moment(time).format(),
    tsunami,
    coords: {
      latitude,
      longitude,
      depth,
    },
    place,
    // authorize api
    map: map({ latitude, longitude, GOOGLE_MAPS_API_KEY })
  };

}

