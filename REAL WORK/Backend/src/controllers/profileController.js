const pool = require("../config/database");

async function getProfile(req, res) {
  try {
    const [profile, stats, favorites, activities] = await Promise.all([
      pool.query(
        `SELECT u.email, p.username, p.display_name, p.avatar_url, p.bio,
                p.is_verified
         FROM auth_users u
         JOIN profiles p ON p.id = u.id
         WHERE u.id = $1`,
        [req.user.id],
      ),
      pool.query(
        `SELECT
           (SELECT COUNT(*) FROM game_library WHERE user_id = $1)::int AS total_games,
           (SELECT COUNT(*) FROM movie_library WHERE user_id = $1)::int AS total_films,
           (SELECT COUNT(*) FROM game_reviews WHERE user_id = $1)
             + (SELECT COUNT(*) FROM movie_reviews WHERE user_id = $1) AS total_reviews,
           (SELECT ROUND(AVG(rating)::numeric, 1) FROM game_reviews WHERE user_id = $1) AS average_game_rating`,
        [req.user.id],
      ),
      pool.query(
        `SELECT * FROM (
           SELECT g.slug, g.title, g.cover_url AS image, 'game' AS category,
                  l.rating AS user_score, l.added_at
           FROM game_library l
           JOIN games g ON g.id = l.game_id
           WHERE l.user_id = $1 AND l.is_favorite = true
           UNION ALL
           SELECT m.slug, m.title, m.poster_url AS image, 'movie' AS category,
                  l.personal_rating AS user_score, l.added_at
           FROM movie_library l
           JOIN movies m ON m.id = l.movie_id
           WHERE l.user_id = $1 AND l.is_favorite = true
         ) favorite_items
         ORDER BY added_at DESC
         LIMIT 8`,
        [req.user.id],
      ),
      pool.query(
        `SELECT * FROM (
           SELECT g.slug, g.title, g.cover_url AS image,
                  'game' AS category, 'Menambahkan game ke library' AS activity,
                  l.added_at AS created_at
           FROM game_library l
           JOIN games g ON g.id = l.game_id
           WHERE l.user_id = $1
           UNION ALL
           SELECT g.slug, g.title, g.cover_url AS image,
                  'game' AS category, 'Memberi rating ' || r.rating AS activity,
                  r.created_at
           FROM game_reviews r
           JOIN games g ON g.id = r.game_id
           WHERE r.user_id = $1
           UNION ALL
           SELECT m.slug, m.title, m.poster_url AS image,
                  'movie' AS category, 'Menambahkan film ke library' AS activity,
                  l.added_at AS created_at
           FROM movie_library l
           JOIN movies m ON m.id = l.movie_id
           WHERE l.user_id = $1
         ) recent_activity
         ORDER BY created_at DESC
         LIMIT 10`,
        [req.user.id],
      ),
    ]);

    if (!profile.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Profil pengguna tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      profile: profile.rows[0],
      stats: stats.rows[0],
      favorites: favorites.rows,
      activities: activities.rows,
    });
  } catch (error) {
    console.error("Memuat profil gagal:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memuat profil.",
    });
  }
}

async function updateProfile(req, res) {
  const { displayName, bio } = req.body ?? {};
  if (
    typeof displayName !== "string" ||
    typeof bio !== "string" ||
    !displayName.trim() ||
    displayName.trim().length > 80 ||
    bio.length > 240
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Nama wajib diisi (maksimum 80 karakter), bio maksimum 240 karakter.",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE profiles
       SET display_name = $2, bio = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING username, display_name, avatar_url, bio, is_verified`,
      [req.user.id, displayName.trim(), bio.trim()],
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Profil pengguna tidak ditemukan.",
      });
    }
    return res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error("Memperbarui profil gagal:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui profil.",
    });
  }
}

module.exports = { getProfile, updateProfile };
