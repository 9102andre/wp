import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "@/context/accessibility.jsx";
import { AuthProvider } from "@/context/AuthContext.jsx";
import Index from "@/pages/Index.jsx";
import NotFound from "@/pages/NotFound.jsx";
import RoleLogin from "@/pages/RoleLogin.jsx";
import AuthCallback from "@/pages/AuthCallback.jsx";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/login/:roleId"
                element={<RoleLogin />}
              />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}
