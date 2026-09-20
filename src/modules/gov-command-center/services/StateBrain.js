/**
 * THE UNIFIED STATE-WIDE ENGINE ("STATE BRAIN")
 * Mimics connection to TN AgriStack - Farmer ID System.
 */

const STATE_ZONES = {
    delta: ['thanjavur', 'thiruvarur', 'nagapattinam', 'mayiladuthurai', 'cuddalore', 'ariyalur', 'perambalur', 'pudukkottai', 'trichy', 'karur'],
    west: ['coimbatore', 'erode', 'salem', 'tiruppur', 'namakkal', 'nilgiris', 'dharmapuri', 'krishnagiri'],
    north: ['vellore', 'kanchipuram', 'thiruvallur', 'chennai', 'ranipet', 'tirupathur', 'tiruvannamalai', 'villupuram', 'kallakurichi', 'chengalpattu'],
    south: ['madurai', 'dindigul', 'virudhunagar', 'tirunelveli', 'thoothukudi', 'tenkasi', 'kanyakumari', 'ramanathapuram', 'sivaganga', 'theni']
};

// Unique Success Parameters (District-Specific Realities)
export const DISTRICT_REALITIES = {
    thanjavur: { focus: 'paddy', reason: 'Delta Zone: High water availability' },
    vellore: { focus: 'turmeric', reason: 'Low Water Table: High profitability for drought-tolerant cash crops' },
    coimbatore: { focus: 'cotton', reason: 'Black Soil: Ideal for commercial fiber crops' },
    madurai: { focus: 'flowers', reason: 'Market Hub: Jasmine Export Potential' },
    erode: { focus: 'turmeric', reason: 'Turmeric Belt' }
};

// Mock "Live" Sowing Data from "TN AgriStack"
// In a real app, this would be fetched from an API
const LIVE_SOWING_STATS = {
    erode: { turmeric: 1250, sugarcane: 800 },
    salem: { turmeric: 950, mango: 1500 },
    thanjavur: { paddy: 5000 },
    vellore: { groundnut: 300 }
};

export const StateBrain = {
    /**
     * Mimics TN AgriStack Integration
     * Fetches real-time sowing data for the entire state.
     */
    fetchLiveStateData: async () => {
        // Simulate network latency
        await new Promise(r => setTimeout(r, 500));
        return LIVE_SOWING_STATS;
    },

    /**
     * Cross-District Intelligence Logic
     * Detects state-wide trends and triggers alerts.
     */
    analyzeCrossDistrictRisk: (currentDistrict, cropType) => {
        const lowerDistrict = currentDistrict.toLowerCase();
        const lowerCrop = cropType.toLowerCase();

        // SCENARIO: Erode & Salem over-planting Turmeric -> Warn Vellore
        if (lowerCrop === 'turmeric') {
            const totalWesternTurmeric = (LIVE_SOWING_STATS.erode?.turmeric || 0) + (LIVE_SOWING_STATS.salem?.turmeric || 0);

            // If West Zone has > 2000 acres, and current district is Vellore
            if (totalWesternTurmeric > 2000 && lowerDistrict === 'vellore') {
                return {
                    alertType: 'saturation_warning',
                    title: 'STATE-WIDE SATURATION WARNING',
                    message: "High Turmeric sowing detected in Erode & Salem (>2200 acres). Anticipating 40% price drop in TN markets.",
                    action: 'Avoid Turmeric',
                    impact: 'Negative'
                };
            }
        }

        // SCENARIO: Delta planting Paddy -> Safe for Thanjavur
        if (lowerCrop === 'paddy' && STATE_ZONES.delta.includes(lowerDistrict)) {
            return {
                alertType: 'zone_optimal',
                title: 'ZONE OPTIMIZED',
                message: "Paddy aligns with Delta Zone hydro-geology.",
                impact: 'Positive'
            };
        }

        return null; // No state-wide risk detected
    },

    /**
     * Sub-Simulation Architecture
     * Runs local monitoring based on unique soil/weather.
     */
    runDistrictSubSimulation: (districtId) => {
        // Return local viability score (0-100)
        // Mock logic purely for demonstration
        const id = districtId.toLowerCase();
        // Delta districts have good soil for water-intensive
        if (STATE_ZONES.delta.includes(id)) return { soilScore: 95, waterScore: 90 };
        // North districts have lower water
        if (STATE_ZONES.north.includes(id)) return { soilScore: 80, waterScore: 60 };

        return { soilScore: 85, waterScore: 75 };
    }
};
