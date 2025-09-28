import React, {useContext, useEffect, useState} from 'react'
import {UserContext} from "../context/user.context";
import { useNavigate} from 'react-router-dom'
import axios from "../config/axios"

const UserAuth = ({children}) => {

    const {user, setUser} = useContext(UserContext);
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                navigate('/login')
                return
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setUser(response.data.user)
                setLoading(false)
            } catch (error) {
                console.error("Failed to fetch user:", error)
                localStorage.removeItem('token')
                navigate('/login')
            }
        }

        fetchUser()
    }, [token, navigate, setUser])

    if(loading){
        return <div>Loading...</div>
    }

    return (
        <>{children}</>
    )
}

export default UserAuth
