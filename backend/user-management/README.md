# User Management Module

Backend Team — User Management APIs by Gaurav.

Only admins and principals can create, update, or delete user accounts.
Every endpoint requires a valid JWT token in the `Authorization` header.

## Security

- **JWT Required**: All routes verify `Authorization: Bearer <token>` before processing.
- **Role Protection**: Only `admin` and `principal` roles can create, update, or delete users.
- **Cross-Role Isolation**: `/api/students/:id` will never return or modify a teacher/parent record (and vice versa).
- **Input Sanitization**: Name fields reject special characters — only letters, spaces, hyphens, apostrophes, and periods allowed.
- **Response Sanitization**: Sensitive fields (`password`, `passwordHash`, `token`, `failedLoginAttempts`, `accountLockedUntil`, etc.) are stripped from all API responses automatically.

## Setup

Requires `jsonwebtoken` package:

```bash
npm install jsonwebtoken
```

Set the JWT secret via environment variable:

```bash
JWT_SECRET=secret-here
```

## APIs

Mount these routers in the main Express app:

```js
const {
  userRoutes,
  studentRoutes,
  teacherRoutes,
  parentRoutes,
} = require('./backend/user-management');

app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
```

> **Note**: JWT auth middleware is already built into every route. No need to add `authMiddleware` at mount time. But if you want to reuse it for other modules:
>
> ```js
> const { authMiddleware } = require('./backend/user-management');
> app.use('/api/other', authMiddleware, otherRoutes);
> ```

The JWT payload should contain at least:

```json
{
  "id": "user-uuid",
  "role": "admin",
  "email": "user@school.edu"
}
```

---

### Create User

`POST /api/users`

```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@school.edu",
  "role": "student"
}
```

Valid roles: `admin`, `principal`, `teacher`, `student`, `parent`.

**Validation rules:**
- `fullName`: Required, 2-100 chars, letters/spaces/hyphens/apostrophes/periods only
- `email`: Required, must be valid format, must be unique
- `role`: Required, must be one of the valid roles

### List Users

`GET /api/users`

Optional filters:

- `role=student`
- `role=teacher`
- `role=parent`
- `status=active`
- `status=inactive`

### Get User by ID

`GET /api/users/:id`

### Update User

`PATCH /api/users/:id`

```json
{
  "fullName": "Rahul K. Sharma",
  "email": "rahul.sharma@school.edu"
}
```

### Delete User

`DELETE /api/users/:id`

### Toggle Account Status

`PATCH /api/users/:id/status`

Toggles between `active` and `inactive`. No request body needed.

---

## Role-Specific Endpoints

Convenience routes that scope all operations to a single role. The role is auto-set on creation, and cross-role access is blocked on read/update/delete.

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List all students |
| GET | `/api/students/:id` | Get student by ID |
| POST | `/api/students` | Create student (role auto-set) |
| PATCH | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Teachers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teachers` | List all teachers |
| GET | `/api/teachers/:id` | Get teacher by ID |
| POST | `/api/teachers` | Create teacher (role auto-set) |
| PATCH | `/api/teachers/:id` | Update teacher |
| DELETE | `/api/teachers/:id` | Delete teacher |

### Parents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/parents` | List all parents |
| GET | `/api/parents/:id` | Get parent by ID |
| POST | `/api/parents` | Create parent (role auto-set) |
| PATCH | `/api/parents/:id` | Update parent |
| DELETE | `/api/parents/:id` | Delete parent |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Description of the error."
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error (bad input) |
| 401 | Missing or invalid JWT token |
| 403 | Insufficient permissions (not admin/principal) |
| 404 | User not found |
| 409 | Email already exists |
| 500 | Unexpected server error |
