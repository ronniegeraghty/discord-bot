import { Listener } from "discord-akairo";

export default class ReadyListener extends Listener {
  public constructor() {
    super("ready", {
      emitter: "client",
      event: "reday",
      category: "client",
    });
  }
  public exec(): void {
    console.log(`${this.client.user.tag} is now online and ready!`);
  }
}
