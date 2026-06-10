import {Router} from "express";
import { signup } from "../../controllers/signup.controllers.js";
import { login} from "../../controllers/login.controllers.js";
import {verifyJwt} from "../../middleware/verifyJwt.js"
import {auth} from "../../controllers/auth.js"
const router = Router();
router.post("/signup",signup);
router.post("/login",login);
router.get("/me",verifyJwt,auth); 

export default router;