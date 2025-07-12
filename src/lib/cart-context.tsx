"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  getCartFromServer,
  addToServerCart,
  removeFromServerCart,
  clearServerCart,
} from "./cartApi" // Your API helper functions

// --- 1. TYPE DEFINITIONS (Fully written out) ---
interface CartItem {
  _id: string;
  cartItemId: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { cartItemId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { cartItemId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

interface CartContextType {
  state: CartState;
  loading: boolean;
  addToCart: (item: Omit<CartItem, "quantity" | "cartItemId">) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

// --- 2. HELPER & REDUCER (Fully written out) ---
const calculateNewState = (items: CartItem[]): CartState => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, itemCount, total };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item._id === action.payload._id && item.selectedSize === action.payload.selectedSize
      );
      const newItems = existingItem
        ? state.items.map((item) =>
            item._id === action.payload._id && item.selectedSize === action.payload.selectedSize
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        : [...state.items, action.payload];
      return calculateNewState(newItems);
    }
    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.cartItemId !== action.payload.cartItemId);
      return calculateNewState(newItems);
    }
    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.cartItemId === action.payload.cartItemId ? { ...item, quantity: action.payload.quantity } : item
      );
      return calculateNewState(newItems);
    }
    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 };
    case "LOAD_CART":
      return calculateNewState(action.payload);
    default:
      return state;
  }
};

// --- 3. THE UPGRADED PROVIDER ---
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const loadAndMergeCarts = async () => {
      setLoading(true);
      const guestCartItems: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");

      if (user) {
        try {
          if (guestCartItems.length > 0) {
            for (const guestItem of guestCartItems) {
              await addToServerCart(guestItem._id, guestItem.quantity, guestItem.selectedSize);
            }
            localStorage.removeItem("cart");
          }
          
          const serverCart = await getCartFromServer();

          // This filter prevents crashes if a product in the cart was deleted from the DB
          const serverItems = serverCart.items
            .filter((item: any) => item.product !== null) 
            .map((item: any): CartItem => ({
              _id: item.product._id,
              cartItemId: item._id,
              name: item.product.name,
              brand: item.product.brand,
              price: item.product.price,
              image: item.product.image,
              quantity: item.quantity,
              selectedSize: item.size,
            }));
          
          dispatch({ type: "LOAD_CART", payload: serverItems });

        } catch (err) {
          console.error("Failed to load or merge server cart:", err);
          dispatch({ type: "LOAD_CART", payload: guestCartItems });
        }
      } else {
        dispatch({ type: "LOAD_CART", payload: guestCartItems });
      }
      setLoading(false);
    };

    if (!authLoading) {
      loadAndMergeCarts();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items, user, loading]);

  // --- 4. ACTION FUNCTIONS ---
  const addToCart = async (item: Omit<CartItem, "quantity" | "cartItemId">) => {
    if (user) {
      try {
        const tempCartItemId = item._id + (item.selectedSize || '') + Date.now();
        const optimisticItem = { ...item, quantity: 1, cartItemId: tempCartItemId };
        dispatch({ type: "ADD_ITEM", payload: optimisticItem });
        await addToServerCart(item._id, 1, item.selectedSize);
        const serverCart = await getCartFromServer();
        const serverItems = serverCart.items
          .filter((item: any) => item.product !== null)
          .map((i: any): CartItem => ({ _id: i.product._id, cartItemId: i._id, name: i.product.name, brand: i.product.brand, price: i.product.price, image: i.product.image, quantity: i.quantity, selectedSize: i.size }));
        dispatch({ type: "LOAD_CART", payload: serverItems });
      } catch (err) {
        console.error("Failed to add to server cart:", err);
      }
    } else {
      const newItem = { ...item, quantity: 1, cartItemId: item._id + (item.selectedSize || '') + Date.now() };
      dispatch({ type: "ADD_ITEM", payload: newItem });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { cartItemId } });
    if (user) {
      try {
        await removeFromServerCart(cartItemId);
      } catch (err) {
        console.error("Failed to remove from server cart:", err);
      }
    }
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { cartItemId, quantity } });
    }
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR_CART" });
    if (user) {
      try {
        await clearServerCart();
      } catch (err) {
        console.error("Failed to clear cart on server:", err);
      }
    }
  };

  return (
    <CartContext.Provider value={{ state, loading, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// --- 5. THE HOOK ---
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}