const SITE_URL =
  typeof window !== "undefined" ? window.location.origin : "https://studio.printmycase.com.br";

const SITE_NAME = "Studio PrintMyCase";

/** Helper to inject a JSON-LD script and return a cleanup function */
export function injectJsonLd(id: string, data: object): () => void {
  let script = document.querySelector(`script[data-seo="${id}"]`) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo", id);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
  return () => { script?.remove(); };
}

/** Build a BreadcrumbList JSON-LD object */
export function breadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

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

export { SITE_URL, SITE_NAME, setMeta };
