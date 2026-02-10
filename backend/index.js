import dotenv from "dotenv";
dotenv.config();
import express from 'express'
import studentRouter from './routes/student.js'
import loginRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'
import teacherRouter from './routes/teacher.js'
import cookieParser from "cookie-parser"


async function startServer()
{
    
    const app = express()
    app.use(express.json());
    app.use(cookieParser());

    app.get('/',(req,res)=>{
        res.send("Server is ready")
    })

    

    //routes 
    app.use("/login" , loginRouter)
    app.use("/student" , studentRouter)
    app.use("/admin" , adminRouter)
    app.use("/teacher", teacherRouter)
    

    
    const port = process.env.PORT || 3000
    app.listen(port,()=>{
        console.log(`Server at http://localhost:${port}`)
    })



}

startServer();