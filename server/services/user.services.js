const userModel = require("../models/user.model");

const getUserById = async(id, res) =>{

    const user = await userModel.findById(id);
    res.status(201).json({
        success: true,
        user,
    })
};

module.exports = {
    getUserById,
}

