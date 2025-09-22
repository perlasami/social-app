import EventEmitter from "events";
import { sendEmail } from "./sendEmail";

type UserEventTypes = "send-email-activation-code" | "send-reset-password-email";

export class UserEvents {
  constructor(private readonly emitter: EventEmitter) {}

  subscribe = (event: UserEventTypes, cb: (payload: any) => void) => {
    this.emitter.on(event, cb);
  };

  publish = (event: UserEventTypes, payload: any) => {
    this.emitter.emit(event, payload);
  };
}

const emitter = new EventEmitter();
export const emailEmitter = new UserEvents(emitter);


emailEmitter.subscribe("send-email-activation-code", async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  sendEmail({ to, subject, html });
});

emailEmitter.subscribe("send-reset-password-email", async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  sendEmail({ to, subject, html });
});