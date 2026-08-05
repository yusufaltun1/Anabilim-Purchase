import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

/** Eski yol: /transfer-detail/:id → /transfers/:id */
export default function TransferDetailRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const href = `/transfers/${id}` as Href;
  return <Redirect href={href} />;
}
