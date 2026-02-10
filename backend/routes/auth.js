//generates token for users
import express from 'express';
import bcrypt from "bcrypt";
import pool from "../config/connect_db.js";
import jwt from 'jsonwebtoken'


const router = express.Router()


//login creates access and refresh token
router.post("/", async(req,res)=>
{
    try{

    const {email ,password} =req.body

    if(!email || !password)
    {
        return res.status(400).json({ message: "Email and password required"})
    }

    //first checks teacher db
    const [teacherRows] = await pool.execute(
        `SELECT teacher_id , password ,role FROM teachers WHERE email = ?`,
        [email]
    )

    //if email exists in teacher db
    if(teacherRows.length > 0)
    {
        const teacher = teacherRows[0]
        const match = await bcrypt.compare(password, teacher.password)

        if(!match)
        {
            return res.status(401).json({message : "Invalid credentials"})
        }

        const userId = teacher.teacher_id;
        const userType = "faculty";

        const accessToken = jwt.sign(
            {
            userId ,
            role : teacher.role,
            userType 
            },
            process.env.JWT_SECRET,
            { expiresIn : "30m"}
        )

        const refreshToken = jwt.sign(
            { userId ,
              userType 
            },
            process.env.REFRESH_SECRET,
            { expiresIn: "7d" }
          );
          // Delete old refresh tokens on login
          // await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ? AND user_type = ?',
          // [userId ,userType])

          await pool.execute(
            `INSERT INTO refresh_tokens (user_id, user_type,role, token, expires_at)
             VALUES (?, ?,?,?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
            [userId, userType,teacher.role, refreshToken]
          );
        
        //send the refreshtoken via secure path to cookie

        res.cookie("refreshToken" , refreshToken , {
          httpOnly : true ,
          secure : false ,
          sameSite : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })


        return res.json({ accessToken })
        
    }


    //else check in student db
    const [rows] = await pool.execute(
        `SELECT student_id, password FROM students WHERE email = ?`,
        [email]
    )

    //if email doesn't exist
    if(rows.length === 0){
        return res.status(401).json({ message: "Invalid credentials"})
    }

    //check password in db 
    const student = rows[0]
    const isMatch = await bcrypt.compare(password,student.password)
    if(!isMatch)
    {
        return res.status(401).json({ message: "Invalid credentials" })
    }

    const userId = student.student_id;
    const userType = "student";
    
    //if password exists and exists in db then generate JWT token for user
    const accessToken = jwt.sign(
            { 
            userId,
            role : "student",
            userType 
            },
            process.env.JWT_SECRET, 
            { expiresIn:'30m'}
    )

    const refreshToken = jwt.sign(
            {
            userId  ,
            userType 
           },
            process.env.REFRESH_SECRET,
            { expiresIn: "7d" }
      );

    await pool.execute(
        `INSERT INTO refresh_tokens (user_id, user_type,role, token, expires_at)
         VALUES (?, ?, ?,?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [userId, userType,"student", refreshToken]
      );
    
      //send refresh token in cookie via http
      res.cookie("refreshToken" , refreshToken , {
        httpOnly : true ,
        secure : false ,
        sameSite : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

    return res.json({ accessToken})

    }

    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }

})




//refresh the token
router.post("/refresh" ,async(req,res,) =>
{ 
     try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
        return res.status(401).json({ message: "Refresh token missing" })

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)

        const [rows] = await pool.execute(
        "SELECT user_id, user_type, role FROM refresh_tokens WHERE token = ?",
        [refreshToken]
        );

        if (rows.length === 0)
        return res.status(401).json({ message: "Invalid refresh token" })
        const session = rows[0];

        const newAccessToken = jwt.sign(
          {
            userId: session.user_id,
            role: session.role,        
            userType: session.user_type
          },
          process.env.JWT_SECRET,
          { expiresIn: "30m" }
        );
    
        res.json({ accessToken: newAccessToken });
    
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }


})



//logout

router.post("/logout", async (req, res) => {
  const  refreshToken  = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  await pool.execute(
    "DELETE FROM refresh_tokens WHERE token = ?",
    [refreshToken]
  );

  res.clearCookie("refreshToken");

  res.json({ message: "Logged out successfully" });
});



export default router