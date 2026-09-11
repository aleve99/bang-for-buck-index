import { describe, expect, it } from "vitest";
import { takeReceiptFile } from "@/lib/storage";

describe("takeReceiptFile", () => {
  it("pulls a non-empty File out of FormData so Zod never sees it", () => {
    const form = new FormData();
    form.set("beerName", "Pils");
    form.set("receipt", new File(["png"], "receipt.png", { type: "image/png" }));

    const file = takeReceiptFile(form);

    expect(file?.name).toBe("receipt.png");
    expect(file?.type).toBe("image/png");
    expect(form.has("receipt")).toBe(false);
    expect(form.get("beerName")).toBe("Pils");
  });

  it("returns null for an empty file input", () => {
    const form = new FormData();
    form.set("receipt", new File([], "", { type: "application/octet-stream" }));
    expect(takeReceiptFile(form)).toBeNull();
  });
});
