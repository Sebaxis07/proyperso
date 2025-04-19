// cliente/src/context/CartContext.jsx
import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (err) {
        console.error('Error al cargar el carrito:', err);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Actualizar total y contador de items cuando cambia el carrito
  useEffect(() => {
    // Calcular total
    const newTotal = cart.reduce((acc, item) => {
      return acc + (item.precio * item.cantidad);
    }, 0);
    
    // Calcular cantidad total de items
    const newItemCount = cart.reduce((acc, item) => {
      return acc + item.cantidad;
    }, 0);
    
    setTotal(newTotal);
    setItemCount(newItemCount);
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Agregar producto al carrito
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = prevCart.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad si ya existe
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          cantidad: updatedCart[existingItemIndex].cantidad + quantity
        };
        return updatedCart;
      } else {
        // Agregar nuevo item al carrito
        return [...prevCart, { ...product, cantidad: quantity }];
      }
    });
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item._id === productId) {
          return { ...item, cantidad: quantity };
        }
        return item;
      });
    });
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;