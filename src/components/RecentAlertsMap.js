import React from "react";
import PropTypes from "prop-types";
import polygons from "../polygons.json";

class RecentAlertsMap extends React.Component {
  state = {
    map: null,
    mapBounds: null,
    showMapWithUserLocation: false,
    timeToShelterText: "",
    timeToShelterShareText: "",
    alertExplanationText: "",
    alertExplanationShareText: "",
  };

  componentDidMount() {
    this.initMapWithAlertLocation();
  }

  componentDidUpdate() {
    if (this.props.mapFocus) {
      this.updateMapFocus();
    }
  }

  async initMapWithAlertLocation() {
    window.mapboxgl.accessToken =
      "pk.eyJ1IjoiZmRkdmlzdWFscyIsImEiOiJjbGZyODY1dncwMWNlM3pvdTNxNjF4dG1rIn0.wX4YYvWhm5W-5t8y5pp95w";
    const map = new window.mapboxgl.Map({
      container: "alerts_map",
      style: "mapbox://styles/fddvisuals/cloz9rvig00et01qjbh5q3jz1",
      center: [this.props.alerts[0].lon, this.props.alerts[0].lat],
      cooperativeGestures: true,
    });

    const geojson = {
      type: "FeatureCollection",
      features: [],
    };

    map.on("load", () => {
      const alertNames = [];
      const bounds = new window.mapboxgl.LngLatBounds();
      this.props.alerts.forEach((alert) => {
        if (alertNames.includes(alert.name)) {
          return;
        }
        alertNames.push(alert.name);

        bounds.extend(
          polygons[alert.taCityId]?.map(([lat, lon]) => [lon, lat])
        );

        if (alert.taCityId) {
          geojson.features.push({
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                polygons[alert.taCityId]?.map(([lat, lon]) => [lon, lat]),
              ],
            },
          });
        }

        // Add a marker
        const el = document.createElement("div");
        el.className = "map-marker";
        new window.mapboxgl.Marker(el)
          .setLngLat([alert.lon, alert.lat])
          .addTo(map);
      });

      // Add a new layer to visualize the polygons.
      map.addLayer({
        id: `polygon1`,
        type: "fill",
        source: {
          type: "geojson",
          data: geojson,
        },
        paint: {
          "fill-color": "red",
          "fill-opacity": 0.3,
        },
      });

      // Add am outline around the polygon.
      map.addLayer({
        id: `outline1`,
        type: "line",
        source: {
          type: "geojson",
          data: geojson,
        },
        paint: {
          "line-color": "red",
          "line-width": 1,
        },
      });

      map.fitBounds(bounds, {
        padding: { top: 50, bottom: 170 },
        animate: false,
      });

      this.setState({ map, mapBounds: bounds });
    });
  }

  updateMapFocus = () => {
    const alert = this.props.mapFocus;
    if (alert === "reset") {
      this.state.map.fitBounds(this.state.mapBounds, {
        padding: { top: 50, bottom: 170 },
        pitch: 0,
        animate: true,
      });
    } else {
      this.state.map.panTo([alert.lon, alert.lat], {
        zoom: 13,
        pitch: 50,
        animate: true,
      });
    }
  };

  render() {
    return (
      <section className="section map">
        <div id="alerts_map" style={{ height: "80vh" }}></div>
      </section>
    );
  }
}

RecentAlertsMap.propTypes = {
  alerts: PropTypes.array.isRequired,
  mapFocus: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

RecentAlertsMap.defaultProps = {
  mapFocus: null,
};

export default RecentAlertsMap;
