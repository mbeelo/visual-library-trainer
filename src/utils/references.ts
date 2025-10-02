export const getPinterestUrl = (item: string): string => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(item + " reference art")}`;

export const getArtStationUrl = (item: string): string => `https://www.artstation.com/search?sort_by=${encodeURIComponent(item)}&query=${encodeURIComponent(item)}`;

export const getGoogleUrl = (item: string): string => `https://www.google.com/search?q=${encodeURIComponent(item + " reference art")}&tbm=isch`;

export const getUnsplashUrl = (item: string): string => `https://unsplash.com/s/photos/${encodeURIComponent(item)}`;

export const getPexelsUrl = (item: string): string => `https://www.pexels.com/search/${encodeURIComponent(item)}/`;

export const getPixabayUrl = (item: string): string => `https://pixabay.com/images/search/${encodeURIComponent(item)}/`;