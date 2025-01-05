
import { Button } from "@dumpanddone/ui"
import { ArrowDown } from 'lucide-react'
import { useState } from 'react'
import { WaitlistModal } from "./join-waitlist-modal"

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden pt-24 md:pt-32">
      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center">
          <p
            className="inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            Launching soon...
            <ArrowDown className="ml-2 h-4 w-4" />
          </p>
          <h1 className="mt-8 text-4xl font-medium font-inter tracking-tight sm:text-6xl md:text-7xl">
            Turn your scattered thoughts
            <br />
            into polished blog posts
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary/60 sm:text-xl">
            <span className="text-primary font-medium">Brilliant ideas</span> hiding in your <span className="text-primary font-medium">messy notes?</span>
            {" "}Dump them in, get a <span className="text-primary font-medium">structured blog post</span> that sounds exactly like you.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button 
              size="lg" 
              className="rounded-lg text-base font-bold text-white bg-[#1b61e3] h-fit px-4 py-2 hover:bg-[#1b61e3]/80"
              style={{
                boxShadow:
                  "inset 0 4px 1px rgba(65, 119, 231, 1), " +
                  "inset 0 -4px 2px rgba(24, 81, 187, 1), " +
                  "0 0px 4px rgba(0, 0, 0, 0.1)",
              }}
              onClick={() => setIsModalOpen(true)}
            >
              Transform my notes into gold
            </Button>
          </div>
        </div>
      </div>
      <div
        className="absolute right-0 top-1/2 -z-10 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-primary/20 to-primary-foreground/20 opacity-20 blur-3xl"
        aria-hidden="true"
      />
      <WaitlistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  )
}