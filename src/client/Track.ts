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

// eslint-disable-next-line @typescript-eslint/no-empty-function
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
    let endIndex: number = this.findUrlEndPoint(url);
    switch (url.substring(0, endIndex)) {
      case "https://www.youtube":
        return "youtube";
      case "https://youtu":
        return "youtube";
      case "https://soundcloud":
        return "soundcloud";
      default:
        return null;
    }
  }
  public static findUrlEndPoint(url: string): number {
    const endPointList = [".com", ".be"];
    for (let endPoint of endPointList) {
      const endPointIndex = url.toString().indexOf(endPoint);
      if (endPointIndex !== -1) {
        return endPointIndex;
      }
    }
    return 0;
  }
}
