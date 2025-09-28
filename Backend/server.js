import "dotenv/config"
import http from "http";
import app from "./app.js";
import {Server} from "socket.io"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import {generateResult} from "./services/ai.service.js";

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        
    }
});

io.use(async (socket, next) => {
    try{
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ];
        const projectId = socket.handshake.query.projectId;

        if(!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error("Invalid projectId"));
        }

        socket.project = await projectModel.findById(projectId);



        if (!token) {
            return next(new Error("Authentication error"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error("Authentication error"));
        }

        socket.user = decoded;

        next();
    }catch(error){
        next(error);
    }
    
})
io.on('connection', socket => {

    try{

    socket.roomId = socket.project._id.toString();

    console.log('a user connected');

    socket.join(socket.roomId);

    socket.on('project-message', async  data => {

        try{

        console.log('project-message', data);

        const message = data.message || data.text || '';

        const aiIsPresentInMessage = message && message.includes("@ai");

        if(aiIsPresentInMessage){

            const prompt = message.replace("@ai", "").trim();

            try {
                const result = await generateResult(prompt);

                let emitMessage;

                if (typeof result === 'object' && result.fileTree) {

                    socket.project.fileTree = { ...socket.project.fileTree, ...result.fileTree };
                    await socket.project.save();


                    let codeDisplay = '';
                    for (const [fileName, fileData] of Object.entries(result.fileTree)) {
                        codeDisplay += `\n\n**${fileName}:**\n\`\`\`\n${fileData.contents}\n\`\`\``;
                    }
                    emitMessage = (result.text || 'Code has been created/updated successfully.') + codeDisplay;
                } else {

                    emitMessage = typeof result === 'string' ? result : JSON.stringify(result);
                }

                io.to(socket.roomId).emit("project-message", {
                    message: emitMessage,
                    sender: { _id: "ai", email: "AI" },
                    createdAt: new Date()
                });

            } catch (error) {
                console.error('AI service error:', error.message);
                io.to(socket.roomId).emit('project-message', {
                    message: "Sorry, AI service is currently unavailable due to quota limits. Please try again later.",
                    sender: {
                        _id: "ai",
                        email: "AI",
                    }
                });
            }

            return;
        }

        io.to(socket.roomId).emit('project-message', data);
        } catch (err) {
        console.error("Error handling project-message:", err.message);
        socket.emit("project-error", { error: "Message failed to send" });
      }
    });
    


  socket.on('disconnect', () => { 
    try{
    console.log('user disconnected');
    socket.leave(socket.roomId);    
    socket.project = null;      
    socket.user = null; 
    } catch (err) {
        console.error("Disconnect error:", err.message);
      }
    });
     } catch (err) {
    console.error("Socket connection error:", err.message);
  }
});

server.listen(port, function(req, res){
    console.log(`server is running on ${port}`);
})