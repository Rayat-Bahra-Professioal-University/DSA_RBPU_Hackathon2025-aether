"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const LocationPicker = ({ formData, setFormData }) => {
  useMapEvents({
    click(e) {
      setFormData({
        ...formData,
        latitude: e.latlng.lat.toString(),
        longitude: e.latlng.lng.toString(),
      });
    },
  });

  return formData.latitude && formData.longitude ? (
    <Marker
      position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
      icon={L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })}
    />
  ) : null;
};

export default function ClientMap({ center = [30.7333, 76.7794], formData, setFormData }) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationPicker formData={formData} setFormData={setFormData} />
    </MapContainer>
  );
}
