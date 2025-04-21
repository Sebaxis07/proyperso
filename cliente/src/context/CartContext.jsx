import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

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

  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => {
      return acc + (item.precio * item.cantidad);
    }, 0);
    
    const newItemCount = cart.reduce((acc, item) => {
      return acc + item.cantidad;
    }, 0);
    
    setTotal(newTotal);
    setItemCount(newItemCount);
    
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          cantidad: updatedCart[existingItemIndex].cantidad + quantity
        };
        return updatedCart;
      } else {
        return [...prevCart, { ...product, cantidad: quantity }];
      }
    });
  };

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

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

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