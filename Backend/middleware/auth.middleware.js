import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async function(req, res, next){
    try{
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if(!token){
            return res.status(401).send({error: "Unauthorized user"});
        }

        try {
            const isBlackListed = await redisClient.get(token);
            if (isBlackListed) {
                res.cookie("token", "");
                return res.status(401).send({error: "Unauthorized user"});
            }
        } catch (redisErr) {
            console.warn("Redis unavailable, skipping blacklist check:", redisErr.message);
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("DECODED:", decoded);

            req.user = decoded;
            next();
        } catch (err) {
            console.log("JWT ERROR:", err.message);

            return res.status(401).send({ error: "Unauthorized user" });
        }
    } catch (error){
        res.status(401).send({error: "Unauthorized user"});
    }
}