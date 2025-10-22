
import EventEmitter from "events";
import { sendEmail } from "./sendEmail";


interface EmailEventPayloads {
  "send-email-activation-code": { to: string; subject: string; html: string };
  "send-reset-password-email": { to: string; subject: string; html: string };
  "send-tagged-email": { to: string; subject: string; html: string; tags: string[] };
}

type UserEventTypes = keyof EmailEventPayloads;


export class UserEvents {
  constructor(private readonly emitter: EventEmitter) {}

  subscribe = <K extends UserEventTypes>(event: K, cb: (payload: EmailEventPayloads[K]) => void) => {
    this.emitter.on(event, cb);
  };

  publish = <K extends UserEventTypes>(event: K, payload: EmailEventPayloads[K]) => {
    this.emitter.emit(event, payload);
  };
}


const emitter = new EventEmitter();
export const emailEmitter = new UserEvents(emitter);


emailEmitter.subscribe("send-email-activation-code", async ({ to, subject, html }) => {
  sendEmail({ to, subject, html });
});

emailEmitter.subscribe("send-reset-password-email", async ({ to, subject, html }) => {
  sendEmail({ to, subject, html });
});

emailEmitter.subscribe("send-tagged-email", async ({ to, subject, html, tags }) => {
  const taggedHtml = `<p><strong>Tags:</strong> ${tags.join(", ")}</p>${html}`;
  sendEmail({ to, subject, html: taggedHtml });
});
