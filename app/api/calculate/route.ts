import { calculateFootprint } from "@/lib/carbon/calculate";
import { footprintRequestSchema } from "@/lib/validation/schemas";

async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const payload = footprintRequestSchema.safeParse(await parseJson(request));

  if (!payload.success) {
    return Response.json(
      {
        error: "Invalid input",
        issues: payload.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  return Response.json({
    result: calculateFootprint(payload.data.footprint, payload.data.profile),
  });
}
