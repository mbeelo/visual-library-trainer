export const getPinterestUrl = (item: string): string => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(item + " reference art")}&utm_source=afterimage&utm_medium=referral&utm_campaign=reference_search&utm_content=pinterest`;

export const getArtStationUrl = (item: string): string => `https://www.artstation.com/search?sort_by=${encodeURIComponent(item)}&query=${encodeURIComponent(item)}&utm_source=afterimage&utm_medium=referral&utm_campaign=reference_search&utm_content=artstation`;

export const getGoogleUrl = (item: string): string => `https://www.google.com/search?q=${encodeURIComponent(item + " reference art")}&tbm=isch&utm_source=afterimage&utm_medium=referral&utm_campaign=reference_search&utm_content=google`;

export const getUnsplashUrl = (item: string): string => `https://unsplash.com/s/photos/${encodeURIComponent(item)}?utm_source=afterimage&utm_medium=referral&utm_campaign=reference_search&utm_content=unsplash`;

export const getPexelsUrl = (item: string): string => `https://www.pexels.com/search/${encodeURIComponent(item)}/?utm_source=afterimage&utm_medium=referral&utm_campaign=reference_search&utm_content=pexels`;

export const getPixabayUrl = (item: string): string => `https://pixabay.com/images/search/${encodeURIComponent(item)}/?utm_source=afterimage&utm_medium=referral&utm_campaign=reference_search&utm_content=pixabay`;