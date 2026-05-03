import { Providers }     from "./providers";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Providers />
    </ErrorBoundary>
  );
}
