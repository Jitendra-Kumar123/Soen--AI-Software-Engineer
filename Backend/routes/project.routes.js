import {Router} from "express";
const router = Router();
import {body} from "express-validator";
import * as projectController from "../controllers/project.controller.js"
import * as authMiddleWare from "../middleware/auth.middleware.js"
import {authUser} from "../middleware/auth.middleware.js";

router.post("/create",
    authMiddleWare.authUser,
    body('name').isString().withMessage("Name is required"),
    projectController.createProject

)

router.get("/all", 
    authMiddleWare.authUser,
    projectController.getAllProject
)

router.put("/add-user",
    authMiddleWare.authUser,
    body('projectId').isString().withMessage("Project ID must be a string"),
    body('users').isArray({ min: 1 }).withMessage("Users must be a non-empty array"),
    body('users.*').isString().withMessage("Each user must be a string"),
    projectController.addUserToProject
)

router.get("/get-project/:projectId",
    authMiddleWare.authUser,
    projectController.getProjectById
)

router.put('/update-file-tree',
    authMiddleWare.authUser,
    body('projectId').isString().withMessage('ProjectId is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    projectController.updateFileTree
)

export default router;