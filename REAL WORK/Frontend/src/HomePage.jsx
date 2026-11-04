import { useEffect, useState } from "react";
import SiteNav from "./components/SiteNav";
import { getHomeData, saveGame } from "./api";
import { mediaImages } from "./mediaImages";

const demoCatalog = {
  games: [
    {
      slug: "persona-3-reload",
      title: "Persona 3 Reload",
      image: mediaImages.persona3,
      score: 9.8,
    },
    {
      slug: "persona-5-royal",
      title: "Persona 5 Royal",
      image: mediaImages.persona5,
      score: 9.6,
    },
  ],
  movies: [
    {
      slug: "i-want-to-eat-your-pancreas",
      title: "I Want to Eat Your Pancreas",
      image: mediaImages.romance,
      score: 9.4,
    },
    {
      slug: "avengers-doomsday",
      title: "Avengers: Doomsday",
      image: mediaImages.action,
      score: 0,
    },
  ],
};

function MediaCard({ item, onSelect, comingSoon = false }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group cursor-pointer text-left"
      disabled={!onSelect}
    >
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl border border-gray-800/50 transition-colors group-hover:border-indigo-500/50">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="mb-2 font-semibold leading-tight text-white">
        {item.title}
      </h3>
      {comingSoon ? (
        <span className="inline-block rounded border border-red-500/50 bg-[#1A1F2C] px-2 py-0.5 text-[10px] font-semibold text-red-400">
          Coming Soon
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded border border-yellow-500/30 bg-[#1A1F2C] px-2 py-0.5 text-[10px] font-medium text-yellow-400">
          ★ {Number(item.score || 0).toFixed(1)} / 10
        </span>
      )}
    </button>
  );
}

function HomePage({ onSelectDetail, onNavigate, token, demo, onLogout }) {
  const [catalog, setCatalog] = useState(demoCatalog);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (demo) return undefined;
    let active = true;
    getHomeData(token)
      .then((data) => {
        if (active) {
          setCatalog(data);
          setIsFavorite(
            Boolean(
              data.games.find((item) => item.slug === "persona-3-reload")
                ?.is_favorite,
            ),
          );
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [demo, token]);

  const featuredGame =
    catalog.games.find((item) => item.slug === "persona-3-reload") ||
    demoCatalog.games[0];

  async function handleSaveGame() {
    if (demo) {
      setIsFavorite((current) => !current);
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await saveGame(featuredGame.slug, !isFavorite, token);
      setIsFavorite((current) => !current);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0E14] p-4 font-sans text-white md:p-8">
      <div className="mx-auto max-w-7xl">
        <SiteNav
          activePage="home"
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
        {error && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {error}
          </p>
        )}

        <div className="space-y-12">
          <section className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-gray-800/50 shadow-2xl md:h-[400px]">
            <img
              src={featuredGame.image || mediaImages.banner}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/80 to-transparent" />
            <div className="relative flex h-full max-w-2xl flex-col justify-center px-6 md:px-10">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded border border-fuchsia-600/30 bg-fuchsia-600/20 px-2 py-1 text-[10px] font-bold text-fuchsia-300">
                  HIGHLIGHT GAME
                </span>
                <span className="rounded border border-gray-700 bg-gray-800/60 px-2 py-1 text-[10px] font-semibold text-gray-300">
                  2024
                </span>
                <span className="rounded border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-[10px] font-semibold text-yellow-400">
                  ★ {Number(featuredGame.score || 0).toFixed(1)} / 10
                </span>
              </div>
              <h1 className="mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                {featuredGame.title}
              </h1>
              <p className="mb-8 text-sm leading-relaxed text-gray-300">
                Persona 3 Reload adalah RPG yang dikembangkan dan diterbitkan
                oleh Atlus, dibuat ulang untuk era modern.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={onSelectDetail}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Lihat Detail
                </button>
                <button
                  type="button"
                  onClick={handleSaveGame}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-700/70 bg-[#1A1F2C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
                >
                  {isSaving
                    ? "Menyimpan..."
                    : isFavorite
                      ? "Tersimpan"
                      : "Simpan List"}
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-6 flex items-center gap-3">
              <span className="text-2xl text-yellow-400" aria-hidden="true">
                ★
              </span>
              <h2 className="text-xl font-bold tracking-wide">Game Popular</h2>
              <div className="ml-4 h-px flex-1 bg-gray-800" />
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
              {catalog.games.map((game) => (
                <MediaCard
                  key={game.slug}
                  item={game}
                  onSelect={
                    game.slug === "persona-3-reload"
                      ? onSelectDetail
                      : undefined
                  }
                />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-6 flex items-center gap-3">
              <span className="text-2xl text-yellow-400" aria-hidden="true">
                ★
              </span>
              <h2 className="text-xl font-bold tracking-wide">Film Popular</h2>
              <div className="ml-4 h-px flex-1 bg-gray-800" />
            </div>
            <div className="grid grid-cols-2 gap-6 pb-12 sm:grid-cols-3 md:grid-cols-5">
              {catalog.movies.map((movie) => (
                <MediaCard
                  key={movie.slug}
                  item={movie}
                  comingSoon={Number(movie.score) === 0}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
