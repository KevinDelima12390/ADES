# ADES Web Application (Frontend)

This is the frontend client for the Autonomous Drone Emergency System (ADES), built with React, TypeScript, and Vite.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup and Environment Configuration](#setup-and-environment-configuration)
- [Backend URL Configuration](#backend-url-configuration)
- [Available Scripts](#available-scripts)
- [Build and Deployment Guide](#build-and-deployment-guide)
- [PWA Functionality](#pwa-functionality)

## Features

- User Registration (Name, User ID, Password, Photo Upload)
- Secure Login / Authentication with JWT
- Emergency Trigger Interface with 3-second hold and Geolocation
- Event History display with location links and status
- Responsive Design
- Progressive Web App (PWA) with Offline Mode and Background Sync for emergency alerts

## Technology Stack

- **Frontend Framework**: React (Vite + TypeScript)
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Networking**: Axios
- **Routing**: React Router v6
- **Location Services**: HTML5 Geolocation API
- **Storage**: `localStorage`, `sessionStorage`
- **Offline Mode**: Service Workers + Workbox (via `vite-plugin-pwa`)
- **Build Tool**: Vite
- **Notifications**: `react-hot-toast`

## Setup and Environment Configuration

To get the project up and running, follow these steps:

1.  **Clone the repository (if not already done):**
    ```bash
    git clone <repository-url>
    cd ades-web
    ```

2.  **Install Dependencies:**
    Navigate to the `ades-web` directory and install the required Node.js packages:
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root of the `ades-web` directory. This file will store your environment-specific variables. A crucial variable is the backend API base URL.

    Example `.env` file:
    ```
    VITE_API_BASE_URL=http://localhost:8000
    ```

## Backend URL Configuration

The application communicates with the IBIS Database backend. The base URL for the backend API is configured via the `VITE_API_BASE_URL` environment variable.

-   **Development**: Set `VITE_API_BASE_URL` to your local backend instance (e.g., `http://localhost:8000`).
-   **Production**: Set `VITE_API_BASE_URL` to your deployed backend instance (e.g., `https://your-backend-api.com`).

Ensure this variable is correctly set in your `.env` file for local development or in your deployment environment for production builds.

## Available Scripts

In the project directory, you can run:

-   `npm run dev`: Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in the browser. The page will reload if you make edits.
-   `npm run build`: Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.
-   `npm run lint`: Lints the project files.
-   `npm run preview`: Serves the production build locally for testing.

## Build and Deployment Guide

1.  **Build for Production:**
    To create a production-ready build of the application, run:
    ```bash
    npm run build
    ```
    This command will generate a `dist` directory containing all the static assets (HTML, CSS, JavaScript, images) optimized for production.

2.  **Deployment:**
    The contents of the `dist` directory can be served by any static file server (e.g., Nginx, Apache, Vercel, Netlify). Ensure your server is configured to:
    -   Serve `index.html` for all routes (client-side routing fallback).
    -   Handle HTTPS for secure communication.
    -   Correctly point to your `VITE_API_BASE_URL` for API calls.

## PWA Functionality

This application is configured as a Progressive Web App (PWA):

-   **Installation**: You can install the application to your device's home screen (Android/iOS) or desktop.
-   **Offline Access**: The application will cache static assets, allowing it to load even when offline.
-   **Background Sync**: Emergency requests made while offline will be automatically queued and retried when an internet connection is re-established. This is handled by Workbox's Background Sync feature.
-   **Updates**: The PWA will automatically check for updates and notify the user when new content is available.