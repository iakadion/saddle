import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Architecture from "./pages/Architecture";
import AgentBrowser from "./pages/AgentBrowser";
import Compute from "./pages/Compute";
import Integrations from "./pages/Integrations";
import Docs from "./pages/Docs";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/architecture"} component={Architecture} />
      <Route path={"/agent-browser"} component={AgentBrowser} />
      <Route path={"/compute"} component={Compute} />
      <Route path={"/integrations"} component={Integrations} />
      <Route path={"/docs"} component={Docs} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
