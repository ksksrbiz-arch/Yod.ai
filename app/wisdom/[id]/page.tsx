import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import Starfield from '@/components/Starfield';
import HolocronAvatar from '@/components/HolocronAvatar';
import { decodeWisdomId } from '@/lib/wisdom';
import WisdomCard from '@/components/WisdomCard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const payload = decodeWisdomId(id);
  if (!payload) {
    return { title: 'Wisdom not found' };
  }
  const title = `"${payload.q.slice(0, 80)}${payload.q.length > 80 ? '…' : ''}" — Master Yoda`;
  const description = 'A piece of wisdom shared through Yoda.ai — the only AI that makes you wiser.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function WisdomPage({ params }: PageProps) {
  const { id } = await params;
  const payload = decodeWisdomId(id);
  if (!payload) notFound();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-void-black">
      <Starfield density={70} />

      <header className="relative z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-2.5 h-2.5 rounded-full bg-sage-green shadow-[0_0_12px_#7FB069]" />
            <span className="font-headers font-semibold tracking-wide text-crystal-white">Yoda.ai</span>
          </Link>
          <Link href="/chat" className="btn-primary text-xs">
            Ask your own <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-8 pb-24 md:pt-16">
        <div className="text-center mb-10">
          <div className="inline-flex justify-center mb-6">
            <HolocronAvatar size={120} />
          </div>
          <p className="eyebrow mb-3">A piece of wisdom · shared</p>
          <h1 className="text-2xl md:text-3xl font-headers font-medium leading-tight text-crystal-white">
            From Master Yoda
          </h1>
        </div>

        <div className="surface p-6 md:p-8 mb-10">
          <WisdomCard quote={payload.q} variant="showcase" />
        </div>

        <div className="text-center surface p-10 md:p-14">
          <Sparkles size={20} className="text-wisdom-gold mx-auto mb-4" />
          <p className="eyebrow mb-3">Find your own wisdom</p>
          <h2 className="text-2xl md:text-3xl font-headers font-semibold headline mb-4">
            The path opens, when you ask.
          </h2>
          <p className="text-sage-green max-w-md mx-auto mb-7">
            Three free questions a day. No card. No wall. Step in. Ask the question you have been avoiding.
          </p>
          <Link href="/chat" className="btn-primary">
            Begin <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex items-center justify-between border-t border-white/5">
        <span className="text-xs text-sage-green/70">Yoda.ai · Wisdom, distilled.</span>
        <Link href="/" className="text-xs text-sage-green/60 hover:text-crystal-white transition">
          Home
        </Link>
      </footer>
    </div>
  );
}
