import { Suspense } from 'react';
import { destinations } from '../../data/destinations';
import ExploreClient from '../../components/explore/ExploreClient';
export default function ExplorePage() { return <Suspense fallback={<main className="explore-page"><p>Loading destinations…</p></main>}><ExploreClient destinations={destinations} /></Suspense>; }
