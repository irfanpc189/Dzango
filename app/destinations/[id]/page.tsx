import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { destinations, getDestination } from '../../../data/destinations';
import DestinationPage from '../../../components/destination/DestinationPage';
export function generateStaticParams() { return destinations.map(({ id }) => ({ id })); }
export function generateMetadata({ params }: { params: { id: string } }): Metadata { const d = getDestination(params.id); return d ? { title: `${d.title} — DZÖNGA`, description: d.tagline } : {}; }
export default function DestinationRoute({ params }: { params: { id: string } }) { const destination = getDestination(params.id); if (!destination) notFound(); return <DestinationPage destination={destination} />; }
