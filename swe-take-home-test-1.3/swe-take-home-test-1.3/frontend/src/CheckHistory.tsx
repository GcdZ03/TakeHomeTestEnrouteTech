import { useState, useEffect } from "react";
import type { Vehicle, Check, ErrorResponse } from "./types";
import { api } from "./api";
import { useToast } from "./useToast";
import { ToastContainer } from "./Toast";

type IssueFilter = "all" | "true" | "false";

interface Props {
  refreshTrigger?: number;
}

export function CheckHistory({ refreshTrigger }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [hasIssueFilter, setHasIssueFilter] = useState<IssueFilter>("all");
  const [checks, setChecks] = useState<Check[]>([]);
  const { toasts, showToast, dismissToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Track which params fetched
  const [lastFetchedParams, setLastFetchedParams] = useState<{
    vehicle: string;
    filter: IssueFilter;
    trigger: number | undefined;
  } | null>(null);

  // Derive loading state: loading if a vehicle selected but params don't match last fetch
  const loading =
    selectedVehicle !== "" &&
    (lastFetchedParams === null ||
      lastFetchedParams.vehicle !== selectedVehicle ||
      lastFetchedParams.filter !== hasIssueFilter ||
      lastFetchedParams.trigger !== refreshTrigger);

  useEffect(() => {
    api.getVehicles().then(setVehicles).catch(console.error);
  }, []);

  // Fetch checks when filters change or refreshTrigger updates
  useEffect(() => {
    if (!selectedVehicle) {
      return;
    }

    let cancelled = false;
    const currentParams = {
      vehicle: selectedVehicle,
      filter: hasIssueFilter,
      trigger: refreshTrigger,
    };

    const hasIssueParam =
      hasIssueFilter === "all" ? undefined : hasIssueFilter === "true";

    api
      .getChecks(selectedVehicle, hasIssueParam)
      .then((data) => {
        if (!cancelled) {
          setChecks(data);
          setLastFetchedParams(currentParams);
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [selectedVehicle, hasIssueFilter, refreshTrigger]);

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    if (!vehicleId) {
      setChecks([]);
      setLastFetchedParams(null);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this inspection record?"
    );
    if (!confirmDelete) return;

    setDeletingId(id);

    try {
      await api.deleteCheck(id);

      // Remove deleted item from UI
      setChecks((prev) => prev.filter((check) => check.id !== id));

      showToast("Inspection record deleted successfully.", "success");
    } catch (err: unknown) {
      const error = err as ErrorResponse;
      const message =
        error?.error?.message ?? "Failed to delete inspection record.";

      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="check-history">
      <h2>View Inspection History</h2>
      
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="filters">
        <div className="form-group">
          <label htmlFor="vehicle-filter">Vehicle</label>
          <select
            id="vehicle-filter"
            value={selectedVehicle}
            onChange={(e) => handleVehicleChange(e.target.value)}>
            <option value="">Select a vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration} - {v.make} {v.model}
              </option>
            ))}
          </select>
        </div>

        {selectedVehicle && (
          <div className="form-group">
            <label htmlFor="issue-filter">Filter by issues</label>
            <select
              id="issue-filter"
              value={hasIssueFilter}
              onChange={(e) =>
                setHasIssueFilter(e.target.value as IssueFilter)
              }>
              <option value="all">All checks</option>
              <option value="true">With issues only</option>
              <option value="false">No issues only</option>
            </select>
          </div>
        )}
      </div>

      {loading && <p>Loading checks...</p>}

      {!loading && selectedVehicle && checks.length === 0 && (
        <p className="no-results">No checks found for this vehicle.</p>
      )}

      {!loading && checks.length > 0 && (
        <div className="checks-list">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`check-card ${check.hasIssue ? "has-issue" : ""}`}>
              <div className="check-header">
                <span className="check-date">
                  {formatDate(check.createdAt)}
                </span>
                <span
                  className={`status-badge ${check.hasIssue ? "fail" : "ok"}`}>
                  {check.hasIssue ? "⚠ Has Issues" : "✓ All OK"}
                </span>
              </div>

              <div className="check-details">
                <p>
                  <strong>Odometer:</strong> {check.odometerKm.toLocaleString()}{" "}
                  km
                </p>

                <div className="check-items">
                  <strong>Checklist:</strong>
                  <ul>
                    {check.items.map((item) => (
                      <li
                        key={item.key}
                        className={item.status === "FAIL" ? "fail" : "ok"}>
                        <span className="item-key">{item.key}:</span>
                        <span className="item-status">{item.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {check.note && (
                  <div className="check-note">
                    <strong>Notes:</strong>
                    <p>{check.note}</p>
                  </div>
                )}
              </div>
              <div className="delete-box">
                <button 
                  className="delete-button"
                  type="button"
                  onClick={() => handleDelete(check.id)}
                  disabled={deletingId === check.id}
                >
                  {deletingId === check.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
