import { verifyJWT } from "../utils/jwt.js";


const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  let authToken;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    authToken = authHeader.split(" ")[1];
  } else {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) return res.status(401).json({ message: "User not authenticated." });

    // Improved cookie parsing for multiple cookies
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=');
        return [key, v.join('=')];
      })
    );
    
    // Attempt to find token in commonly used cookie names
    authToken = cookies.authtoken || cookies.token || cookies.authToken;
  }

  // Prevent processing "null" or "undefined" as strings which can happen with some frontend storage libs
  if (!authToken || authToken === "null" || authToken === "undefined") {
    console.warn(`[AUTH] Authentication failed: No valid token found in Header or Cookie. Header present: ${!!authHeader}, Cookie present: ${!!req.headers.cookie}`);
    return res.status(401).json({ message: "No valid authentication token provided." });
  }

  try {
    // Debugging 'jwt malformed'
    const tokenParts = authToken.split('.');
    if (tokenParts.length !== 3) {
       console.error(`[AUTH] Malformed JWT: Expected 3 parts, got ${tokenParts.length}. Token length: ${authToken.length}.`);
       console.error(`[AUTH] Token Start: "${authToken.substring(0, 15)}..." End: "...${authToken.substring(authToken.length - 15)}"`);
    }

    const data = await verifyJWT(authToken);
  
    req.user = data;
    // Keep internal logging minimal in production-like environments
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] Success: ${req.user.username || req.user.email || req.user._id} (${req.user.roles?.join(',')})`);
    }
     
    next();
  } catch (error) {
    console.error(`[AUTH] JWT Verification Failed [${error.name}]: ${error.message}`);
    // Log the suspect token if it's malformed
    if (error.name === 'JsonWebTokenError' && error.message === 'jwt malformed') {
       console.error(`[AUTH] Suspect Token: "${authToken}"`);
    }
    res.status(401).json({ message: "Invalid or expired auth token.", error: error.message });
  }
};

export default auth;