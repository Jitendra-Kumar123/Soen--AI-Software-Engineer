import express from "express";
const app = express();
import morgan from "morgan";
import connect from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import projectRoutes from "./routes/project.routes.js"
import aiRoutes from "./routes/ai.routes.js"

connect();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors());

app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);

app.get("/", function(req, res){
    res.send("hey");
})

export default app 