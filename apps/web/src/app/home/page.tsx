import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { HomeScreen } from '@/components/features/HomeScreen';

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect('/auth/sign-in');
  return <HomeScreen />;
}
