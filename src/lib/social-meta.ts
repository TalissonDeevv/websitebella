import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const getSocialMeta = createServerFn({ method: "GET" }).handler(() => ({
  image: new URL("/images/bella-retrato-rubro.png", getRequest().url).href,
}));
