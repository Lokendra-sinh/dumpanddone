import { TwinkleStars } from "@dumpanddone/ui";
import { Button } from "@dumpanddone/ui";
import { Link } from "@tanstack/react-router";

const LandingPage = () => {
  return (
    <div className="w-full h-full relative bg-black">
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] bg-purple-800/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-purple-700/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />

      <nav className="relative z-10 container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" className="w-8 h-8">
            <defs>
              <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#7E22CE" />
              </linearGradient>
            </defs>
            
            <path 
              d="M 15,30
                 C 15,22 22,15 30,15
                 L 45,15
                 C 40,15 35,20 35,25
                 C 35,35 45,35 45,45
                 C 45,50 40,45 30,45
                 L 15,45
                 Z" 
              fill="url(#purpleGradient)"
            />
          </svg>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">dumpanddone</span>
        </div>
      </nav>

      <main className="w-full relative z-10 container pt-32 pb-24 text-center">
        <h1 className="text-6xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-400 to-purple-600">
            From Chaos to Clarity
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-purple-400 to-white">
            Blog Posts that Shine
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Turn your messy notes, scattered conversations, and raw knowledge into
          <span className="text-purple-400">
            {" "}
            polished, professional blog posts{" "}
          </span>
          ready to captivate your audience. No more formatting headaches, just
          <span className="text-purple-300"> beautiful content </span>
          that's ready to publish.
        </p>

        <div className="w-full flex items-center justify-center">
          <Link to="/dashboard" className="inline-block p-[2px] bg-gradient-to-t from-purple-900 to-purple-600 rounded-[6px] shadow-inner">
            <TwinkleStars>
              <span className="hover:none outline-none border-none inline-flex items-center shadow-[0px_0px_10px_1px_#a855f7] px-3 py-1 text-sm font-medium rounded-md bg-purple-950 text-white bg-gradient-to-t from-purple-950 to-purple-500">
                Create your first blog
              </span>
            </TwinkleStars>
          </Link>
        </div>

        <div className="max-w-md mx-auto mb-8 mt-10">
          <div className="flex gap-x-4">
            <input
              type="email"
              placeholder="Enter your email for early access"
              className="flex-1 rounded-lg bg-gray-900/50 border border-gray-800 px-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white">
              Join Waitlist
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Be among the first to transform your content creation process.
          </p>
        </div>


      </main>
    </div>
  );
};

export default LandingPage;
