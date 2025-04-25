const Trip = require("../Models/tripModel");
const User = require("../Models/user");
const dotenv = require("dotenv");
const axios = require("axios");
var polylineUtil = require('@mapbox/polyline');
dotenv.config();

const offsetDurationInMinutes = 15;
const pct = 0.3;
const radiusOffset = 50;

const osrmUrl = 'http://router.project-osrm.org/route/v1/driving/';

// Function to fetch route from OSRM
const getRoute = async (source, destination) => {
    try {
        const response = await axios.get(`${osrmUrl}${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full`);
        return response.data.routes[0].geometry;
    } catch (err) {
        console.error("Error fetching route:", err);
        return null;
    }
};

exports.activeTrip = (req, res) => {
    var riderArray = [];
    User.findById(req.auth._id, (err, user) => {
        if (!user.active_trip) {
            res.statusMessage = "No active trip";
            return res.status(400).end();
        }
        Trip.findById(user.active_trip, (err, trip) => {
            User.findById(trip.driver, (err, user_driver) => {
                const riders = trip.riders;
                if (riders.length === 0) {
                    res.status(200).json({
                        ...trip._doc,
                        riders: riderArray,
                        driver: user_driver.name + ' ' + user_driver.lastname,
                    });
                } else {
                    let i = 0;
                    riders.forEach(rider => {
                        User.findById(rider, (err, user_rider) => {
                            if (err) return res.status(500).end();
                            riderArray.push(String(user_rider.name + ' ' + user_rider.lastname));
                            i++;
                            if (i === riders.length) {
                                return res.status(200).json({
                                    ...trip._doc,
                                    riders: riderArray,
                                    driver: user_driver.name + ' ' + user_driver.lastname,
                                });
                            }
                        });
                    });
                }
            });
        });
    });
};

exports.ride = async (req, res) => {
    User.findById(req.auth._id, async (err, user) => {
        if (!user.active_trip) {
            const startDateTime = new Date(req.body.dateTime);
            startDateTime.setMinutes(startDateTime.getMinutes() - offsetDurationInMinutes);
            const endDateTime = new Date(req.body.dateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + offsetDurationInMinutes);

            Trip.find({
                completed: false,
                available_riders: true,
                date: { $gte: startDateTime, $lte: endDateTime },
            }, async (err, trips) => {
                if (err || trips.length === 0) {
                    res.statusMessage = "No matches found. No trips around your time.";
                    return res.status(400).end();
                }

                let trip;
                for (const tempTrip of trips) {
                    const pctLen = parseInt(tempTrip.route.length * pct);
                    const foundSrc = polylineUtil.isLocationOnPath(req.body.src, tempTrip.route.slice(0, pctLen), radiusOffset);
                    if (foundSrc) {
                        const foundDst = polylineUtil.isLocationOnPath(req.body.dst, tempTrip.route.slice(pctLen), radiusOffset);
                        if (foundDst) {
                            trip = tempTrip;
                            break;
                        }
                    }
                }

                if (!trip) {
                    res.statusMessage = "No match found";
                    return res.status(400).end();
                }

                trip.waypoints.push(req.body.src, req.body.dst);
                const routePolyline = await getRoute(req.body.src, req.body.dst);
                trip.route = polylineUtil.decode(routePolyline).map(([lat, lng]) => ({ lat, lng }));
                trip.riders.push(user._id);
                trip.available_riders = trip.riders.length !== trip.max_riders;

                trip.save((err, updatedTrip) => {
                    if (err) return res.status(500).end();
                    user.active_trip = updatedTrip._id;
                    user.trip_role_driver = false;
                    user.save((err) => {
                        if (err) return res.status(500).end();
                        res.status(200).json(updatedTrip);
                    });
                });
            });
        } else {
            res.statusMessage = "A trip is already active";
            return res.status(400).end();
        }
    });
};
