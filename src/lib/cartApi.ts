import api from "./api"

export const getCartFromServer = async () => {
  const res = await api.get("/cart")
  return res.data
}

export const addToServerCart = async (productId: string, quantity: number, size?: string) => {
  const res = await api.post("/cart", { productId, quantity, size })
  return res.data
}

export const removeFromServerCart = async (itemId: string) => {
  const res = await api.delete(`/cart/${itemId}`)
  return res.data
}

export const clearServerCart = async () => {
  const res = await api.delete("/cart")
  return res.data
}

export const applyCouponToServer = async (code: string, cartTotal: number) => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await api.post('/coupons/apply', 
      { code, cartTotal },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Coupon application failed');
  }
};