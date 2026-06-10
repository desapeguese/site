export type Base64AssetPayload = {
  fileName: string;
  mimeType: string;
  base64Data: string;
};

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_API_BASE64_LENGTH = 8_000_000;
const TARGET_BASE64_LENGTH = 7_800_000;
const RESIZE_LIMITS = [1920, 1600, 1280, 960, 720];
const QUALITY_STEPS = [0.82, 0.74, 0.66, 0.58, 0.5];

type DataUrlParts = {
  mimeType: string;
  base64Data: string;
};

function parseDataUrl(value: string): DataUrlParts {
  const match = /^data:([^;]+);base64,(.+)$/.exec(value);

  if (!match) {
    throw new Error("Não foi possível ler a imagem.");
  }

  return {
    mimeType: match[1].trim().toLowerCase(),
    base64Data: match[2],
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result));
    };

    reader.onerror = () => {
      reject(new Error("Não foi possível ler o arquivo."));
    };

    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível processar a imagem."));
    image.src = dataUrl;
  });
}

function getScaledSize(width: number, height: number, maxDimension: number): { width: number; height: number } {
  const largestDimension = Math.max(width, height);

  if (largestDimension <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / largestDimension;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function replaceExtension(fileName: string, mimeType: string): string {
  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1] ?? "webp";
  const baseName = fileName.replace(/\.[^.]+$/, "");

  return `${baseName}.${extension}`;
}

function canCompressInBrowser(): boolean {
  return typeof document !== "undefined" && typeof Image !== "undefined";
}

async function compressImage(file: File, sourceDataUrl: string): Promise<Base64AssetPayload> {
  if (!canCompressInBrowser()) {
    throw new Error("Imagem muito grande. Tente enviar uma imagem menor.");
  }

  const image = await loadImage(sourceDataUrl);
  const outputMimeTypes = ["image/webp", "image/jpeg"];

  for (const maxDimension of RESIZE_LIMITS) {
    const size = getScaledSize(image.naturalWidth || image.width, image.naturalHeight || image.height, maxDimension);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext("2d");
    if (!context) continue;

    for (const outputMimeType of outputMimeTypes) {
      context.clearRect(0, 0, size.width, size.height);

      if (outputMimeType === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, size.width, size.height);
      }

      context.drawImage(image, 0, 0, size.width, size.height);

      for (const quality of QUALITY_STEPS) {
        const candidate = parseDataUrl(canvas.toDataURL(outputMimeType, quality));

        if (!ALLOWED_IMAGE_MIME_TYPES.has(candidate.mimeType)) {
          continue;
        }

        if (candidate.base64Data.length <= TARGET_BASE64_LENGTH) {
          return {
            fileName: replaceExtension(file.name, candidate.mimeType),
            mimeType: candidate.mimeType,
            base64Data: candidate.base64Data,
          };
        }
      }
    }
  }

  throw new Error("Imagem muito grande. Tente enviar uma imagem menor.");
}

export function fileToBase64Payload(file: File): Promise<Base64AssetPayload> {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return Promise.reject(new Error("Formato de imagem não permitido."));
  }

  return readFileAsDataUrl(file).then(async (dataUrl) => {
    const payload = parseDataUrl(dataUrl);

    if (payload.base64Data.length <= MAX_API_BASE64_LENGTH) {
      return {
        fileName: file.name,
        mimeType: file.type,
        base64Data: payload.base64Data,
      };
    }

    return compressImage(file, dataUrl);
  });
}
