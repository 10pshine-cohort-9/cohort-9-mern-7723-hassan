# Cohort 9 MERN Project

This repository contains my full-stack MERN project developed as part of the **10Pearls Cohort 9 MERN (Node.js + React.js) program**.

The project is divided into two main parts:

* **Frontend** – React application built with Vite
* **Backend** – Node.js and Express API connected with MongoDB

The application includes authentication, API communication, real-time functionality, testing, and code quality checks.

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* Socket.IO Client
* DOMPurify
* Jest
* React Testing Library

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* bcrypt
* Socket.IO
* Pino Logger
* Mocha
* Chai
* Supertest
* MongoDB Memory Server

## Project Structure

```text
cohort-9-mern-7723-hassan/
│
├── backend/                 # Express API and server-side code
│   ├── test/                # Backend tests
│   ├── index.js             # Backend entry point
│   └── package.json
│
├── frontend/                # React application
│   ├── src/                 # React components and application code
│   ├── public/              # Static files
│   └── package.json
│
├── .github/workflows/       # GitHub Actions workflows
├── sonar-project.properties # SonarQube configuration
└── README.md
```

## Getting Started

### Prerequisites

Make sure the following are installed on your system:

* Node.js
* npm
* MongoDB or a MongoDB Atlas connection

The frontend is configured for modern Node.js versions, so using **Node.js 20 or later** is recommended.

## Installation

Clone the repository:

```bash
git clone https://github.com/10pshine-cohort-9/cohort-9-mern-7723-hassan.git
```

Move into the project folder:

```bash
cd cohort-9-mern-7723-hassan
```

## Backend Setup

Move into the backend folder:

```bash
cd backend
```

Install the dependencies:

```bash
npm install
```

Create an `.env` file and add the required environment variables. The exact values should match your local or deployed configuration.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend in development mode:

```bash
npm run dev
```

For normal execution:

```bash
npm start
```

The backend uses Express and MongoDB for handling application data and APIs.

## Frontend Setup

Open another terminal and move into the frontend folder:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide the local URL for accessing the application in the browser.

## Testing

The project includes tests for both the frontend and backend.

### Backend Tests

Run backend tests:

```bash
cd backend
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

The backend testing setup uses Mocha, Chai, Supertest, and MongoDB Memory Server.

### Frontend Tests

Run frontend tests:

```bash
cd frontend
npm test
```

Run frontend tests with coverage:

```bash
npm run test:coverage
```

The frontend uses Jest and React Testing Library.

## Main Features

The project includes functionality and tools such as:

* User authentication
* Password hashing with bcrypt
* JWT-based authorization
* MongoDB database integration
* REST API development with Express
* React-based frontend
* Client-side routing
* API communication with Axios
* Real-time communication using Socket.IO
* Input/content sanitization using DOMPurify
* Backend logging with Pino
* Automated testing
* Test coverage reports
* GitHub Actions workflow
* SonarQube code quality configuration

## Available Scripts

### Backend

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `npm start`             | Starts the backend server        |
| `npm run dev`           | Starts the backend with Nodemon  |
| `npm test`              | Runs backend tests               |
| `npm run test:coverage` | Runs backend tests with coverage |

### Frontend

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `npm run dev`           | Starts the Vite development server |
| `npm run build`         | Creates a production build         |
| `npm run preview`       | Previews the production build      |
| `npm test`              | Runs frontend tests                |
| `npm run test:coverage` | Runs frontend tests with coverage  |

## Code Quality

The repository also contains configuration for automated code quality checks and GitHub workflows.

The aim is to keep the code organized, test the main functionality, and identify issues before changes are merged.

## Author

**Hassan Ahmed**

MERN Stack / Software Engineering Student

## Repository

The project is maintained in the `develop` branch and is part of the **10Pearls Cohort 9 MERN program**.
