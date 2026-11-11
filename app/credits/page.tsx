import { images } from '../../data/images';

export default function CreditsPage() {
  return <main><header className="destination-hero dark"><a className="wordmark" href="/">DZ<span>Ö</span>NGA <b></b></a><p className="eyebrow">Image credits</p><h1>Made with<br/><em>care.</em></h1></header><section className="credits-grid">{Object.entries(images).map(([id, image]) => <article className="credit-card" key={id}><div className="credit-image" style={{ backgroundImage: `url(${image.file})` }} /><h2>{id}</h2><p>{image.alt}</p><p>{image.creator || 'Creator unknown'} · {image.status}</p><p><a href={image.licenseUrl || '#'}>Licence</a>{image.sourceUrl && <> · <a href={image.sourceUrl}>Source</a></>}</p></article>)}</section><footer className="footer dark"><a className="wordmark" href="/">DZ<span>Ö</span>NGA <b></b></a><p>Five treasures. Infinite India.</p></footer></main>;
}
