module.exports = function map({ latitude, longitude, GOOGLE_MAPS_API_KEY }) {
  const url = [
      `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}`,
      `&center=${longitude},${latitude}`,
      `&q=${longitude},${latitude}`,
      `&zoom=7`
  ];
  return url.join("");
}