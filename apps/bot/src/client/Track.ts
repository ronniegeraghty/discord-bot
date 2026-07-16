import {
  AudioResource,
  createAudioResource,
  demuxProbe,
} from "@discordjs/voice";
import youtubedl from "youtube-dl-exec";

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

  public createAudioResource(): Promise<AudioResource<Track>> {
    return new Promise((resolve, reject) => {
      // Stream the best audio track from yt-dlp straight to stdout; demuxProbe
      // detects the container/codec so it can play without re-encoding.
      const subprocess = youtubedl.exec(
        this.url,
        {
          output: "-",
          format: "bestaudio[acodec=opus]/bestaudio/best",
          quiet: true,
          noWarnings: true,
          noPlaylist: true,
          noCheckCertificates: true,
          // Give yt-dlp a JS runtime so it doesn't fall back to throttled
          // YouTube formats, which caused the audio to cut out mid-track.
          jsRuntimes: "node",
        },
        { stdio: ["ignore", "pipe", "ignore"] },
      );

      const stream = subprocess.stdout;
      if (!stream) {
        reject(new Error("Failed to start audio stream."));
        return;
      }

      // Surface spawn/stream errors as a rejection instead of letting them
      // bubble up as an uncaught exception that crashes the bot.
      subprocess.once("error", (error) => reject(error));
      stream.once("error", (error) => reject(error));

      demuxProbe(stream)
        .then((probe) =>
          resolve(
            createAudioResource(probe.stream, {
              metadata: this,
              inputType: probe.type,
            }),
          ),
        )
        .catch((error) => reject(error));
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
