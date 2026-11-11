# Urban Digital Twin AI – Smart City Simulator

An AI-powered smart city simulation platform designed to improve urban transportation planning through 3D city visualization, intelligent route optimization, traffic simulation, and environmental analytics.

## 1. Project Overview

Urban Digital Twin AI is a smart city simulation platform that converts 3D city models into an interactive road-network representation. It uses the **A\* pathfinding algorithm** to identify optimized routes based on distance, time, congestion, and safety-related route costs.

The system also integrates an AI prediction service to estimate fuel consumption, CO₂ emissions, electric-vehicle energy usage, and Eco-Score. Through interactive 3D visualization, analytics, and PDF report generation, the platform supports more informed and sustainable transportation planning.

## 2. Problem Statement

Rapid urbanization has increased traffic congestion, fuel consumption, and CO₂ emissions. Existing navigation systems primarily focus on route guidance and provide limited support for 3D city-model visualization, customizable traffic simulation, and environmental impact analysis.

This project aims to provide an integrated platform combining 3D visualization, route optimization, traffic simulation, and AI-powered analytics to support sustainable urban planning.

## 3. Key Features

- **3D City Visualization:** Upload and visualize OBJ city models using Three.js.
- **Road Network Representation:** Represent the city using spatial road and junction graphs.
- **A\* Route Optimization:** Calculate optimized routes between selected source and destination locations.
- **Traffic Simulation:** Use car, bus, truck, and emergency-vehicle inputs to influence route weights.
- **AI-Based Predictions:** Estimate fuel consumption, CO₂ emissions, EV energy usage, and Eco-Score.
- **Analytics Dashboard:** Display route information, environmental metrics, and road-segment analytics.
- **PDF Report Generation:** Export simulation results for urban planning analysis.
- **Secure Authentication:** Support login and registration using Spring Security and JWT.

## 4. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 18, Vite |
| 3D Visualization | Three.js |
| Backend | Java, Spring Boot 2.7 |
| Authentication | Spring Security, JWT |
| Data Access | Spring Data JPA |
| Database | MySQL 8.0 |
| AI Service | Python, Flask |
| Machine Learning | Scikit-learn |
| Route Optimization | A\* Algorithm |
| Communication | REST APIs, WebSocket |
| PDF Reporting | jsPDF |

## 5. System Architecture

The application consists of the following components:

1. **Frontend:** React and Three.js provide the user interface and 3D city visualization.
2. **Backend:** Spring Boot manages application logic, authentication, and communication between modules.
3. **Database:** MySQL stores application data.
4. **Routing Engine:** The A\* algorithm calculates optimized routes using the road-network graph.
5. **AI Service:** Python Flask and Scikit-learn process prediction inputs and provide environmental estimates.
6. **Reporting Module:** jsPDF generates downloadable simulation reports.

## 6. System Workflow

1. User logs in to the application.
2. User uploads a 3D city model in OBJ format.
3. Three.js renders the city model and road-network representation.
4. User selects source and destination locations.
5. A\* calculates an optimized route.
6. Traffic and vehicle inputs influence route weights.
7. The Python AI service processes the relevant inputs.
8. Route analytics and environmental estimates are displayed on the dashboard.
9. The user generates and downloads a PDF report.

## 7. Project Modules

### Module 1 – 3D City Model

- Uploads 3D city models.
- Visualizes the city using Three.js.
- Provides the city representation for route planning.

### Module 2 – Route Optimization

- Accepts source and destination selections.
- Uses A\* for route calculation.
- Incorporates traffic-related inputs into route weights.
- Displays the optimized route and route information.

### Module 3 – AI Analytics

- Integrates the Python Flask prediction service.
- Estimates fuel consumption and CO₂ emissions.
- Estimates EV energy usage.
- Calculates or provides an Eco-Score.

### Module 4 – Dashboard and Reporting

- Displays route and environmental analytics.
- Provides interactive visualizations and road-segment details.
- Generates PDF reports.

## 8. Getting Started

### Prerequisites

Install the following software:

- Node.js and npm
- Java Development Kit
- Maven
- Python 3
- MySQL Server 8.0
- A modern web browser

### Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

### Configure MySQL

1. Start the MySQL server.
2. Create the database using the name configured in the backend.
3. Configure the database URL, username, and password in the Spring Boot application.
4. Verify the database connection.

Do not upload database passwords or JWT secrets to a public repository.

### Run the Spring Boot Backend

Open the backend directory and configure the database and authentication settings.

For a Maven project with the Maven Wrapper:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
mvnw.cmd spring-boot:run
```

### Run the Python AI Service

Open the AI-service directory and create a virtual environment:

```bash
python -m venv .venv
```

Activate it:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

Install dependencies if a `requirements.txt` file is provided:

```bash
pip install -r requirements.txt
```

Start the Flask service using the actual entry-point file and command specified in the project.

### Run the React Frontend

Open the frontend directory:

```bash
npm install
npm run dev
```

Configure the frontend API URL according to the backend settings in your repository.

*Note: Confirm the actual folder names, scripts, configuration keys, and service ports in your source code before using these commands.*

## 9. Testing and Evaluation

The system can be tested using the following functional test areas:

| Test Area | Expected Verification |
|---|---|
| Authentication | Valid and invalid login handling |
| 3D Model Upload | Valid OBJ upload and model rendering |
| 3D Visualization | Correct model display and interaction |
| Road Network | Road and junction connectivity |
| Route Optimization | A\* route generation |
| Traffic Simulation | Route-cost response to changed vehicle inputs |
| AI Service | Successful prediction request and response |
| Database | Correct data storage and retrieval |
| Dashboard | Correct display of route and analytics |
| PDF Export | Successful report generation |

Performance evaluation can record model-loading time, route-computation time, AI-service response time, PDF-generation time, and route distance.

AI prediction accuracy should only be reported after comparing predicted values with suitable reference or real-world data. Metrics such as MAE, RMSE, and MAPE can be used when ground-truth data is available.

## 10. Future Enhancements

- Junction-to-junction congestion-level visualization.
- Dark and light themes.
- Copy route summary to clipboard.
- Route counter.
- Further validation using real-world traffic datasets.
- Expanded scenario-based urban planning analysis.

## 11. Sustainable Development Goals

This project supports the following United Nations Sustainable Development Goals:

- **SDG 9:** Industry, Innovation and Infrastructure.
- **SDG 11:** Sustainable Cities and Communities.
- **SDG 13:** Climate Action.



## 12 . Conclusion

Urban Digital Twin AI combines 3D city visualization, A\*-based route optimization, traffic simulation, and AI-powered environmental analytics in a unified smart city platform. It aims to help urban planners explore transportation scenarios and evaluate their potential impact on mobility and sustainability.

---

**Project:** Urban Digital Twin AI – Smart City Simulator  
**Domain:** Smart Cities, Urban Digital Twins, Artificial Intelligence, Sustainable Transportation
