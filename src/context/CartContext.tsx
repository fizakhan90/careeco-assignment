"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getCartFromServer,
  addToServerCart,
  removeFromServerCart,
  clearServerCart,
  applyCouponToServer, 
} from "../lib/cartApi";


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
  itemCount: number;
  total: number; 
  discount: number;
  couponCode: string | null;
  finalTotal: number; 
  couponError: string | null;
}

type CartAction =
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { cartItemId: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { cartItemId: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | {
      type: "APPLY_COUPON_SUCCESS";
      payload: { discount: number; discountedTotal: number; code: string };
    }
  | { type: "APPLY_COUPON_FAIL"; payload: { error: string } }
  | { type: "REMOVE_COUPON" };

interface CartContextType {
  state: CartState;
  loading: boolean;
  addToCart: (item: Omit<CartItem, "quantity" | "cartItemId">) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  const calculateTotals = (items: CartItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, itemCount };
  };

  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) =>
          item._id === action.payload._id &&
          item.selectedSize === action.payload.selectedSize
      );
      const newItems = existingItem
        ? state.items.map((item) =>
            item._id === action.payload._id &&
            item.selectedSize === action.payload.selectedSize
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        : [...state.items, action.payload];

      const { total, itemCount } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        discount: 0,
        finalTotal: total,
        couponCode: null,
        couponError: null,
      };
    }
    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.cartItemId !== action.payload.cartItemId
      );
      const { total, itemCount } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        discount: 0,
        finalTotal: total,
        couponCode: null,
        couponError: null,
      };
    }
    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.cartItemId === action.payload.cartItemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const { total, itemCount } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        discount: 0,
        finalTotal: total,
        couponCode: null,
        couponError: null,
      };
    }
    case "LOAD_CART": {
      const { total, itemCount } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        total,
        itemCount,
        finalTotal: total,
        discount: 0,
        couponCode: null,
        couponError: null,
      };
    }

    case "APPLY_COUPON_SUCCESS":
      return {
        ...state,
        discount: action.payload.discount,
        finalTotal: action.payload.discountedTotal,
        couponCode: action.payload.code.toUpperCase(),
        couponError: null,
      };
    case "APPLY_COUPON_FAIL":
      return { ...state, couponError: action.payload.error };
    case "REMOVE_COUPON":
      return {
        ...state,
        discount: 0,
        finalTotal: state.total,
        couponCode: null,
        couponError: null,
      };

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        itemCount: 0,
        discount: 0,
        finalTotal: 0,
        couponCode: null,
        couponError: null,
      };
    default:
      return state;
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    discount: 0,
    finalTotal: 0,
    couponCode: null,
    couponError: null,
  });
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        try {
          const serverCart = await getCartFromServer();
          const items = serverCart.items
            .filter((item: any) => item.product)
            .map((item: any) => ({
              _id: item.product._id,
              cartItemId: item._id,
              name: item.product.name,
              brand: item.product.brand,
              price: item.product.price,
              image: item.product.image,
              quantity: item.quantity,
              selectedSize: item.size,
            }));
          dispatch({ type: "LOAD_CART", payload: items });
        } catch (err) {
          console.error("Failed to load cart from server:", err);
        }
      } else {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          dispatch({ type: "LOAD_CART", payload: JSON.parse(savedCart) });
        }
      }
      const couponData = localStorage.getItem("appliedCoupon");
      if (couponData) {
        try {
          const parsed = JSON.parse(couponData);
          dispatch({
            type: "APPLY_COUPON_SUCCESS",
            payload: {
              code: parsed.code,
              discount: parsed.discount,
              discountedTotal: parsed.finalTotal,
            },
          });
        } catch (err) {
          console.error("Failed to load coupon from localStorage:", err);
        }
      }

      setLoading(false);
    };
    if (!authLoading) {
      loadCart();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (state.couponCode) {
      const couponData = {
        code: state.couponCode,
        discount: state.discount,
        finalTotal: state.finalTotal,
      };
      localStorage.setItem("appliedCoupon", JSON.stringify(couponData));
    } else {
      localStorage.removeItem("appliedCoupon");
    }
  }, [state.couponCode, state.discount, state.finalTotal]);

  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items, user, loading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { couponCode, discount, finalTotal } = state;
      const couponData = { couponCode, discount, finalTotal };
      localStorage.setItem("couponInfo", JSON.stringify(couponData));
    }
  }, [state.couponCode, state.discount, state.finalTotal]);

  const applyCoupon = async (code: string) => {
    dispatch({ type: "APPLY_COUPON_FAIL", payload: { error: "" } }); 
    if (!user) {
      dispatch({
        type: "APPLY_COUPON_FAIL",
        payload: { error: "You must be logged in to apply coupons." },
      });
      return;
    }
    if (state.items.length === 0) {
      dispatch({
        type: "APPLY_COUPON_FAIL",
        payload: { error: "Cannot apply coupon to an empty cart." },
      });
      return;
    }
    try {
      const data = await applyCouponToServer(code, state.total);
      dispatch({ type: "APPLY_COUPON_SUCCESS", payload: { ...data, code } });
    } catch (err: any) {
      dispatch({ type: "APPLY_COUPON_FAIL", payload: { error: err.message } });
    }
  };

  const removeCoupon = () => {
    dispatch({ type: "REMOVE_COUPON" });
  };

  const addToCart = async (item: Omit<CartItem, "quantity" | "cartItemId">) => {
    if (user) {
      try {
        const response = await addToServerCart(item._id, 1, item.selectedSize);
        const newCartItem = response.items?.[response.items.length - 1];
        const newItem = { ...item, quantity: 1, cartItemId: newCartItem._id };
        dispatch({ type: "ADD_ITEM", payload: newItem });
      } catch (err) {
        console.error("Failed to sync addToCart with server:", err);
      }
    } else {
      const newItem = {
        ...item,
        quantity: 1,
        cartItemId: item._id + Date.now().toString(),
      };
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
    <CartContext.Provider
      value={{
        state,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
