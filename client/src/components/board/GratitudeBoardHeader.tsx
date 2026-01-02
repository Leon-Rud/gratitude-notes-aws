import type { User } from "../../contexts/AuthContext";

interface GratitudeBoardHeaderProps {
  user: User | null;
  logout: () => void;
}

export function GratitudeBoardHeader({ user, logout }: GratitudeBoardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-white/[0.14] bg-[rgba(0,0,0,0.1)] px-8 py-4">
      {/* Left: Title */}
      <h1 className="font-manrope text-[24px] font-extrabold uppercase leading-[1.2] tracking-[2.88px] text-[#f1eeea]">
        Gratitude Board
      </h1>

      {/* Right: About us, Log out, Avatar */}
      <div className="flex h-[55px] w-[276px] items-center justify-between">
        {/* About us with glass pill background */}
        <a
          href="#/about"
          className="relative flex h-[36px] w-[110px] items-center justify-center rounded-card bg-ui-glass font-manrope text-[16px] font-semibold uppercase tracking-[1.76px] text-white transition-colors hover:bg-ui-glassHover"
        >
          About us
        </a>

        {/* Log out */}
        <button
          onClick={logout}
          className="font-manrope text-[16px] font-semibold uppercase leading-[35px] tracking-[1.92px] text-white transition-opacity hover:opacity-80"
        >
          Log out
        </button>

        {/* User Avatar */}
        {user && (
          <div className="flex items-center rounded px-2">
            <div className="relative h-[55px] w-[55px]">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  referrerPolicy="no-referrer"
                  className="h-full w-full rounded-full border-[1.5px] border-[#999999] object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.startsWith("data:image/svg+xml")) {
                      target.src = `data:image/svg+xml,${encodeURIComponent(
                        `<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 55 55">
                          <circle cx="27.5" cy="27.5" r="27.5" fill="rgba(255,255,255,0.2)"/>
                          <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="22" font-family="Arial, sans-serif" font-weight="600">${(user.name || "U").charAt(0).toUpperCase()}</text>
                        </svg>`,
                      )}`;
                    }
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border-[1.5px] border-[#999999] bg-[rgba(255,255,255,0.2)]">
                  <span className="font-poppins text-xl font-semibold text-white">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
