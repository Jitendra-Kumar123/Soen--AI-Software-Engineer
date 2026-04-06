import axios from "axios"

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
})

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default axiosInstance;