import React, { useState, useEffect } from "react";
import {
  withGoogleMap,
  withScriptjs,
  GoogleMap,
  Marker,
  InfoWindow
} from "react-google-maps";
import truckData from "./data/csvjson.json";
import mapStyles from "./mapStyles";
import * as geolib from 'geolib';

function SFOMap() {
  let trucks = new Map();
  const maxNoOfSuggestions=7;
  //load the foodTruck data and map required props
  truckData.forEach(truck => {
    trucks.set(truck.locationid,
      {
        locationId: truck.locationid,
        foodItem: truck.foodItems,
        address:truck.address,
        name: truck.applicant,
        latitude: truck.latitude,
        longitude: truck.longitude
      });
  });
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [trucksCloseBy, setTrucksCloseBy] = useState(null);
  useEffect(() => {
    const listener = e => {
      if (e.key === "Escape") {
        setSelectedTruck(null);
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <GoogleMap
      defaultZoom={14}
      defaultCenter={{ lat: 37.79218368678335, lng: - 122.4043141170555 }}
      defaultOptions={{ styles: mapStyles }}
      onClick={(mapsMouseEvent) => {
        const myLocation = mapsMouseEvent.latLng.toJSON();
        //clear the state when user clicked at new latlng.
        setTrucksCloseBy(null);
        setSelectedTruck(null);
        //Find the # of closest truck realtive to the mouse click location
        setTrucksCloseBy(geolib.orderByDistance(myLocation, Array.from(trucks.values())).slice(0, maxNoOfSuggestions));
      }}
    >
      // place the trucks in the respective latlng in the map
      {trucksCloseBy && (trucksCloseBy.map(truck => (
        <Marker
          key = {truck.locationId}
          position={{
            lat: truck.latitude,
            lng: truck.longitude
          }}
          onClick={() => {
            setSelectedTruck(truck);
          }}
          icon={{
            url: `/ftc.png`,
            scaledSize: new window.google.maps.Size(20, 20)
          }}
        />
      )))}
      // show information of the selected truck
      {selectedTruck && (
        <InfoWindow
          onCloseClick={() => {
            setSelectedTruck(null);
          }}
          position={{
            lat: selectedTruck.latitude,
            lng: selectedTruck.longitude
          }}
        >
          <div>
            <h2>{selectedTruck.name}</h2>
            <p>{selectedTruck.address}</p>
            <p>{selectedTruck.foodItem}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

const MapWrapped = withScriptjs(withGoogleMap(SFOMap));

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <MapWrapped
        googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.SFO_FOODTRUCK_APP_GOOGLE_KEY
          }`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `100%` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    </div>
  );
}
