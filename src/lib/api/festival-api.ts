import type {
  LandingAsset,
  LandingAssetUpdateInput,
  LandingItem,
  LandingItemInput,
  LandingItemUpdateInput,
  LandingPageContent,
  LandingPageUpdateInput,
  LandingSection,
  LandingSectionUpdateInput,
} from "@/lib/landing/types";
import { clearAdminSession, getAdminSession, saveAdminSession } from "@/lib/admin/admin-session";

type Fetcher = typeof fetch;
type JsonRequestInit = Omit<RequestInit, "headers">;

export class FestivalApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown
  ) {
    super(message);
    this.name = "FestivalApiError";
  }
}

export type FestivalApiClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
};

export type FestivalLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MEMBER";
  };
};

export type NewsletterSubscriptionResponse = {
  message: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : "Erro ao comunicar com a API.";

    throw new FestivalApiError(message, response.status, payload);
  }

  return payload as T;
}

function createJsonHeaders(accessToken?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function getStoredAccessToken(fallbackToken?: string): string | undefined {
  const storedSession = getAdminSession();
  return storedSession?.accessToken ?? fallbackToken;
}

export function createFestivalApiClient(options: FestivalApiClientOptions = {}) {
  const baseUrl = (options.baseUrl ?? "/api/v1").replace(/\/$/, "");
  const fetcher = options.fetcher ?? fetch;

  async function refreshAdminSession(): Promise<string | null> {
    const session = getAdminSession();

    if (!session?.refreshToken) {
      return null;
    }

    const response = await fetcher(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: createJsonHeaders(),
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    if (!response.ok) {
      clearAdminSession();
      return null;
    }

    const refreshedSession = await parseResponse<FestivalLoginResponse>(response);
    saveAdminSession(refreshedSession);

    return refreshedSession.accessToken;
  }

  async function fetchAuthenticatedJson<T>(url: string, init: JsonRequestInit, accessToken: string): Promise<T> {
    const firstAccessToken = getStoredAccessToken(accessToken);
    const firstResponse = await fetcher(url, {
      ...init,
      headers: createJsonHeaders(firstAccessToken),
    });

    if (firstResponse.status !== 401) {
      return parseResponse<T>(firstResponse);
    }

    const refreshedAccessToken = await refreshAdminSession();

    if (!refreshedAccessToken) {
      return parseResponse<T>(firstResponse);
    }

    const retryResponse = await fetcher(url, {
      ...init,
      headers: createJsonHeaders(refreshedAccessToken),
    });

    return parseResponse<T>(retryResponse);
  }

  async function fetchAuthenticatedRaw(url: string, init: JsonRequestInit, accessToken: string): Promise<Response> {
    const firstAccessToken = getStoredAccessToken(accessToken);
    const firstResponse = await fetcher(url, {
      ...init,
      headers: createJsonHeaders(firstAccessToken),
    });

    if (firstResponse.status !== 401) {
      if (!firstResponse.ok) {
        await parseResponse(firstResponse);
      }

      return firstResponse;
    }

    const refreshedAccessToken = await refreshAdminSession();

    if (!refreshedAccessToken) {
      await parseResponse(firstResponse);
      return firstResponse;
    }

    const retryResponse = await fetcher(url, {
      ...init,
      headers: createJsonHeaders(refreshedAccessToken),
    });

    if (!retryResponse.ok) {
      await parseResponse(retryResponse);
    }

    return retryResponse;
  }

  return {
    async getDefaultLandingPage(): Promise<LandingPageContent> {
      const response = await fetcher(`${baseUrl}/landing-pages/default`, {
        headers: createJsonHeaders(),
        cache: "no-store",
      });

      return parseResponse<LandingPageContent>(response);
    },

    async login(email: string, password: string): Promise<FestivalLoginResponse> {
      const response = await fetcher(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: createJsonHeaders(),
        body: JSON.stringify({ email, password }),
      });

      return parseResponse<FestivalLoginResponse>(response);
    },

    async updatePage(payload: LandingPageUpdateInput, accessToken: string): Promise<LandingPageContent> {
      return fetchAuthenticatedJson<LandingPageContent>(
        `${baseUrl}/admin/landing-pages/default`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
        accessToken
      );
    },

    async updateSection(id: string, payload: LandingSectionUpdateInput, accessToken: string): Promise<LandingSection> {
      return fetchAuthenticatedJson<LandingSection>(
        `${baseUrl}/admin/landing-sections/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
        accessToken
      );
    },

    async createItem(sectionId: string, payload: LandingItemInput, accessToken: string): Promise<LandingItem> {
      return fetchAuthenticatedJson<LandingItem>(
        `${baseUrl}/admin/landing-sections/${sectionId}/items`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        accessToken
      );
    },

    async updateItem(id: string, payload: LandingItemUpdateInput, accessToken: string): Promise<LandingItem> {
      return fetchAuthenticatedJson<LandingItem>(
        `${baseUrl}/admin/landing-items/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
        accessToken
      );
    },

    async removeItem(id: string, accessToken: string): Promise<void> {
      return fetchAuthenticatedJson<void>(
        `${baseUrl}/admin/landing-items/${id}`,
        {
          method: "DELETE",
        },
        accessToken
      );
    },

    async updateAsset(id: string, payload: LandingAssetUpdateInput, accessToken: string): Promise<LandingAsset> {
      return fetchAuthenticatedJson<LandingAsset>(
        `${baseUrl}/admin/landing-assets/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
        accessToken
      );
    },

    async subscribeNewsletter(email: string, source = "footer"): Promise<NewsletterSubscriptionResponse> {
      const response = await fetcher(`${baseUrl}/newsletter/subscriptions`, {
        method: "POST",
        headers: createJsonHeaders(),
        body: JSON.stringify({ email, source }),
      });

      return parseResponse<NewsletterSubscriptionResponse>(response);
    },

    async exportNewsletterCsv(accessToken: string): Promise<Blob> {
      const response = await fetchAuthenticatedRaw(
        `${baseUrl}/admin/newsletter/subscriptions/export.csv`,
        { method: "GET" },
        accessToken
      );

      return response.blob();
    },

    async restoreDefaultLandingPage(accessToken: string): Promise<LandingPageContent> {
      return fetchAuthenticatedJson<LandingPageContent>(
        `${baseUrl}/admin/landing-pages/default/restore`,
        { method: "POST" },
        accessToken
      );
    },
  };
}

export const festivalApi = createFestivalApiClient();
