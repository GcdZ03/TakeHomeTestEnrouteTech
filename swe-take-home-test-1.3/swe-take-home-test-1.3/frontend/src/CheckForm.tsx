import { useState, useEffect } from "react";
import type { Vehicle, CheckItem, CheckItemKey, ErrorResponse } from "./types";
import { api } from "./api";
import { ToastContainer } from "./Toast";
import { useToast } from "./useToast";

const CHECK_ITEMS: CheckItemKey[] = ["TYRES", "BRAKES", "LIGHTS", "OIL", "COOLANT"];

interface Props {
  onSuccess: () => void;
}

export function CheckForm({ onSuccess }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [odometerKm, setOdometerKm] = useState("");
  const [items, setItems] = useState<CheckItem[]>(
    CHECK_ITEMS.map((key) => ({ key, status: "OK" })),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const NOTE_MAX = 300;
  const {toasts, showToast, dismissToast} = useToast();

  useEffect(() => {
    api.getVehicles().then(setVehicles).catch(console.error);
  }, []);

  const handleItemStatusChange = (key: CheckItemKey, status: "OK" | "FAIL") => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, status }
          : item,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);
    setLoading(true);

    try {
      await api.createCheck({
        vehicleId: selectedVehicle,
        odometerKm: parseFloat(odometerKm),
        items,
        ...(note.trim() ? { note: note.trim() } : {}),
      });

      showToast("Check submitted successfully!", "success");

      // Reset form and display success notification
      setSelectedVehicle("");
      setOdometerKm("");
      setNote("");
      setItems(
        CHECK_ITEMS.map((key) => ({ key, status: "OK" })),
      );
      onSuccess();
    } catch (err: unknown) {
      const errorResponse = err as ErrorResponse;
      if (errorResponse.error?.details?.length) {
        const msgs = errorResponse.error.details.map((d) => `${d.field}: ${d.reason}`);
        setValidationErrors(msgs);
        showToast(msgs[0], "error");
      } else {
        const msg = errorResponse.error?.message ?? "Failed to submit check. Please try again.";
        setError(msg);
        showToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="check-form">
      <h2>Submit Vehicle Inspection Result</h2>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      {error && <div className="error-banner">{error}</div>}
      {validationErrors.length > 0 && (
        <div className="error-banner">
          <strong>Validation errors:</strong>
          <ul>
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="vehicle">Vehicle *</label>
        <select
          id="vehicle"
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          required>
          <option value="">Select a vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration} - {v.make} {v.model} ({v.year})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="odometer">Odometer (km) *</label>
        <input
          id="odometer"
          type="number"
          min="0"
          value={odometerKm}
          onChange={(e) => setOdometerKm(e.target.value)}
          placeholder="Enter odometer reading"
          required
        />
      </div>

      <div className="form-group">
        <label>Checklist Items *</label>
        <div className="checklist">
          {items.map((item) => (
            <div key={item.key} className="checklist-item">
              <span className="item-label">{item.key}</span>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name={`status-${item.key}`}
                    value="OK"
                    checked={item.status === "OK"}
                    onChange={() => handleItemStatusChange(item.key, "OK")}
                  />
                  OK
                </label>
                <label>
                  <input
                    type="radio"
                    name={`status-${item.key}`}
                    value="FAIL"
                    checked={item.status === "FAIL"}
                    onChange={() => handleItemStatusChange(item.key, "FAIL")}
                  />
                  FAIL
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="note">Notes (optional)</label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
          maxLength={NOTE_MAX}
          placeholder="Add any additional notes (max 300 characters)"
          rows={4}
        />
        <div className="char-counter">
          {note.length}/{NOTE_MAX}
        </div>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Check"}
      </button>
    </form>
  );
}
