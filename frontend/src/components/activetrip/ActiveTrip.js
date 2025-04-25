import React, { useState, useEffect, useRef } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import Cookies from 'js-cookie';
import L from 'leaflet';
import 'leaflet-routing-machine';
import './ActiveTrip.css';

const mapContainerStyle = {  
    height: "35vh",
    width: "100%",
};

const center = [43.473078230478336, -80.54225947407059];

export default function ActiveTrip({ setActiveTrip }) {
    const [map, setMap] = useState(null);
    const [routeControl, setRouteControl] = useState(null);
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [datetime, setDatetime] = useState("");
    const [driver, setDriver] = useState("");
    const [riders, setRiders] = useState("");
    const mapRef = useRef();

    useEffect(() => {
        const mapInstance = L.map(mapRef.current).setView(center, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        setMap(mapInstance);

        return () => {
            mapInstance.remove();
        };
    }, []);

    useEffect(() => {
        fetch(process.env.REACT_APP_END_POINT + '/trip/activetrip', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': Cookies.get('tokken')
            }
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
        }).then((responseJson) => {
            setDatetime(new Date(responseJson.dateTime).toLocaleString());
            setDriver(responseJson.driver);
            setSourceCoords(responseJson.source, 'src');
            setDestinationCoords(responseJson.destination, 'dest');
            const allRiders = responseJson.riders.join(', ') || "No rider currently";
            setRiders(allRiders);

            if (map) {
                const route = L.Routing.control({
                    waypoints: [
                        L.latLng(responseJson.source.lat, responseJson.source.lng),
                        ...responseJson.waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
                        L.latLng(responseJson.destination.lat, responseJson.destination.lng)
                    ],
                    createMarker: () => null,
                    routeWhileDragging: false
                }).addTo(map);

                setRouteControl(route);
            }
        }).catch((error) => {
            alert(error);
        });
    }, [map]);

    const setSourceCoords = (coords) => {
        setSource(`${coords.lat}, ${coords.lng}`);
    };

    const setDestinationCoords = (coords) => {
        setDestination(`${coords.lat}, ${coords.lng}`);
    };

    const handleCancel = () => {
        fetch(process.env.REACT_APP_END_POINT + '/trip', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': Cookies.get('tokken')
            },
        }).then((response) => {
            if (response.ok) {
                setActiveTrip(null);
                alert("Trip cancelled successfully");
                window.location.reload();
                return;
            }
            throw new Error(response.statusText);
        }).catch((error) => {
            console.error(error);
            alert(error);
        });
    };

    const handleDone = () => {
        fetch(process.env.REACT_APP_END_POINT + '/trip/done', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': Cookies.get('tokken')
            },
        }).then((response) => {
            if (response.ok) {
                setActiveTrip(null);
                alert("Trip marked completed");
                window.location.reload();
                return;
            }
            throw new Error(response.statusText);
        }).catch((error) => {
            console.error(error);
            alert(error);
        });
    };

    return (
        <>
            <h1 id="pageTitle">Active Trip</h1>
            <div id="map" ref={mapRef} style={mapContainerStyle}></div>
            <Container id="activeTripContainer" fluid="lg">
                <Row style={{ marginTop: '1rem' }}>
                    <Col md="10">
                        <h1>Active Trip Details</h1>
                        <Row>
                            <h3 style={{ marginTop: '1rem' }}><span className='trip-attributes'>Source</span>: {source}</h3>
                            <h3><span className='trip-attributes'>Destination</span>: {destination}</h3>
                            <h3><span className='trip-attributes'>Date</span>: {datetime}</h3>
                            <h3 style={{ marginTop: '1rem' }}><span className='trip-attributes'>Driver</span>: {driver}</h3>
                            <h3><span className='trip-attributes'>Rider(s)</span>: {riders}</h3>
                        </Row>
                    </Col>
                    <Col md="2">
                        <Row>
                            <Button variant='primary' id='doneTripButton' onClick={handleDone}> Done </Button>
                            <Button variant='danger' id='cancelTripButton' onClick={handleCancel}> Cancel trip </Button>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
