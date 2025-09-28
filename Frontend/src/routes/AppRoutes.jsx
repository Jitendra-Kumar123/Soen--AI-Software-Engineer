import React from 'react'
import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom'
import Login from '../screens/Login'
import Register from '../screens/Register'
import Home from '../screens/Home'
import Project from "../screens/Project"
import UserAuth from '../auth/UserAuth'


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<UserAuth><Home /></UserAuth>} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path="/project" element={<Navigate to="/" />} />

        <Route path="/project/:projectId" element={<UserAuth><Project /></UserAuth>} />

        <Route path="*" element={<p className="p-6 text-center text-red-500">404 | Page not found</p>} />
      </Routes>    
    </BrowserRouter>
  )
}

export default AppRoutes