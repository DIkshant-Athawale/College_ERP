import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  // HARD safety check (Express 5)
  if (!req || !req.headers) {
    return res.status(401).json({ message: "Invalid request object" });
  }

  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid auth format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); //REQUIRED

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}



export default authenticate
