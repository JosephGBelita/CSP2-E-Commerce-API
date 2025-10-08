const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const crypto = require('crypto');

const User = require("../models/User");
const auth = require("../auth");
const { errorHandler } = auth;

module.exports.checkEmailExists = (req, res) => {
    if(req.body.email.includes("@")){
        return User.find({ email : req.body.email })
        .then(result => {
            if (result.length > 0) {
                return res.status(409).send({message: "Duplicate email found"});
            } else {
                return res.status(404).send({message: "No duplicate email found"});
            };
        })
        .catch(error => errorHandler(error, req, res));
    }
    else{
        res.status(400).send({message: "Invalid email format"});
    }
};

module.exports.registerUser = (req, res) => {
    if (!req.body.email.includes("@")){
        return res.status(400).send({ message: 'Invalid email format' });
    }
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({ message: 'Mobile number is invalid' });
    }
    else if (req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be atleast 8 characters long' });
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10),
            isAdmin: false
        })

        return newUser.save()
        .then((result) => res.status(201).send({
            message: 'User registered successfully',
            user: result
        }))
        .catch(error => errorHandler(error, req, res));
    }
};

module.exports.loginUser = (req, res) => {
    if(!req.body.email.includes("@")){
        return res.status(400).send({ error: "Invalid Email" });
    }

    return User.findOne({ email : req.body.email })
    .then(result => {
        if(result == null){
            return res.status(401).send({ error: "Email and password do not match" });
        } else {
            const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
            if (isPasswordCorrect) {
                return res.status(200).send({ 
                    access : auth.createAccessToken(result)
                })
            } else {
                return res.status(401).send({ error: "Email and password do not match" });
            }
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .then(user => {
        if(!user){
            return res.status(404).send({ error: "User not found" });
        } else {
            user.password = "";
            return res.status(200).send({ user });
        }  
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const { id } = req.user;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).send({ error: "Password must be at least 8 characters long" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.findByIdAndUpdate(id, { password: hashedPassword });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, mobileNo } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, mobileNo },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

module.exports.updateUserAsAdmin = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ 
                error: "Failed in Find", 
                details: {
                    stringValue: `"${userId}"`,
                    valueType: "string",
                    kind: "ObjectId",
                    value: userId,
                    path: "_id",
                    reason: {},
                    message: `Cast to ObjectId failed for value "${userId}" (type string) at path '_id' for model 'User'`
                }
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isAdmin: true },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({ error: "User not Found" });
        }

        res.status(200).send({
            updateUser: updatedUser
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send({ 
                error: "Failed in Find", 
                details: error
            });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to set user as admin' });
    }
};

module.exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: 'No image file uploaded' 
            });
        }

        const imageUrl = `/images/profile/${req.file.filename}`;
    
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profileImage: imageUrl },
            { new: true }
        );
        
        updatedUser.password = undefined;
        
        res.json({ 
            success: true, 
            imageUrl: imageUrl,
            user: updatedUser,
            message: 'Profile image updated successfully'
        });
        
    } catch (error) {
        console.error('Profile upload error details:', error);
        
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'Image must be less than 2MB' 
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

module.exports.getAllUsers = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).send({ error: 'Access forbidden. Admin only.' });
        }

        const users = await User.find({}, { password: 0 });
        res.status(200).send(users);
    } catch (error) {
        errorHandler(error, req, res);
    }
};

module.exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).send({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        
        const responseMessage = 'If the email exists, a password reset link has been sent';
        
        if (!user) {
            return res.status(200).send({ 
                message: responseMessage 
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        return res.status(200).send({ 
            message: responseMessage,
            resetToken: resetToken,
            resetUrl: `http://localhost:3000/reset-password/${resetToken}`,
            userId: user._id,
            userEmail: user.email
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(200).send({ 
            message: 'If the email exists, a password reset link has been sent'
        });
    }
};

module.exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).send({ error: 'Password must be at least 8 characters long' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({ error: 'Invalid or expired reset token' });
        }

        user.password = bcrypt.hashSync(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).send({ 
            message: 'Password reset successfully',
            email: user.email
        });

    } catch (error) {
        console.error('Reset password error:', error);
        errorHandler(error, req, res);
    }
};