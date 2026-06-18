import {Router} from "express";
// import { chats } from "../../controllers/chat.controllers.js";
import { geminiAi } from "../../services/geminiApi.js";
import { verifyJwt } from "../../middleware/verifyJwt.js";
import { conversation } from "../../controllers/conversation.controllers.js";
import { showConversation } from "../../controllers/showChats.controllers.js";
import { deleteConversation } from "../../controllers/deleteConversation.controllers.js";
import { renameConversationTitle } from "../../controllers/renameConversationTitle.controllers.js";

const router=Router();
router.post("/conversation",verifyJwt,geminiAi);
router.get("/conversation",verifyJwt,conversation);
router.get("/conversation/:id",verifyJwt,showConversation);
router.post("/conversation/:id/rename",verifyJwt,renameConversationTitle);
router.delete("/conversation/:id",verifyJwt,deleteConversation);


export default router;