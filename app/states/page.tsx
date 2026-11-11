import Link from 'next/link';
import { states } from '../../data/states';
export default function StatesIndex() { return <main className="states-index"><h1>States and territories</h1>{(['state','union-territory'] as const).map((kind) => <section key={kind}><h2>{kind === 'state' ? 'States' : 'Union territories'}</h2><div>{states.filter((item) => item.kind === kind).map((item) => <Link href={`/states/${item.slug}`} key={item.slug}>{item.name}</Link>)}</div></section>)}</main>; }
