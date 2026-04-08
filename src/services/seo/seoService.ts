export const seoService = {
  buildCanonicalPath(path: string) {
    return path.startsWith("/") ? path : `/${path}`;
  },
};
