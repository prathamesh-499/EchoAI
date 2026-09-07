import {Router} from "express";
// import { chats } from "../../controllers/chat.controllers.js";
import { chatAi } from "../../services/chatAi.js";
import { verifyJwt } from "../../middleware/verifyJwt.js";
import { conversation } from "../../controllers/conversation.controllers.js";
import { showChats } from "../../controllers/showChats.controllers.js";
import { deleteConversation } from "../../controllers/deleteConversation.controllers.js";
import { renameConversationTitle } from "../../controllers/renameConversationTitle.controllers.js";
import { checkQuota, recordTokens } from "../../middleware/quotaLimit.js";
const router=Router();
router.post("/conversation",verifyJwt,checkQuota,chatAi,recordTokens);
router.get("/conversation",verifyJwt,conversation);
router.get("/conversation/:id",verifyJwt,showChats);
router.post("/conversation/:id/rename",verifyJwt,renameConversationTitle);
router.delete("/conversation/:id",verifyJwt,deleteConversation);


export default router;