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
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const teste: Product[] = [];
      await AsyncStorage.setItem('@GoMarketPlace:cart', JSON.stringify(teste));
      const cart = await AsyncStorage.getItem('@GoMarketPlace:cart');

      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists =
        products.findIndex(productInCart => productInCart.id === product.id) >=
        0;

      if (productExists) {
        increment(product.id); //eslint-disable-line
        return;
      }

      const newProduct = { ...product, quantity: 1 } as Product;

      setProducts([...products, newProduct]);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(products),
      );
    },
    [increment, products], //eslint-disable-line
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const incrementProducts = products.map(
        product =>
          product.id === id
            ? { ...product, quantity: product.quantity + 1 }
            : product,
        //   id: product.id,
        //   title: product.title,
        //   image_url: product.image_url,
        //   price: product.price,
        //   quantity: product.quantity + 1,
        // }
        // : product,
      );

      setProducts(incrementProducts);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(incrementProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      console.log(id); //eslint-disable-line
      console.log(products); //eslint-disable-line
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const decrementProducts = products.map(p => p);

      const productIndex = products.findIndex(
        productInCart => productInCart.id === id,
      );

      const actualQuantity = decrementProducts[productIndex].quantity;

      if (actualQuantity === 1) {
        decrementProducts.splice(productIndex, 1);
        return;
      }

      decrementProducts[productIndex].quantity -= 1;

      console.log(decrementProducts); //eslint-disable-line
      setProducts(decrementProducts);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(decrementProducts),
      );
    },
    [products],
  );

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
