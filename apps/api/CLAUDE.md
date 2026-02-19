## Conventions

- Always use DTOs (Data Transfer Objects) for request/response types in controllers and services. Never use database entities or schema types directly in API endpoints.
- Always specify explicit `type` in `@ApiProperty()` / `@ApiPropertyOptional()` decorators for DTO fields, especially for nullable types (e.g., `@ApiPropertyOptional({ type: String, nullable: true })`). NestJS Swagger cannot reliably infer union/nullable types.

## Testing

- In integration tests, type request bodies with the corresponding DTO (e.g., `.send({ ... } as CreateTaskDto)`) and type response bodies with the response DTO (e.g., `const body: TaskResponseDto = res.body`).
- When applicable, structure and comment each test case into stages by SETUP ACT ASSERT. The comment format will be comment "#region \***\*\*\*\*\*** STAGE \***\*\*\*\*\***" with "endregion" at the end.
