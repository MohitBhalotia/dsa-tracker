export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });

  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  sheets: ["sheets"] as const,
  sheetDetail: (slug: string, search: string) => ["sheet-detail", slug, search] as const,
  question: (id: string) => ["question", id] as const,
  revisions: ["revisions"] as const,
};
