import { mediaImages } from "../mediaImages";

const pages = [
  { id: "home", label: "Beranda" },
  { id: "ranking", label: "Ranking List" },
  { id: "upcoming", label: "Akan Datang" },
  { id: "profile", label: "Profil" },
];

function SiteNav({ activePage, onNavigate, onLogout }) {
  return (
    <nav className="mb-8 flex flex-wrap items-center justify-between gap-3 border border-gray-800/70 bg-[#141927] px-4 py-3 md:px-6">
      <button
        onClick={() => onNavigate("home")}
        className="shrink-0 text-lg font-bold tracking-wide"
      >
        My
        <span className="bg-gradient-to-b from-[#A855F7] via-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent">
          Play
        </span>
        List
      </button>

      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-gray-800 bg-[#0F1421] p-1">
        {pages.map((page) => {
          const isActive =
            activePage === page.id ||
            (page.id === "home" && activePage === "detail");

          return (
            <button
              key={page.id}
              onClick={() => page.id !== "upcoming" && onNavigate(page.id)}
              disabled={page.id === "upcoming"}
              title={
                page.id === "upcoming"
                  ? "Halaman ini belum tersedia"
                  : undefined
              }
              aria-current={isActive ? "page" : undefined}
              aria-disabled={page.id === "upcoming" || undefined}
              className={`shrink-0 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : page.id === "upcoming"
                    ? "cursor-not-allowed text-gray-600"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {page.label}
            </button>
          );
        })}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <label className="hidden min-w-0 items-center gap-2 rounded-lg border border-gray-800 bg-[#0F1421] px-3 py-2 xl:flex">
          <svg
            className="h-4 w-4 shrink-0 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
            <path d="m16 16 4 4" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            aria-label="Cari game, film, studio"
            placeholder="Cari game, film, studio..."
            className="w-32 bg-transparent text-xs text-white outline-none placeholder:text-gray-500"
          />
        </label>

        <select
          aria-label="Filter media"
          className="hidden rounded-lg border border-gray-800 bg-[#0F1421] px-2.5 py-2 text-xs text-gray-300 outline-none lg:block"
          defaultValue="Semua Media"
        >
          <option>Semua Media</option>
          <option>Game</option>
          <option>Film</option>
          <option>Anime</option>
        </select>

        <button
          aria-label="Daftar tersimpan, 0 item"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-800 bg-[#0F1421] text-gray-300"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.5L6 21V4.75Z"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-purple-600 px-1 text-[8px] text-white">
            0
          </span>
        </button>

        <button
          onClick={() => onNavigate("profile")}
          aria-label="Buka profil"
          className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-700"
        >
          <img
            src={mediaImages.avatar}
            alt=""
            className="h-full w-full object-cover"
          />
        </button>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="shrink-0 rounded-lg border border-gray-800 px-3 py-2 text-xs text-gray-400 transition-colors hover:border-rose-500/60 hover:text-white"
          >
            Keluar
          </button>
        )}
      </div>
    </nav>
  );
}

export default SiteNav;
