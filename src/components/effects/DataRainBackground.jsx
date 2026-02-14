
import React, { useEffect, useRef } from 'react';
import '../../styles/MicroInteractions.css';

export default function DataRainBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const columns = Math.ceil(width / 20); // Font size approx 20px
        const drops = Array(columns).fill(0);

        const dataPoints = ['pH: 6.5', 'N: 40', 'TEMP: 32°C', '₹: 45', 'NPK', 'Yield: 5.5T', 'H2O: 80%', 'UV: 7', 'CO2: 400', 'AGRI-NEURAL'];
        const fontSize = 14;

        const draw = () => {
            // Semi-transparent black to create fade effect
            ctx.fillStyle = 'rgba(2, 6, 23, 0.1)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#50C878'; // Emerald Green
            ctx.font = `${fontSize}px 'Share Tech Mono', monospace`; // Use existing font if possible, or monospace

            for (let i = 0; i < drops.length; i++) {
                // Pick random data point
                const text = dataPoints[Math.floor(Math.random() * dataPoints.length)];

                // Draw text
                ctx.fillText(text, i * fontSize * 6, drops[i] * fontSize); // Spread columns wider for phrases

                // Reset drop or increment
                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50); // Speed control

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="agri-rain-container">
            <canvas ref={canvasRef} className="agri-rain-canvas" />
        </div>
    );
}
