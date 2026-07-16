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

describe("Track.getURLType", () => {
  it("detects youtube.com URLs with or without a subdomain", () => {
    expect(Track.getURLType("https://www.youtube.com/watch?v=abc")).toBe(
      "youtube"
    );
    expect(Track.getURLType("https://youtube.com/watch?v=abc")).toBe("youtube");
    expect(Track.getURLType("https://m.youtube.com/watch?v=abc")).toBe(
      "youtube"
    );
    expect(Track.getURLType("https://music.youtube.com/watch?v=abc")).toBe(
      "youtube"
    );
  });

  it("detects youtu.be short URLs", () => {
    expect(Track.getURLType("https://youtu.be/abc")).toBe("youtube");
  });

  it("detects soundcloud URLs including share and mobile subdomains", () => {
    expect(Track.getURLType("https://soundcloud.com/artist/track")).toBe(
      "soundcloud"
    );
    expect(Track.getURLType("https://on.soundcloud.com/abcd")).toBe(
      "soundcloud"
    );
    expect(Track.getURLType("https://m.soundcloud.com/artist/track")).toBe(
      "soundcloud"
    );
  });

  it("returns null for unsupported or malformed URLs", () => {
    expect(Track.getURLType("https://example.com/foo")).toBeNull();
    expect(Track.getURLType("https://notyoutube.com/foo")).toBeNull();
    expect(Track.getURLType("not a url")).toBeNull();
  });
});
