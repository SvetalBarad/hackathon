# CareerLaunchpad API Routes Documentation

## Authentication Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/google` - Authenticate with Google
- `POST /api/auth/apple` - Authenticate with Apple
- `POST /api/auth/linkedin` - Authenticate with LinkedIn
- `GET /api/auth/me` - Get current authenticated user

## Roadmap Routes
- `GET /api/roadmap/career-paths` - Get all career paths
- `GET /api/roadmap/career-paths/:id` - Get single career path
- `POST /api/roadmap/personalized` - Create a personalized roadmap
- `GET /api/roadmap/user/:userId` - Get user's personalized roadmap
- `POST /api/roadmap/milestone` - Update milestone completion status
- `GET /api/roadmap/next-steps/:userId` - Get recommended next steps

## Skills Routes
- `GET /api/skills` - Get all skills
- `GET /api/skills/search` - Search skills by text
- `GET /api/skills/category/:category` - Get skills by category
- `POST /api/skills/map-courses` - Map academic courses to skills
- `GET /api/skills/:id` - Get single skill
- `POST /api/skills` - Create a skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

## Resources Routes
- `GET /api/resources` - Get all resources
- `GET /api/resources/search` - Search resources
- `GET /api/resources/skill/:skillId` - Get resources by skill
- `GET /api/resources/career-path/:careerPathId` - Get resources by career path
- `GET /api/resources/recommendations/:userId` - Get personalized resource recommendations
- `GET /api/resources/:id` - Get single resource
- `POST /api/resources` - Create a new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

## Career Paths Routes
- `GET /api/career-paths` - Get all career paths
- `GET /api/career-paths/:id` - Get career path by ID
- `POST /api/career-paths` - Create a career path
- `PUT /api/career-paths/:id` - Update a career path
- `DELETE /api/career-paths/:id` - Delete a career path

## Opportunities Routes
- `GET /api/opportunities` - Get all opportunities
- `GET /api/opportunities/:id` - Get single opportunity
- `POST /api/opportunities` - Create a new opportunity
- `PUT /api/opportunities/:id` - Update opportunity
- `GET /api/opportunities/match/:userId` - Match opportunities to user
- `POST /api/opportunities/save` - Save opportunity for user
- `DELETE /api/opportunities/save/:userId/:opportunityId` - Remove saved opportunity
- `GET /api/opportunities/saved/:userId` - Get saved opportunities for user

## Portfolio Routes
- `GET /api/portfolio/:userId` - Get user portfolio
- `PUT /api/portfolio/:userId` - Update portfolio
- `POST /api/portfolio/:userId/projects` - Add project to portfolio
- `POST /api/portfolio/:userId/experiences` - Add experience to portfolio
- `POST /api/portfolio/:userId/education` - Add education to portfolio
- `GET /api/portfolio/projects/:userId` - Get all projects for a user
- `GET /api/portfolio/projects/single/:projectId` - Get a single project
- `POST /api/portfolio/projects` - Create a new project
- `PUT /api/portfolio/projects/:projectId` - Update a project
- `DELETE /api/portfolio/projects/:projectId/:userId` - Delete a project
- `PUT /api/portfolio/projects/feature/:projectId` - Toggle featured status of a project
- `GET /api/portfolio/career-path/:userId/:careerPathId` - Get projects related to a career path
- `GET /api/portfolio/recommendations/:userId` - Get portfolio recommendations

## Jobs Routes
- `GET /api/v1/jobs` - Get all jobs
- `GET /api/v1/jobs/:id` - Get job by ID
- `POST /api/v1/jobs` - Create a job
- `PUT /api/v1/jobs/:id` - Update a job
- `DELETE /api/v1/jobs/:id` - Delete a job

## Users Routes
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/:id/skills` - Get user skills
- `PUT /api/v1/users/:id/skills` - Update user skills

## Health Check Route
- `GET /api/health` - Check API health 