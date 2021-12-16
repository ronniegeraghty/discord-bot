import {
  AudioResource,
  createAudioResource,
  demuxProbe,
} from "@discordjs/voice";
import ytdl, { getInfo } from "ytdl-core";
import { exec as ytdl_exec } from "youtube-dl-exec";
/**
 * This is the data required to create a Track Object
 */
export interface TrackData {
  url: string;
  title: string;
  onStart: () => void;
  onFinish: () => void;
  onError: (error: Error) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {
  //comment to avoid sonarlint rule
};

export default class Track implements TrackData {
  public readonly url: string;
  public readonly title: string;
  public readonly onStart: () => void;
  public readonly onFinish: () => void;
  public readonly onError: (error: Error) => void;

  private constructor({ url, title, onStart, onFinish, onError }: TrackData) {
    this.url = url;
    this.title = title;
    this.onStart = onStart;
    this.onFinish = onFinish;
    this.onError = onError;
  }

  public createAudioResource(): Promise<AudioResource<Track>> {
    return new Promise((resolve, reject) => {
      // const process = ytdl(
      //   this.url,
      //   {},
      //   { stdio: ["ignore", "pipe", "ignore"] }
      // );
      // if (!process.stdout) {
      //   reject(new Error("No stdout"));
      // }
      // const stream = process.stdout;
      // const onError = (error: Error) => {
      //   if (!process.killed) process.kill();
      //   stream.resume();
      //   reject(error);
      // };
      // process.once("spawn", () => {
      //   demuxProbe(stream)
      //     .then((probe: { stream: any; type: any }) =>
      //       resolve(
      //         createAudioResource(probe.stream, {
      //           metadata: this,
      //           inputType: probe.type,
      //         })
      //       )
      //     )
      //     .catch(onError);
      // });
      const stream = ytdl(this.url, { filter: "audioonly" });
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

  public static async from(
    url: string,
    methods: Pick<Track, "onStart" | "onFinish" | "onError">
  ): Promise<Track> {
    const info = await getInfo(url);
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
    return new Track({
      title: info.videoDetails.title,
      url,
      ...wrapperMethods,
    });
  }
}
