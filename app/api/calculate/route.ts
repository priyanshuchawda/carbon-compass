import { calculateFootprint } from "@/lib/carbon/calculate";
import { footprintRequestSchema } from "@/lib/validation/schemas";
import { parseBoundedBody, apiSuccess } from "@/lib/carbon/api-utils";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBoundedBody(request, footprintRequestSchema);
  if (!parsed.success) {
    return parsed.errorResponse;
  }

  const result = calculateFootprint(parsed.data.footprint, parsed.data.profile);
  return apiSuccess({ result });
}
