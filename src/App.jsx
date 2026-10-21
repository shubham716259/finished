import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { PlannerProvider } from "./context/PlannerContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ForgotPassword from "./Pages/ForgotPassword";
import Recipes from "./Pages/Recipedetail";
import Favorites from "./Pages/favourites";
import MealPlanner from "./Pages/Mealplanner";
import ShoppingList from "./Pages/ShoppingList";
import SurpriseMe from "./Pages/Supriseme";
import NotFound from "./Pages/NotFound";
import RecipeDetails from "./Pages/detail";
import About from "./Pages/About";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "1086082498267-3s8g5h88e45m9b59j36v37a4c7h5mgls.apps.googleusercontent.com";

function App() {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <ToastProvider>
            <PlannerProvider>
              <BrowserRouter>
                <div className="app-layout">
                  <Navbar />
                  <div className="main-content-wrapper">
                    <Routes>
                      {/* Home */}
                      <Route path="/" element={<Hero />} />

                      {/* Recipes Explorer */}
                      <Route path="/recipes" element={<Recipes />} />

                      {/* Recipe Details */}
                      <Route path="/recipe/:id" element={<RecipeDetails />} />

                      {/* Favorites */}
                      <Route path="/favorites" element={<Favorites />} />

                      {/* Meal Planner */}
                      <Route path="/planner" element={<MealPlanner />} />

                      {/* Shopping List */}
                      <Route path="/shopping" element={<ShoppingList />} />

                      {/* Surprise Me */}
                      <Route path="/surprise" element={<SurpriseMe />} />

                      {/* About */}
                      <Route path="/about" element={<About />} />

                      {/* Auth Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />

                      {/* 404*/}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Footer />
                </div>
              </BrowserRouter>
            </PlannerProvider>
          </ToastProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;
