const bcrypt = require ("bcryptjs");
const UserModel = require("../models/User.model");
const { emit } = require("../config/db");

class UserController {
    static async getAllUsers(req, res){
        try{
            const users = await UserModel.findAll();
            return res.status(200).json({
                total:users.length,
                users,
            });
        }catch(err){
            console.error("GetAllUsers Error:", err.message);
            return res.status(500).json({
                message:"server error."
            });
        }
    }
    static async getUserById(req, res){
        try{
            const {id} = req.params;
            const user = await UserModel.findById(id);

            if(!user){
                return res.status(404).json({
                    message:"USER NOT FOUND "
                });
            }
            return res.status(200).json(user);
        }catch(err){
            console.error("GetUserById Error:", err.message);
            return res.status(500).json({
                message:"Server error"
            });
        }
    }
    static async createUser(req, res){
        try{
            const{name, email, password ,role}= role.
            body;
            if (!name || !email || !password || !role){
                return res.status(400).json({
                    message:"name, email, password and role are required."
                });
            }

            const validRoles = ["admin", "manager", "member"];
            if(!validRoles.includes(role)){
                return res.status(400).json({
                    message:"Role must be admin, manager, or member."
                });
            }
            if(password.length < 6 ){
                return res.status(400).json({
                    message:"Password must be at least 6 characters."
                });
            }
            const emailTaken = await UserModel.emailExists(email);
            if (emailTaken){
                return res.status(409).json({
                    message:"Email already exists."
                });
            }
            const hashedPasswod = await bcrypt.hash(password, 10);
            const newUserId = await UserModel.create({
                name , email, password:hashedPasswod, role
            });
            const newUser = await UserModel.findById(newUserId);
            return res.status(201).json({
                message:"user created  successfully.",
                user: newUser,
            });

        }catch(err){
            console.error("CreateUSer Error:", err.message);
            return res.status(500).json({
                message:"server error."
            });
        }
    }

    static async updateUser(req, res){
        try{
            const {id} = req.params;
            const {name, email, role, is_active} = req.body;

            const existingUser = await UserModel.findById(id);
            if(!existingUser){
                return res.status(404).json({
                    message:"User not found."
                });
            }

            if(role){
                const validRoles = ["admin", "manager", "member"];
                if(!validRoles.includes(role)){
                    return res.status(400).json({
                        message:"ROles must be admin, manager , or member."
                    });
                }
            }
            if (email && email !== existingUser.email){
                const emailTaken = await UserModel.emailExists(email);
                if(emailTaken){
                    return res.status(409).json({
                        message:"EMail already in use."
                    });
                }
            }
            await UserModel.update(id, {name, email, role, is_active});

            const updatedUser = await UserModel.findById(id);

            return res.status(200).json({
                message: "User updated successfully.",
                user: updatedUser,
            });

        } catch (err) {
            console.error("UpdateUser Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Cannot delete yourself
            if (parseInt(id) === req.user.id) {
                return res.status(400).json({ message: "You cannot deactivate your own account." });
            }

            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            await UserModel.softDelete(id);

            return res.status(200).json({ message: "User deactivated successfully." });

        } catch (err) {
            console.error("DeleteUser Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }
    static async changePassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters." });
            }

            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await UserModel.updatePassword(id, hashedPassword);

            return res.status(200).json({ message: "Password changed successfully." });

        } catch (err) {
            console.error("ChangePassword Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }
}

module.exports = UserController;