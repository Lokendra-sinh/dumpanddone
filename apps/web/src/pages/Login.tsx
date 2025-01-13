import { Link, useNavigate } from "@tanstack/react-router";
import { useGoogleLogin } from "@react-oauth/google";
import { trpc } from "@/utils/trpc";
import { useUserStore } from "@/store/useUserStore";


export function Login() {
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();

  const googleLoginMutation = trpc.googleLogin.useMutation({
    onSuccess: (res) => {
      setUser({
        ...res.user,
        created_at: new Date(res.user.created_at),
        blogs: res.user.blogs.map(blog => ({
          ...blog,
          created_at: new Date(blog.created_at),
          last_updated: new Date(blog.last_updated),
          outline: blog.outline ? {
            ...blog.outline,
            created_at: new Date(blog.outline.created_at),
            updated_at: new Date(blog.outline.updated_at)
          } : undefined
        }))
      });
      navigate({
        to: "/dashboard",
      });
    },
    onError: (e) => {
      console.error("Error while logging in", e);
    },
  });

  const handleGitHubLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_GITHUB_REDIRECT_URI}&scope=user`;
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("token response is", tokenResponse);
      googleLoginMutation.mutate({ accessToken: tokenResponse.access_token });
    },
    onError: (e) => {
      console.log("error while login is", e);
    },
  });

  return (
    <div className="w-full flex items-center justify-center min-h-screen">
      <div className="w-[350px] rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            Login
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="p-6 pt-0">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <button
                onClick={handleGitHubLogin}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
              >
                <svg viewBox="0 0 438.549 438.549" className="mr-2 h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M409.132,114.573c-19.608-33.596-46.205-60.194-79.798-79.8C295.736,15.166,259.057,5.365,219.271,5.365 c-39.781,0-76.472,9.804-110.063,29.408c-33.596,19.605-60.192,46.204-79.8,79.8C9.803,148.168,0,184.854,0,224.63 c0,47.78,13.94,90.745,41.827,128.906c27.884,38.164,63.906,64.572,108.063,79.227c5.14,0.954,8.945,0.283,11.419-1.996 c2.475-2.282,3.711-5.14,3.711-8.562c0-0.571-0.049-5.708-0.144-15.417c-0.098-9.709-0.144-18.179-0.144-25.406l-6.567,1.136 c-4.187,0.767-9.469,1.092-15.846,1c-6.374-0.089-12.991-0.757-19.842-1.999c-6.854-1.231-13.229-4.086-19.13-8.559 c-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559 c-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-0.951-2.568-2.098-3.711-3.429c-1.142-1.331-1.997-2.663-2.568-3.997 c-0.572-1.335-0.098-2.43,1.427-3.289c1.525-0.859,4.281-1.276,8.28-1.276l5.708,0.853c3.807,0.763,8.516,3.042,14.133,6.851 c5.614,3.806,10.229,8.754,13.846,14.842c4.38,7.806,9.657,13.754,15.846,17.847c6.184,4.093,12.419,6.136,18.699,6.136 c6.28,0,11.704-0.476,16.274-1.423c4.565-0.952,8.848-2.383,12.847-4.285c1.713-12.758,6.377-22.559,13.988-29.41 c-10.848-1.14-20.601-2.857-29.264-5.14c-8.658-2.286-17.605-5.996-26.835-11.14c-9.235-5.137-16.896-11.516-22.985-19.126 c-6.09-7.614-11.088-17.61-14.987-29.979c-3.901-12.374-5.852-26.648-5.852-42.826c0-23.035,7.52-42.637,22.557-58.817 c-7.044-17.318-6.379-36.732,1.997-58.24c5.52-1.715,13.706-0.428,24.554,3.853c10.85,4.283,18.794,7.952,23.84,10.994 c5.046,3.041,9.089,5.618,12.135,7.708c17.705-4.947,35.976-7.421,54.818-7.421s37.117,2.474,54.823,7.421l10.849-6.849 c7.419-4.57,16.18-8.758,26.262-12.565c10.088-3.805,17.802-4.853,23.134-3.138c8.562,21.509,9.325,40.922,2.279,58.24 c15.036,16.18,22.559,35.787,22.559,58.817c0,16.178-1.958,30.497-5.853,42.966c-3.9,12.471-8.941,22.457-15.125,29.979 c-6.191,7.521-13.901,13.85-23.131,18.986c-9.232,5.14-18.182,8.85-26.84,11.136c-8.662,2.286-18.415,4.004-29.263,5.146 c9.894,8.562,14.842,22.077,14.842,40.539v60.237c0,3.422,1.19,6.279,3.572,8.562c2.379,2.279,6.136,2.95,11.276,1.995 c44.163-14.653,80.185-41.062,108.068-79.226c27.88-38.161,41.825-81.126,41.825-128.906 C438.536,184.851,428.728,148.168,409.132,114.573z"
                  />
                </svg>
                Login with Github
              </button>
              <button
                onClick={() => login()}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
              >
                <svg viewBox="0 0 488 512" className="mr-2 h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  />
                </svg>
                Login with Google
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center p-6 pt-0">
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
      {/* <AtmosphericArc /> */}
    </div>
  );
}

const AtmosphericArc = () => {
  return (
    <div className="w-full h-64 bg-black">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>

          <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" />

            <stop offset="100%" stopColor="black" />
          </linearGradient>

          <linearGradient id="fillBlack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(255,255,255,0.03)" />

            <stop offset="100%" stopColor="black" />
          </linearGradient>

          <linearGradient id="fillWhite" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(255,255,255,1)" />

            <stop offset="100%" stopColor="rgb(255,255,255, 0.1" />
          </linearGradient>

          <linearGradient id="arcGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>

          <radialGradient id="spotGlow" cx="50%" cy="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
          </radialGradient>
        </defs>

        {/* Base arc */}
        <path
          d="M 300 1000 Q 500 800 700 1000 Q 500 230 300 1000"
          // stroke="rgba(255,255,255,1)"
          strokeWidth="0"
          strokeLinejoin="round"
          strokeOpacity={1}
          strokeLinecap="butt"
          fill="url(#fillWhite)"
        />

        {/* Blurred glow layer */}
        <path
          d="M 0 250 Q 500 80 1000 250"
          stroke="rgba(0,0,0,1)"
          strokeWidth="10"
          fill="url(#arcGlow)"
          filter="url(#fillBlack)"
        />

        {/* Atmospheric highlights */}
        <g opacity="0.6">
          {/* <path 
            d="M 400 120 Q 500 80 600 120"
            stroke="url(#arcGlow)"
            strokeWidth="4"
            fill="none"
          /> */}
          <circle
            cx="500"
            cy="100"
            r="40"
            fill="url(#spotGlow)"
            opacity="0.3"
          />
        </g>
      </svg>
    </div>
  );
};

export default AtmosphericArc;
