
import { AuthTokenPromotionInstance } from 'twilio/lib/rest/accounts/v1/authTokenPromotion.js';
import authService from '../services/authService.js';
import { createJWT } from '../utils/jwt.js';

const register = async (req, res) => {

    const input = req.body;

    if(!input.password){
        return res.status(400).json({message: "Password is required"});
    }
    if(!input.confirmPassword){
        return res.status(400).json({message: "Confirm password is required"});
    }
    if(input.password !== input.confirmPassword){
        return res.status(400).json({message: "Password and confirm password do not match"});
    }

    try{
        const data = await authService.register(input);
         const authtoken = createJWT(data);
        res.cookie("authtoken", authtoken,{maxAge: 86400 * 1000});

        res.status(201).json({ ...data, authtoken, message: "User registered successfully" });
     } catch(error){
      res.status(error.statusCode || 500).json({message: error.message});
}
}

const login = async (req, res) => {
    const input = req.body;
try{
    if(!input){
        return res.status(400).json({ message: "Input data is required" });
    }
 if (!input.password) {
        return res.status(400).json({ message: "Password is required" });
    }
 if (!input.email) {
        return res.status(400).json({ message: "Email is required" });
    }
 const data = await authService.login(input);
         // generate token
        const authtoken = createJWT(data);

        console.log('Generated authtoken in login:', authtoken);
        console.log('Data from service:', data);

        res.cookie("authtoken", authtoken,{maxAge: 86400 * 1000});

        /* const result = await verifyJWT(token);
        console.log(result);*/

        const response = {
            authtoken: authtoken,
            _id: data._id,
            username: data.username,
            email: data.email,
            roles: data.roles
        };
        console.log('Response being sent:', response);
        res.status(200).json(response);
        return;
    }catch(error){
        res.status(error.statusCode || 500).json({message: error.message});
    }
};
const forgetPassword = async (req, res) => {
    const { identifier, method, redirectUrl } = req.body;

    try {
        if (!identifier || !method) {
            return res.status(400).json({ message: "Identifier and method are required" });
        }
        const data = await authService.forgetPassword(identifier, method, redirectUrl);
        res.json(data);
        return;
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
const resetPassword = async (req, res) => {
    const input = req.body;
    const { code, userId } = req.body; // Expecting code and userId in body now
    try{
        if(!code || !userId){
            return res.status(400).json({ message: "Code and user id is required" });
        }
        if(!input.password){
            return res.status(400).json({ message: "Password is required" });
        }
        if(!input.confirmPassword){
            return res.status(400).json({ message: "Confirm password is required" });
        }
        if(input.password !== input.confirmPassword){
            return res.status(400).json({ message: "Password and confirm password do not match" });
        }
        const data = await authService.resetPassword(userId, code, input.password);
        res.json(data);
        return;
    }catch(error){
        res.status(error.statusCode || 500).json({message: error.message});
    }
};

const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }
        const data = await authService.googleLogin(token);
        const authtoken = createJWT(data);
        res.cookie("authtoken", authtoken, { maxAge: 86400 * 1000 });
        res.status(200).json({ ...data, authtoken });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Google login failed" });
    }
};

const logout = async (req, res) => {
    res.clearCookie('authtoken');
    res.json({ message: "Logout successful" });
    return;
};

const sendOTP = async (req, res) => {
    const { contactInfo, method } = req.body;
    try {
        if (!contactInfo || !method) {
            return res.status(400).json({ message: "Contact info and method are required" });
        }
        const data = await authService.requestOTP(contactInfo, method);
        res.json(data);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const verifyOTP = async (req, res) => {
    const { contactInfo, otp } = req.body;
    try {
        if (!contactInfo || !otp) {
            return res.status(400).json({ message: "Contact info and OTP are required" });
        }
        const data = await authService.verifyOTP(contactInfo, otp);
        res.json(data);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export default { register, login, forgetPassword, resetPassword, logout, googleLogin, sendOTP, verifyOTP };

