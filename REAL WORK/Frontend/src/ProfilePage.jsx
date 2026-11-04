import { useEffect, useState } from "react";
import SiteNav from "./components/SiteNav";
import { getProfile, updateProfile } from "./api";
import { mediaImages } from "./mediaImages";

const demoProfile = {
  profile: {
    display_name: "Larp",
    username: "Imustlarp",
    bio: "I Have No personality I Must Larp",
    is_verified: true,
    avatar_url: mediaImages.avatar,
  },
  stats: {
    total_games: 0,
    total_films: 0,
    total_reviews: 0,
    average_game_rating: null,
  },
  favorites: [],
  activities: [],
};

function ProfilePage({ onNavigate, token, demo, onLogout }) {
  const [data, setData] = useState(demo ? demoProfile : null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (demo) return undefined;
    let active = true;
    getProfile(token)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [demo, token]);

  async function handleProfileSave(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get("displayName") || "");
    const bio = String(formData.get("bio") || "");

    if (demo) {
      setData((current) => ({
        ...current,
        profile: { ...current.profile, display_name: displayName, bio },
      }));
      setIsEditing(false);
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const result = await updateProfile(token, displayName, bio);
      setData((current) => ({ ...current, profile: result.profile }));
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  const profile = data?.profile || demoProfile.profile;
  const stats = data?.stats || demoProfile.stats;
  const favorites = data?.favorites || [];
  const activities = data?.activities || [];

  return (
    <main className="min-h-screen bg-[#0B0E14] p-4 font-sans text-white md:p-8">
      <div className="mx-auto max-w-6xl">
        <SiteNav
          activePage="profile"
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

        <section className="rounded-2xl border border-gray-800/70 bg-[#151923] p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src={profile.avatar_url || mediaImages.avatar}
                alt={`Foto profil ${profile.display_name || "pengguna"}`}
                className="h-20 w-20 shrink-0 rounded-full border-2 border-indigo-400/50 object-cover md:h-24 md:w-24"
              />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold md:text-3xl">
                  {profile.display_name}
                </h1>
                <div className="mt-1 flex items-center gap-1.5">
                  <p className="text-sm text-indigo-300">@{profile.username}</p>
                  {profile.is_verified && (
                    <span
                      role="img"
                      aria-label="Akun terverifikasi"
                      title="Akun terverifikasi"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <path
                          d="m4 8.2 2.5 2.4L12 5.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-400">{profile.bio}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-indigo-400 hover:text-white"
            >
              Edit Profil
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              [stats.total_games, "Total Game"],
              [stats.total_films, "Total Film"],
              [stats.total_reviews, "Ulasan"],
              [stats.average_game_rating ?? "—", "Rating Rata-rata"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-gray-800 bg-[#101521] px-4 py-4"
              >
                <p className="text-2xl font-bold">{value}</p>
                <p className="mt-1 text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-gray-800/70 bg-[#151923] p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Favorit Sepanjang Masa</h2>
              <button
                onClick={() => onNavigate("ranking")}
                className="shrink-0 text-xs font-medium text-indigo-300 hover:text-indigo-200"
              >
                Lihat ranking
              </button>
            </div>
            {favorites.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {favorites.map((favorite) => (
                  <button
                    key={`${favorite.category}-${favorite.slug}`}
                    onClick={() =>
                      favorite.slug === "persona-3-reload" &&
                      onNavigate("detail")
                    }
                    disabled={favorite.slug !== "persona-3-reload"}
                    className="group overflow-hidden rounded-xl border border-gray-800 bg-[#101521] text-left transition-colors hover:border-indigo-500/60 disabled:cursor-default"
                  >
                    <img
                      src={favorite.image || mediaImages.persona3}
                      alt={favorite.title}
                      className="h-36 w-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    <span className="block p-3">
                      <span className="block font-semibold">
                        {favorite.title}
                      </span>
                      <span className="mt-1 block text-xs text-yellow-400">
                        {favorite.user_score
                          ? `★ ${favorite.user_score} / 10`
                          : "Favorit"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-gray-800 bg-[#101521] p-5 text-sm text-gray-400">
                Belum ada media favorit. Simpan game dari halaman beranda atau
                detail.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-800/70 bg-[#151923] p-5 md:p-6">
            <h2 className="mb-5 text-lg font-bold">Aktivitas Terkini</h2>
            {activities.length ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={`${activity.slug}-${activity.activity}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-800 bg-[#101521] p-3"
                  >
                    <img
                      src={activity.image || mediaImages.persona3}
                      alt=""
                      className="h-14 w-11 shrink-0 rounded-md object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {activity.title}
                      </span>
                      <span className="mt-1 block text-xs text-gray-400">
                        {activity.activity}
                      </span>
                      <span className="mt-1 block text-[11px] text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-gray-800 bg-[#101521] p-5 text-sm text-gray-400">
                Aktivitas Anda akan muncul di sini.
              </p>
            )}
          </section>
        </div>

        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <form
              onSubmit={handleProfileSave}
              className="w-full max-w-md space-y-4 rounded-2xl border border-gray-700 bg-[#151923] p-6"
            >
              <h2 className="text-lg font-bold">Edit Profil</h2>
              <label className="block text-sm text-gray-300">
                Nama tampilan
                <input
                  name="displayName"
                  required
                  maxLength={80}
                  defaultValue={profile.display_name}
                  className="mt-2 w-full rounded-lg border border-gray-700 bg-[#0F1421] px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </label>
              <label className="block text-sm text-gray-300">
                Bio
                <textarea
                  name="bio"
                  maxLength={240}
                  defaultValue={profile.bio}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg border border-gray-700 bg-[#0F1421] px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </label>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg px-4 py-2 text-sm text-gray-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

export default ProfilePage;
