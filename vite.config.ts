import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function updateMetaTag(html: string, attr: "name" | "property", key: string, content: string): string {
  const re = new RegExp(`<meta\\s+[^>]*?${attr}=["']${key}["'][^>]*?>`, "gi");
  if (re.test(html)) {
    return html.replace(re, (tag) => {
      if (/content=["'][^"']*?["']/i.test(tag)) {
        return tag.replace(/content=["'][^"']*?["']/i, `content="${content}"`);
      }
      return tag.replace(/>$/, ` content="${content}">`);
    });
  }
  return html.replace("</head>", `  <meta ${attr}="${key}" content="${content}" />\n  </head>`);
}

function updateTitle(html: string, title: string): string {
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  }
  return html.replace("</head>", `  <title>${title}</title>\n  </head>`);
}

function generatePageHtml(
  baseHtml: string,
  meta: { title: string; description: string; image: string; url: string },
): string {
  let out = updateTitle(baseHtml, meta.title);
  out = updateMetaTag(out, "name", "description", meta.description);
  out = updateMetaTag(out, "property", "og:title", meta.title);
  out = updateMetaTag(out, "property", "og:description", meta.description);
  out = updateMetaTag(out, "property", "og:image", meta.image);
  out = updateMetaTag(out, "property", "og:image:alt", meta.title);
  out = updateMetaTag(out, "property", "og:url", meta.url);
  out = updateMetaTag(out, "name", "twitter:title", meta.title);
  out = updateMetaTag(out, "name", "twitter:description", meta.description);
  out = updateMetaTag(out, "name", "twitter:image", meta.image);
  out = updateMetaTag(out, "name", "twitter:url", meta.url);
  return out;
}

function staticSocialPages(): Plugin {
  return {
    name: "static-social-pages",
    apply: "build",
    closeBundle() {
      const clientDir = path.resolve(__dirname, "dist/client");
      const indexPath = path.join(clientDir, "index.html");
      if (!fs.existsSync(indexPath)) return;

      const baseHtml = fs.readFileSync(indexPath, "utf8");

      const pages = [
        {
          dir: path.join(clientDir, "bookings"),
          meta: {
            title: "Book Fash Shot It — Moments worth keeping, shot right.",
            description:
              "Studio sessions, video coverage and drone shoots for convocation, birthdays, weddings, matriculation, corporate and portraits across Lagos.",
            image: "https://fashshotit.com/images/media/events/FSI%20(76%20of%20682).webp",
            url: "https://fashshotit.com/bookings",
          },
        },
        {
          dir: path.join(clientDir, "bookings", "unilag"),
          meta: {
            title: "UNILAG Convocation — Your convocation, shot beautifully | Fash Shot It",
            description:
              "Photos, a headshot, your gown and props, all on the day. Book alone or with up to 5 friends.",
            image: "https://fashshotit.com/images/media/portraits/FSI_7628.webp",
            url: "https://fashshotit.com/bookings/unilag",
          },
        },
        {
          dir: path.join(clientDir, "unilag"),
          meta: {
            title: "UNILAG Convocation — Your convocation, shot beautifully | Fash Shot It",
            description:
              "Photos, a headshot, your gown and props, all on the day. Book alone or with up to 5 friends.",
            image: "https://fashshotit.com/images/media/portraits/FSI_7628.webp",
            url: "https://bookings.fashshotit.com/unilag",
          },
        },
      ];

      for (const { dir, meta } of pages) {
        fs.mkdirSync(dir, { recursive: true });
        const html = generatePageHtml(baseHtml, meta);
        fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), cloudflare(), staticSocialPages()],
});
