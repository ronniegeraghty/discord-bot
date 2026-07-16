import {
  AudioResource,
  createAudioResource,
  StreamType,
} from "@discordjs/voice";
import youtubedl from "youtube-dl-exec";
import { spawn } from "node:child_process";
import ffmpegStatic from "ffmpeg-static";

// Prefer an explicit path (set in the container to the system ffmpeg), then the
// bundled static binary (handy for local dev), then whatever is on PATH.
const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg";

/**
 * This is the data required to create a Track Object
 */
export interface TrackData {
  url: string;
  urlType: ULRTYPES;
  title: string;
  thumbnail: string | null;
  userTag: string;
  onStart: () => void;
  onFinish: () => void;
  onError: (error: Error) => void;
}

 
const noop = () => {
  //comment to avoid sonarlint rule
};

export type ULRTYPES = "youtube" | "soundcloud";

export default class Track implements TrackData {
  public readonly url: string;
  public readonly urlType: ULRTYPES;
  public readonly title: string;
  public readonly thumbnail: string | null;
  public readonly userTag: string;
  public readonly onStart: () => void;
  public readonly onFinish: () => void;
  public readonly onError: (error: Error) => void;

  private constructor({
    url,
    urlType,
    title,
    thumbnail,
    userTag,
    onStart,
    onFinish,
    onError,
  }: TrackData) {
    this.url = url;
    this.urlType = urlType;
    this.title = title;
    this.thumbnail = thumbnail;
    this.userTag = userTag;
    this.onStart = onStart;
    this.onFinish = onFinish;
    this.onError = onError;
  }

  public async createAudioResource(): Promise<AudioResource<Track>> {
    // Resolve the direct media URL at play time (URLs can expire while queued).
    // yt-dlp needs a JS runtime so YouTube returns a full-speed (un-throttled)
    // URL instead of one that starves the buffer and makes the audio cut out.
    const resolved = await youtubedl(this.url, {
      format: "bestaudio[acodec=opus]/bestaudio/best",
      getUrl: true,
      noWarnings: true,
      noPlaylist: true,
      noCheckCertificates: true,
      jsRuntimes: "node",
    });
    const mediaUrl = String(resolved).trim().split("\n")[0];
    if (!mediaUrl) {
      throw new Error("Failed to resolve a playable media URL.");
    }

    // Let FFmpeg pull the media directly: it handles HLS (SoundCloud) and
    // reconnects on network hiccups, emitting a uniform Ogg/Opus stream that
    // Discord plays without the slow pure-JS encoder (and without the stalls
    // caused by piping a non-seekable MP4 through the probe path).
    const ffmpeg = spawn(
      ffmpegPath,
      [
        "-reconnect", "1",
        "-reconnect_streamed", "1",
        "-reconnect_delay_max", "5",
        "-i", mediaUrl,
        "-vn",
        "-c:a", "libopus",
        "-f", "ogg",
        "-ar", "48000",
        "-ac", "2",
        "pipe:1",
      ],
      { stdio: ["ignore", "pipe", "ignore"] },
    );

    const stream = ffmpeg.stdout;
    if (!stream) {
      ffmpeg.kill("SIGKILL");
      throw new Error("Failed to start the audio transcoder.");
    }

    // Clean up the FFmpeg process once playback ends or the stream errors.
    const cleanup = () => {
      if (!ffmpeg.killed) ffmpeg.kill("SIGKILL");
    };
    ffmpeg.once("error", cleanup);
    stream.once("error", cleanup);
    stream.once("close", cleanup);

    return createAudioResource(stream, {
      metadata: this,
      inputType: StreamType.OggOpus,
    });
  }

  public static async from(
    url: string,
    userTag: string,
    methods: Pick<Track, "onStart" | "onFinish" | "onError">,
  ): Promise<Track> {
    const urlType = this.getURLType(url);
    if (!urlType) {
      throw new Error(
        "Invalid or unsupported URL. Provide a YouTube or SoundCloud link.",
      );
    }

    // Fetch metadata (title + thumbnail) once, up front, via yt-dlp.
    const info = (await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noPlaylist: true,
      noCheckCertificates: true,
      // Use the container's Node as yt-dlp's JS runtime so YouTube extraction
      // isn't degraded/throttled (a missing runtime caused audio drop-outs).
      jsRuntimes: "node",
    })) as { title?: string; thumbnail?: string };

    // The methods are wrapped so that we can ensure they are only called once.
    const wrapperMethods = {
      onStart() {
        wrapperMethods.onStart = noop;
        methods.onStart();
      },
      onFinish() {
        wrapperMethods.onFinish = noop;
        methods.onFinish();
      },
      onError(error: Error) {
        wrapperMethods.onError = noop;
        methods.onError(error);
      },
    };

    return new Track({
      url,
      urlType,
      title: info.title ?? "Unknown title",
      thumbnail: info.thumbnail ?? null,
      userTag,
      ...wrapperMethods,
    });
  }
  public static getURLType(url: string): ULRTYPES | null {
    let host: string;
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch {
      return null;
    }
    // Match the domain (and any subdomain like www./m./music./on.) rather than
    // a brittle string prefix, so share and mobile links are recognised too.
    const isHost = (domain: string) =>
      host === domain || host.endsWith(`.${domain}`);
    if (host === "youtu.be" || isHost("youtube.com")) return "youtube";
    if (isHost("soundcloud.com")) return "soundcloud";
    return null;
  }
}
