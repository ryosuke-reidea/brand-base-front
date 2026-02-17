import { getAllCreators } from '@/lib/db-queries';
import { CreatorsClient } from '@/components/creators-client';

export const revalidate = 60;

export default async function CreatorsPage() {
  const creators = await getAllCreators();

  return <CreatorsClient creators={creators} />;
}
