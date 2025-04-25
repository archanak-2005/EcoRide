import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Modal } from 'react-bootstrap';
import L from 'leaflet';

const mapContainerStyle = {
  height: "70vh", 
  width: "100%",
};
const center = {
  lat: 43.473078230478336,
  lng: -80.54225947407059,
};

const autocompleteTextBoxStyle = {
  boxSizing: `border-box`,
  border: `1px solid transparent`,
  width: `22rem`,
  height: `3rem`,
  padding: `0 12px`,
  borderRadius: `3px`,
  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
  fontSize: `14px`,
  outline: `none`,
  textOverflow: `ellipses`,
  position: 'absolute',
  top: '1rem',
  left: '1.5rem',
  maxWidth: '100%'
};

const CustomMapEvents = ({ setMarker, setTextBoxText }) => {
  useMapEvents({
    click(e) {
      setMarker(e.latlng);
      setTextBoxText('');
    },
  });
  return null;
};

export default function MapSelector(props) {
  const [marker, setMarker] = useState(center);
  const [textBoxText, setTextBoxText] = useState('');

  const handleClose = () => {
    props.handleCallback(true);
    return null;
  };

  const mapSelectorRef = useRef();

  return (
    <Modal
      onHide={handleClose}
      size='xl'
      show={props.showModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body data-test="model-body">
        <div style={autocompleteTextBoxStyle}>
          <input
            type="text"
            placeholder="Search (manual input required for now)"
            data-test="map-search"
            value={textBoxText}
            onChange={e => setTextBoxText(e.target.value)}
          />
        </div>
        <MapContainer
          center={marker}
          zoom={15}
          style={mapContainerStyle}
          whenCreated={mapInstance => (mapSelectorRef.current = mapInstance)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          <Marker position={marker} icon={L.icon({
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          })} />
          <CustomMapEvents setMarker={setMarker} setTextBoxText={setTextBoxText} />
        </MapContainer>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" data-test="close-button" onClick={handleClose}>Close</Button>
        <Button variant="primary" data-test="map-select" onClick={() => props.handleCallback(false, props.mapType, marker)}>Select</Button>
      </Modal.Footer>
    </Modal>
  );
}
