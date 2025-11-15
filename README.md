# Stopover Flight Search Application

This application consists of a Go backend API and a Next.js frontend. The backend fetches flight data from the Aviasales API and serves it to the frontend, which displays the flight information in a user-friendly interface.

## Prerequisites

- Go (1.16 or later)
- Node.js (18 or later)
- npm, yarn, or pnpm

## Running the Application

### Step 1: Set up the Backend

1. Navigate to the backend directory:
   ```
   cd /path/to/stopover/backend
   ```

2. Create a `.env` file with the following variables (if not already present):
   ```
   AVIASALES_TOKEN=your_token_here
   AVIASALES_MARKER=your_marker_here
   AVIASALES_HOST=your_host_here
   ```

3. Install Go dependencies:
   ```
   go mod tidy
   ```

4. Run the backend server:
   ```
   go run .
   ```

   The server will start on port 8080. You should see log messages indicating that the server has started.

### Step 2: Set up the Frontend

1. Open a new terminal window and navigate to the frontend directory:
   ```
   cd /path/to/stopover/frontend
   ```

2. Create a `.env.local` file with the following variables:
   ```
   # Backend API URL
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8080/api/flights
   ```

3. Install dependencies:
   ```
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

4. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   The frontend will start on port 3000.

### Step 3: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

You should see the landing page. Click on the search button to navigate to the flights page, which will display flight data fetched from the backend.

## Testing the Application

1. **Backend Testing**:
   - Verify the backend is running by accessing `http://localhost:8080/api/flights` in your browser or using a tool like curl:
     ```
     curl http://localhost:8080/api/flights
     ```
   - You should receive a JSON response with flight data.

2. **Frontend Testing**:
   - Navigate to `http://localhost:3000` in your browser.
   - Click on the search button to go to the flights page.
   - Verify that flight data is displayed.
   - Test the filtering and sorting functionality.
   - Select a flight to see vendor options.

## Troubleshooting

1. **Backend Issues**:
   - Check the `aviasales.log` file in the backend directory for error messages.
   - Ensure your `.env` file contains valid credentials.
   - Verify that port 8080 is not being used by another application.
   - If you get "connection refused" errors, make sure the Aviasales API is accessible from your network.

2. **Frontend Issues**:
   - Check the browser console for any error messages.
   - Ensure the backend is running and accessible.
   - If you see "No flights found from API, using fallback data", it means the frontend couldn't fetch data from the backend and is using built-in sample data.
   - Clear your browser cache if you're seeing outdated data.

3. **Connection Issues**:
   - Ensure CORS is properly configured in the backend (main.go). The backend is set up to allow requests from http://localhost:3000.
   - **Important**: Make sure the backend server is running before accessing the flights page. The most common cause of "failed to fetch" errors is that the backend is not running or not accessible.
   - Check your network connection.
   - Verify that both applications are running on the expected ports.
   - If you're running the frontend and backend on different machines or in containers, ensure the NEXT_PUBLIC_BACKEND_URL in .env.local points to the correct host and port.
   - Try using different browsers if you encounter persistent issues.
   - The application now provides more detailed error messages when connection issues occur, which should help diagnose the problem.
   
4. **Cross-Origin Issues**:
   - If you see warnings about cross-origin requests to /_next/* resources, ensure next.config.js is properly configured.
   - The next.config.js file should include:
     ```
     /** @type {import('next').NextConfig} */
     const nextConfig = {
       experimental: {
         allowedDevOrigins: ['localhost'],
       },
     }
     
     module.exports = nextConfig
     ```

5. **Common Error Solutions**:
   - "Error loading .env file": Create the .env file with the required variables.
   - "Failed to initialize search": Check your Aviasales API credentials.
   - "No flight data available": The backend hasn't completed its initial search yet, wait a few seconds and refresh.
   - "API request failed": Ensure the backend server is running before accessing the flights page.
   - "Failed to fetch flight data": This typically indicates that the frontend cannot connect to the backend. Check that:
     - The backend server is running (check for log messages in the terminal where you started the backend)
     - The URL in NEXT_PUBLIC_BACKEND_URL is correct and accessible
     - There are no network issues preventing the connection
     - The browser console may show more detailed error information
   - "Cannot connect to backend server": This specific error message indicates that the backend is not running or not accessible at the URL specified. Start or restart the backend server and ensure it's running on the expected port.