export const getPinterestUrl = (item: string): string => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(item + " reference art")}`;

export const getArtStationUrl = (item: string): string => `https://www.artstation.com/search?q=${encodeURIComponent(item)}`;

export const getGoogleUrl = (item: string): string => `https://www.google.com/search?q=${encodeURIComponent(item + " reference art")}&tbm=isch`;