import { Navbar } from "./navbar"
import { Hero } from "./hero"
import { HowItWorks } from "./how-it-works"
import { SeeItInAction } from "./see-it-in-action/see-it-in-action"


export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-muted">
      <Navbar />
      <Hero />
      <HowItWorks />
      <SeeItInAction />
      {/* <WhyDumpanddone />  */}
    </div>
  )
}

