import type { Metadata } from 'next';
import './globals.css';
import './destination.css';
import './destination-template.css';
import './intro-transition.css';
import './verified-facts.css';
import './image-fallback.css';
import { MotionProvider } from '../components/motion/MotionProvider';
import './states.css';
import './explore.css';

export const metadata: Metadata = {
  title: 'DZÖNGA — Five treasures. Infinite India.',
  description: 'An immersive treasury of India’s places, cultures, landscapes and stories.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><MotionProvider>{children}</MotionProvider></body></html>;
}
