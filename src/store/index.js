import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./favoritesSlice";

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
  },
});

store.subscribe(() => {
  const { favorites, cachedRecipes } = store.getState().favorites;
  try {
    localStorage.setItem("favorites", JSON.stringify(favorites));
    localStorage.setItem("favorites_cache", JSON.stringify(cachedRecipes));
  } catch (error) {
    console.error("Failed to save favorites to localStorage", error);
  }
});
