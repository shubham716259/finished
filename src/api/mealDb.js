const MEALDB_API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const MEALDB_INGREDIENT_IMAGE_BASE_URL =
  "https://www.themealdb.com/images/ingredients";

const encode = encodeURIComponent;

async function request(endpoint, { checkStatus = false, errorMessage } = {}) {
  const response = await fetch(`${MEALDB_API_BASE_URL}/${endpoint}`);

  if (checkStatus && !response.ok) {
    throw new Error(errorMessage || `Recipe request failed with status ${response.status}`);
  }

  return response.json();
}

export const lookupMeal = (id, options) =>
  request(`lookup.php?i=${id}`, options);

export const searchMealsByName = (name, options) =>
  request(`search.php?s=${encode(name)}`, options);

export const filterMealsByCategory = (category, options) =>
  request(`filter.php?c=${encode(category)}`, options);

export const filterMealsByArea = (area, options) =>
  request(`filter.php?a=${encode(area)}`, options);

export const filterMealsByIngredient = (ingredient, options) =>
  request(`filter.php?i=${encode(ingredient)}`, options);

export const getRandomMeal = (options) => request("random.php", options);

export const getIngredientImageUrl = (ingredient) =>
  `${MEALDB_INGREDIENT_IMAGE_BASE_URL}/${encode(ingredient)}-Small.png`;
