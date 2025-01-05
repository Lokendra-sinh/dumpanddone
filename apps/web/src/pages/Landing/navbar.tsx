import { Link } from "@tanstack/react-router";
import { Button } from "@dumpanddone/ui";

export function Navbar() {
  return (
    <header className="w-full sticky top-0 z-50 border-b px-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-12 flex h-16 items-center justify-between gap-10">
        <div className="flex items-center justify-between gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <defs>
                  <linearGradient
                    id="logoGradient"
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(221.2 83.2% 53.3%)"
                      stopOpacity="1"
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(217.2 91.2% 59.8%)"
                      stopOpacity="1"
                    />
                  </linearGradient>
                </defs>

                {/* <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" /> */}

                <rect
                  x="25"
                  y="30"
                  width="20"
                  height="4"
                  fill="white"
                  opacity="0.9"
                  transform="rotate(-15, 35, 32)"
                />
                <rect
                  x="55"
                  y="35"
                  width="15"
                  height="4"
                  fill="white"
                  opacity="0.9"
                  transform="rotate(10, 62.5, 37)"
                />
                <rect
                  x="30"
                  y="45"
                  width="25"
                  height="4"
                  fill="white"
                  opacity="0.9"
                  transform="rotate(-5, 42.5, 47)"
                />

                <rect
                  x="35"
                  y="55"
                  width="30"
                  height="4"
                  fill="white"
                  opacity="0.9"
                />
                <rect
                  x="35"
                  y="63"
                  width="30"
                  height="4"
                  fill="white"
                  opacity="0.9"
                />
                <rect
                  x="35"
                  y="71"
                  width="30"
                  height="4"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">Dumpanddone</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/pricing"
              className="text-accent font-medium transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="text-accent font-medium transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-base border h-fit rounded-lg border-border shadow-md px-2 py-1 font-bold hover:bg-muted"
          >
            Login
          </Button>
          <Button
            className="rounded-lg text-base font-bold text-white bg-primary h-fit px-2 py-1 border border-black"
            style={{
              boxShadow:
                "inset 0 3px 0px rgba(84, 92, 107, 0.5), " +
                "inset 0 -2px 5px rgba(0, 0, 0, 0.6), " +
                "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            Join waitlist
          </Button>
        </div>
      </div>
    </header>
  );
}
