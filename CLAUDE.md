# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MuhasebeOkulu** is an accounting education platform built with Spring Boot backend and vanilla JavaScript frontend. The application allows students to practice accounting problems with automatic solution checking.

- **Tech Stack**: Spring Boot 3.5.7, PostgreSQL, JWT authentication, Vanilla JavaScript + Tailwind CSS
- **Architecture**: RESTful API with SPA frontend
- **Language**: Turkish (UI and content), Java (code)
- **Database**: PostgreSQL (development and production)

## Development Commands

### Building and Running

```bash
# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run

# Run tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=TestClassName

# Run a single test method
./mvnw test -Dtest=TestClassName#methodName

# Package without running tests
./mvnw package -DskipTests
```

### Database

- **Connection**: PostgreSQL on localhost:5432
- **Database name**: muhasebe-okulu
- **Default credentials**: postgres/1234 (configured in application.properties)
- **Schema management**: Hibernate DDL auto-update + SQL migrations in `src/main/resources/db/migration/`

### API Documentation

- **Swagger UI**: http://localhost:8080/swagger-ui.html (when application is running)
- **Actuator endpoints**: http://localhost:8080/actuator (mappings, health, info)

### Frontend Development

- **Static files**: Located in `src/main/resources/static/`
- **Live reload**: Enabled via Spring Boot DevTools
- **Access**: http://localhost:8080/ or IntelliJ's built-in server on port 63342

## Architecture

### Package Structure

```
com.example.muhasebeokulu5/
├── config/              # Configuration classes (CORS, Swagger, ModelMapper)
├── controller/          # REST controllers
├── dto/                 # Data Transfer Objects
├── entities/            # JPA entities
├── exception/           # Custom exceptions and handlers
├── repository/          # Spring Data JPA repositories
├── security/            # JWT authentication (JwtUtil, JwtRequestFilter, SecurityConfig)
└── service/             # Business logic layer
```

### Core Domain Models

The application revolves around these key entities:

1. **User**: System users with roles (USER, ADMIN)
2. **Problem**: Accounting problems with difficulty levels and categories
3. **SolvedProblem**: Junction table tracking which users solved which problems
4. **CorrectEntry**: Expected correct accounting entries for each problem
5. **UserAnswer**: User-submitted answers for problems
6. **AccountPlan**: Chart of accounts (Hesap Planı)
7. **DiscussionPost & Comment**: Discussion forum for problems

### Authentication & Authorization

- **JWT-based authentication**: Tokens stored in localStorage on frontend
- **Token expiry**: 24 hours (86400000ms)
- **Roles**: USER (default) and ADMIN
- **Security filter**: `JwtRequestFilter` validates tokens on protected endpoints
- **Password encoding**: BCrypt

**Public endpoints** (no authentication required):
- `/api/auth/**` - Login/Register
- `/api/problems/**` - Browse problems
- `/api/solved-problems/**` - Check solutions
- `/api/account-plans/**` - Access chart of accounts
- `/*.html` - Frontend pages

**Protected endpoints**:
- `/api/users/**` - User profile management (requires authentication)
- `/api/admin/**` - Admin operations (requires ADMIN role)
- `/api/correct-entries/**` - Correct answers (authenticated users only)

### Frontend Architecture

- **Framework**: Vanilla JavaScript (no framework)
- **Styling**: Tailwind CSS
- **Pages**: Static HTML files in `src/main/resources/static/`
  - `index.html` - Landing page
  - `login.html`, `register.html` - Authentication
  - `dashboard.html` - User dashboard
  - `problems.html`, `problem-detail.html` - Problem browsing/solving
  - `profile.html` - User profile
  - `admin.html`, `admin-dashboard.html` - Admin panel
- **Assets**: Organized in `/assets/` subdirectories (css, js, images)

### Key Design Patterns

1. **DTO Pattern**: Separation of API contracts from entities using ModelMapper
2. **Repository Pattern**: Spring Data JPA repositories for data access
3. **Service Layer**: Business logic isolated from controllers
4. **JWT Stateless Authentication**: No server-side sessions
5. **Role-Based Access Control**: Enforced at both controller and frontend levels

## Important Technical Details

### CORS Configuration

The application is configured to accept requests from:
- http://localhost:63342 (IntelliJ IDEA built-in server)
- http://localhost:8080 (Spring Boot)
- http://192.168.1.36:63342 (Network access)
- http://127.0.0.1:63342

When adding new origins, update `SecurityConfig.corsConfigurationSource()`.

### Database Performance

HikariCP connection pool is configured for optimal performance:
- Maximum pool size: 20
- Minimum idle: 5
- Batch processing enabled for bulk operations

SQL migrations are located in `src/main/resources/db/migration/` for schema changes.

### Problem Solution Checking

The core feature is automatic solution verification:
1. User submits accounting entries for a problem
2. Backend compares with `CorrectEntry` data for that problem
3. Solution marked correct if entries match
4. `SolvedProblem` record created on success

### Lombok Usage

Project uses Lombok extensively:
- `@Data`, `@Getter`, `@Setter` on entities and DTOs
- `@NoArgsConstructor`, `@AllArgsConstructor` for constructors
- Annotation processing configured in pom.xml

When creating new entities/DTOs, follow the existing Lombok patterns.

## Common Development Tasks

### Adding a New Entity

1. Create entity class in `entities/` package with JPA annotations
2. Create repository interface extending `JpaRepository`
3. Create corresponding DTO in `dto/` package
4. Add mapping configuration in service layer
5. Create controller for REST endpoints
6. Update `SecurityConfig` if new endpoints need special permissions

### Adding a New REST Endpoint

1. Add method to appropriate controller with `@GetMapping/@PostMapping/@PutMapping/@DeleteMapping`
2. Implement business logic in corresponding service
3. Update `SecurityConfig.filterChain()` if endpoint needs authentication
4. Test with Swagger UI or frontend

### Modifying Authentication

- JWT secret and expiration configured in `application.properties`
- Token generation/validation logic in `JwtUtil`
- Filter logic in `JwtRequestFilter`
- Security rules in `SecurityConfig`

### Frontend JavaScript Pattern

Most pages follow this pattern:
1. Check authentication status (localStorage token)
2. Fetch data from API with Authorization header
3. Render data dynamically
4. Handle user interactions (forms, clicks)
5. Redirect based on role/authentication

## Project-Specific Conventions

- **Turkish content**: UI text, problem descriptions, and user-facing content are in Turkish
- **Role names**: Use `Role.USER` and `Role.ADMIN` enum values
- **Difficulty levels**: Use `Difficulty` enum (KOLAY, ORTA, ZOR)
- **Profession types**: Use `Profession` enum for user professions
- **Date handling**: Use `LocalDateTime` for timestamps
- **Error handling**: Custom exceptions in `exception/` package with global exception handler

## Testing

- Unit tests in `src/test/java/`
- H2 database configured for test scope
- Spring Boot Test annotations for integration tests
- Run a full test suite before committing major changes