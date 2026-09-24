// Authentication utilities
const API_BASE = '/api/auth';

// Store token in localStorage
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

// Get token from localStorage
export const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Get current user from localStorage
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Store user in localStorage
export const setCurrentUser = (user) => {
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        localStorage.removeItem('user');
    }
};

// Register user
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            setAuthToken(data.token);
            setCurrentUser(data.user);
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Login user
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            setAuthToken(data.token);
            setCurrentUser(data.user);
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Logout user
export const logoutUser = () => {
    setAuthToken(null);
    setCurrentUser(null);
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getAuthToken();
};
