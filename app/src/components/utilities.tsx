export const capitalString = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export class FocusFeature {
  private features: { [key: string]: string };

  constructor() {
    this.features = {};
  }

  update(params: { [key: string]: string }) {
    Object.entries(params).forEach(([queryKey, queryValue]) => {
      const oldQuery = this.features[queryKey] ?? '';
      if (queryValue === oldQuery) return;

      if (queryValue && queryValue !== '') {
          this.features[queryKey] = queryValue;
      } else {
        delete this.features[queryKey];
      }
    });
  }

  getAll() {
    return this.features;
  }
  
  getQueryString() {
    const queryParams = new URLSearchParams(this.features);
    console.log(queryParams.toString())
    return queryParams.toString();
  }
}


export function updateSearchParams(params: { [key: string]: string }) {
    const currentSearchParams = new URLSearchParams(window.location.search);

    Object.entries(params).forEach(([queryKey, queryValue]) => {
      const oldQuery = currentSearchParams.get(queryKey) ?? '';
      if (queryValue === oldQuery) return;

      if (queryValue && queryValue !== '') {
        currentSearchParams.set(queryKey, queryValue);
      } else {
        currentSearchParams.delete(queryKey);
      }
    });

    const newUrl = [window.location.pathname, currentSearchParams.toString()]
      .filter(Boolean)
      .join('?');
    // Manually update the URL without triggering a navigation
    window.history.replaceState(null, '', newUrl);
}


