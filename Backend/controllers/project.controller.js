import Project from "../models/project.model.js";
import projectModel from "../models/project.model.js"
import * as projectService from "../services/project.service.js"
import {validationResult} from "express-validator"
import userModel from "../models/user.model.js"
import {authUser} from "../middleware/auth.middleware.js"
import mongoose from "mongoose"

export const createProject = async function(req, res){
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

  try{
    const { name } = req.body;


    const loggedInUser = await userModel.findById(req.user._id);

    if (!loggedInUser) {
        return res.status(404).json({ error: "User not found" });
    }

    const userId = loggedInUser._id;

    const newProject = await projectService.createProject({ name, userId });
    return res.status(201).json({ project: newProject });


} catch(err){
        console.log(err);
        res.status(400).send(err.message);
    }
}

export const getAllProject = async function(req, res) {
  try {
    const loggedInUser = await userModel.findById(req.user._id);

    if (!loggedInUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const allUserProjects = await projectService.getAllProjectByUserId({
      userId: loggedInUser._id
    });

    return res.status(200)
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .json({
        projects: allUserProjects
      });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const addUserToProject = async function(req, res){
    try{
        const { projectId, userIds } = req.body;
        console.log("Adding users to project:", { projectId, userIds, userId: req.user._id });

        if(!projectId || !userIds || !Array.isArray(userIds)){
            console.log("Invalid request data");
            return res.status(400).json({message: "Project ID and a list of user IDs are required"})
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            console.log("Invalid projectId");
            return res.status(400).json({message: "Invalid project ID"})
        }

        for (const userId of userIds) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.log("Invalid userId:", userId);
                return res.status(400).json({message: "Invalid user ID"})
            }
        }

        const project = await Project.findById(projectId);
        if(!project){
            console.log("Project not found");
            return res.status(404).json({message: "Project not found"})
        }

        const existingUserIds = new Set(project.users.map(u => u.toString()));
        const newUserIds = userIds.filter(id => !existingUserIds.has(id));

        console.log("Existing users:", existingUserIds);
        console.log("New users to add:", newUserIds);

        if (newUserIds.length === 0) {
            console.log("No new users to add");
            return res.status(200).json({ message: "Users are already in the project", project });
        }

        project.users.push(...newUserIds);
        await project.save();

        const updatedProject = await Project.findById(projectId).populate('users', 'name email');

        console.log("Users added successfully");
        return res.status(200).json({message: "Users added successfully", project: updatedProject})
    }catch(err){
        console.error("Error adding users to project:", err);
        if (err.code === 11000) {
            return res.status(400).json({message: "Duplicate project name and users combination"})
        }
        return res.status(500).json({message: "Internal server error"})
    }
}

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;  
    const project = await Project.findById(projectId).populate("users", "email name");

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ project });
  } catch (err) {
    console.error("❌ Error in getProjectById:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const updateFileTree = async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }

  try{
    const {projectId, fileTree} = req.body;

    const project = await projectService.updateFileTree({
      projectId,
      fileTree
    })

    return res.status(200).json({
      project
    })
  }catch(err){
    console.log(err)
    res.status(400).json({ error: err.message})
  }
}