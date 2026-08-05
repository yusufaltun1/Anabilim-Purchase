import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

/** Eski menü linkleri için: /create-product → /products/create */
export default function CreateProductRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/products/create');
  }, [router]);

  return <View />;
}
