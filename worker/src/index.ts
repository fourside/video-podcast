import { Hono } from "hono";
import { generateFeed } from "./feed";

type Bindings = {
  BUCKET: R2Bucket;
  HOST: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/feed.xml", async (c) => {
  const objects = await listAllObjects(c.env.BUCKET);
  const xml = generateFeed(c.env.HOST, objects);
  return c.body(xml, 200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  });
});

app.on("GET", "/episodes/:key{.+}", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  return serveEpisode(c.env.BUCKET, c.req.raw, key);
});

app.on("HEAD", "/episodes/:key{.+}", async (c) => {
  const key = decodeURIComponent(c.req.param("key"));
  const head = await c.env.BUCKET.head(key);
  if (!head) {
    return c.notFound();
  }
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(head.size),
      "Accept-Ranges": "bytes",
    },
  });
});

async function listAllObjects(bucket: R2Bucket): Promise<R2Object[]> {
  const allObjects: R2Object[] = [];
  let cursor: string | undefined;
  let truncated = true;

  while (truncated) {
    const list = await bucket.list({
      include: ["customMetadata"],
      cursor,
      limit: 1000,
    });
    allObjects.push(...list.objects);
    truncated = list.truncated;
    if (list.truncated) {
      cursor = list.cursor;
    }
  }
  return allObjects;
}

async function serveEpisode(
  bucket: R2Bucket,
  request: Request,
  key: string,
): Promise<Response> {
  const rangeHeader = request.headers.get("Range");

  if (rangeHeader) {
    const match = rangeHeader.match(/^bytes=(\d+)-(\d*)$/);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : undefined;

      const object = await bucket.get(key, {
        range:
          end !== undefined
            ? { offset: start, length: end - start + 1 }
            : { offset: start },
      });
      if (!object) {
        return new Response("Not Found", { status: 404 });
      }

      const totalSize = object.size;
      const actualEnd = end !== undefined ? end : totalSize - 1;
      const contentLength = actualEnd - start + 1;

      return new Response(object.body, {
        status: 206,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Range": `bytes ${start}-${actualEnd}/${totalSize}`,
          "Content-Length": String(contentLength),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }
  }

  const object = await bucket.get(key);
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(object.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export default { fetch: app.fetch };
