const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 5000;

mongoose.connect("mongodb://127.0.0.1:27017/testDB")
  .then(() => console.log("MongoDB Connected via Mongoose!"))
  .catch(err => console.error("DB Connection Error:", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  city: String,
  isActive: Boolean
});

const User = mongoose.model("User", userSchema);

app.use(express.json());

// 1. Basic Route (No parameters)
app.get("/", (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      message: "Hello from Express + Mongoose!" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.get('http://localhost:5000/');
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 2. Request Body (JSON data) - Already created
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ 
      success: true, 
      message: "User saved!", 
      user 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: "Failed to save user", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.post('http://localhost:5000/users', {
//     name: 'John',
//     email: 'john@email.com',
//     age: 25
//   });
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 3. Route Parameters (URL params)
app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "User found!", 
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch user", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.get('http://localhost:5000/users/64a1b2c3d4e5f6789012345');
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 4. Multiple Route Parameters
app.get("/users/:id/posts/:postId", (req, res) => {
  try {
    const { id, postId } = req.params;
    res.status(200).json({ 
      success: true, 
      message: `User ${id}'s post ${postId}`, 
      data: { userId: id, postId }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch post", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.get('http://localhost:5000/users/123/posts/456');
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 5. Query Parameters (URL query string)
app.get("/search", async (req, res) => {
  try {
    const { name, age, city } = req.query;
    let filter = {};
    if (name) filter.name = new RegExp(name, 'i');
    if (age) filter.age = age;
    if (city) filter.city = new RegExp(city, 'i');
    
    const users = await User.find(filter);
    res.status(200).json({ 
      success: true, 
      message: "Search results", 
      users, 
      searchParams: req.query 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Search failed", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.get('http://localhost:5000/search', {
//     params: { name: 'john', age: 25, city: 'NYC' }
//   });
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 6. Multiple Query Parameters with Pagination
app.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'name', order = 'asc' } = req.query;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    res.status(200).json({ 
      success: true, 
      message: "Users list", 
      users, 
      pagination: { page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch users", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.get('http://localhost:5000/users', {
//     params: { page: 2, limit: 5, sortBy: 'age', order: 'desc' }
//   });
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 7. Headers Data
app.get("/profile", (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const userAgent = req.headers['user-agent'];
    const customHeader = req.headers['x-custom-header'];
    
    if (!authToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token required" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Profile accessed", 
      data: { authToken, userAgent, customHeader }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to access profile", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.get('http://localhost:5000/profile', {
//     headers: {
//       'Authorization': 'Bearer your-token-here',
//       'X-Custom-Header': 'custom-value'
//     }
//   });
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 8. Route Params + Query Params Combined
app.get("/users/:id/search", async (req, res) => {
  try {
    const userId = req.params.id;
    const { keyword, category } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ 
        success: false, 
        message: "Keyword is required" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: `Searching for user ${userId}`, 
      data: { userId, searchKeyword: keyword, category }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Search failed", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.get('http://localhost:5000/users/123/search', {
//     params: { keyword: 'javascript', category: 'skills' }
//   });
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 9. Route Params + Request Body Combined
app.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "User updated!", 
      updatedUser 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: "Failed to update user", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.put('http://localhost:5000/users/123', {
//     name: 'Updated Name',
//     age: 26
//   });
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 10. Query Params + Request Body Combined
app.post("/users/bulk", async (req, res) => {
  try {
    const { notify = false, sendEmail = true } = req.query;
    const users = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Users array is required" 
      });
    }
    
    const savedUsers = await User.insertMany(users);
    res.status(201).json({ 
      success: true, 
      message: "Bulk users created!", 
      savedUsers,
      options: { notify: JSON.parse(notify), sendEmail: JSON.parse(sendEmail) }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: "Failed to create bulk users", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.post('http://localhost:5000/users/bulk', [
//     { name: 'User1', email: 'user1@email.com', age: 25 },
//     { name: 'User2', email: 'user2@email.com', age: 30 }
//   ], {
//     params: { notify: true, sendEmail: false }
//   });
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 11. All Combined: Route Params + Query Params + Headers + Body
app.patch("/users/:id/settings", async (req, res) => {
  try {
    const userId = req.params.id;
    const { action = 'update', force = false } = req.query;
    const authToken = req.headers.authorization;
    const settings = req.body;
    
    if (!authToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization required" 
      });
    }
    
    if (!settings || Object.keys(settings).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Settings data is required" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Settings updated!", 
      data: {
        userId,
        action,
        force: JSON.parse(force),
        authToken,
        newSettings: settings
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to update settings", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.patch('http://localhost:5000/users/123/settings', {
//     theme: 'dark',
//     notifications: true
//   }, {
//     params: { action: 'update', force: true },
//     headers: {
//       'Authorization': 'Bearer your-token'
//     }
//   });
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 12. Wildcard Route Parameters
app.get("/files/*", (req, res) => {
  try {
    const filePath = req.params[0];
    
    if (!filePath) {
      return res.status(400).json({ 
        success: false, 
        message: "File path is required" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "File requested", 
      data: { fullPath: filePath }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to access file", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.get('http://localhost:5000/files/documents/reports/2024/january.pdf');
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 13. Optional Route Parameters (using regex)
app.get(/^\/products\/(\d+)(?:\/reviews\/(\d+))?$/, (req, res) => {
  try {
    const productId = req.params[0];
    const reviewId = req.params[1];
    
    res.status(200).json({ 
      success: true, 
      message: "Product route", 
      data: {
        productId,
        reviewId: reviewId || null
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch product", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   // Without reviewId
//   const response = await axios.get('http://localhost:5000/products/123');
//   console.log(response.data);
//   
//   // With reviewId
//   const response2 = await axios.get('http://localhost:5000/products/123/reviews/456');
//   console.log(response2.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 14. Form Data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
app.post("/contact", (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, and message are required" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Contact form submitted!", 
      data: { name, email, message }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit contact form", 
      error: error.message 
    });
  }
});
// Frontend call (form data):
// try {
//   const formData = new URLSearchParams();
//   formData.append('name', 'John');
//   formData.append('email', 'john@email.com');
//   formData.append('message', 'Hello there!');
//   
//   const response = await axios.post('http://localhost:5000/contact', formData, {
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//   });
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// 15. Array Query Parameters
app.get("/filter", async (req, res) => {
  try {
    let { tags, categories, ids } = req.query;
    
    // Handle arrays in query params
    tags = Array.isArray(tags) ? tags : [tags].filter(Boolean);
    categories = Array.isArray(categories) ? categories : [categories].filter(Boolean);
    ids = Array.isArray(ids) ? ids : [ids].filter(Boolean);
    
    res.status(200).json({ 
      success: true, 
      message: "Filtered results", 
      data: { tags, categories, ids }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Filter failed", 
      error: error.message 
    });
  }
});
// Frontend call: 
// try {
//   const response = await axios.get('http://localhost:5000/filter', {
//     params: { 
//       tags: ['javascript', 'nodejs'], 
//       categories: ['web'], 
//       ids: [1, 2, 3] 
//     },
//     paramsSerializer: params => {
//       const searchParams = new URLSearchParams();
//       Object.keys(params).forEach(key => {
//         if (Array.isArray(params[key])) {
//           params[key].forEach(value => searchParams.append(key, value));
//         } else {
//           searchParams.append(key, params[key]);
//         }
//       });
//       return searchParams.toString();
//     }
//   });
//   console.log(response.data);
// } catch (error) {
//   console.error('Error:', error.response?.data || error.message);
// }

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Something went wrong!", 
    error: err.message 
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Route not found" 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

});
