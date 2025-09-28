import mongoose from "mongoose";
import projectModel from "../models/project.model.js"

export const createProject = async function({
    name, userId
}){

    if(!name){
        throw new Error("Name is required")
    }
    if(!userId){
        throw new Error("User is required")
    }

    const existingProject = await projectModel.findOne({ name, users: userId });
if (existingProject) {
  throw new Error("Project name already exists for this user");
}

let project;
try {
    project = await projectModel.create({
        name,
        users: [userId]
    });
} catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
        throw new Error("Project name already exists");
    }
    throw error;
}

    return project;
} 

export const getAllProjectByUserId = async function({userId}){
    if(!userId){
        throw new Error("UserId is required")
    }

    const allUserProjects = await projectModel.find({users: userId})

    return allUserProjects
}

export const addUsersToProject = async function({projectId, users, userId}){
    if(!projectId){
        throw new Error("ProjectId is required")
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if(!users){
        throw new Error("users are required") 
    }
    if (!Array.isArray(users)) {
        throw new Error("users must be an array")
    }
    for (const userId of users) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error(`Invalid userId in users array: ${userId}`)
        }
    }

    if(!userId){
        throw new Error("userId is required")
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new Error("Invalid userId")
    }

    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    if(!project){
        throw new Error("User not belong to this project")
    }

   const updatedProject = await  projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })

    return updatedProject
}

export const getProjectById = async function({projectId}){
    if(!projectId){
        throw new Error("projectId is required")
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findOne({_id: projectId}).populate('users')

    return project;
}

export const updateFileTree = async function({ projectId, fileTree }){
    if(!projectId){
        throw new Error("projectId is required")
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid projectId")
    }

    if(!fileTree){
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}