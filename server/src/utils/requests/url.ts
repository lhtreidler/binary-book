export const buildUrl = (baseUrl: string, params: Record<string, any>) => {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, val]) => {
    url.searchParams.append(key, val);
  });

  return url;
};

export const appendSearchParams = (url: URL, params: Record<string, any>) => {
  Object.entries(params).forEach(([key, val]) => {
    url.searchParams.append(key, val);
  });

  return url.toString();
};

export const appendPath = (url: URL, path: string) => {
  url.pathname = `${url.pathname}/${path}`;

  return url;
};
