// TN AgriStack Service - Mock Data for Farmer Clusters

const CROPS = ['Tomato', 'Paddy', 'Turmeric', 'Sugarcane', 'Groundnut', 'Cotton'];
const HEALTH_STATUS = ['Optimal', 'Stressed', 'Critical', 'Recovery'];

// Helper to generate random coordinates near a center
const getRandomCoord = (center, spread = 0.05) => {
    return [
        center[0] + (Math.random() - 0.5) * spread,
        center[1] + (Math.random() - 0.5) * spread
    ];
};

export const AgriStackService = {
    /**
     * Fetch registered farmer clusters from TN AgriStack database (Mock)
     * @param {string} districtId 
     * @param {Array} center [lat, lng]
     */
    fetchClusters: async (districtId, center) => {
        // Simulate network delay
        // await new Promise(r => setTimeout(r, 300));

        const clusterCount = 5 + Math.floor(Math.random() * 5); // 5-10 clusters
        const clusters = [];

        for (let i = 0; i < clusterCount; i++) {
            const crop = CROPS[Math.floor(Math.random() * CROPS.length)];
            const health = HEALTH_STATUS[Math.floor(Math.random() * HEALTH_STATUS.length)];
            const farmers = 50 + Math.floor(Math.random() * 200);

            // Saturation Logic: Tomato clusters are often "Stressed" if saturation is high
            let saturationLevel = 'Normal';
            if (crop === 'Tomato' && Math.random() > 0.6) saturationLevel = 'High (Glut Risk)';

            clusters.push({
                id: `cluster-${districtId}-${i}`,
                position: getRandomCoord(center),
                crop,
                farmers,
                health,
                saturation: saturationLevel,
                soilMoisture: 20 + Math.floor(Math.random() * 60) + '%'
            });
        }
        return clusters;
    },

    /**
     * Fetch Farmer Profile
     */
    getFarmerProfile: async (farmerId) => {
        return {
            id: farmerId || 'TN-AGRI-100234',
            name: 'Thiru. Selvam',
            surveyNo: '12-A/45, Sector 4, Vellore North',
            totalLand: 5.5, // Acres
            sowingHistory: [
                { year: '2023', season: 'Kharif', crop: 'Paddy', yield: '18 Tons', income: '₹ 4.5L' },
                { year: '2023', season: 'Rabi', crop: 'Groundnut', yield: '8 Tons', income: '₹ 3.2L' },
                { year: '2024', season: 'Kharif', crop: 'Turmeric', yield: '12 Tons', income: '₹ 5.8L' }
            ],
            currentIntent: { crop: 'Tomato', area: 2.5 }
        };
    },

    /**
     * Update Intended Sowing Area
     */
    updateSowingIntent: async (farmerId, crop, area) => {
        console.log(`[AgriStack] Updated intent for ${farmerId}: ${crop} ${area} acres`);
        // In a real app, this would update the backend
        // For simulation, we assume StateBrain picks this up in next cycle
        return true;
    },

    /**
     * Verify Profile with TN AgriStack Registry
     */
    verifyProfile: async (data) => {
        // Simulate network call
        await new Promise(r => setTimeout(r, 2000));

        // Mock Validation for Demo
        if (data.userType === 'farmer') {
            if (data.aadhar && data.aadhar.length !== 12) throw new Error("Invalid Aadhar Number (Must be 12 digits)");
            if (!data.surveyNo) throw new Error("Land Survey Number is required");
        }

        if (data.userType === 'officer') {
            if (!data.employeeId) throw new Error("Employee ID is required");
        }

        return { verified: true, message: "Profile Verified with State Registry" };
    }
};
