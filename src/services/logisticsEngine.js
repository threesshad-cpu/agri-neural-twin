
import { DISTRICT_CENTERS } from '../data/districtMaps';

/**
 * Simplified Distance Matrix for Tamil Nadu (Major Hubs)
 * Distances in km (approximate road distance)
 */
const DISTANCE_MATRIX = {
    vellore: {
        chennai: 140,
        tiruvannamalai: 85,
        kanchipuram: 70,
        krishnagiri: 110,
        dharmapuri: 145,
        salem: 210,
        chittoor: 40 // Nearby cross-border
    },
    chennai: {
        vellore: 140,
        kanchipuram: 75,
        tiruvallur: 45,
        chengalpattu: 60,
        villupuram: 170
    },
    coimbatore: {
        tiruppur: 55,
        erode: 100,
        salem: 160,
        nilgiris: 85
    },
    madurai: {
        virudhunagar: 50,
        dindigul: 65,
        theeni: 75,
        sivaganga: 50,
        tiruchirappalli: 135
    },
    tiruvannamalai: {
        vellore: 85,
        villupuram: 60,
        salem: 140,
        dharmapuri: 110
    }
};

/**
 * Mock Market Prices for Districts (Baseline)
 * In a real app, this would come from an API.
 */
const BASE_MARKET_PRICES = {
    chennai: 45,
    coimbatore: 42,
    madurai: 38,
    salem: 35,
    vellore: 25, // Surplus source typically has lower price
    tiruvannamalai: 32,
    kanchipuram: 40,
    krishnagiri: 30
};

/**
 * Finds optimal trade routes for a surplus district.
 * 
 * Logic:
 * 1. Find neighbors in "Deficit" (High Price) state.
 * 2. Calculate Transport Cost (approx ₹5 per 100km per kg).
 * 3. Calculate "Profit Path" Score = (TargetPrice - SourcePrice - TransportCost).
 * 4. Return top 3 routes.
 * 
 * @param {string} sourceDistrictId - ID of the district with surplus
 * @param {number} currentSourcePrice - The crashed price in the surplus district (e.g., ₹10/kg)
 * @returns {Array} Top 3 optimal routes
 */
export const findOptimalTradeRoutes = (sourceDistrictId, currentSourcePrice) => {
    const source = sourceDistrictId.toLowerCase();
    const neighbors = DISTANCE_MATRIX[source] || {};

    // Transport Cost Constant: ₹0.05 per km per kg
    const TRANSPORT_RATE_PER_KM = 0.05;

    const routes = Object.keys(neighbors).map(targetId => {
        const distance = neighbors[targetId];
        const targetPrice = BASE_MARKET_PRICES[targetId] || 35; // Default fallback
        const transportCost = distance * TRANSPORT_RATE_PER_KM;

        // Profit Margin
        const margin = targetPrice - currentSourcePrice - transportCost;

        return {
            targetId,
            targetName: targetId.charAt(0).toUpperCase() + targetId.slice(1),
            distance,
            transportCost: transportCost.toFixed(2),
            targetPrice,
            profitMargin: margin.toFixed(2),
            coordinates: {
                start: DISTRICT_CENTERS[source],
                end: DISTRICT_CENTERS[targetId]
            }
        };
    });

    // Filter only profitable routes and Sort by Profit Margin (Desc)
    const optimalRoutes = routes
        .filter(r => r.profitMargin > 2) // Minimum ₹2 profit to be worth it
        .sort((a, b) => b.profitMargin - a.profitMargin)
        .slice(0, 3); // Top 3

    return optimalRoutes;
};

/**
 * Generates an advisory message based on the routes.
 */
export const generateLogisticsAdvisory = (sourceDistrict, routes) => {
    if (!routes || routes.length === 0) return "No profitable trade routes found nearby. Consider cold storage.";

    const bestRoute = routes[0];
    const source = sourceDistrict.charAt(0).toUpperCase() + sourceDistrict.slice(1);

    return `By rerouting 20% of ${source}'s surplus to ${bestRoute.targetName}, we can stabilize ${source}'s price by avoiding local glut. Expected profit increase: ₹${bestRoute.profitMargin}/kg (net of transport).`;
};
