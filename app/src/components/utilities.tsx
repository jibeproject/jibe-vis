export const capitalString = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
    console.log(newUrl);
    // Manually update the URL without triggering a navigation
    window.history.replaceState(null, '', newUrl);
}
