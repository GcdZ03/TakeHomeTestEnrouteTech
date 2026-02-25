import { useState } from "react";
import { CheckForm } from "./CheckForm";
import { CheckHistory } from "./CheckHistory";
import { ToastContainer } from "./Toast";
import { useToast } from "./useToast";
import "./App.css";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toasts, showToast, dismissToast } = useToast();

  const handleCheckSubmitted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app w-full">
      <header>
        <h1>Vehicle Inspection Logbook</h1>
      </header>

      <main>
        <div className="container">
          <div className="left-panel">
            <CheckForm onSuccess={handleCheckSubmitted} />
          </div>

          <div className="right-panel">
            <CheckHistory refreshTrigger={refreshKey} />
          </div>
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
