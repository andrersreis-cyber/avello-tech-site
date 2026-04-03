import { useState } from 'react'
import { useLenis } from './hooks/useLenis'
import { Loader } from './components/Loader'
import { Nav } from './components/Nav'
import { HeroSection } from './components/HeroSection'
import { IntroSection } from './components/IntroSection'
import { ManifestoProblems } from './components/ManifestoProblems'
import { ManifestoSolution } from './components/ManifestoSolution'
import { ManifestoMission } from './components/ManifestoMission'
import { ProofSection } from './components/ProofSection'
import { CtaSection } from './components/CtaSection'
import { Footer } from './components/Footer'
import { WebGLBackground } from './components/WebGLBackground'
import './LandingPage.css'

export function LandingPage() {
  const [loaded, setLoaded] = useState(false)
  useLenis()

  return (
    <div className="av">
      <WebGLBackground />
      <Loader onComplete={() => setLoaded(true)} />
      <Nav />
      <main>
        <HeroSection />
        <IntroSection />
        <ManifestoProblems />
        <ManifestoSolution />
        <ManifestoMission />
        <ProofSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
