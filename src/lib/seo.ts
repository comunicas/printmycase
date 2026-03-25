const SITE_URL =
  typeof window !== "undefined" ? window.location.origin : "https://studio.printmycase.com.br";

function setMeta(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export interface PageSeoOptions {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string; // default "website"
}

/**
 * Sets all standard SEO meta tags for a page and returns a cleanup function
 * suitable for use in a useEffect return.
 *
 * Does NOT handle JSON-LD — each page injects its own structured data.
 */
export function setPageSeo(opts: PageSeoOptions): () => void {
  const { title, description, url, image, type = "website" } = opts;

  document.title = title;

  setMeta("name", "description", description);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:type", type);
  if (image) setMeta("property", "og:image", image);

  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  if (image) setMeta("name", "twitter:image", image);

  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);

  return () => {
    canonical?.remove();
  };
}

export { SITE_URL, setMeta };
