# basicNode
# Express.js + MongoDB API Examples

A comprehensive Node.js application demonstrating various Express.js API endpoints with MongoDB integration using Mongoose. This project showcases different ways to handle HTTP requests including route parameters, query parameters, headers, and request bodies.

## 🚀 Features

- **Complete CRUD Operations** - Create, Read, Update, Delete users
- **Multiple Parameter Types** - Route params, query params, headers, and body data
- **Advanced Routing** - Wildcard routes, optional parameters, and combined parameter types
- **MongoDB Integration** - Full database connectivity with Mongoose ODM
- **Error Handling** - Comprehensive error handling and validation
- **Pagination & Filtering** - Built-in pagination and search functionality
- **Form Data Support** - Handle both JSON and form-encoded data

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <>
   cd express-mongodb-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install required packages**
   ```bash
   npm install express mongoose dotenv
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/testDB
   PORT=5000
   NODE_ENV=development
   ```

5. **Start MongoDB**
   - **Local MongoDB**: Ensure MongoDB service is running
   - **MongoDB Atlas**: Use your Atlas connection string in `.env`

6. **Run the application**
   ```bash
   node server.js
   ```

The server will start on `http://localhost:5000`

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  age: Number (0-120),
  city: String,
  isActive: Boolean (default: true),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-updated)
}
```

## 🔗 API Endpoints

### 1. Basic Route
- **GET** `/` - Welcome message
- **Response**: Success message

### 2. User Management

#### Create User
- **POST** `/users`
- **Body**: JSON user data
- **Example**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "city": "New York"
  }
  ```

#### Get User by ID
- **GET** `/users/:id`
- **Parameters**: `id` (MongoDB ObjectId)

#### Update User
- **PUT** `/users/:id`
- **Parameters**: `id` (MongoDB ObjectId)
- **Body**: JSON with fields to update

#### Get All Users (with Pagination)
- **GET** `/users`
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `sortBy` (default: 'name')
  - `order` ('asc' or 'desc', default: 'asc')

### 3. Search & Filter

#### Search Users
- **GET** `/search`
- **Query Parameters**:
  - `name` (partial match, case-insensitive)
  - `age` (exact match)
  - `city` (partial match, case-insensitive)

#### Advanced Filter
- **GET** `/filter`
- **Query Parameters**:
  - `tags[]` (array of tags)
  - `categories[]` (array of categories)
  - `ids[]` (array of IDs)

### 4. Advanced Routes

#### User Posts
- **GET** `/users/:id/posts/:postId`
- **Parameters**: `id` (user ID), `postId` (post ID)

#### User Search
- **GET** `/users/:id/search`
- **Parameters**: `id` (user ID)
- **Query Parameters**: `keyword` (required), `category`

#### User Settings
- **PATCH** `/users/:id/settings`
- **Parameters**: `id` (user ID)
- **Query Parameters**: `action`, `force`
- **Headers**: `Authorization` (required)
- **Body**: Settings object

### 5. File Operations

#### File Access
- **GET** `/files/*`
- **Wildcard Parameter**: Any file path after `/files/`

### 6. Form Data

#### Contact Form
- **POST** `/contact`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Body**: `name`, `email`, `message`

### 7. Bulk Operations

#### Bulk User Creation
- **POST** `/users/bulk`
- **Query Parameters**: `notify`, `sendEmail`
- **Body**: Array of user objects

## 🧪 Testing the API

### Using cURL

```bash
# Get welcome message
curl http://localhost:5000/

# Create a user
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@email.com","age":25}'

# Get user by ID
curl http://localhost:5000/users/64a1b2c3d4e5f6789012345

# Search users
curl "http://localhost:5000/search?name=john&age=25"

# Get users with pagination
curl "http://localhost:5000/users?page=1&limit=5&sortBy=age&order=desc"
```

### Using JavaScript (Frontend)

```javascript
// Create user
const createUser = async () => {
  try {
    const response = await axios.post('http://localhost:5000/users', {
      name: 'Jane Doe',
      email: 'jane@example.com',
      age: 28,
      city: 'Los Angeles'
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

// Search users
const searchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/search', {
      params: { name: 'john', city: 'New York' }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

## 📝 Response Format

All API responses follow this consistent format:

```json
{
  "success": boolean,
  "message": "Description of the operation",
  "data": {}, // or "user", "users", etc.
  "error": "Error message (only on failure)"
}
```

## 🔧 Error Handling

The application includes comprehensive error handling:

- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Missing or invalid authorization
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server-side errors

## 🌍 Environment Configuration

### Development
```env
MONGODB_URI=mongodb://127.0.0.1:27017/testDB
NODE_ENV=development
PORT=5000
```

### Production (MongoDB Atlas)
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/testDB?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
```

## 📚 Project Structure

```
express-mongodb-api/
├── server.js          # Main application file
├── package.json       # Dependencies and scripts
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## 🔗 Dependencies

- **express**: Web framework for Node.js
- **mongoose**: MongoDB ODM for Node.js
- **dotenv**: Environment variable loader

## 🚦 Getting Started

1. Start your MongoDB service
2. Install dependencies: `npm install`
3. Create your `.env` file
4. Run the server: `node server.js`
5. Test endpoints using cURL, Postman, or your frontend application

## 📖 API Examples by Category

### Route Parameters
- `/users/123` - Get user with ID 123
- `/users/123/posts/456` - Get post 456 for user 123
- `/products/789` - Get product 789
- `/products/789/reviews/101` - Get review 101 for product 789

### Query Parameters
- `/users?page=2&limit=5` - Paginated users
- `/search?name=john&city=NYC` - Search with filters
- `/filter?tags=js&tags=node` - Multiple values for same parameter

### Headers
- `Authorization: Bearer token123` - Authentication
- `X-Custom-Header: value` - Custom headers

### Request Body
- JSON data for creating/updating resources
- Form data for contact forms
- Arrays for bulk operations

## 🔒 Security Considerations

For production deployment, consider adding:

- **Authentication middleware** (JWT tokens)
- **Rate limiting** (express-rate-limit)
- **Input validation** (joi or express-validator)
- **CORS configuration** (cors middleware)
- **Helmet.js** for security headers
- **MongoDB connection encryption**

## 📞 Support

If you encounter any issues:

1. Check that MongoDB is running
2. Verify your connection string
3. Ensure all dependencies are installed
4. Check the console for error messages

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy coding! 🎉**
