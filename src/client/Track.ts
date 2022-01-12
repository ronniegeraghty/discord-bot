import {
  AudioResource,
  createAudioResource,
  demuxProbe,
} from "@discordjs/voice";
import ytdl, { getBasicInfo as getYoutubeInfo } from "ytdl-core";
import { Readable } from "stream";

/**
 * This is the data required to create a Track Object
 */
export interface TrackData {
  url: string;
  urlType: ULRTYPES;
  title: string;
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
  public readonly userTag: string;
  public readonly onStart: () => void;
  public readonly onFinish: () => void;
  public readonly onError: (error: Error) => void;

  private constructor({
    url,
    urlType,
    title,
    userTag,
    onStart,
    onFinish,
    onError,
  }: TrackData) {
    this.url = url;
    this.urlType = urlType;
    this.title = title;
    this.userTag = userTag;
    this.onStart = onStart;
    this.onFinish = onFinish;
    this.onError = onError;
  }

  public createAudioResource(): Promise<AudioResource<Track>> {
    return new Promise(async (resolve, reject) => {
      let stream: Readable;
      switch (this.urlType) {
        case "youtube":
          stream = ytdl(this.url, { filter: "audioonly" });
          break;
        default:
          reject();
      }

      demuxProbe(stream).then((probe: { stream: any; type: any }) =>
        resolve(
          createAudioResource(probe.stream, {
            metadata: this,
            inputType: probe.type,
          })
        )
      );
    });
  }

  public static from(
    url: string,
    userTag: string,
    methods: Pick<Track, "onStart" | "onFinish" | "onError">
  ): Promise<Track> {
    return new Promise(async (resolve, reject) => {
      const urlType = this.getURLType(url);
      const title = await this.getTitle(url, urlType);
      if (!title) reject("Invalide URL Type");
      //The methods are wrapped so that we can ensure that they are only called once.
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
      resolve(
        new Track({
          title: title,
          urlType,
          url,
          userTag,
          ...wrapperMethods,
        })
      );
    });
  }
  public static getURLType(url: string): ULRTYPES {
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
  public static async getTitle(url, urlType): Promise<string> {
    switch (urlType) {
      case "youtube":
        return (await getYoutubeInfo(url)).videoDetails.title;
      default:
        return "";
    }
  }
}
