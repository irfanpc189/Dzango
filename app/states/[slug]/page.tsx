import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import StatePage from '../../../components/state/StatePage';
import { getState, states } from '../../../data/states';
export function generateStaticParams() { return states.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata { const state = getState(params.slug); return { title: state ? `${state.name} | DZÖNGA` : 'State | DZÖNGA', description: state?.intro }; }
export default function StateRoute({ params }: { params: { slug: string } }) { const state = getState(params.slug); if (!state) notFound(); return <StatePage state={state} />; }
