/* eslint-disable */
export const displayMap = (locations) => {
  var map = new maplibregl.Map({
    container: 'map',
    style:
      'https://api.maptiler.com/maps/streets/style.json?key=zQbBWTl7eEF6Cn0YJNq1',
    antialias: true,
    scrollZoom: false,
  });

  const bounds = new maplibregl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new maplibregl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new maplibregl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
