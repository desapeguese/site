import { ZodError } from "zod";
import { ApiError } from "./api-error";

export async function handleApiRoute(handler: () => Promise<Response> | Response): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { message: error.message, details: error.details },
        { status: error.status }
      );
    }

    if (error instanceof ZodError) {
      return Response.json(
        { message: "Validation failed.", details: error.flatten() },
        { status: 400 }
      );
    }

    console.error(error);

    return Response.json({ message: "Internal server error." }, { status: 500 });
  }
}
