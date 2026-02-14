
export const GOVERNMENT_SCHEMES = [
    {
        id: 'tn-pmfby',
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        amount: '₹15,000 / Hectare',
        description: 'Comprehensive crop insurance against non-preventable natural risks from pre-sowing to post-harvest.',
        eligibility: {
            minAcreage: 0,
            crops: ['Paddy', 'Millets', 'Oilseeds', 'Sugarcane', 'Banana', 'Tomato'],
            districts: ['All']
        },
        link: 'https://pmfby.gov.in/',
        type: 'Insurance'
    },
    {
        id: 'tn-micro-irrigation',
        name: 'Micro-Irrigation (Drip/Sprinkler) Subsidy',
        amount: '100% Subsidy for SF/MF',
        description: 'Full subsidy for Small & Marginal farmers to install drip irrigation systems for water conservation.',
        eligibility: {
            maxAcreage: 5, // Small/Marginal farmers < 2 Ha (~5 acres)
            crops: ['Sugarcane', 'Banana', 'Vegetables', 'Coconut', 'Tomato'],
            districts: ['Vellore', 'Tiruvannamalai', 'Coimbatore', 'Madurai', 'Trichy']
        },
        link: 'https://tnhorticulture.tn.gov.in/',
        type: 'Subsidy'
    },
    {
        id: 'tn-kaivadp',
        name: 'Kalaignarin All Village Integrated Agri Dev Programme',
        amount: '₹50,000 / Group',
        description: 'Support for coconut seedlings, home gardens, and farm ponds in selected village clusters.',
        eligibility: {
            minAcreage: 0,
            crops: ['Coconut', 'Vegetables'],
            districts: ['All']
        },
        link: 'https://agritech.tnau.ac.in/',
        type: 'Development'
    },
    {
        id: 'tn-solar-pump',
        name: 'PM-KUSUM Solar Pump Scheme',
        amount: '70% Subsidy',
        description: 'Installation of standalone solar agriculture pumps for off-grid irrigation.',
        eligibility: {
            maxAcreage: 10,
            crops: ['All'],
            districts: ['Vellore', 'Tiruvannamalai', 'Salem'] // High solar potential zones
        },
        link: 'https://mnre.gov.in/',
        type: 'Energy'
    },
    {
        id: 'tn-organic-farming',
        name: 'Organic Farming Certification Assistance',
        amount: '₹500 / Acre',
        description: 'Financial assistance for organic certification and input procurement.',
        eligibility: {
            minAcreage: 0,
            crops: ['Paddy', 'Millets', 'Vegetables'],
            districts: ['All']
        },
        link: 'https://tnocd.net/',
        type: 'Organic'
    }
];

/**
 * Calculates match score based on user profile.
 * @param {Object} user - { acreage, district, crop }
 * @returns {Array} - Sorted schemes with matchScore
 */
export const matchSchemes = (user) => {
    // Default fallback if user data is missing
    const profile = {
        acreage: user?.acreage || 2,
        district: user?.district || 'Vellore',
        crop: user?.crop || 'Paddy' // Default crop
    };

    return GOVERNMENT_SCHEMES.map(scheme => {
        let score = 0;
        let reasons = [];

        // 1. District Check (Critical)
        if (scheme.eligibility.districts.includes('All') ||
            scheme.eligibility.districts.map(d => d.toLowerCase()).includes(profile.district.toLowerCase())) {
            score += 40;
            reasons.push('District Eligible');
        }

        // 2. Crop Check
        if (scheme.eligibility.crops.includes('All') ||
            scheme.eligibility.crops.map(c => c.toLowerCase()).includes(profile.crop.toLowerCase())) {
            score += 30;
            reasons.push('Crop Match');
        }

        // 3. Land Size Check
        const isSmallFarmer = profile.acreage <= 5;
        if (scheme.eligibility.maxAcreage) {
            if (profile.acreage <= scheme.eligibility.maxAcreage) {
                score += 30;
                reasons.push('Land Size Criteria Met');
            } else {
                score -= 50; // Ineligible
                reasons.push('Exceeds Acreage Limit');
            }
        } else {
            // If no max limit, everyone eligible, but small farmers might get bonus in reality
            score += 30;
        }

        return { ...scheme, matchScore: Math.max(0, score), logic: reasons };
    }).filter(s => s.matchScore > 50).sort((a, b) => b.matchScore - a.matchScore);
};
