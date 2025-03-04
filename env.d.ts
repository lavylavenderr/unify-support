declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CRONITOR_KEY: string;
      DATABASE_URL: string;
      STR_ENDPOINT: string;
      STR_ACCESSKEY: string;
      STR_SECRETKEY: string;
      DISCORD_TOKEN: string;
      DRAGONFLY_URL: string;
    }
  }
}

export {};
