import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from "../context/user.context"
import axios from "../config/axios"
import { useNavigate } from "react-router-dom"

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projects, setProjects] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  function createProject(e) {
    e.preventDefault()
    if (!projectName.trim()) return
    setIsSubmitting(true)

    axios.post(`${import.meta.env.VITE_API_URL}/projects/create`,
      { name: projectName },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    )
      .then(res => {
        const newProject = res.data.project || res.data
        setProjects(prev => [...prev, newProject])
        setIsModalOpen(false)
        setProjectName("")
      })
      .catch(err => {
        console.error("Failed to create project:", err.response?.data || err.message)
      })
      .finally(() => setIsSubmitting(false))
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    axios.get(`${import.meta.env.VITE_API_URL}/projects/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        const projectList = res.data.projects || []
        setProjects(projectList)
      })
      .catch(err => console.log("Projects fetch error:", err))
  }, [])

  return (
    <main className="bg-gray-50 min-h-screen p-6 md:p-8">
      <div className="projects flex flex-wrap gap-4 items-center">
        <button
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="ri-add-line"></i>
          New Project
        </button>

        {projects && projects.length > 0 ? (
          projects.map((proj) => (
            <div
              key={proj._id}
              onClick={() => navigate(`/project/${proj._id}`)}
              className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 cursor-pointer min-w-[250px] hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex flex-col gap-3"
            >
              <i className="ri-folder-open-line text-blue-500 text-xl mb-2"></i>
              <h2 className="font-semibold text-gray-900 text-lg">{proj.name}</h2>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <i className="ri-group-line"></i>
                <span>Collaborators: {proj.users?.length ?? 0}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 font-medium text-center py-8 w-full">No projects found. Create one to get started!</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <form onSubmit={createProject}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="projectName">
                  Project Name
                </label>
                <input
                  id="projectName"
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg shadow-md hover:shadow-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Home