const TOKEN_COOKIE_NAME = "echoes_auth_token";
const USER_COOKIE_NAME = "echoes_auth_user";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

const readCookie = (name) => {
  if (typeof document === "undefined") return null;

  const encodedName = `${name}=`;
  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const cookie of cookies) {
    if (cookie.startsWith(encodedName)) {
      return decodeURIComponent(cookie.slice(encodedName.length));
    }
  }

  return null;
};

const writeCookie = (name, value, maxAgeSeconds) => {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
};

const clearCookie = (name) => {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

export const getAuthToken = () => {
  const cookieToken = readCookie(TOKEN_COOKIE_NAME);
  if (cookieToken) return cookieToken;

  const legacyToken = localStorage.getItem("token");
  if (legacyToken) {
    writeCookie(TOKEN_COOKIE_NAME, legacyToken, TOKEN_MAX_AGE);
    localStorage.removeItem("token");
    return legacyToken;
  }

  const cookieUser = readCookie(USER_COOKIE_NAME);
  if (cookieUser) {
    try {
      const parsed = JSON.parse(cookieUser);
      if (parsed?.token) {
        writeCookie(TOKEN_COOKIE_NAME, parsed.token, TOKEN_MAX_AGE);
        return parsed.token;
      }
    } catch {
      return null;
    }
  }

  const legacyUser = localStorage.getItem("user");
  if (legacyUser) {
    try {
      const parsed = JSON.parse(legacyUser);
      if (parsed?.token) {
        writeCookie(TOKEN_COOKIE_NAME, parsed.token, TOKEN_MAX_AGE);
        localStorage.removeItem("user");
        return parsed.token;
      }
    } catch {
      return null;
    }
  }

  return null;
};

export const getStoredUser = () => {
  const cookieUser = readCookie(USER_COOKIE_NAME);
  if (cookieUser) {
    try {
      const parsed = JSON.parse(cookieUser);
      const token = readCookie(TOKEN_COOKIE_NAME) || parsed?.token || null;
      return token ? { ...parsed, token } : parsed;
    } catch {
      return null;
    }
  }

  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser);

    if (parsed?.token) {
      const { token, ...safeUser } = parsed;
      writeCookie(USER_COOKIE_NAME, JSON.stringify(safeUser), TOKEN_MAX_AGE);
      writeCookie(TOKEN_COOKIE_NAME, token, TOKEN_MAX_AGE);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return { ...safeUser, token };
    }

    const token = readCookie(TOKEN_COOKIE_NAME) || localStorage.getItem("token");
    if (!token) return null;

    writeCookie(USER_COOKIE_NAME, JSON.stringify(parsed), TOKEN_MAX_AGE);
    writeCookie(TOKEN_COOKIE_NAME, token, TOKEN_MAX_AGE);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return { ...parsed, token };
  } catch {
    return null;
  }
};

export const setAuthSession = (userData, token) => {
  const { token: _token, ...safeUser } = userData || {};
  writeCookie(USER_COOKIE_NAME, JSON.stringify(safeUser), TOKEN_MAX_AGE);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  writeCookie(TOKEN_COOKIE_NAME, token, TOKEN_MAX_AGE);
};

export const clearAuthSession = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  clearCookie(USER_COOKIE_NAME);
  clearCookie(TOKEN_COOKIE_NAME);
};

export const updateStoredUser = (userData) => {
  const { token: _token, ...safeUser } = userData || {};
  writeCookie(USER_COOKIE_NAME, JSON.stringify(safeUser), TOKEN_MAX_AGE);
  localStorage.removeItem("user");
};