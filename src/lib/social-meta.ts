import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const getSocialMeta = createServerFn({ method: "GET" }).handler(() => ({
  image: new URL("/images/bella-home.png", getRequest().url).href,
}));
