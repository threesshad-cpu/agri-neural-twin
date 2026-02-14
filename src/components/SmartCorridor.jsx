
import React from 'react';
import { Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';

// Custom Icon for Transport Trucks (or simple dot)
const truckIcon = new L.DivIcon({
    className: 'truck-marker',
    html: `<div style="background-color: #0ea5e9; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px #0ea5e9; border: 2px solid white;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

export default function SmartCorridor({ routes, sourceCoords }) {
    if (!routes || routes.length === 0 || !sourceCoords) return null;

    return (
        <>
            {routes.map((route, idx) => {
                // Determine color based on profit margin
                const color = idx === 0 ? '#0ea5e9' : (idx === 1 ? '#3b82f6' : '#6366f1');
                const opacity = idx === 0 ? 0.9 : 0.6;
                const weight = idx === 0 ? 4 : 2;

                const positions = [sourceCoords, route.coordinates.end];

                return (
                    <React.Fragment key={route.targetId}>
                        {/* The glowing corridor line */}
                        <Polyline
                            positions={positions}
                            pathOptions={{
                                color: color,
                                weight: weight,
                                opacity: opacity,
                                dashArray: '10, 10', // Dashed line for animation
                                className: 'smart-corridor-line' // CSS animation class
                            }}
                        >
                            <Tooltip sticky>
                                <div className="cyber-font" style={{ color: color }}>
                                    PROFIT PATH: ₹{route.profitMargin}/kg
                                </div>
                                <div style={{ fontSize: '0.8rem' }}>Default Transport: {route.distance}km</div>
                            </Tooltip>
                        </Polyline>

                        {/* Destination Marker */}
                        <Marker position={route.coordinates.end} icon={truckIcon}>
                            <Popup>
                                <strong>Destination: {route.targetName}</strong><br />
                                Transport Cost: ₹{route.transportCost}/kg
                            </Popup>
                        </Marker>
                    </React.Fragment>
                );
            })}
        </>
    );
}
