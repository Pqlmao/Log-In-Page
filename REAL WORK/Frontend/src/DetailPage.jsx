import { useEffect, useState } from "react";
import SiteNav from "./components/SiteNav";
import { getGame, saveGame, submitGameReview } from "./api";
import { mediaImages } from "./mediaImages";

const demoGame = {
  slug: "persona-3-reload",
  title: "Persona 3 Reload",
  description:
    "Persona 3 Reload adalah pembuatan ulang modern dari RPG Persona 3. Masuki Jam Gelap, bangkitkan kekuatan Persona, dan bertarung bersama teman-teman Anda.",
  developer: "Atlus",
  release_date: "2024-02-02",
  image: mediaImages.banner,
  platforms: ["PC", "PlayStation 4", "PlayStation 5", "Xbox"],
  score: 9.8,
  price: 173700,
  technical_details: {
    engine: "Unreal Engine 4",
    languages: ["Inggris", "Indonesia", "Jepang"],
  },
  is_favorite: false,
};

const DetailPage = ({ onNavigate, token, demo, onLogout }) => {
  const [game, setGame] = useState(demoGame);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("10");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadGame() {
    const data = await getGame("persona-3-reload", token);
    setGame(data.game);
    setReviews(data.reviews);
    setRating(String(data.game.user_score || 10));
  }

  useEffect(() => {
    if (demo) return undefined;
    let active = true;
    getGame("persona-3-reload", token)
      .then((data) => {
        if (!active) return;
        setGame(data.game);
        setReviews(data.reviews);
        setRating(String(data.game.user_score || 10));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [demo, token]);

  async function handleSaveGame() {
    if (demo) {
      setGame((current) => ({ ...current, is_favorite: !current.is_favorite }));
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await saveGame(game.slug, !game.is_favorite, token);
      setGame((current) => ({ ...current, is_favorite: !current.is_favorite }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    if (demo) {
      setError("Ulasan hanya dapat disimpan saat menggunakan backend.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await submitGameReview(game.slug, Number(rating), reviewText, token);
      setReviewText("");
      await loadGame();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  const technicalDetails = game.technical_details || {};

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white font-sans p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <SiteNav
          activePage="detail"
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

        {/* MAIN CONTAINER */}
        <div className="space-y-6">
          {/* HERO BANNER SECTION */}
          <section className="relative w-full min-h-[300px] rounded-3xl overflow-hidden border border-gray-800/50 p-6 md:p-8 flex flex-col justify-between">
            {/* Hero Background */}
            <img
              src={game.image || mediaImages.banner}
              alt="Game showcase"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/80 to-transparent"></div>

            {/* Top Info & Price Box */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
              {/* Left Content */}
              <div className="max-w-xl">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 text-[10px] font-bold px-2.5 py-1 rounded-md">
                    HIGHLIGHT GAME
                  </span>
                  <span className="bg-gray-800/80 text-gray-300 border border-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-md">
                    2024
                  </span>
                  <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px] font-semibold px-2.5 py-1 rounded-md">
                    ★ {Number(game.score || 0).toFixed(1)} /10
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  {game.title}
                </h1>

                <div className="flex flex-wrap gap-8 text-xs text-gray-400">
                  <div>
                    <span className="block text-gray-500 text-[10px]">
                      Developer / Studio:
                    </span>
                    <span className="font-medium text-gray-300">
                      {game.developer || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-[10px]">
                      Rilis:
                    </span>
                    <span className="font-medium text-gray-300">
                      {game.release_date
                        ? new Date(game.release_date).toLocaleDateString(
                            "id-ID",
                            { timeZone: "UTC" },
                          )
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-[10px]">
                      Platform:
                    </span>
                    <span className="font-medium text-gray-300">
                      {(game.platforms || []).join(", ") || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Price Card */}
              <div className="bg-[#151923]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-5 w-full md:w-64 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider text-gray-400">
                    HARGA GAME
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    -70% Developer Sale
                  </span>
                </div>

                <div className="text-2xl font-bold text-white">
                  {game.price
                    ? `Rp ${Number(game.price).toLocaleString("id-ID")}`
                    : "Harga belum tersedia"}
                </div>
                <button
                  type="button"
                  onClick={handleSaveGame}
                  disabled={isSaving}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {isSaving
                    ? "Menyimpan..."
                    : game.is_favorite
                      ? "Tersimpan di Favorit"
                      : "Simpan ke Favorit"}
                </button>

                <div className="space-y-1 text-[11px] text-gray-400 border-t border-gray-800 pt-2">
                  <div className="flex justify-between">
                    <span>Harga Tertinggi:</span>
                    <span className="text-gray-300">Rp 579.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harga Terendah:</span>
                    <span className="text-gray-300">Rp 173.700</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CONTENT GRID (Left Column + Right Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN (2 Columns Wide) */}
            <div className="lg:col-span-2 space-y-6">
              {/* VIDEO PLAYER SECTION */}
              <div className="space-y-3">
                <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center">
                  {/* Visual Placeholder Pemutar Video */}
                  <img
                    src={game.image || mediaImages.banner}
                    alt="Pratinjau trailer game"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <button className="absolute w-16 h-16 bg-indigo-600/90 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                    <svg
                      className="w-8 h-8 text-white translate-x-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </button>
                </div>

                {/* Video Tabs */}
                <div className="flex items-center gap-3">
                  <button className="bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                    Trailer Resmi
                  </button>
                  <button className="bg-[#151923] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                    Gameplay 4K
                  </button>
                  <button className="bg-[#151923] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                    Story Teaser
                  </button>
                </div>
              </div>

              {/* SINOPSIS & LATAR BELAKANG CARD */}
              <div className="bg-[#151923] border border-gray-800/60 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Sinopsis & Latar Belakang
                  </h2>
                </div>
                <p className="text-xs leading-relaxed text-gray-400">
                  {game.description || "Belum ada sinopsis untuk game ini."}
                </p>
              </div>

              {/* KOLOM DISKUSI & ULASAN CARD */}
              <div className="bg-[#151923] border border-gray-800/60 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Kolom Diskusi & Ulasan
                  </h2>
                </div>

                {/* Box Form Ulasan */}
                <form
                  onSubmit={handleReviewSubmit}
                  className="space-y-3 rounded-xl border border-gray-800/80 bg-[#1A1F2C] p-4"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-300">
                      Tulis Ulasan Anda
                    </span>
                    <label className="flex items-center gap-2 text-[10px] text-gray-400">
                      Beri Skor
                      <select
                        value={rating}
                        onChange={(event) => setRating(event.target.value)}
                        className="rounded border border-gray-700 bg-[#101521] px-2 py-1 text-yellow-400 outline-none"
                        aria-label="Pilih skor dari 1 sampai 10"
                      >
                        {Array.from(
                          { length: 10 },
                          (_, index) => 10 - index,
                        ).map((score) => (
                          <option key={score} value={score}>
                            {score} / 10
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                    maxLength={2000}
                    placeholder="Bagaimana pendapat Anda tentang media ini?"
                    className="w-full resize-none bg-transparent text-xs text-white outline-none placeholder-gray-500"
                  />

                  <div className="flex justify-end border-t border-gray-800/60 pt-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
                    >
                      {isSaving ? "Mengirim..." : "Kirim Diskusi"}
                    </button>
                  </div>
                </form>
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-xl border border-gray-800 bg-[#101521] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {review.display_name || review.username}
                        </p>
                        <span className="text-xs text-yellow-400">
                          ★ {review.rating} / 10
                        </span>
                      </div>
                      {review.review_text && (
                        <p className="mt-2 text-xs leading-relaxed text-gray-400">
                          {review.review_text}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR (1 Column Wide) */}
            <div className="space-y-6">
              {/* SKOR KESELURUHAN CARD */}
              <div className="bg-[#151923] border border-gray-800/60 rounded-2xl p-6 space-y-6">
                <div className="text-center">
                  <span className="text-[10px] font-semibold text-gray-500 tracking-wider">
                    SKOR KESELURUHAN
                  </span>
                  <div className="text-4xl font-extrabold text-white mt-1 flex items-center justify-center gap-1">
                    {Number(game.score || 0)
                      .toFixed(1)
                      .replace(".", ",")}
                    <span className="text-yellow-400 text-2xl">★</span>
                  </div>
                </div>

                {/* Rating Progress Bars */}
                <div className="space-y-4 text-xs">
                  {/* Item 1 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-gray-300 text-[11px]">
                      <span>Cerita & Lore</span>
                      <span className="font-semibold text-cyan-400">
                        10 / 10
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-full rounded-full"></div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-gray-300 text-[11px]">
                      <span>Gameplay & Mekanik</span>
                      <span className="font-semibold text-purple-400">
                        9,6 / 10
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[96%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-gray-300 text-[11px]">
                      <span>Visual & Grafik</span>
                      <span className="font-semibold text-indigo-400">
                        9,9 / 10
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[99%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-gray-300 text-[11px]">
                      <span>Audio & Musik</span>
                      <span className="font-semibold text-yellow-400">
                        10 / 10
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 w-full rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* INFORMASI TEKNIS CARD */}
              <div className="bg-[#151923] border border-gray-800/60 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Informasi Teknis
                  </h2>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="block text-gray-500 text-[10px]">
                      Platform / Format
                    </span>
                    <span className="font-medium text-gray-300">
                      {(game.platforms || []).join(", ") || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-[10px]">
                      Mesin / Durasi
                    </span>
                    <span className="font-medium text-gray-300">
                      {technicalDetails.engine || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-[10px]">
                      Bahasa & Subtitle
                    </span>
                    <span className="font-medium text-gray-300">
                      {(technicalDetails.languages || []).join(", ") || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
