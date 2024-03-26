const UserModel = require ('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a User
const registerUsers = async (req, res) => {
    try {
       const saltPassword = bcrypt.genSaltSync(10);
       const hashPassword = bcrypt.hashSync(req.body.password, saltPassword);
       
       const userData = {
        fullname: req.body.fullname,
        username: req.body.username,
        email: req.body.email,
        password: hashPassword

       };
       const userExist = await UserModel.findOne({
        emai: req.body.email
       });
       
       if (userExist) {
        return res.status(403).json({
            message: "User already Exist"
        })
       } else {
        const newUser = await UserModel.create(userData)
        return res.status(200).json({
            message: "User registered Successful",
            data: newUser
        });
       }
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
          });
    }
};

// login User
const loginUsers = async (req, res) => {
    try {
      const loginRequest = {
        email: req.body.email,
        password: req.body.password
      };
      const user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
      } else {
        const correctPassword = await bcrypt.compare(loginRequest.password, user.password);
        if (correctPassword == false) {
            return res.status(401).json({
                message: "Incorrect email or Password"
            });
        } else {
            const generatedToken = jwt.sign({
                id: user._id,
                username: user.username,
                email: user.email
            }, "secretKey", {expiresIn: "30 mins"});

            const result = {
                id: user._id,
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                token: generatedToken
            }
            return res.status(200).json({
                message: "Login Successful",
                data: result
            });
        }
      }
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
          });
    };
};

// update a username
const updateUsername = async (req, res) => {
    try {
        const id = req.params.id
        const user = await UserModel.findById(id);
        if (!user) {
           return res.status(404).json({
                message: "User not found"
            });
        } else {
            const userData = {
                username: req.body.username
            };
            const updatedUsername = await UserModel.findByIdAndUpdate(id, userData, { new: true });
            return res.status(200).json({
                message: "Username Updated Successful",
                data: updatedUsername
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
          });
    }
};

// get a user
const retrieveUser = async (req, res) => {
    try {
        const user = await UserModel.findOne({ username: req.params.username });
        if (!user) {
           return res.status(404).json({
                message: "User not found"
            });
        } else {
           return res.status(200).json({
                status: "Success",
                data: user
            })
        }
    } catch (error) {
       return res.status(500).json({
            status: "Failed",
            message: error.message
          }); 
    }
};

// get all users
const userPool = async (req, res) => {
    try {
        const userPool = await UserModel.find();

        res.status(200).json({
            status: 'Success',
            numbersOfUsers: userPool.length,
            data: userPool
        });
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error
        })
    }
};

// delete user
const deactivateUsers = async (req, res) => {
    try {
        const user = await UserModel.findOne({ username: req.params.username });

        if (!user) {
           return res.status(404).json({
                message: "User not found",
            });
        } else {
            await UserModel.deleteOne({ username: req.params.username });
            return res.status(200).json({
                message: "User deleted Successful"
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error
        });
    }
};


 
module.exports = { registerUsers, loginUsers, retrieveUser, updateUsername, userPool, deactivateUsers}