import dotenv from "dotenv";
dotenv.config();
import express from 'express'
import studentRouter from './routes/student.js'
import loginRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'
import teacherRouter from './routes/teacher.js'
import cookieParser from "cookie-parser"
import cors from "cors"


import { createServer } from 'http';
import { Server } from 'socket.io';

async function startServer() {

    const app = express()
    const server = createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    // Make io accessible in routes
    app.set('io', io);
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        origin: process.env.FRONTEND_URL || true,
        credentials: true
    }));

    // Global Socket Emitter for DB Changes
    app.use((req, res, next) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            // Wait for the response to complete
            res.on('finish', () => {
                // Determine if it was successful
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const socketIo = req.app.get('io');
                    if (socketIo) {
                        socketIo.emit('db_change', { method: req.method, path: req.path });
                    }
                }
            });
        }
        next();
    });

    app.get('/', (req, res) => {
        res.send("Server is ready")
    })



    //routes 
    app.use("/login", loginRouter)
    app.use("/student", studentRouter)
    app.use("/admin", adminRouter)
    app.use("/teacher", teacherRouter)



    const port = process.env.PORT || 3000
    server.listen(port, () => {
        console.log(`Server at http://localhost:${port}`)
    })



}

startServer();