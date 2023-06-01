import "./styles.css";
import { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
  InfoWindow,
  StreetViewPanorama
} from "@react-google-maps/api";
type Libraries = (
  | "drawing"
  | "geometry"
  | "localContext"
  | "places"
  | "visualization"
)[];
const data = [
  {
    source: { lat: 58.14, lng: 14.6074 },
    destination: { lat: 57.906969506453116, lng: 16.697856507261587 },
    distance: 123
  },
  {
    source: { lat: 57.09402001135807, lng: 15.361428911804866 },
    destination: { lat: 58.14, lng: 14.6074 },
    distance: 158
  }
];

const libraries: Libraries = ["drawing", "geometry"];
export default function App() {
  const [polylineText, setPolylineText] = useState<
    google.maps.LatLng | google.maps.LatLngLiteral | undefined
  >(undefined);

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "",
    libraries
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    const defaultLocation = { lat: 57.4217705, lng: 15.0437262 };
    //Set the bounds to the furthest north and south points on the map in order to avoid zooming out or panning further than those bounds
    const maxBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-85, -180),
      new google.maps.LatLng(85, 180)
    );

    map.setOptions({
      center: defaultLocation,
      zoom: 7,
      controlSize: 30,
      restriction: {
        latLngBounds: maxBounds,
        strictBounds: true
      },
      fullscreenControl: true,
      mapTypeControl: false
    });
    map.setTilt(45);
    const location1 = data[1].destination;
    const location2 = data[1].source;
    setMap(map);

    // store the spherical property in a variable for later use
    const compute = google.maps.geometry.spherical;

    // use computeDistanceBetween() method
    // to get the distance between the two locations for calculating the offset Length
    const distanceBetween = compute.computeDistanceBetween(
      location1,
      location2
    );
    console.log("Distance Between: " + distanceBetween);

    // multiply the distance to 0.45 to get the 45% of its length
    // You can change the value here if you want to modify it
    // ex. multiplying it with 0.5 will provide you the center.
    const offsetDistance = distanceBetween * 0.45;
    console.log("Offset length: " + offsetDistance);

    // use computeHeading() method to get the heading for later use
    const heading = compute.computeHeading(location1, location2);
    console.log("Heading: " + heading);

    // use the computeOffset() method to get the latLng of the offsetDistance
    const offsetLocation = compute.computeOffset(
      location1,
      offsetDistance,
      heading
    );
    console.log("Offset location: " + offsetLocation);

    // update the state for the position of your infoWindow
    setPolylineText(offsetLocation);
  }, []);

  const onUnmount = useCallback((map: google.maps.Map) => {
    setMap(null);
  }, []);

  return !isLoaded ? null : (
    <GoogleMap
      id="react-google-maps"
      mapContainerClassName={"google-map-container-style"}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onZoomChanged={() => {}}
    >
      <InfoWindow position={polylineText}>
        <div>
          <p>Distance Between Points: {data[1].distance}</p>
        </div>
      </InfoWindow>
      {data.map(({ source, destination, distance }, index) => (
        <Marker key={index} position={source}></Marker>
      ))}
      {data.map(({ source, destination, distance }, index) => (
        <Polyline
          key={index}
          options={{
            strokeColor: "#4468E1",
            icons: [
              {
                icon: { path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW },
                offset: "50%"
              }
            ]
          }}
          path={[source, destination]}
        />
      ))}
    </GoogleMap>
  );
}
