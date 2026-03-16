import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerUser = async (req,res) => {
    try {
        const {name, email, password} = req.body;

        // 1️⃣ Check required fields
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"Please Provide All Required Fields"
            });
        }


        // 2️⃣ Check if user exists
        const existingUser = await User.findOne({email});

        if(existingUser){
            res.status(400).json({
                success: false,
                message: "User Already Exists With This email"
            });
        }

        // 3️⃣ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4️⃣ Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // 5️⃣ Send response
        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

export const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body;

        // 1️⃣ Check if email & password are provided
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please Provide Email and Password"
            });
        }

        // 2️⃣ Find user by email
        const user = await User.findOne({email});

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        // 3️⃣ Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        // 4️⃣ Generate JWT Token
        const token = jwt.sign(
            {
                id: user._id,
                name: user.name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user:{
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

