import {Router} from "express";
import { login} from "../../controllers/login.controllers.js";
import {verifyJwt} from "../../middleware/verifyJwt.js"
import {auth} from "../../controllers/auth.js"
import { refreshToken } from "../../controllers/refreshToken.controllers.js";
import { logout } from "../../controllers/logout.controllers.js";
import { deleteAccount, updatePassword, updateUsername } from "../../controllers/profile.controllers.js";
import { EmailVerificationController, confirmEmailVerification } from "../../controllers/emailVerification.controllers.js";
const router = Router();
router.post("/login",login);
router.post("/logout",logout);
router.get("/me",verifyJwt,auth);
router.get("/refreshToken",refreshToken); 
router.post("/profile/username",verifyJwt,updateUsername);
router.post("/profile/password",verifyJwt,updatePassword);
router.delete("/profile",verifyJwt,deleteAccount);
router.post("/verify-email",EmailVerificationController);
router.post("/verify-email/otp",confirmEmailVerification);

export default router;
