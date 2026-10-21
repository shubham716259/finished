import { createSlice } from "@reduxjs/toolkit";

const readLocalStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage`, error);
    return fallback;
  }
};

const storedFavorites = readLocalStorage("favorites", []);
const storedRecipes = readLocalStorage("favorites_cache", {});

const initialState = {
  favorites: Array.isArray(storedFavorites) ? storedFavorites : [],
  cachedRecipes:
    storedRecipes && typeof storedRecipes === "object" && !Array.isArray(storedRecipes)
      ? storedRecipes
      : {},
};

const getFavoriteId = (item) =>
  item && typeof item === "object" ? item.idMeal : item;

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite(state, action) {
      const recipeOrId = action.payload;
      const recipe =
        recipeOrId && typeof recipeOrId === "object" ? recipeOrId : null;
      const id = recipe ? recipe.idMeal : recipeOrId;
      if (id === undefined || id === null || id === "") return;

      const idString = String(id);
      const exists = state.favorites.some(
        (item) => String(getFavoriteId(item)) === idString
      );

      if (exists) {
        state.favorites = state.favorites.filter(
          (item) => String(getFavoriteId(item)) !== idString
        );
      } else {
        state.favorites.push(idString);
      }

      if (recipe) {
        state.cachedRecipes[idString] = recipe;
      }
    },
    removeFavorite(state, action) {
      const id = getFavoriteId(action.payload);
      if (id === undefined || id === null) return;
      const idString = String(id);
      state.favorites = state.favorites.filter(
        (item) => String(getFavoriteId(item)) !== idString
      );
    },
    clearFavorites(state) {
      state.favorites = [];
    },
    cacheRecipe(state, action) {
      const recipe = action.payload;
      if (recipe?.idMeal) {
        state.cachedRecipes[String(recipe.idMeal)] = recipe;
      }
    },
  },
});

export const {
  toggleFavorite,
  removeFavorite,
  clearFavorites,
  cacheRecipe,
} = favoritesSlice.actions;

export const selectFavorites = (state) => state.favorites.favorites;
export const selectCachedRecipes = (state) => state.favorites.cachedRecipes;
export const selectFavoritesCount = (state) => state.favorites.favorites.length;
export const selectIsFavorite = (state, id) => {
  if (!id) return false;
  const idString = String(id);
  return state.favorites.favorites.some(
    (item) => String(getFavoriteId(item)) === idString
  );
};

export default favoritesSlice.reducer;
