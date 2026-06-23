import {Router} from "express";
import { signup } from "../../controllers/signup.controllers.js";
import { login} from "../../controllers/login.controllers.js";
import {verifyJwt} from "../../middleware/verifyJwt.js"
import {auth} from "../../controllers/auth.js"
import { refreshToken } from "../../controllers/refreshToken.controllers.js";
import { logout } from "../../controllers/logout.controllers.js";
const router = Router();
router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",verifyJwt,logout);
router.get("/me",verifyJwt,auth);
router.get("/refreshToken",refreshToken); 


export default router;