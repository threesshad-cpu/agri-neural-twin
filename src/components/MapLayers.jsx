import React, { useState, useEffect } from 'react';
import { Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AgriStackService } from '../services/AgriStack';
import { useTranslation } from '../i18n';

// Fix Leaflet Default Icon Issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for Farmer Clusters (Green Tractor-like)
const tractorIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2823/2823521.png', // Tractor Icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

export default function MapLayers({ districtId, center, heatmapMode, showMarkers = true }) {
    const [clusters, setClusters] = useState([]);
    const { t } = useTranslation();
    const map = useMap();

    useEffect(() => {
        if (districtId && center) {
            AgriStackService.fetchClusters(districtId, center).then(data => {
                setClusters(data);
            });
        }
    }, [districtId, center]);

    return (
        <>
            {/* Farmer ID Markers */}
            {showMarkers && clusters.map((cluster) => (
                <Marker
                    key={cluster.id}
                    position={cluster.position}
                // Using default leaflet icon for stability, tractor icon commented out
                // icon={tractorIcon} 
                >
                    <Popup>
                        <div style={{ fontFamily: 'Share Tech Mono', minWidth: '200px' }}>
                            <h4 style={{ margin: '0 0 5px 0', color: '#10B981' }}>{t('farmer_profile')} (ID: {cluster.id.split('-').pop()})</h4>
                            <div style={{ fontSize: '0.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                <span>{t('crop_type')}:</span> <b>{t(`crops.${cluster.crop.toLowerCase()}`)}</b>
                                <span>{t('map.farmers')}:</span> <b>{cluster.farmers}</b>
                                <span>{t('map.health')}:</span> <b style={{ color: cluster.health === 'Critical' ? 'red' : 'green' }}>{t(`map.${cluster.health.toLowerCase()}`)}</b>
                                <span>{t('map.soil_h2o')}:</span> <b>{cluster.soilMoisture}</b>
                            </div>
                            {/* Saturation Warning in Popup */}
                            {cluster.saturation && cluster.saturation.includes('High') && (
                                <div style={{ marginTop: '5px', color: '#EF4444', fontWeight: 'bold', fontSize: '0.7rem' }}>
                                    ⚠️ {t('map.saturation_zone')} {t('risk_level')}
                                </div>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Heatmap Layer (Overlay if enabled) */}
            {heatmapMode && clusters.map((cluster) => {
                // Determine Heat Color
                const isHighRisk = cluster.saturation && cluster.saturation.includes('High');
                const color = isHighRisk ? '#EF4444' : '#10B981';

                return (
                    <CircleMarker
                        key={`heat-${cluster.id}`}
                        center={cluster.position}
                        pathOptions={{
                            color: color,
                            fillColor: color,
                            fillOpacity: 0.4,
                            weight: 0
                        }}
                        radius={isHighRisk ? 40 : 20} // Larger radius for risk zones
                    >
                        <Popup>{t('map.saturation_zone')}: {isHighRisk ? t('map.high') : t('map.low')}</Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
}
