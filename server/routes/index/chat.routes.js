import {Router} from "express";
// import { chats } from "../../controllers/chat.controllers.js";
import { geminiAi } from "../../services/geminiApi.js";
import { verifyJwt } from "../../middleware/verifyJwt.js";
import { conversation } from "../../controllers/conversation.controllers.js";

const router=Router();
router.post("/chat",verifyJwt,geminiAi);
router.get("/conversation",verifyJwt,conversation);


export default router;