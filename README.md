# PulseGuard - Advanced Healthcare Monitoring App

PulseGuard is a comprehensive mobile application designed for real-time health monitoring and risk prediction. Leveraging advanced sensor integration and machine learning, it provides users with instant insights into their cardiovascular health.

## 🚀 Key Features

- **Real-Time Vitals Monitoring**: Tracks Heart Rate (BPM), Blood Oxygen (SpO2), Blood Pressure, and Body Temperature.
- **AI-Powered Risk Prediction**: Utilizes a trained Machine Learning model to assess health risks based on live sensor data.
- **Smart Notifications**: Delivers critical alerts for abnormal vital readings.
- **Health History**: Stores and visualizes historical health data with interactive charts.
- **User Profiles**: Secure user authentication and profile management.
- **Multi-Language Support**: Built-in support for English and Arabic.
- **Wearable Integration**: Seamless connection with Mi Band 4 for live data streaming.

## 🛠️ Tech Stack

- **Framework**: React Native
- **State Management**: React Context API
- **Navigation**: React Navigation
- **Styling**: Styled Components & Linear Gradient
- **Machine Learning**: TensorFlow.js (Model: `model.json`)
- **Data Storage**: AsyncStorage
- **Backend**: Node.js & Express (API endpoints for data persistence)
- **Sensors**: Mi Band 4 (via Mi Band API)

## 📂 Project Structure

```
src/
├── components/      # Reusable UI components (Cards, Buttons, Charts)
├── context/         # Global state management (AuthContext, SensorContext)
├── ml/              # Machine Learning models and utilities
│   ├── RiskPredictor.js  # ML model integration
│   └── NLPBot.js         # Natural Language Processing for chatbot
├── navigation/      # App navigation setup
├── screens/         # Main application screens
│   ├── HomeScreen.js    # Dashboard with live data
│   ├── HistoryScreen.js # Historical data visualization
│   ├── ChatScreen.js    # AI Chatbot interface
│   └── ...              # Other screens (Login, Profile, etc.)
├── services/        # API integration and helper functions
└── utils/           # Utility functions and constants
```

## 🔌 Mi Band Integration

The app uses the Mi Band API to fetch live sensor data. Ensure you have the Mi Band connected and authorized for the app to read health data.

## 🤖 Machine Learning Model

The AI model is located in `src/ml/model.json`. It is a neural network trained to predict health risks based on user vitals.

## 🌐 API Endpoints

The app communicates with a backend server to persist and retrieve health data.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health/data/` | Fetch all health data records |
| POST | `/health/data/` | Create a new health data record |
| GET | `/health/data/:id/` | Fetch a specific health data record |
| PUT | `/health/data/:id/` | Update a health data record |
| DELETE | `/health/data/:id/` | Delete a health data record |

## 🏃 Running the App

1. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start the Development Server**:
   ```bash
   npm start
   # or
   yarn start
   ```

3. **Run on Device/Emulator**:
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator
   - Press `w` for Web

## 📝 License

MIT