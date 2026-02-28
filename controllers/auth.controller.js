const bcrypt = require("bcryptjs");
const jwt = require ("jsonwebtoken");

const UserModel = require ("../models/User.model");
const { use } = require("react");


class AuthController {

     static async login(req, res){
        try{
            const {email, password} = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    message:"EMAIL AND PASSWORD ARE REQUIRED"
                });
            }
            const user = await UserModel.findByEmail(email);
            if(!user){
                return res.status(401).json({
                    message:"INVALID EMAIL OR PASSWORD."
                });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(401).json({
                    message:"INVALID PASSWORD, TRY AGAIN"
                });   
            }
            const token = jwt.sign({
                id: user.id,
                name:user.name,
                email:user.email,
                role:user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_SECRET_IN || "7d"
            }
        );
            return res.status(200).json({
                message:"LOGIN SUCCESSFUL.",
                token,
                user:{
                    id: user.id,
                    name:user.name,
                    email:user.email,
                    role:user.role
                },
            });     
        }catch(err){
            console.error("LOGIN ERROR:", err.message);
            return res.status(500).json({
                message:"SERVER ERROR. PLEASE TRY AGAIN"
            });
        }
     }

     static async me(req, res){
        try{
            const user = await UserModel.findById(req.user.id);
            if(!user){
                return res.status(404).json({
                    message:"USER NOT FOUND"
                });
            }
            return res.status(200).json(user);
        }catch(err){
            console.error("ME ERROR:", err.message);
            return res.status(500).json({
                message:"SERVER ERROR . PLEASE TRY /AGAIN."
            });
        }
     }
}
module.exports = AuthController;