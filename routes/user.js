const express = require("express");
const userController = require("../controllers/user");
const { verify, verifyAdmin } = require("../auth");
const { uploadProfileImage } = require("../config/multer");

const router = express.Router();

router.post("/check-email", userController.checkEmailExists);
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/details", verify, userController.getProfile);
router.put('/update-password', verify, userController.updatePassword);
router.put('/profile', verify, userController.updateProfile);
router.patch("/:id/set-as-admin", verify, verifyAdmin, userController.updateUserAsAdmin);
router.post("/upload-profile-image", verify, uploadProfileImage.single('profileImage'), userController.uploadProfileImage);
router.get("/all", verify, verifyAdmin, userController.getAllUsers);

router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

module.exports = router;