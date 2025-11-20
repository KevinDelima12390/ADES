
# ADES Application Documentation

This document provides a comprehensive overview of the ADES (Automated Distress Emergency System) application, which consists of a web client and a mobile client.

## Project Structure

The project is a monorepo containing two main directories:

-   `ades-web/`: The source code for the web application.
-   `ades-mobile/`: The source code for the mobile application.

Both applications share a similar architecture and feature set.

## Core Technologies

### Common

-   **State Management:** Redux Toolkit is used for managing application state in both the web and mobile apps.
-   **HTTP Client:** Axios is used for making API requests to the backend.
-   **Authentication:** Both applications use JWT (JSON Web Tokens) for authentication. The token is stored in `localStorage` or `sessionStorage` in the web app and in `Expo's SecureStore` in the mobile app.

### Web (`ades-web`)

-   **Framework:** React
-   **UI Library:** Material-UI (MUI)
-   **Routing:** React Router
-   **Build Tool:** Vite
-   **PWA Support:** The web app is a Progressive Web App (PWA) and can be installed on devices and used offline.

### Mobile (`ades-mobile`)

-   **Framework:** React Native with Expo
-   **UI:** React Native components and Expo components
-   **Navigation:** React Navigation

## Application Flow

The application flow is similar for both the web and mobile clients.

1.  **Authentication:**
    -   Users can register with their name, a user ID, a password, and a profile photo.
    -   Users can log in with their user ID and password.
    -   Upon successful login, a JWT token is issued by the backend and stored on the client.
    -   The application uses this token to authenticate subsequent API requests.
    -   The authentication state is managed by a Redux slice (`authSlice`).

2.  **Dashboard:**
    -   After logging in, the user is directed to the dashboard.
    -   The dashboard displays a welcome message and the main feature of the application: an emergency button.
    -   To trigger an emergency, the user must press and hold the emergency button for 3 seconds.
    -   This action sends the user's current location (latitude and longitude) to the backend.
    -   The web app uses the browser's Geolocation API, and the mobile app uses `expo-location` to get the user's location.

3.  **Event History:**
    -   Users can view a history of their past emergency events.
    -   This screen fetches the event history from the backend and displays it in a list or table.
    -   Each event includes the date and time it was triggered, the location (latitude and longitude), and the status of the event (e.g., pending, in-progress, resolved).
    -   The location is a link that opens Google Maps to show the location where the event was triggered.

## Screens/Pages

### Web (`ades-web/src/pages`)

-   `LoginPage.tsx`: Handles user login.
-   `RegistrationPage.tsx`: Handles new user registration.
-   `Dashboard.tsx`: The main screen after login, containing the emergency button.
-   `EventHistoryPage.tsx`: Displays the user's event history.

### Mobile (`ades-mobile/src/screens`)

-   `LoginScreen.tsx`: Handles user login.
-   `RegistrationScreen.tsx`: Handles new user registration.
-   `DashboardScreen.tsx`: The main screen after login, containing the emergency button.
-   `EventHistoryScreen.tsx`: Displays the user's event history.

## State Management (`authSlice`)

Both applications share a similar Redux slice for authentication (`authSlice`).

-   **State:**
    -   `token`: The JWT token.
    -   `isAuthenticated`: A boolean indicating if the user is authenticated.
    -   `userId`: The ID of the logged-in user.
-   **Actions:**
    -   `setCredentials`: Sets the token, `isAuthenticated` flag, and user ID upon login.
    -   `logout`: Clears the authentication state upon logout.

The mobile app's `authSlice` has the additional responsibility of saving and deleting the token from `SecureStore`.
This documentation provides a high-level overview of the ADES application. For more detailed information, please refer to the source code in the respective directories.
