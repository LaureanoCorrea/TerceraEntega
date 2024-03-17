import { Router } from "express";
import userManagerMongo from "../dao/Mongo/userManagerMongo.js";
import { createHash, isValidPassword } from "../utils/hashBcrypt.js";
import { generateToken } from "../utils/jsonwebtoken.js";
import { passportCall } from "../middleware/passportCall.js";
import authorization from "../middleware/authentication.middleware.js";
import CartManagerMongo from "../dao/Mongo/cartsManagerMongo.js";

const router = Router();
const userService = new userManagerMongo();
const cartService = new CartManagerMongo();

//passport ----------------------------

router.post("/register", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await userService.getUser({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Crear el nuevo usuario
    const newUser = await userService.createUsers({
      first_name,
      last_name,
      email,
      date_of_birth: req.body.date_of_birth,
      password: createHash(password),
    });

    // Crear un carrito de compras asociado al nuevo usuario
    const newCart = await cartService.createCart({ userId: newUser._id });
    // Actualizar el usuario con el ID del carrito
    await userService.updateUser(newUser._id, { cartId: newCart._id });
    console.log('sesion-cart', newCart._id)
    res.status(201).render("exito", { name: newUser.first_name });
    } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getUserBy({ email });
    if (!user || !isValidPassword({ password: user.password }, password))
      return res.status(401).send("Credenciales inválidas");

    const token = generateToken({
      first_name: user.first_name,
      id: user._id,
      role: user.role,
    });
    res.cookie("cookieToken", token, {
      maxAge: 60 * 60 * 1000 * 24,
      httpOnly: true,
    });
    res.redirect("/products");
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).send("Error (products) interno del servidor");
  }
});

router.get("/faillogin", (req, res) => {
  res.send({ status: "error", message: "Login Fails" });
});

router.get("/logout", (req, res) => {
  res.clearCookie("cookieToken");
  res.redirect("/login");
});

// github ----------------------------

router.get(
  "/github",
  passportCall("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

router.get(
  "/githubcallback",
  passportCall("github", {
    failureRedirect: "/api/sessions/login",
  }),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).send("No autorizado");
    }

    res.redirect("/products");
  }
);

//current ----------------------------

router.get(
  "/current",
  passportCall(["jwt", "github"]),
  authorization(["admin", "user"]),
  async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res
          .status(401)
          .send({ status: "error", message: "Usuario no autenticado" });
      }
      const userName = req.user.first_name;
      res.send({
        status: "success",
        message: "Usuario autenticado",
        user: userName,
      });
    } catch (error) {
      console.error("Error al obtener el nombre de usuario:", error);
      res
        .status(500)
        .send({ status: "error", message: "Error interno del servidor" });
    }
  }
);

export default router;
