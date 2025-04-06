# CareerLaunchpad

A career guidance platform to help college students connect their academic experiences to career preparation.

## Features

- **Skills Mapping Engine**: Translate academic experiences into industry-recognized skills
- **Personalized Career Roadmap**: Create a customized development path
- **Opportunity Matcher**: Find relevant internships, jobs, and projects
- **Portfolio Builder**: Showcase projects and professional experiences
- **Learning Resources**: Discover personalized learning materials

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local instance or MongoDB Atlas)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/careerlaunchpad.git
cd careerlaunchpad
```

2. Install dependencies for both frontend and backend
```
npm install
cd backend
npm install
cd ..
```

3. Configure environment variables
```
# In backend/.env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Running the Application

1. Start the backend server
```
cd backend
npm run dev
```

2. In a separate terminal, start the frontend
```
npm run dev
```

3. Open your browser and navigate to http://localhost:5173 (or the port shown in your terminal)

## Project Structure

- `src/` - Frontend code
  - `components/` - Reusable UI components
  - `contexts/` - React context for global state
  - `pages/` - Page components
  - `services/` - API service layer

- `backend/` - Backend code
  - `controllers/` - API endpoint controllers
  - `models/` - MongoDB schema models
  - `routes/` - API routes
  - `server.js` - Express server configuration

## Development

To seed the database with sample data:

```
cd backend
npm run seed
```

## Current Status

The application is fully functional with the following features implemented:

1. Skills mapping and visualization
2. Career roadmap creation and milestone tracking
3. Opportunity matching based on user skills
4. Portfolio project management
5. Personalized learning resources

Some features that could be added in the future:
- User authentication with social login
- Enhanced skill assessment
- Integration with job boards APIs
- Resume builder
- Mock interview practice

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any inquiries or support, please contact the project team.

---

Developed for the Hackathon by [Your Team Name]

# MongoDB Seeding API for Next.js

This project includes API routes for seeding and retrieving data from MongoDB in a Next.js application.

## Setup

1. Make sure you have a MongoDB connection string in your `.env.local` file:

```
MONGODB_URI=your_mongodb_connection_string
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

## Available API Routes

### Seed All Collections

`POST /api/seed`

This endpoint cleans and seeds both `users` and `careerPaths` collections with mock data.

Example:
```bash
curl -X POST http://localhost:3000/api/seed
```

### Seed Only Career Paths

`POST /api/seed/career-paths`

This endpoint cleans and seeds only the `careerPaths` collection with mock data.

Example:
```bash
curl -X POST http://localhost:3000/api/seed/career-paths
```

### Get All Career Paths

`GET /api/career-paths`

This endpoint retrieves all career paths from the database.

Example:
```bash
curl http://localhost:3000/api/career-paths
```

### Get Career Path by ID

`GET /api/career-paths/[id]`

This endpoint retrieves a specific career path by ID.

Example:
```bash
curl http://localhost:3000/api/career-paths/6123456789abcdef01234567
```

## Admin Interface

An admin interface is available at `/admin/seed` to easily seed the database and view the results.

## Data Structure

### Users

```json
{
  "name": "Alice",
  "age": 25,
  "email": "alice@example.com",
  "skills": ["JavaScript", "React"]
}
```

### Career Paths

```json
{
  "title": "Frontend Developer",
  "description": "Build interactive websites using HTML, CSS, and JavaScript",
  "skills": ["HTML", "CSS", "JavaScript", "React"],
  "level": "beginner",
  "durationWeeks": 10,
  "milestones": [
    {
      "title": "HTML & CSS Fundamentals",
      "description": "Learn the basics of HTML and CSS to build static web pages.",
      "skillsRequired": ["HTML", "CSS"],
      "order": 1,
      "estimatedTimeInWeeks": 3,
      "resources": ["resource-101", "resource-102"]
    }
  ]
}
```

## Utility Functions

The project includes utility functions in `src/utils/seed-database.js` for easily working with the API from frontend code:

- `seedDatabase()` - Seeds all collections
- `seedCareerPaths()` - Seeds only career paths collection
- `fetchCareerPaths()` - Fetches all career paths
- `fetchCareerPathById(id)` - Fetches a specific career path by ID 