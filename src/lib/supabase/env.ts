function isHttpUrl(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function deriveSupabaseUrlFromDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  try {
    const host = new URL(databaseUrl).hostname;
    const match = host.match(/^db\.([a-z0-9-]+)\.supabase\.co$/);

    if (!match) {
      return undefined;
    }

    return `https://${match[1]}.supabase.co`;
  } catch {
    return undefined;
  }
}

export function getSupabaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (isHttpUrl(configuredUrl)) {
    return configuredUrl;
  }

  const derivedUrl = deriveSupabaseUrlFromDatabaseUrl();

  if (derivedUrl) {
    return derivedUrl;
  }

  throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid http(s) URL.");
}

export function getSupabaseAnonKey() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required.");
  }

  return anonKey;
}
