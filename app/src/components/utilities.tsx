export const capitalString = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export class FocusFeature {
  features: { [key: string]: string };

  constructor(features: { [key: string]: string }) {
    this.features = { ...features };
  }

  update(params: { [key: string]: string }) {
    const newFeatures = { ...this.features }; // Create a new object for immutability

    Object.entries(params).forEach(([queryKey, queryValue]) => {
      const oldQuery = newFeatures[queryKey] ?? '';
      if (queryValue === oldQuery) return;

      if (queryValue && queryValue !== '') {
        newFeatures[queryKey] = queryValue;
      } else {
        delete newFeatures[queryKey];
      }
    });

    this.features = newFeatures; // Update the features with the new object
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


