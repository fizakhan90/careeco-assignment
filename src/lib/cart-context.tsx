"use client"

import React, { createContext, useContext, useReducer, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  getCartFromServer,
  addToServerCart,
  removeFromServerCart,
  clearServerCart,
} from "./cartApi"
import api from "./api"

interface CartItem {
  _id: string
  name: string
  brand: string
  price: number
  image?: string
  quantity: number
  selectedColor?: string
  selectedSize?: string

}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addToCart: (item: Omit<CartItem, "quantity">) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
} | null>(null)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) =>
          item._id === action.payload._id &&
          item.selectedColor === action.payload.selectedColor &&
          item.selectedSize === action.payload.selectedSize
      )

      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map((item) =>
          item._id === action.payload._id &&
          item.selectedColor === action.payload.selectedColor &&
          item.selectedSize === action.payload.selectedSize
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
      } else {
        newItems = [...state.items, action.payload]
      }

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item._id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item._id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      )
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 }

    case "LOAD_CART": {
      const total = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      return { items: action.payload, total, itemCount }
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  const { user } = useAuth()

  // Load cart from backend (if logged in) or localStorage (guest)
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const serverCart = await getCartFromServer()

          const items = await Promise.all(
            serverCart.items.map(async (item: any) => {
              const res = await api.get(`/products/${item.product}`)
              const product = res.data
              return {
                _id: product._id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                image: product.image,
                quantity: item.quantity,
                selectedSize: item.size,
              }
            })
          )

          dispatch({ type: "LOAD_CART", payload: items })
        } catch (err) {
          console.error("Failed to load cart from server:", err)
        }
      } else {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          try {
            const cartItems = JSON.parse(savedCart)ck to Store

            dispatch({ type: "LOAD_CART", payload: cartItems })
          } catch (error) {
            console.error("Error loading cart from localStorage:", error)
          }
        }
      }
    }

    loadCart()
  }, [user])

  // Persist to localStorage only for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(state.items))
    }
  }, [state.items, user])

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    const newItem = { ...item, quantity: 1 }
    dispatch({ type: "ADD_ITEM", payload: newItem })

    if (user) {
      try {
        await addToServerCart(item._id, 1, item.selectedSize)
      } catch (err) {
        console.error("Failed to sync addToCart with server:", err)
      }
    }
  }

  const removeFromCart = async (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })

    if (user) {
      try {
        await removeFromServerCart(id)
      } catch (err) {
        console.error("Failed to remove from server cart:", err)
      }
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
      // 📝 Optionally: sync quantity update to backend if needed
    }
  }

  const clearCart = async () => {
    dispatch({ type: "CLEAR_CART" })
    if (user) {
      try {
        await clearServerCart()
      } catch (err) {
        console.error("Failed to clear cart on server:", err)
      }
    }
  }

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
