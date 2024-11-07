import { Cronitor } from "cronitor";
import { env } from "./env";

export const cronitor = new Cronitor(env.CRONITOR_API_KEY)