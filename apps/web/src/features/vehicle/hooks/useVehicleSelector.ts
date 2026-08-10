const STORAGE_KEY = "selected_vehicle";

export interface SelectedVehicle {
  brandId: number;
  brandName: string;
  brandSlug: string;
  modelId: number;
  modelName: string;
  generationId: number;
  generationName: string;  // ví dụ "2019–2023"
  generationLabel: string; // ví dụ "Toyota Camry 2.5Q (2019–2023)"
}

export function useVehicleSelector() {
  function getSelected(): SelectedVehicle | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SelectedVehicle) : null;
    } catch {
      return null;
    }
  }

  function setSelected(vehicle: SelectedVehicle): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
  }

  function clearSelected(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { getSelected, setSelected, clearSelected };
}
