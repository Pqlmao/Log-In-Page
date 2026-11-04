const pool = require("../config/database");

const catalogQuery = `
  SELECT
    g.id,
    g.slug,
    g.title,
    g.cover_url AS image,
    g.genres,
    'game'::text AS category,
    COALESCE(review_scores.score, g.community_rating)::numeric(3, 1) AS score,
    COALESCE(favorites.total, 0)::int AS favorites,
    my_library.rating AS user_score,
    my_library.is_favorite AS is_favorite
  FROM games g
  LEFT JOIN LATERAL (
    SELECT AVG(r.rating)::numeric(3, 1) AS score
    FROM game_reviews r
    WHERE r.game_id = g.id
  ) review_scores ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS total
    FROM game_library l
    WHERE l.game_id = g.id AND l.is_favorite = true
  ) favorites ON true
  LEFT JOIN game_library my_library
    ON my_library.game_id = g.id AND my_library.user_id = $1
  WHERE g.is_published = true

  UNION ALL

  SELECT
    m.id,
    m.slug,
    m.title,
    m.poster_url AS image,
    m.genres,
    'movie'::text AS category,
    COALESCE(review_scores.score, m.community_rating)::numeric(3, 1) AS score,
    COALESCE(favorites.total, 0)::int AS favorites,
    my_library.personal_rating AS user_score,
    my_library.is_favorite AS is_favorite
  FROM movies m
  LEFT JOIN LATERAL (
    SELECT AVG(r.rating)::numeric(3, 1) AS score
    FROM movie_reviews r
    WHERE r.movie_id = m.id
  ) review_scores ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS total
    FROM movie_library l
    WHERE l.movie_id = m.id AND l.is_favorite = true
  ) favorites ON true
  LEFT JOIN movie_library my_library
    ON my_library.movie_id = m.id AND my_library.user_id = $1
  WHERE m.is_published = true
`;

async function getHome(req, res) {
  try {
    const [games, movies] = await Promise.all([
      pool.query(
        `SELECT g.id, g.slug, g.title, g.cover_url AS image, g.genres,
                COALESCE(AVG(reviews.rating), g.community_rating)::numeric(3, 1) AS score,
                library.rating AS user_score,
                COALESCE(library.is_favorite, false) AS is_favorite
         FROM games g
         LEFT JOIN game_reviews reviews ON reviews.game_id = g.id
         LEFT JOIN game_library library
           ON library.game_id = g.id AND library.user_id = $1
         WHERE g.is_published = true
         GROUP BY g.id, library.rating, library.is_favorite
         ORDER BY score DESC, g.title
         LIMIT 6`,
        [req.user?.id || null],
      ),
      pool.query(
        `SELECT m.id, m.slug, m.title, m.poster_url AS image, m.genres,
                COALESCE(AVG(reviews.rating), m.community_rating)::numeric(3, 1) AS score,
                library.personal_rating AS user_score,
                COALESCE(library.is_favorite, false) AS is_favorite
         FROM movies m
         LEFT JOIN movie_reviews reviews ON reviews.movie_id = m.id
         LEFT JOIN movie_library library
           ON library.movie_id = m.id AND library.user_id = $1
         WHERE m.is_published = true
         GROUP BY m.id, library.personal_rating, library.is_favorite
         ORDER BY score DESC, m.title
         LIMIT 6`,
        [req.user?.id || null],
      ),
    ]);

    return res.json({
      success: true,
      games: games.rows,
      movies: movies.rows,
    });
  } catch (error) {
    console.error("Memuat katalog gagal:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memuat katalog media.",
    });
  }
}

async function getRankings(req, res) {
  const category = req.query.category || "all";
  if (!["all", "game", "movie", "popular"].includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Filter ranking tidak valid.",
    });
  }

  try {
    const result = await pool.query(
      `WITH catalog AS (${catalogQuery})
       SELECT *
       FROM catalog
       WHERE $2 = 'all'
          OR ($2 = 'popular' AND favorites > 0)
          OR category = $2
       ORDER BY
         CASE WHEN $2 = 'popular' THEN favorites END DESC NULLS LAST,
         score DESC,
         title ASC`,
      [req.user?.id || null, category],
    );
    return res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error("Memuat ranking gagal:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memuat ranking media.",
    });
  }
}

async function getGame(req, res) {
  try {
    const result = await pool.query(
      `SELECT g.id, g.slug, g.title, g.description, g.developer, g.publisher,
              g.release_date, g.cover_url AS image, g.platforms, g.genres,
              g.price, g.technical_details,
              COALESCE(scores.score, g.community_rating)::numeric(3, 1) AS score,
              library.rating AS user_score,
              COALESCE(library.is_favorite, false) AS is_favorite
       FROM games g
       LEFT JOIN LATERAL (
         SELECT AVG(r.rating)::numeric(3, 1) AS score
         FROM game_reviews r
         WHERE r.game_id = g.id
       ) scores ON true
       LEFT JOIN game_library library
         ON library.game_id = g.id AND library.user_id = $2
       WHERE g.slug = $1 AND g.is_published = true`,
      [req.params.slug, req.user?.id || null],
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Game tidak ditemukan.",
      });
    }

    const reviews = await pool.query(
      `SELECT r.id, r.rating, r.review_text, r.created_at,
              p.display_name, p.username, p.avatar_url, p.is_verified
       FROM game_reviews r
       JOIN profiles p ON p.id = r.user_id
       WHERE r.game_id = $1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [result.rows[0].id],
    );

    return res.json({
      success: true,
      game: result.rows[0],
      reviews: reviews.rows,
    });
  } catch (error) {
    console.error("Memuat detail game gagal:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memuat detail game.",
    });
  }
}

async function updateGameLibrary(req, res) {
  const { isFavorite, status = "plan" } = req.body ?? {};
  const allowedStatuses = ["plan", "playing", "completed", "dropped"];

  if (typeof isFavorite !== "boolean" || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status atau pilihan favorit tidak valid.",
    });
  }

  try {
    const game = await pool.query(
      "SELECT id FROM games WHERE slug = $1 AND is_published = true",
      [req.params.slug],
    );
    if (!game.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Game tidak ditemukan.",
      });
    }

    const result = await pool.query(
      `INSERT INTO game_library (user_id, game_id, status, is_favorite)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, game_id) DO UPDATE
       SET status = EXCLUDED.status,
           is_favorite = EXCLUDED.is_favorite
       RETURNING status, is_favorite, rating`,
      [req.user.id, game.rows[0].id, status, isFavorite],
    );
    return res.json({ success: true, library: result.rows[0] });
  } catch (error) {
    console.error("Menyimpan game ke library gagal:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan perubahan library.",
    });
  }
}

async function submitGameReview(req, res) {
  const { rating, reviewText = "" } = req.body ?? {};
  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 10 ||
    typeof reviewText !== "string" ||
    reviewText.trim().length > 2000
  ) {
    return res.status(400).json({
      success: false,
      message: "Rating atau ulasan tidak valid (1–10, maksimum 2000 karakter).",
    });
  }

  const client = await pool.connect();
  try {
    const game = await client.query(
      "SELECT id FROM games WHERE slug = $1 AND is_published = true",
      [req.params.slug],
    );
    if (!game.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Game tidak ditemukan.",
      });
    }

    await client.query("BEGIN");
    const review = await client.query(
      `INSERT INTO game_reviews (user_id, game_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, game_id) DO UPDATE
       SET rating = EXCLUDED.rating,
           review_text = EXCLUDED.review_text,
           updated_at = NOW()
       RETURNING id, rating, review_text, created_at`,
      [req.user.id, game.rows[0].id, rating, reviewText.trim() || null],
    );
    await client.query(
      `INSERT INTO game_library (user_id, game_id, status, rating)
       VALUES ($1, $2, 'completed', $3)
       ON CONFLICT (user_id, game_id) DO UPDATE
       SET rating = EXCLUDED.rating`,
      [req.user.id, game.rows[0].id, rating],
    );
    await client.query("COMMIT");

    return res.status(201).json({ success: true, review: review.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Mengirim ulasan gagal:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan ulasan.",
    });
  } finally {
    client.release();
  }
}

module.exports = {
  getHome,
  getRankings,
  getGame,
  updateGameLibrary,
  submitGameReview,
};
