import cartsModel from "../models/carts.model.js";
import { ObjectId } from "mongodb";

class CartManagerMongo {

    constructor() {
        this.cartsModel = cartsModel;
    }

    async getCarts() {
        try {
            return await this.cartsModel.find({});
        } catch (error) {
            throw new Error('Error al obtener los carritos');
        }
    }

    async getCartBy(userId) {
        try {
          const cart = await this.cartsModel.findOne({ userId: userId });
          if (!cart) {
            throw new Error("Cart not found for user");
          }
          return cart;
        } catch (error) {
          throw new Error(`Error getting cart: ${error.message}`);
        }
      }
      
    
    // async getCartLean(userId) {
    //     try {
    //         const cart = await this.cartsModel.findOne({ userId: userId }).lean();
    //         if (!cart) {
    //           throw new Error("Cartlean not found for user");
    //         }
    //         return cart;
    //       } catch (error) {
    //         throw new Error(`Error getting cart: ${error.message}`);
    //       }
    //     }

    async createCart(newCart) {
        try {
            const cart = await this.cartsModel.create(newCart);
            return cart;
        } catch (error) {
            throw new Error('Error al crear el carrito');
        }
    }

    async addProductToCart(cartId, productId, quantity) {
        try {
            let cart = await this.cartsModel.findById(cartId);
            if (!cart) {
                cart = await this.cartsModel.create({ _id: cartId, products: [] });
            }
            const existingProductIndex = cart.products.findIndex(item => item.product.toString() === productId);
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;
            } else { 
                cart.products.push({ product: productId, quantity });
            }
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error('Error al agregar el producto al carrito: ' + error.message);
        }
    }

    async updateCart(cartId, cartData) {
        try {
            return await this.cartsModel.findByIdAndUpdate(cartId, cartData, { new: true });
        } catch (error) {
            throw new Error('Error al actualizar el carrito');
        }
    }

    async deleteCart(cid) {
        try {
            return await this.cartsModel.findByIdAndDelete(cid);
        } catch (error) {
            throw new Error('Error al eliminar el carrito');
        }
    }
}

export default CartManagerMongo;



//     async getCarts() {
//         try {
//             return await this.cartsModel.find({});
//         } catch (error) {
//             throw new Error('Error al obtener los carritos');
//         }
//     }

//     async getCartBy(filter) {
//         try {
//           const cart = await this.cartsModel.findOne(filter);
//           if (!cart) {
//             throw new Error("Cart not found for user");
//           }
//           return cart;
//         } catch (error) {
//           throw new Error(`Error getting cart: ${error.message}`);
//         }
//       }
      
    
//     // async getCartLean(userId) {
//     //     try {
//     //         const cart = await cartsModel.findOne({ userId: userId }).lean();
//     //         if (!cart) {
//     //           throw new Error("Cartlean not found for user");
//     //         }
//     //         return cart;
//     //       } catch (error) {
//     //         throw new Error(`Error getting cart: ${error.message}`);
//     //       }
//     //     }

//     async createCart(newCart) {
//         try {
//           return await this.cartsModel.create(newCart);
//         } catch (error) {
//           console.error('Error al crear el carrito:', error);
//           throw new Error('Error al crear el carrito');
//         }
//       }

//     async addProductToCart(cartId, productId, quantity) {
//         try {
//             let cart = await this.cartsModel.findById(cartId);
//             if (!cart) {
//                 cart = await this.cartsModel.create({ _id: cartId, products: [] });
//             }
//             const existingProductIndex = cart.products.findIndex(item => item.product.toString() === productId);
//             if (existingProductIndex !== -1) {
//                 cart.products[existingProductIndex].quantity += quantity;
//             } else { 
//                 cart.products.push({ product: productId, quantity });
//             }
//             await cart.save();
//             return cart;
//         } catch (error) {
//             throw new Error('Error al agregar el producto al carrito: ' + error.message);
//         }
//     }

//     async updateCart(cid, cartToUpdate) {
//         try {
//             return await this.cartsModel.findByIdAndUpdate(cid, cartToUpdate, { new: true });
//         } catch (error) {
//             throw new Error('Error al actualizar el carrito');
//         }
//     }

//     async deleteCart(cid) {
//         try {
//             return await this.cartsModel.findByIdAndDelete(cid);
//         } catch (error) {
//             throw new Error('Error al eliminar el carrito');
//         }
//     }
// }

// export default CartManagerMongo;