'use client';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

export default function RegistryImage(props: ImageProps) { const [missing, setMissing] = useState(false); if (missing && process.env.NODE_ENV !== 'production') return <div className="image-pending" role="img" aria-label="Image pending"><span>Image pending</span></div>; return <Image {...props} onError={() => setMissing(true)} />; }
