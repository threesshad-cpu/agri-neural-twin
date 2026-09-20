import mockData from '../data/mockData.json';

const LATENCY_MS = 800;

export const dataService = {
    getDistrictsList: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const list = mockData.districts.map(d => ({ id: d.id, name: d.name, risk: d.risk }));
                resolve(list);
            }, LATENCY_MS);
        });
    },

    getDistrictMetrics: async (districtId) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const cityData = mockData.districts.find(d => d.id === districtId);
                if (cityData) {
                    resolve(cityData);
                } else {
                    reject(new Error("District not found in Neural Database"));
                }
            }, LATENCY_MS);
        });
    },

    /**
     * Fetch Real-Time Weather (Mock OpenWeather API)
     * Returns condition, temp, and risk implication
     */
    getRealTimeWeather: async (districtId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Determine mock weather based on random chance or district ID hash
                // For demo, we rotate conditions
                const conditions = [
                    { condition: 'Clear Sky', temp: 32, humidity: 45, icon: '☀️', riskMod: 1.0 },
                    { condition: 'Heavy Rain', temp: 24, humidity: 90, icon: '🌧️', riskMod: 0.7 }, // Reduces yield
                    { condition: 'Heatwave', temp: 41, humidity: 20, icon: '🔥', riskMod: 0.8 }, // Stress
                    { condition: 'Cloudy', temp: 29, humidity: 60, icon: '☁️', riskMod: 0.95 }
                ];
                // Deterministic mock based on name length
                const index = (districtId.length) % conditions.length;
                resolve(conditions[index]);
            }, 600);
        });
    },

    /**
     * Fetch Current Market Prices (Mock Agmarknet)
     */
    getMarketPrices: async (_districtId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { crop: 'Tomato', price: 2450, unit: '₹/Quintal', trend: 'up' },
                    { crop: 'Paddy', price: 1980, unit: '₹/Quintal', trend: 'stable' },
                    { crop: 'Cotton', price: 6200, unit: '₹/Quintal', trend: 'down' }
                ]);
            }, 500);
        });
    }
};
