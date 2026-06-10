import { describe, expect, it } from "vitest";
import { fileToBase64Payload } from "./file-to-base64";

describe("fileToBase64Payload", () => {
  it("converts a File into an API asset payload with raw Base64", async () => {
    const file = new File(["abc"], "logo.png", { type: "image/png" });

    const result = await fileToBase64Payload(file);

    expect(result.fileName).toBe("logo.png");
    expect(result.mimeType).toBe("image/png");
    expect(result.base64Data).toBe("YWJj");
  });

  it("rejects unsupported image upload MIME types", async () => {
    const file = new File(["<svg></svg>"], "unsafe.svg", { type: "image/svg+xml" });

    await expect(fileToBase64Payload(file)).rejects.toThrow("Formato de imagem não permitido.");
  });
});
