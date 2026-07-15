import { describe, it, expect, vi } from "vitest";

// Track pulls in heavy runtime deps (yt-dlp + @discordjs/voice) that aren't
// needed to exercise its pure URL parsing, so stub them out.
vi.mock("youtube-dl-exec", () => ({ default: vi.fn() }));
vi.mock("@discordjs/voice", () => ({
  createAudioResource: vi.fn(),
  demuxProbe: vi.fn(),
  AudioResource: class {},
}));

import Track from "./Track";

describe("Track.findUrlEndPoint", () => {
  it("finds the index of a .com endpoint", () => {
    expect(Track.findUrlEndPoint("https://www.youtube.com/watch?v=abc")).toBe(
      19
    );
  });

  it("finds the index of a .be endpoint", () => {
    expect(Track.findUrlEndPoint("https://youtu.be/abc")).toBe(13);
  });

  it("returns 0 when no known endpoint is present", () => {
    expect(Track.findUrlEndPoint("not-a-url")).toBe(0);
  });
});

describe("Track.getURLType", () => {
  it("detects full youtube.com URLs", () => {
    expect(Track.getURLType("https://www.youtube.com/watch?v=abc")).toBe(
      "youtube"
    );
  });

  it("detects youtu.be short URLs", () => {
    expect(Track.getURLType("https://youtu.be/abc")).toBe("youtube");
  });

  it("detects soundcloud URLs", () => {
    expect(Track.getURLType("https://soundcloud.com/artist/track")).toBe(
      "soundcloud"
    );
  });

  it("returns null for unsupported URLs", () => {
    expect(Track.getURLType("https://example.com/foo")).toBeNull();
  });
});
