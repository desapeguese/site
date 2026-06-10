import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { ApiError } from "../http/api-error";

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function normalizeBase64Image(value: string, fallbackMimeType = "application/octet-stream") {
  const trimmed = value.trim();
  const match = DATA_URL_PATTERN.exec(trimmed);

  if (match) {
    return {
      mimeType: assertAllowedImageMimeType(match[1]),
      base64Data: assertValidBase64(match[2]),
    };
  }

  return {
    mimeType: assertAllowedImageMimeType(fallbackMimeType),
    base64Data: assertValidBase64(trimmed),
  };
}

export function readFrontendAssetAsBase64(relativePath: string): string {
  return readFileSync(resolveFrontendPublicAssetPath(relativePath)).toString("base64");
}

function assertAllowedImageMimeType(mimeType: string): string {
  const normalizedMimeType = mimeType.trim().toLowerCase();

  if (!ALLOWED_IMAGE_MIME_TYPES.has(normalizedMimeType)) {
    throw new ApiError(400, "Asset MIME type must be an image.");
  }

  return normalizedMimeType;
}

function assertValidBase64(base64Data: string): string {
  const normalizedBase64 = base64Data.trim();

  if (
    normalizedBase64.length === 0 ||
    normalizedBase64.length % 4 === 1 ||
    !BASE64_PATTERN.test(normalizedBase64)
  ) {
    throw new ApiError(400, "Asset data must be valid Base64.");
  }

  return normalizedBase64;
}

function resolveFrontendPublicAssetPath(relativePath: string): string {
  if (isAbsolute(relativePath)) {
    throw new Error("Frontend asset paths must be relative.");
  }

  const root = process.cwd();
  const candidate = resolve(root, relativePath);
  const relativeToRoot = relative(root, candidate);

  if (
    relativeToRoot === ".." ||
    relativeToRoot.startsWith("..\\") ||
    relativeToRoot.startsWith("../") ||
    isAbsolute(relativeToRoot)
  ) {
    throw new Error("Frontend asset path escapes the frontend root.");
  }

  if (!existsSync(candidate)) {
    throw new Error(`Frontend asset not found: ${relativePath}`);
  }

  return candidate;
}
