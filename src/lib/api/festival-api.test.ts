import { afterEach, describe, expect, it, vi } from "vitest";
import { FestivalApiError, createFestivalApiClient } from "./festival-api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("festival API client", () => {
  it("fetches default landing content from the embedded API base URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ slug: "default", sections: [], assets: [] }),
    });

    const client = createFestivalApiClient({
      baseUrl: "/api/v1",
      fetcher: fetchMock as never,
    });

    const payload = await client.getDefaultLandingPage();

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/landing-pages/default", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    expect(payload.slug).toBe("default");
  });

  it("sends bearer token for admin updates", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "section-1", title: "Novo título" }),
    });

    const client = createFestivalApiClient({
      baseUrl: "/api/v1",
      fetcher: fetchMock as never,
    });

    await client.updateSection("section-1", { title: "Novo título" }, "token-123");

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/landing-sections/section-1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
      body: JSON.stringify({ title: "Novo título" }),
    });
  });

  it("updates landing items with bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "item-1", title: "Novo card" }),
    });

    const client = createFestivalApiClient({
      baseUrl: "/api/v1",
      fetcher: fetchMock as never,
    });

    await client.updateItem("item-1", { title: "Novo card" }, "token-123");

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/landing-items/item-1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
      body: JSON.stringify({ title: "Novo card" }),
    });
  });

  it("updates landing assets with bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "asset-1", fileName: "logo.png" }),
    });

    const client = createFestivalApiClient({
      baseUrl: "/api/v1",
      fetcher: fetchMock as never,
    });

    await client.updateAsset(
      "asset-1",
      { fileName: "logo.png", mimeType: "image/png", base64Data: "data" },
      "token-123"
    );

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/landing-assets/asset-1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
      body: JSON.stringify({
        fileName: "logo.png",
        mimeType: "image/png",
        base64Data: "data",
      }),
    });
  });

  it("subscribes emails to the newsletter with a source", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Inscrição confirmada." }),
    });

    const client = createFestivalApiClient({
      baseUrl: "/api/v1",
      fetcher: fetchMock as never,
    });

    await client.subscribeNewsletter("contato@festival.com.br", "footer");

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/newsletter/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "contato@festival.com.br",
        source: "footer",
      }),
    });
  });

  it("throws FestivalApiError for non-2xx responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Invalid email" }),
    });

    const client = createFestivalApiClient({
      baseUrl: "/api/v1",
      fetcher: fetchMock as never,
    });

    await expect(client.subscribeNewsletter("invalid")).rejects.toBeInstanceOf(FestivalApiError);
  });
});
