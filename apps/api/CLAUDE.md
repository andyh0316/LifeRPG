## Conventions

- Always use DTOs (Data Transfer Objects) for request/response types in controllers and services. Never use database entities or schema types directly in API endpoints.
- Always specify explicit `type` in `@ApiProperty()` / `@ApiPropertyOptional()` decorators for DTO fields, especially for nullable types (e.g., `@ApiPropertyOptional({ type: String, nullable: true })`). NestJS Swagger cannot reliably infer union/nullable types.
