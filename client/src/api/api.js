import axios from "axios";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
    withCredentials: true,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    }
})

const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
    API.interceptors.request.use(
        (config) => {
            console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
            return config;
        },
        (error) => Promise.reject(error)
    );

    API.interceptors.response.use(
        (response) => {
            console.log('API Response:', response.status, response.config.url);
            return response;
        },
        (error) => Promise.reject(error)
    );
}

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('Request timed out. The server is taking too long to respond. Please try again.'));
        }
        if (error.message === 'Network Error') {
            return Promise.reject(new Error('Cannot reach the backend server. Make sure the server is running on port 3001 (cd server && npm start).'));
        }
        return Promise.reject(error);
    }
);

// Auth
export const signIn = async (data)=>await API.post('/auth/login',data)
export const signUp = async (data)=>await API.post('/auth/register',data)
export const logout = async ()=>await API.get('/auth/logout')
export const getMe = async ()=>await API.get('/auth/me')
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

// Goals
export const getGoal = async()=>await API.get('/goals')
export const setGoal = async(data)=>await API.post('/goals',data)
export const updateGoal = async(data)=>await API.put('/goals',data)
export const addAmount = async(data)=>await API.put('/goals/addamount',data)
export const completeGoal = async(data)=>await API.put('/goals/completed',data)
export const deleteGoal = async(data)=>await API.delete('/goals',{data:data})

// Overview
export const getOverview = async()=>await API.get('/overview/')

// AI
export const parseReceipt = async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return await API.post('/ai/receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
    });
};

// Profile
export const getProfile = async()=>await API.get('/profile/')
export const updateProfile = async(data)=>await API.put('/profile/',data)
