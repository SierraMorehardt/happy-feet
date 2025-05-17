# HappyFeet

A JavaScript application to help runners train for races with personalized training plans and workout tracking.

## Quick Start

### Docker Development
```bash
docker-compose up --build
```

### Local Development
```bash
git clone <repo-url>
cd happy-feet
npm install
cp .env.example .env
npm run dev
npm test
```

## Authentication

The application uses JWT for authentication:

1. **Register**
```http
POST /api/register
```

2. **Login**
```http
POST /api/login
```

After login, include the JWT token in the Authorization header:
```http
Authorization: Bearer <token>
```

## Project Structure

```text
happy-feet/
├── src/
│   ├── main/           # Application code
│   └── test/           # Test files
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Input validation using express-validator

## API Testing Tools

- Use the provided `HappyFeetAPI.http` file with VS Code REST Client
- Import `HappyFeetAPI.postman_collection.json` into Postman for API testing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
