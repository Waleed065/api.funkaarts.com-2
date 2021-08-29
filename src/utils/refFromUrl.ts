export function refFromUrl(URL: string) {
  return decodeURIComponent(URL?.split?.("/")?.pop()?.split("?")?.[0] ?? '');
}
