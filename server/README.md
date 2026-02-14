# Agri-Neural Twin Backend 🧠

A lightweight Node.js/Express backend for the Agri-Neural Twin platform.

## Features
- **Authentication**: JWT-based login/register for Farmers & Officers.
- **Profile Management**: Stores detailed land metrics and geospatial coordinates.
- **Simulation Engine**: Centralized market risk calculation logic.
- **Data Persistence**: MongoDB integration for scalable data storage.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in this directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/agri-neural-twin
    JWT_SECRET=your_secret_key
    ```

3.  **Run Server**:
    ```bash
    # Development Mode
    npm run dev

    # Production Mode
    npm start
    ```

## API Endpoints

- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/profiles/setup` - Save farmer land details
- `POST /api/simulations/save` - Save "What-If" scenario results
- `GET /api/districts/:name` - Get aggregated stats for a district
