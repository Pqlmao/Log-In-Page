import { useEffect, useState } from "react";
import SiteNav from "./components/SiteNav";
import { getRankings } from "./api";
import { mediaImages } from "./mediaImages";

const demoRankings = [
  {
    slug: "persona-3-reload",
    title: "Persona 3 Reload",
    category: "game",
    genres: ["RPG", "Atlus"],
    score: 9.8,
    favorites: 1320,
    image: mediaImages.persona3,
  },
  {
    slug: "persona-5-royal",
    title: "Persona 5 Royal",
    category: "game",
    genres: ["RPG", "Atlus"],
    score: 9.6,
    favorites: 1780,
    image: mediaImages.persona5,
  },
  {
    slug: "i-want-to-eat-your-pancreas",
    title: "I Want to Eat Your Pancreas",
    category: "movie",
    genres: ["Drama"],
    score: 9.4,
    favorites: 1540,
    image: mediaImages.romance,
  },
];

const filters = [
  { label: "Semua Kategori", category: "all" },
  { label: "Top Games", category: "game" },
  { label: "Top Movies", category: "movie" },
  { label: "Paling Difavoritkan", category: "popular" },
];

function RankingPage({ onNavigate, token, demo, onLogout }) {
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [rankings, setRankings] = useState(demo ? demoRankings : []);
  const [error, setError] = useState("");
  const [loadedCategory, setLoadedCategory] = useState(demo ? "all" : "");
  const isLoading = !demo && loadedCategory !== activeFilter.category;
  const visibleRankings = demo
    ? rankings
        .filter(
          (item) =>
            activeFilter.category === "all" ||
            activeFilter.category === "popular" ||
            item.category === activeFilter.category,
        )
        .sort((a, b) =>
          activeFilter.category === "popular"
            ? b.favorites - a.favorites
            : b.score - a.score,
        )
    : rankings;

  useEffect(() => {
    if (demo) return undefined;
    let active = true;
    getRankings(activeFilter.category, token)
      .then((data) => {
        if (active) {
          setRankings(data.items);
          setError("");
          setLoadedCategory(activeFilter.category);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
          setLoadedCategory(activeFilter.category);
        }
      });
    return () => {
      active = false;
    };
  }, [activeFilter, demo, token]);

  return (
    <main className="min-h-screen bg-[#0B0E14] p-4 font-sans text-white md:p-8">
      <div className="mx-auto max-w-6xl">
        <SiteNav
          activePage="ranking"
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
        <header className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">
            Peringkat Media Terpopuler
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Temukan media yang paling disukai komunitas MyPlayList.
          </p>
        </header>

        <section>
          <div
            className="mb-4 flex flex-wrap gap-2"
            aria-label="Filter kategori ranking"
          >
            {filters.map((filter) => (
              <button
                key={filter.category}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter.category === filter.category}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter.category === filter.category
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-gray-800 bg-[#151923] text-gray-400 hover:border-gray-700 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
            >
              {error}
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-gray-800/70 bg-[#151923]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead className="border-b border-gray-800 bg-[#111622]">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th scope="col" className="px-5 py-4">
                      Rank
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Judul Media
                    </th>
                    <th scope="col" className="px-5 py-4 text-center">
                      Skor
                    </th>
                    <th scope="col" className="px-5 py-4 text-center">
                      Skor Anda
                    </th>
                    <th scope="col" className="px-5 py-4 text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/70">
                  {visibleRankings.map((item, index) => (
                    <tr
                      key={item.slug}
                      className="transition-colors hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#20263A] text-sm font-bold text-indigo-300">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            item.slug === "persona-3-reload" &&
                            onNavigate("detail")
                          }
                          disabled={item.slug !== "persona-3-reload"}
                          className="flex items-center gap-3 text-left disabled:cursor-default"
                        >
                          <img
                            src={item.image}
                            alt=""
                            className="h-12 w-10 shrink-0 rounded-md object-cover"
                          />
                          <span>
                            <span className="block font-semibold text-white">
                              {item.title}
                            </span>
                            <span className="mt-1 block text-xs capitalize text-gray-500">
                              {Array.isArray(item.genres)
                                ? item.genres.join(" · ")
                                : item.genres}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="font-semibold text-yellow-400">
                          ★ {Number(item.score || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-gray-400">
                        {item.user_score ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="rounded-full border border-gray-700 bg-[#101521] px-3 py-1 text-xs text-gray-400">
                          {item.is_favorite
                            ? "Favorit"
                            : item.user_score
                              ? "Sudah dinilai"
                              : "Belum dinilai"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isLoading && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                Memuat ranking...
              </p>
            )}
            {!isLoading && !error && visibleRankings.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-gray-400">
                Belum ada media untuk filter ini.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default RankingPage;
