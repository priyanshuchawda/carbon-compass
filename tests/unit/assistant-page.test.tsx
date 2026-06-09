import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AssistantPage from "@/app/assistant/page";
import * as sessionLib from "@/lib/carbon/session";

// Mock loadSessionPayload
vi.mock("@/lib/carbon/session", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/carbon/session")>();
  return {
    ...original,
    loadSessionPayload: vi.fn(),
  };
});

describe("Assistant Page Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders assistant page with header, warning, suggestions, and input form", () => {
    vi.mocked(sessionLib.loadSessionPayload).mockReturnValue(null); // demo mode

    render(<AssistantPage />);

    expect(screen.getByRole("heading", { name: /ai carbon assistant/i })).toBeInTheDocument();
    expect(screen.getByText(/showing demo profile data/i)).toBeInTheDocument();
    expect(screen.getByText(/how can i help you today/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ask about your emissions/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    expect(
      screen.getByRole("log", { name: /conversation with carbon compass assistant/i }),
    ).toBeInTheDocument();

    // suggestions
    expect(screen.getByRole("button", { name: /what is driving my emissions/i })).toBeInTheDocument();
  });

  it("calls fetch API when user submits a message", async () => {
    vi.mocked(sessionLib.loadSessionPayload).mockReturnValue(null);

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ content: "This is a mock assistant reply." }),
    } as Response);

    render(<AssistantPage />);

    const input = screen.getByPlaceholderText(/ask about your emissions/i);
    fireEvent.change(input, { target: { value: "Tell me about my footprint" } });

    const sendBtn = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendBtn);

    expect(fetchSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("This is a mock assistant reply.")).toBeInTheDocument();
    });
  });
});
