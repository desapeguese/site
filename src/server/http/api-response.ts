export function jsonResponse<T>(payload: T, init?: ResponseInit): Response {
  return Response.json(payload, init);
}

export function emptyResponse(status = 204): Response {
  return new Response(null, { status });
}

export function csvResponse(fileName: string, csv: string): Response {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
