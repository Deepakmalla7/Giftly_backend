import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();

router.post("/register", (req, res) => userController.registerUser(req, res));
router.post("/login", (req, res) => userController.loginUser(req, res));

router.get("/", (req, res) => userController.getAllUsers(req, res));
router.get("/:id", (req, res) => userController.getUserById(req, res));
router.put("/:id", (req, res) => userController.updateUser(req, res));

export default router;
