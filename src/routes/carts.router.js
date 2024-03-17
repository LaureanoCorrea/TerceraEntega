import { Router } from "express";
import cartsManagerMongo from "../dao/Mongo/cartsManagerMongo.js";
import { passportCall } from "../middleware/passportCall.js";
import UserManagerMongo from "../dao/Mongo/userManagerMongo.js";

const cartsRouter = Router();
const cartService = new cartsManagerMongo();
const userService = new UserManagerMongo();

cartsRouter.get("/cart", passportCall(["jwt", "github"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCartBy(userId); // Obtener el carrito del usuario actual
    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "El carrito especificado no existe",
      });
    }
    res.send({ cart }); // Devolver el carrito encontrado
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
});
         

cartsRouter.post("/cart/:productId", passportCall(["jwt", "github"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const quantity = req.body.quantity || 1;
    
    const cart = await userService.getUserCartBy(userId); 
    console.log('cart', newCart._id)
    console.log('user', userId)
    if (!cart) {
      const newCart = await cartService.createCart({ products: [] });
      // Asociar el carrito recién creado con el usuario
      await userService.updateUserCart(userId, newCart._id);
      // Agregar el producto al carrito
      newCart.products.push({ product: productId, quantity });
      await newCart.save(); // Guardar el carrito actualizado en la base de datos
      res.redirect(`/product-added/${productId}`); // Redirigir al usuario después de agregar el producto
    } else {
      // Si el carrito existe, simplemente agregar el producto al carrito
      cart.products.push({ product: productId, quantity });
      await cart.save(); // Guardar el carrito actualizado en la base de datos
      
      console.log(newCart)
      res.redirect(`/product-added/${productId}`); // Redirigir al usuario después de agregar el producto
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


cartsRouter.delete("/cart/remove/:productId", passportCall(["jwt", "github"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    await cartService.updateCart(userId, productId, -1);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
});
  
cartsRouter.delete("/cart/clear", passportCall(["jwt", "github"]), async (req, res) => {
  try {
    const userId = req.user.id;
    await cartService.deleteCart(userId);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
});
  
  export default cartsRouter;
  