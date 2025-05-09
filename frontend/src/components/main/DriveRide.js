import React, { useState, useEffect, useRef } from 'react';
import { Button, Col, Container, FloatingLabel, Form, Row } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import './DriveRide.css';
import "react-datepicker/dist/react-datepicker.css";
import Cookies from 'js-cookie';
import L from 'leaflet';
import MapSelector from './MapSelector';

const mapContainerStyle = {
    height: "60vh",
    width: "100%",   
};

const center = {
    lat: 43.473078230478336,
    lng: -80.54225947407059,
};

export default function DriveRide({ type, setToken, setActiveTrip }) {
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Title Error');
    const [mapType, setMapType] = useState();
    const [mapCoords, setMapCoords] = useState({
        src: null,
        dst: null
    });
    const [dateTime, setDateTime] = useState(new Date(new Date().getTime() + (60 * 60 * 1000)));
    const [riders, setRiders] = useState();
    const [srcName, setsrcName] = useState("");
    const [destName, setdestName] = useState("");
    const [routeResp, setRouteResp] = useState(null);  // Define state and setter for route response

    const mapRef = useRef();
    const onMapLoad = (map) => {
        mapRef.current = map;
    };

    const openMapModal = (mapType) => {
        setMapType(mapType);
        setModalTitle(mapType === 'src' ? 'Source point' : 'Destination point');
        setShowModal(true);
    }

    const handleCallback = (closeButtonClicked, mapType, mapData) => {
        setShowModal(false);
        if (closeButtonClicked) return;

        setMapCoords({
            ...mapCoords,
            [mapType]: mapData
        });

        if (mapType === 'src') {
            setsrcName(`Source: Lat: ${mapData.lat.toFixed(4)}, Lng: ${mapData.lng.toFixed(4)}`);
        } else {
            setdestName(`Destination: Lat: ${mapData.lat.toFixed(4)}, Lng: ${mapData.lng.toFixed(4)}`);
        }
    }

    const handleDriveSubmit = (event) => {
        event.preventDefault();
        const data = {
            src: {
                lat: mapCoords.src.lat,
                lng: mapCoords.src.lng
            },
            dst: {
                lat: mapCoords.dst.lat,
                lng: mapCoords.dst.lng
            },
            dateTime: dateTime,
            max_riders: riders
        }
        console.log(data);
        return fetch(process.env.REACT_APP_END_POINT + '/trip/drive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Coookie': Cookies.get('tokken')
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (response.ok)
                    return response.json();
                else if (response.status === 401)
                    setToken(null);
                throw new Error(response.statusText);
            })
            .then((responseJson) => {
                console.log(responseJson);
                setActiveTrip(responseJson._id);
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
                alert(error);
                window.location.reload();
            });
    }

    const handleRideSubmit = (event) => {
        event.preventDefault();
        const data = {
            src: {
                lat: mapCoords.src.lat,
                lng: mapCoords.src.lng
            },
            dst: {
                lat: mapCoords.dst.lat,
                lng: mapCoords.dst.lng
            },
            dateTime: dateTime,
        }
        console.log(data);
        return fetch(process.env.REACT_APP_END_POINT + '/trip/ride', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Coookie': Cookies.get('tokken')
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                if (response.ok)
                    return response.json();
                else if (response.status === 401)
                    setToken(null);
                throw new Error(response.statusText);
            })
            .then((responseJson) => {
                console.log(responseJson);
                setActiveTrip(responseJson._id);
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
                alert(error);
                window.location.reload();
            });
    }

    useEffect(() => {
        setRouteResp(null);  // Now this is valid
    }, [mapCoords]);

    return (
        <>
        <Container fluid="lg">
            <Row style={{ marginTop: '3rem' }}>
                <Col md>
                    <Form>
                        <Form.Group as={Row} className="mb-3" controlId="src">
                            <Col xs="9">
                                <Form.Control readOnly defaultValue="Source not selected" value={mapCoords['src'] ? srcName : null} />
                            </Col>
                            <Col xs="3">
                                <Button variant="primary" onClick={() => openMapModal('src')} style={{ width: '100%' }} data-test="source-button">
                                    Source
                                </Button>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="dst">
                            <Col xs="9">
                                <Form.Control readOnly defaultValue="Destination not selected" value={mapCoords['dst'] ? destName : null} />
                            </Col>
                            <Col xs="3">
                                <Button variant="primary" onClick={() => openMapModal('dst')} style={{ width: '100%' }} data-test="destination-button">
                                    Destination
                                </Button>
                            </Col>
                        </Form.Group>
                        <Row style={{ marginTop: '1rem' }}>
                            <Col xs="6" sm="3" md="4">
                                <label>Date-Time of trip: </label>
                            </Col>
                            <Col xs="6">
                                <DatePicker
                                    showTimeSelect
                                    selected={dateTime}
                                    minDate={new Date()}
                                    closeOnScroll={true}
                                    onChange={(date) => setDateTime(date)}
                                    dateFormat="MMMM d @ h:mm aa" />
                            </Col>
                        </Row>
                        {
                            type === 'drive' ?
                                <Row style={{ marginTop: '1rem' }}>
                                    <Col sm="7" md="12" xl="8">
                                        <FloatingLabel controlId="ridingWith" label="Select number of people can ride with">
                                            <Form.Select onChange={e => { setRiders(e.target.value) }} >
                                                <option>----- Select -----</option>
                                                <option value="1">One</option>
                                                <option value="2">Two</option>
                                                <option value="3">Three</option>
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Col>
                                </Row>
                                : null
                        }
                        <Row className='justify-content-center'>
                            <Col className='col-auto'>
                                {
                                    type === 'drive' ?
                                        <Button variant="primary" type="submit" data-test="drive-submit-button" style={{ marginTop: '3rem' }} onClick={handleDriveSubmit}>
                                            Ready to drive!
                                        </Button> :
                                        <Button variant="primary" type="submit" data-test="ride-submit-button" style={{ marginTop: '3rem' }} onClick={handleRideSubmit}>
                                            Ready to ride!
                                        </Button>
                                }
                            </Col>
                        </Row>
                    </Form>
                </Col>
                <Col md style={{ marginTop: '2rem' }}>
                    <MapContainer
                        center={center}
                        zoom={15}
                        style={mapContainerStyle}
                        whenCreated={onMapLoad}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {
                            mapCoords.src && mapCoords.dst &&
                            <>
                                <Marker position={mapCoords.src}>
                                    <Popup>{srcName}</Popup>
                                </Marker>
                                <Marker position={mapCoords.dst}>
                                    <Popup>{destName}</Popup>
                                </Marker>
                            </>
                        }
                    </MapContainer>
                </Col>
            </Row>
        </Container>
        <MapSelector
                showModal={showModal}
                mapType={mapType}
                modalTitle={modalTitle}
                mapCoords={mapCoords}
                handleCallback={handleCallback}
            />
        </>
        
        
    );
}
