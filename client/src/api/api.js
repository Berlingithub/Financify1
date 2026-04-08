import axios from "axios";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
    withCredentials: true,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    }
})

// Add request interceptor for debugging
API.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
API.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request Timeout:', error.config.url);
            return Promise.reject(new Error('Request timed out. The server is taking too long to respond. Please try again.'));
        }
        if (error.message === 'Network Error') {
            console.error('Network Error:', error.config?.url);
            return Promise.reject(new Error('Network error. Please check your internet connection and try again.'));
        }
        console.error('API Error:', error.response?.status, error.config?.url, error.message);
        return Promise.reject(error);
    }
);

// Auth
export const signIn = async (data)=>await API.post('/auth/login',data)
export const signUp = async (data)=>await API.post('/auth/register',data)
export const logout = async ()=>await API.get('/auth/logout')
export const test = async ()=>await API.get('/')

// Transactions
export const getTransaction = async()=>await API.get('/transaction');
export const createTransaction = async(data)=>await API.post('/transaction',data);
export const updateTransaction = async(data)=>await API.put('/transaction',data);
export const deleteTransaction = async(data)=>await API.delete('/transaction',{data:data});

// Recurring Payments
export const getPayment = async()=>await API.get('/recurring');
export const createPayment = async(data)=>await API.post('/recurring',data);
export const updatePayment = async(data)=>await API.put('/recurring',data);
export const deletePayment = async(data)=>await API.delete('/recurring',{data:data});

// Income Sources
export const getIncome = async()=> await API.get('/income');
export const createIncome = async(data)=> await API.post('/income',data);
export const deleteIncome = async(data)=> await API.delete('/income',{data:data});
// Update income not implemented in backend - resets to default instead

// Goals
export const getGoal = async()=>await API.get('/goals')
export const setGoal = async(data)=>await API.post('/goals',data)
export const updateGoal = async(data)=>await API.put('/goals',data)
export const addAmount = async(data)=>await API.put('/goals/addamount',data)
export const completeGoal = async(data)=>await API.put('/goals/completed',data)
export const deleteGoal = async(data)=>await API.delete('/goals',{data:data})


// Overview
export const getOverview = async()=>await API.get('/overview/')

// Profile
export const getProfile = async()=>await API.get('/profile/')
export const updateProfile = async(data)=>await API.put('/profile/',data)

