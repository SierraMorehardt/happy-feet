# HappyFeet

A JavaScript application to help runners train for races. This application provides personalized training plans, workout tracking, and performance analytics.

## Features

- User authentication and authorization
- Personalized training plans
- Workout tracking and analytics
- Rate limiting for security
- Docker support for easy deployment
- Comprehensive API documentation

## Requirements

- Node.js 18 or higher
- npm 9 or higher
- Docker and Docker Compose (for containerized deployment)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`:
   ```bash
cp .env.example .env
```
   - Edit `.env` with your specific values:
   - `PORT`: Application port (default: 8080)
   - `NODE_ENV`: Environment mode (development/production)
   - `RATE_LIMIT_*`: Rate limiting configuration
   - `JWT_SECRET`: JWT signing secret (keep this secure!)
   - `CORS_ORIGIN`: Allowed CORS origin

## Project Structure

```text
happy-feet/
├── src/                 # Source code directory
│   ├── main/           # Main application code
│   └── test/           # Test files
├── docker-compose.yml  # Docker configuration
├── Dockerfile          # Container configuration
├── package.json        # Project dependencies
└── README.md          # This file
```

## Setup Instructions

### Docker Development

1. **Build and Run with Docker Compose**

```bash
docker-compose up --build
```

- The app will be available at [http://localhost:8080](http://localhost:8080)
- Both application and database containers will be started automatically

2. **Live Code Mounting**

The `docker-compose.yml` mounts your local `src` directory into the container, allowing for live development:

```yaml
volumes:
  - ./src:/app/src  # Mount source code for live development
```

### Local Development

1. **Clone the repository**

```bash
git clone <repo-url>
cd happy-feet-js
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Create a `.env` file in the root directory with the following variables:

```env
PORT=8080
JWT_SECRET=your-secret-key
```

4. **Run the application**

```bash
npm run dev
```

5. **Run tests**

```bash
npm test
```

## API Documentation

### Authentication

The application uses JSON Web Tokens (JWT) for user authentication. JWT is a compact, URL-safe means of representing claims to be transferred between two parties. In this application:

1. **Register a New User**

```http
POST /api/register
```

Request Body:
```typescript
{
  "username": "string",
  "password": "string",
  "age": 0,
  "gender": "M" | "F",
  "currentWeeklyMileage": 0,
  "longestRecentRun": 0
}
```

Response:
```typescript
{
  "username": "string",
  "age": 0,
  "gender": "M" | "F",
  "currentWeeklyMileage": 0,
  "longestRecentRun": 0
}
```

2. **Login**

```http
POST /api/login
```

Request Body:
```typescript
{
  "username": "string",
  "password": "string"
}
```

Response:
```typescript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Note: The token above is a sample JWT token

The JWT token contains three parts:
1. Header: Contains the token type and algorithm
2. Payload: Contains user claims (username, roles, etc.)
3. Signature: Verifies the token's integrity

### Using JWT Tokens

After logging in, the client must include the JWT token in the Authorization header for all protected API requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### User Management

1. **Get User Profile**

```http
GET /api/users/{username}
```

Headers:
```http
Authorization: Bearer <jwt-token>
```

Response:
```typescript
{
  "username": "string",
  "age": 0,
  "gender": "M" | "F",
  "currentWeeklyMileage": 0,
  "longestRecentRun": 0,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Error Handling

The API returns standardized error responses:

```typescript
{
  "error": "error message",
  "status": 400
}
```

Common error codes:
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (invalid or expired token)
- `404`: Not Found (resource not found)
- `500`: Internal Server Error

**Note:** JWT tokens should be stored securely on the client side (e.g., in an HTTP-only cookie or localStorage) and should never be exposed in the browser's developer tools or network requests.

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Input validation using express-validator

## Testing

The project includes comprehensive test coverage. Run tests using:

```bash
npm test
```

Test files are located in the `src/test` directory and follow the pattern `*.test.js`.

## API Testing Tools

- Use the provided `HappyFeetAPI.http` file with VS Code REST Client
- Import `HappyFeetAPI.postman_collection.json` into Postman for API testing
- Both files contain pre-configured requests for all available endpoints

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Support

For support, please:
1. Check the existing issues
2. Open a new issue if your problem isn't listed
3. Include detailed information about the problem
4. Provide steps to reproduce the issue

## Acknowledgments

- Express.js for the web framework
- bcrypt for password hashing
- JWT for authentication
- Docker for containerization
- Other open-source contributors

---

### Login
- **Method:** POST
- **URL:** `/api/login`
- **Request Body:**
```typescript
{
  "username": "testuser",
  "password": "password123"
}
```
- **Response:**
  - `200 OK` with user info

---

### Get User by Username
- **Method:** GET
- **URL:** `/api/users/{username}`
- **Response:**
  - `200 OK` with user details
  - Example:
    ```typescript
    {
      "username": "testuser",
      "age": 28,
      "gender": "F",
      "currentWeeklyMileage": 0.0,
      "longestRecentRun": 13
    }
    ```

---
