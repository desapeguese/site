import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "./footer";
import { festivalApi } from "@/lib/api/festival-api";
import { toast } from "sonner";

vi.mock("@/lib/api/festival-api", () => ({
  festivalApi: {
    subscribeNewsletter: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe("Footer newsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits the email to the newsletter API and clears the field on success", async () => {
    vi.mocked(festivalApi.subscribeNewsletter).mockResolvedValue({ message: "Inscrição confirmada." });

    render(React.createElement(Footer));

    const input = screen.getByLabelText("Endereço de email");
    fireEvent.change(input, { target: { value: "contato@festival.com.br" } });
    fireEvent.click(screen.getByRole("button", { name: "Assinar Newsletter" }));

    await waitFor(() => {
      expect(festivalApi.subscribeNewsletter).toHaveBeenCalledWith("contato@festival.com.br", "footer");
    });

    expect(input).toHaveValue("");
    expect(toast.success).toHaveBeenCalledWith("Inscrição confirmada.");
  });

  it("keeps the email available when the newsletter API fails", async () => {
    vi.mocked(festivalApi.subscribeNewsletter).mockRejectedValue(new Error("Falha"));

    render(React.createElement(Footer));

    const input = screen.getByLabelText("Endereço de email");
    fireEvent.change(input, { target: { value: "contato@festival.com.br" } });
    fireEvent.click(screen.getByRole("button", { name: "Assinar Newsletter" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Não foi possível assinar a newsletter.");
    });

    expect(input).toHaveValue("contato@festival.com.br");
  });
});
