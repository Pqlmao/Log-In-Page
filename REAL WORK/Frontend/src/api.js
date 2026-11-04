const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(
  /\/$/,
  "",
);

async function request(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Respons server tidak valid.");
  }

  if (!response.ok) {
    throw new Error(data.message || `Permintaan gagal (${response.status}).`);
  }
  if (!data.success) {
    throw new Error(data.message || "Respons server tidak valid.");
  }
  return data;
}

export async function login(credentials) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (!data.user || !data.token) {
    throw new Error("Respons login dari server tidak valid.");
  }
  return { user: data.user, token: data.token };
}

export function logout(token) {
  return request("/auth/logout", {
    method: "POST",
    token,
  });
}

export function getHomeData(token) {
  return request("/media/home", { token });
}

export function getRankings(category = "all", token) {
  return request(`/media/rankings?category=${encodeURIComponent(category)}`, {
    token,
  });
}

export function getGame(slug, token) {
  return request(`/media/games/${encodeURIComponent(slug)}`, { token });
}

export function saveGame(slug, isFavorite, token) {
  return request(`/media/games/${encodeURIComponent(slug)}/library`, {
    method: "PUT",
    token,
    body: JSON.stringify({ isFavorite, status: "plan" }),
  });
}

export function submitGameReview(slug, rating, reviewText, token) {
  return request(`/media/games/${encodeURIComponent(slug)}/reviews`, {
    method: "POST",
    token,
    body: JSON.stringify({ rating, reviewText }),
  });
}

export function getProfile(token) {
  return request("/profile/me", { token });
}

export function updateProfile(token, displayName, bio) {
  return request("/profile/me", {
    method: "PUT",
    token,
    body: JSON.stringify({ displayName, bio }),
  });
}
