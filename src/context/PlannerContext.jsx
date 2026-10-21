import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "./ToastContext";

const PlannerContext = createContext();

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner"];

const createDefaultPlanner = () => {
  const planner = {};
  DAYS_OF_WEEK.forEach((day) => {
    planner[day] = {
      Breakfast: null,
      Lunch: null,
      Dinner: null,
    };
  });
  return planner;
};

export const PlannerProvider = ({ children }) => {
  const { addToast } = useToast();

  const [planner, setPlanner] = useState(() => {
    try {
      const saved = localStorage.getItem("mealPlanner");
      if (!saved) return createDefaultPlanner();

      const parsed = JSON.parse(saved);

      // Handle legacy format where Monday: recipe directly instead of { Breakfast, Lunch, Dinner }
      const normalized = createDefaultPlanner();
      DAYS_OF_WEEK.forEach((day) => {
        if (parsed[day]) {
          if (
            typeof parsed[day] === "object" &&
            ("Breakfast" in parsed[day] || "Lunch" in parsed[day] || "Dinner" in parsed[day])
          ) {
            normalized[day] = {
              Breakfast: parsed[day].Breakfast || null,
              Lunch: parsed[day].Lunch || null,
              Dinner: parsed[day].Dinner || null,
            };
          } else if (parsed[day] && parsed[day].idMeal) {
            // Legacy single meal mapped to Dinner
            normalized[day].Dinner = parsed[day];
          }
        }
      });
      return normalized;
    } catch {
      return createDefaultPlanner();
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mealPlanner", JSON.stringify(planner));
    } catch (e) {
      console.error("Failed to save mealPlanner to localStorage", e);
    }
  }, [planner]);

  const addMeal = useCallback(
    (day, slot, recipe) => {
      if (!day || !slot || !recipe) return;

      setPlanner((prev) => ({
        ...prev,
        [day]: {
          ...(prev[day] || { Breakfast: null, Lunch: null, Dinner: null }),
          [slot]: recipe,
        },
      }));

      addToast(
        `Added "${recipe.strMeal}" to ${day} ${slot}! 📅`,
        "planner"
      );
    },
    [addToast]
  );

  const removeMeal = useCallback(
    (day, slot) => {
      setPlanner((prev) => {
        const currentRecipe = prev[day]?.[slot];
        const next = {
          ...prev,
          [day]: {
            ...prev[day],
            [slot]: null,
          },
        };
        if (currentRecipe) {
          addToast(`Removed meal from ${day} ${slot}`, "info");
        }
        return next;
      });
    },
    [addToast]
  );

  const clearDay = useCallback(
    (day) => {
      setPlanner((prev) => ({
        ...prev,
        [day]: {
          Breakfast: null,
          Lunch: null,
          Dinner: null,
        },
      }));
      addToast(`Cleared meals for ${day}`, "info");
    },
    [addToast]
  );

  const clearPlanner = useCallback(() => {
    setPlanner(createDefaultPlanner());
    addToast("Weekly Meal Planner cleared", "info");
  }, [addToast]);

  const autoPlanWeek = useCallback(
    (recipesPool) => {
      if (!recipesPool || recipesPool.length === 0) {
        addToast("No recipes available to auto-plan. Add some favorites first!", "error");
        return;
      }

      setPlanner((prev) => {
        const next = { ...prev };
        let poolIndex = 0;
        const shuffled = [...recipesPool].sort(() => Math.random() - 0.5);

        DAYS_OF_WEEK.forEach((day) => {
          MEAL_SLOTS.forEach((slot) => {
            if (!next[day][slot]) {
              next[day] = {
                ...next[day],
                [slot]: shuffled[poolIndex % shuffled.length],
              };
              poolIndex++;
            }
          });
        });

        return next;
      });

      addToast("Week auto-planned with delicious meals! 🎲✨", "success");
    },
    [addToast]
  );

  // Helper to get total count of planned meals
  const totalPlannedCount = Object.values(planner).reduce((acc, dayMeals) => {
    if (!dayMeals) return acc;
    return (
      acc +
      (dayMeals.Breakfast ? 1 : 0) +
      (dayMeals.Lunch ? 1 : 0) +
      (dayMeals.Dinner ? 1 : 0)
    );
  }, 0);

  // Helper to extract unique planned recipes
  const getPlannedRecipes = useCallback(() => {
    const list = [];
    const seenIds = new Set();

    DAYS_OF_WEEK.forEach((day) => {
      MEAL_SLOTS.forEach((slot) => {
        const meal = planner[day]?.[slot];
        if (meal && meal.idMeal && !seenIds.has(meal.idMeal)) {
          seenIds.add(meal.idMeal);
          list.push(meal);
        }
      });
    });

    return list;
  }, [planner]);

  return (
    <PlannerContext.Provider
      value={{
        planner,
        addMeal,
        removeMeal,
        clearDay,
        clearPlanner,
        autoPlanWeek,
        totalPlannedCount,
        getPlannedRecipes,
        daysOfWeek: DAYS_OF_WEEK,
        mealSlots: MEAL_SLOTS,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("usePlanner must be used within a PlannerProvider");
  }
  return context;
};
