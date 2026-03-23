export const Env = {
  cloudflare: {
    bucketName:
      process.env.CLOUDFLARE_BUCKET_NAME ||
      unreachable("CLOUDFLARE_BUCKET_NAME"),
    accountId:
      process.env.CLOUDFLARE_ACCOUNT_ID || unreachable("CLOUDFLARE_ACCOUNT_ID"),
    accessKeyId:
      process.env.CLOUDFLARE_ACCESS_KEY_ID ||
      unreachable("CLOUDFLARE_ACCESS_KEY_ID"),
    secretAccessKey:
      process.env.CLOUDFLARE_SECRET_ACCESS_KEY ||
      unreachable("CLOUDFLARE_SECRET_ACCESS_KEY"),
  },
} as const;

function unreachable(name: string): never {
  throw new Error(`${name} is not set.`);
}
