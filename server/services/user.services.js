const userModel = require("../models/user.model");

const getUserById = async(id, res) =>{

    const user = await userModel.findById(id);
    res.status(201).json({
        success: true,
        user,
    })
};

const getAllUsers = async(res) =>{

    const users = await userModel.find();
    res.status(200).json({
        success: true,
        users,
    });
};

module.exports = {
    getUserById,
    getAllUsers,
}

