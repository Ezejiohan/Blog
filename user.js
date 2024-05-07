const UserModel = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SendEmail } = require('../utilities/nodemailer');

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
            const newUser = await UserModel.create(userData);

            const verificationLink = req.protocol + '://' + req.get("host") + '/api/users/' + newUser._id;
            const message = `Thanks for registring on our Blog. kindly click this link ${verificationLink} to verify your account`;

            SendEmail({
                email: newUser.email,
                subject: "verify your account",
                message
            });
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

const verify = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.verified === true) {
            return res.status(400).json({
                message: "User already verified"
            });
        }
        user.verified = true;
        await user.save();

        res.status(200).json({
            message: 'User verification successful',
            data: user
        })
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
        });
    }
};

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
                }, process.env.TOKEN, { expiresIn: "30 mins" });

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
    }
};

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
            message: error.message
        })
    }
};

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
            message: error.message
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await UserModel.findOne({ email: req.user.email });

        const comparePassword = await bcrypt.compare(oldPassword, user.password);
        if (comparePassword !== true) {
            return res.status(404).json({
                message: "Password Incorrect"
            });
        }
        const saltPassword = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(newPassword, saltPassword);

        if (newPassword === oldPassword) {
            return res.status(404).json({
                message: "Unathorized"
            });
        }

        user.password = hashPassword;
        await user.save();

        SendEmail({
            email: user.email,
            subject: 'Password change alert',
            message: 'You have changed your password. If you are not the one, alert us.'
        })

        const result = {
            fullname: user.fullname,
            username: user.username,
            email: user.email
        }

        return res.status(200).json({
            message: "Password changed successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username
        }, process.env.Token)

        const passwordChangeLink = `${req.protocol}://${req.get("host")}/api/users/change_password/${user._id}/${token}`;
        const message = `Click this link: ${passwordChangeLink} to set a new password`;

        SendEmail({
            email: user.email,
            subject: 'Forget password link',
            message
        });

        res.status(200).json({
            message: "Email has been sent"
        });
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const user = await UserModel.findOne({ id: req.param.id });
         if (!user) {
            return res.status(403).json({
                message: 'User not found'
            });
         }

         if (newPassword !== confirmPassword) {
            return res.status(403).json({
                message: 'There is difference in both password'
            })
         }

         const saltPassword = bcrypt.genSaltSync(10);
         const hashPassword = bcrypt.hashSync(newPassword, saltPassword);

         const updatePassword = await UserModel.findByIdAndUpdate(req.params.id, {
            password: hashPassword
         });

         res.status(200).json({
            message: 'Password updated successfully',
            data: updatePassword
         });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    registerUsers,
    verify,
    loginUsers,
    retrieveUser,
    updateUsername,
    userPool,
    deactivateUsers,
    changePassword,
    forgotPassword,
    resetPassword
}