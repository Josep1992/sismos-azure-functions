const moment = require("moment");
const regions = require("../fixtures/regions");
const map = require("./map");

module.exports = function earthquake(source, data) {
  if (source === 'rspr') {
    let [
      id, magnitude, ,
      source, date, time, latitude,
      longitude, depth, , code
    ] = data.split(" ");

    if (id) {
      return {
        id,
        magnitude: Number(magnitude),
        agency: source.toLowerCase(),
        created_at: moment(date).format(),
        time: moment(time, 'HH:mm:ss').format(),
        tsunami: null,
        coords: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          depth,
        },                             // index 0 = en index 1 = es
        place: !regions[code] ? null : regions[code]["name"][0],
        // authorize api
        map: map({ latitude, longitude })
      };
    }
  }

  let { properties: { mag, time, place, updated, tsunami }, geometry, id } = data;
  let { coordinates: [latitude, longitude, depth] } = geometry;

  return {
    id,
    magnitude: mag,
    agency: 'usgs',
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
    map: map({ latitude, longitude })
  };

}

