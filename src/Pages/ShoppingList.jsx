import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePlanner } from "../context/PlannerContext";
import { useToast } from "../context/ToastContext";
import {
  FaShoppingCart,
  FaCheck,
  FaTrash,
  FaCopy,
  FaPrint,
  FaPlus,
  FaLayerGroup,
  FaUtensils,
  FaCalendarAlt,
} from "react-icons/fa";
import "../styles/shoppingList.css";

// Department / Category categorizer
const categorizeIngredient = (name = "") => {
  const n = name.toLowerCase();
  if (
    n.includes("chicken") ||
    n.includes("beef") ||
    n.includes("pork") ||
    n.includes("lamb") ||
    n.includes("bacon") ||
    n.includes("sausage") ||
    n.includes("meat") ||
    n.includes("turkey") ||
    n.includes("duck")
  ) {
    return "🥩 Meat & Poultry";
  }
  if (
    n.includes("salmon") ||
    n.includes("fish") ||
    n.includes("shrimp") ||
    n.includes("prawn") ||
    n.includes("tuna") ||
    n.includes("clam") ||
    n.includes("squid") ||
    n.includes("crab")
  ) {
    return "🐟 Seafood";
  }
  if (
    n.includes("onion") ||
    n.includes("garlic") ||
    n.includes("tomato") ||
    n.includes("potato") ||
    n.includes("lemon") ||
    n.includes("lime") ||
    n.includes("carrot") ||
    n.includes("ginger") ||
    n.includes("pepper") ||
    n.includes("chili") ||
    n.includes("mushroom") ||
    n.includes("herb") ||
    n.includes("basil") ||
    n.includes("cilantro") ||
    n.includes("spinach") ||
    n.includes("lettuce") ||
    n.includes("cucumber") ||
    n.includes("avocado") ||
    n.includes("apple") ||
    n.includes("banana") ||
    n.includes("vegetable")
  ) {
    return "🥬 Fresh Produce";
  }
  if (
    n.includes("milk") ||
    n.includes("cheese") ||
    n.includes("butter") ||
    n.includes("cream") ||
    n.includes("yogurt") ||
    n.includes("egg") ||
    n.includes("cheddar") ||
    n.includes("mozzarella") ||
    n.includes("parmesan")
  ) {
    return "🧀 Dairy & Eggs";
  }
  if (
    n.includes("rice") ||
    n.includes("pasta") ||
    n.includes("spaghetti") ||
    n.includes("noodle") ||
    n.includes("flour") ||
    n.includes("bread") ||
    n.includes("oat") ||
    n.includes("sugar") ||
    n.includes("baking") ||
    n.includes("yeast")
  ) {
    return "🌾 Bakery & Grains";
  }
  if (
    n.includes("oil") ||
    n.includes("olive") ||
    n.includes("sauce") ||
    n.includes("soy") ||
    n.includes("vinegar") ||
    n.includes("spice") ||
    n.includes("cumin") ||
    n.includes("paprika") ||
    n.includes("curry") ||
    n.includes("salt") ||
    n.includes("pepper") ||
    n.includes("mustard") ||
    n.includes("honey") ||
    n.includes("stock") ||
    n.includes("broth") ||
    n.includes("can")
  ) {
    return "🧂 Pantry & Spices";
  }
  return "📦 General Grocery";
};

const ShoppingList = () => {
  const { planner, getPlannedRecipes } = usePlanner();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [plannerIngredients, setPlannerIngredients] = useState([]);
  const [customItems, setCustomItems] = useState(() => {
    try {
      const saved = localStorage.getItem("customShoppingItems");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [checkedMap, setCheckedMap] = useState(() => {
    try {
      const saved = localStorage.getItem("shoppingChecked");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [newItemText, setNewItemText] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [groupBy, setGroupBy] = useState("department"); // 'department' | 'recipe'

  // Sync checkedMap to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("shoppingChecked", JSON.stringify(checkedMap));
    } catch (e) {
      console.error(e);
    }
  }, [checkedMap]);

  // Sync custom items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("customShoppingItems", JSON.stringify(customItems));
    } catch (e) {
      console.error(e);
    }
  }, [customItems]);

  // Load and extract ingredients from all planned recipes
  useEffect(() => {
    async function extractPlannerIngredients() {
      setLoading(true);
      try {
        const plannedRecipes = getPlannedRecipes();

        if (plannedRecipes.length === 0) {
          setPlannerIngredients([]);
          setLoading(false);
          return;
        }

        // Fetch full details if recipes in planner only have id/name/thumb
        const detailedMeals = await Promise.all(
          plannedRecipes.map(async (recipe) => {
            if (recipe.strIngredient1) {
              return recipe;
            }
            try {
              const res = await fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`
              );
              const data = await res.json();
              return data.meals?.[0] || recipe;
            } catch {
              return recipe;
            }
          })
        );

        const extracted = [];
        detailedMeals.forEach((meal) => {
          if (!meal) return;
          for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            const mea = meal[`strMeasure${i}`];
            if (ing && ing.trim()) {
              extracted.push({
                id: `planner-${meal.idMeal}-${i}`,
                ingredient: ing.trim(),
                measure: mea ? mea.trim() : "",
                recipe: meal.strMeal,
                category: categorizeIngredient(ing.trim()),
                isCustom: false,
              });
            }
          }
        });

        setPlannerIngredients(extracted);
      } catch (err) {
        console.error("Failed to extract shopping list:", err);
      } finally {
        setLoading(false);
      }
    }

    extractPlannerIngredients();
  }, [planner, getPlannedRecipes]);

  // Combine planner and custom items
  const allItems = useMemo(() => {
    const formattedCustom = customItems.map((item) => ({
      ...item,
      category: categorizeIngredient(item.ingredient),
      isCustom: true,
    }));
    return [...plannerIngredients, ...formattedCustom];
  }, [plannerIngredients, customItems]);

  // Toggle item check
  const toggleCheck = (id) => {
    setCheckedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Add custom grocery item
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ingredient: newItemText.trim(),
      measure: newItemQty.trim(),
      recipe: "Custom Item",
      checked: false,
    };

    setCustomItems((prev) => [newItem, ...prev]);
    setNewItemText("");
    setNewItemQty("");
    addToast(`Added "${newItem.ingredient}" to shopping list! 🛒`, "cart");
  };

  // Remove custom item
  const handleRemoveCustomItem = (id) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear checked items
  const handleClearChecked = () => {
    setCheckedMap({});
    // Also remove checked custom items
    setCustomItems((prev) => prev.filter((item) => !checkedMap[item.id]));
    addToast("Checked items cleared", "info");
  };

  // Clear all items
  const handleClearAll = () => {
    setCheckedMap({});
    setCustomItems([]);
    addToast("Custom shopping items cleared", "info");
  };

  // Copy list to clipboard
  const handleCopyToClipboard = () => {
    if (allItems.length === 0) return;

    let text = "🛒 CookFusion Shopping List:\n\n";

    if (groupBy === "department") {
      const groups = {};
      allItems.forEach((item) => {
        const cat = item.category || "General";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
      });

      Object.entries(groups).forEach(([cat, items]) => {
        text += `${cat}\n`;
        items.forEach((item) => {
          const status = checkedMap[item.id] ? "[✓]" : "[ ]";
          text += `  ${status} ${item.ingredient}${item.measure ? ` - ${item.measure}` : ""}\n`;
        });
        text += "\n";
      });
    } else {
      allItems.forEach((item) => {
        const status = checkedMap[item.id] ? "[✓]" : "[ ]";
        text += `${status} ${item.ingredient}${item.measure ? ` (${item.measure})` : ""} [From: ${item.recipe}]\n`;
      });
    }

    navigator.clipboard.writeText(text);
    addToast("Shopping list copied to clipboard! 📋", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  // Grouped items
  const groupedItems = useMemo(() => {
    const groups = {};

    if (groupBy === "department") {
      allItems.forEach((item) => {
        const key = item.category || "📦 General Grocery";
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      });
    } else {
      allItems.forEach((item) => {
        const key = item.recipe || "Custom Items";
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      });
    }

    return groups;
  }, [allItems, groupBy]);

  const totalItemsCount = allItems.length;
  const checkedCount = allItems.filter((i) => checkedMap[i.id]).length;
  const progressPercent =
    totalItemsCount > 0 ? Math.round((checkedCount / totalItemsCount) * 100) : 0;

  if (loading) {
    return (
      <main className="shopping-page">
        <div className="shopping-loading">
          <div className="shopping-loader" />
          <p>Compiling your weekly grocery list...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="shopping-page">
      {/* =========================
          HEADER
      ========================= */}
      <section className="shopping-header">
        <p className="shopping-small-title">AUTO-COMPILED GROCERY RUN</p>
        <h1>🛒 Smart Shopping List</h1>
        <p>
          Ingredients from your weekly meal planner, neatly organized and ready for the market.
        </p>

        {/* PROGRESS BAR */}
        {totalItemsCount > 0 && (
          <div className="shopping-progress-wrapper">
            <div className="progress-info-row">
              <span>
                <strong>{checkedCount}</strong> of <strong>{totalItemsCount}</strong> items checked
              </span>
              <span className="progress-percentage">{progressPercent}% Ready</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* ACTIONS TOOLBAR */}
        {totalItemsCount > 0 && (
          <div className="shopping-toolbar-row">
            <div className="group-toggle-group">
              <label>Group by:</label>
              <button
                type="button"
                className={`toggle-pill ${groupBy === "department" ? "active" : ""}`}
                onClick={() => setGroupBy("department")}
              >
                <FaLayerGroup /> Department
              </button>
              <button
                type="button"
                className={`toggle-pill ${groupBy === "recipe" ? "active" : ""}`}
                onClick={() => setGroupBy("recipe")}
              >
                <FaUtensils /> Recipe
              </button>
            </div>

            <div className="toolbar-action-buttons">
              <button
                type="button"
                className="action-btn copy-btn"
                onClick={handleCopyToClipboard}
                title="Copy formatted list for WhatsApp / SMS"
              >
                <FaCopy /> Copy List
              </button>
              <button
                type="button"
                className="action-btn print-btn"
                onClick={handlePrint}
                title="Print Grocery List"
              >
                <FaPrint /> Print
              </button>
              {checkedCount > 0 && (
                <button
                  type="button"
                  className="action-btn clear-checked-btn"
                  onClick={handleClearChecked}
                >
                  Clear Checked
                </button>
              )}
              <button
                type="button"
                className="action-btn clear-all-btn"
                onClick={handleClearAll}
              >
                <FaTrash /> Clear Custom
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =========================
          CUSTOM ITEM INPUT FORM
      ========================= */}
      <section className="add-custom-item-section">
        <form onSubmit={handleAddCustomItem} className="custom-item-form">
          <input
            type="text"
            className="input-item-name"
            placeholder="+ Add extra item (e.g. Olive Oil, Milk, Paper towels)..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
          />
          <input
            type="text"
            className="input-item-qty"
            placeholder="Quantity (optional)"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
          />
          <button type="submit" className="btn-add-item">
            <FaPlus /> Add
          </button>
        </form>
      </section>

      {/* =========================
          ITEMS LIST / EMPTY
      ========================= */}
      {totalItemsCount === 0 ? (
        <div className="shopping-empty-box">
          <div className="shopping-empty-icon">🛒</div>
          <h2>Your Shopping List is Empty</h2>
          <p>
            Add meals to your Weekly Meal Planner or add custom grocery items above to automatically generate your shopping list.
          </p>
          <div className="empty-action-links">
            <Link to="/planner" className="btn-go-planner">
              <FaCalendarAlt /> Go to Meal Planner
            </Link>
            <Link to="/recipes" className="btn-browse-recipes">
              Explore Recipes &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <section className="shopping-categories-container">
          {Object.entries(groupedItems).map(([groupTitle, items]) => (
            <div className="shopping-category-card" key={groupTitle}>
              <h3 className="category-title">
                {groupTitle}
                <span className="category-count">{items.length} items</span>
              </h3>

              <div className="items-list-grid">
                {items.map((item) => {
                  const isChecked = !!checkedMap[item.id];

                  return (
                    <div
                      key={item.id}
                      className={`shopping-item-card ${isChecked ? "checked" : ""}`}
                      onClick={() => toggleCheck(item.id)}
                    >
                      <div className="custom-checkbox">
                        {isChecked && <FaCheck />}
                      </div>

                      <div className="item-details">
                        <span className="item-name">{item.ingredient}</span>
                        {item.measure && (
                          <span className="item-measure">{item.measure}</span>
                        )}
                        <small className="item-source">From {item.recipe}</small>
                      </div>

                      {item.isCustom && (
                        <button
                          type="button"
                          className="btn-delete-custom"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomItem(item.id);
                          }}
                          title="Remove custom item"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
};

export default ShoppingList;