import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const [
        id,
        title,
        image_url,
        price,
        quantity,
      ] = await AsyncStorage.multiGet([
        '@GoMarketplace:id',
        '@GoMarketplace:title',
        '@GoMarketplace:image_url',
        '@GoMarketplace:price',
        '@GoMarketplace:quantity',
      ]);
      const data = [
        {
          id: id[1],
          title: title[1],
          image_url: image_url[1],
          price: price[1],
          quantity: quantity[1],
        },
      ];
      setProducts(data);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    await AsyncStorage.multiSet([
      ['@GoMarketplace:id', product.id],
      ['@GoMarketplace:title', product.title],
      ['@GoMarketplace:image_url', product.image_url],
      ['@GoMarketplace:price', JSON.stringify(product.price)],
    ]);
  }, []);

  const increment = useCallback(async id => {
    const item = products
      .filter(elements => elements.id === id)
      .map(items => ({
        ...items,
        quantity: items.quantity + 1,
      }));
    console.log(item[0]);
  }, []);

  const decrement = useCallback(async id => {
    const item = products
      .filter(elements => elements.id === id)
      .map(items => ({
        ...items,
        quantity: items.quantity - 1,
      }));
    console.log(item[0]);
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
