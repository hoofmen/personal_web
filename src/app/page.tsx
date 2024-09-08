"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const GameEngine = dynamic(() => import('../components/GameEngine'), { ssr: false });

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="game-container">
      {isClient && <GameEngine />}
    </div>
  );
}
