
// Approximate Lat/Lng centers for TN Districts
// Approximate Lat/Lng centers for TN Districts
export const DISTRICT_CENTERS = {
    vellore: [12.9165, 79.1325],
    thanjavur: [10.7870, 79.1378],
    coimbatore: [11.0168, 76.9558],
    madurai: [9.9252, 78.1198],
    erode: [11.3410, 77.7172],
    salem: [11.6643, 78.1460],
    trichy: [10.7905, 78.7047],
    kanchipuram: [12.8185, 79.6947],
    chennai: [13.0827, 80.2707],
    tirunelveli: [8.7139, 77.7567],
    cuddalore: [11.7480, 79.7714],
    dharmapuri: [12.1211, 78.1582],
    dindigul: [10.3673, 77.9803],
    kanyakumari: [8.0883, 77.5385],
    karur: [10.9601, 78.0766],
    krishnagiri: [12.5186, 78.2137],
    nagapattinam: [10.7672, 79.8450],
    namakkal: [11.2189, 78.1674],
    perambalur: [11.2358, 78.8810],
    pudukkottai: [10.3797, 78.8208],
    ramanathapuram: [9.3639, 78.8395],
    sivaganga: [9.8433, 78.4809],
    theni: [10.0104, 77.4768],
    nilgiris: [11.4118, 76.6955],
    thiruvarur: [10.7761, 79.6372],
    thoothukudi: [8.7642, 78.1348],
    tiruppur: [11.1085, 77.3411],
    tiruvannamalai: [12.2330, 79.0667],
    villupuram: [11.9398, 79.4930],
    virudhunagar: [9.5680, 77.9624],
    ariyalur: [11.1401, 79.0786],
    chengalpattu: [12.6841, 79.9836],
    kallakurichi: [11.7388, 78.9664],
    mayiladuthurai: [11.1018, 79.6524],
    ranipet: [12.9292, 79.3323],
    tenkasi: [8.9594, 77.3129],
    tirupathur: [12.4897, 78.5686],
    thiruvallur: [13.1415, 79.9070]
};

// Generates simulated GeoJSON Polygon (Hexagon) around center
const generatePolygon = (center, radiusKm = 15) => {
    const coords = [];
    const lat = center[0];
    const lng = center[1];
    const r = radiusKm / 111; // Approx deg

    for (let i = 0; i < 6; i++) {
        const angle = (i * 60) * (Math.PI / 180);
        const dLat = r * Math.cos(angle);
        const dLng = r * Math.sin(angle);
        coords.push([lat + dLat, lng + dLng]);
    }
    return coords;
};

export const getDistrictMap = (districtId) => {
    const id = districtId.toLowerCase();
    const center = DISTRICT_CENTERS[id] || DISTRICT_CENTERS.vellore; // Default Fallback

    // Create 5-7 Blocks (Polygons) per district
    const subBlocks = [];
    const blockNames = ['East', 'West', 'North', 'South', 'Central', 'Rural', 'Urban'];

    blockNames.forEach((name, idx) => {
        // Offset centers slightly based on idx
        const offsetLat = (idx % 2 === 0 ? 0.05 : -0.05) * ((idx + 1) / 2);
        const offsetLng = (idx % 3 === 0 ? 0.05 : -0.05) * ((idx + 1) / 2);
        const blockCenter = [center[0] + offsetLat, center[1] + offsetLng];

        // Procedural Density Logic
        let density = 'Low';
        if (id === 'erode' && idx < 3) density = 'Very High'; // Force High Risk for Demo
        if (id === 'salem' && idx < 2) density = 'High';
        if (id === 'thanjavur') density = idx % 2 === 0 ? 'Medium' : 'Low';

        subBlocks.push({
            id: `${id}-${name.toLowerCase()}`,
            name: `${name} ${id.charAt(0).toUpperCase() + id.slice(1)} Zone`,
            center: blockCenter,
            polygon: generatePolygon(blockCenter, 5), // 5km radius blocks
            density: density
        });
    });

    return {
        center: center,
        blocks: subBlocks
    };
};
