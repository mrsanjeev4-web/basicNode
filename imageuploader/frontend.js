'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Profile() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim() === '') return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name cannot exceed 50 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateMobile = (mobile) => {
    if (!mobile || mobile.trim() === '') return 'Mobile number is required';
    const cleanMobile = mobile.replace(/[\s\-\+\(\)]/g, '');
    if (!/^[0-9]{10,15}$/.test(cleanMobile)) return 'Please enter a valid mobile number (10-15 digits)';
    return '';
  };

  const validateAddress = (address) => {
    if (!address || address.trim() === '') return 'Address is required';
    if (address.trim().length < 5) return 'Address must be at least 5 characters';
    if (address.trim().length > 200) return 'Address cannot exceed 200 characters';
    return '';
  };

  const validateImage = (file) => {
    if (!file) return 'Image is required';
    if (!file.type.startsWith('image/')) return 'Only image files are allowed';
    if (file.size > 5 * 1024 * 1024) return 'Image size cannot exceed 5MB';
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const mobileError = validateMobile(formData.mobile);
    if (mobileError) newErrors.mobile = mobileError;

    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;

    const imageError = validateImage(image);
    if (imageError) newErrors.image = imageError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    let error = '';
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'mobile':
        error = validateMobile(value);
        break;
      case 'address':
        error = validateAddress(value);
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      setImage(file);

      // Validate image
      const imageError = validateImage(file);
      setErrors(prev => ({
        ...prev,
        image: imageError
      }));

      // Create preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fix the errors below');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('mobile', formData.mobile.trim());
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('image', image);

      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        setMessage('User created successfully!');
        setFormData({ name: '', mobile: '', address: '' });
        setImage(null);
        setImagePreview(null);
        setErrors({});
        document.getElementById('image-input').value = '';
        fetchUsers();
      } else {
        setMessage(result.message || 'Error creating user');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error connecting to server. Make sure backend is running on port 3000');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users');
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage('Error fetching users. Make sure backend is running');
    }
  };

  const getUserImage = (userId) => {
    return `http://localhost:3000/api/users/${userId}/image`;
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <Head>
        <title>User Registration App</title>
        <meta name="description" content="User registration with image upload" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            User Registration
          </h1>
          
          {/* Registration Form */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New User</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Mobile Field */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.mobile ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter mobile number"
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your complete address"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                {/* Image Field */}
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="image-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                  )}
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-3 flex justify-center">
                      <div className="w-24 h-24 border-2 border-gray-300 rounded-full overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading || Object.values(errors).some(error => error !== '')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : 'Submit'}
                </button>
              </form>

              {message && (
                <div className={`mt-4 p-3 rounded-md text-center ${
                  message.includes('successfully') 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Users List */}
          <div className="mt-12">
            <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
              Registered Users
            </h2>
            
            {users.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((user) => (
                  <div key={user._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-3 border-gray-200">
                        <img 
                          src={getUserImage(user._id)} 
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                          }}
                        />
                      </div>
                      
                      <div className="text-center w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                          {user.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center justify-center">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            <span className="font-medium">Mobile:</span>
                          </p>
                          <p className="font-mono text-gray-800">{user.mobile}</p>
                          
                          <p className="flex items-center justify-center mt-2">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            <span className="font-medium">Address:</span>
                          </p>
                          <p className="text-gray-700 text-xs leading-relaxed px-2">
                            {user.address.length > 50 
                              ? `${user.address.substring(0, 50)}...` 
                              : user.address
                            }
                          </p>
                          
                          <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No users found</p>
                <p className="text-gray-400 text-sm">Add some users using the form above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
