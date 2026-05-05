import { create } from 'zustand';

export type FloorPlanFilter = 'all' | 'active' | 'done';

export interface FloorPlanUIState {
  selectedRoomId: string | null;
  selectedPinId: string | null;
  filter: FloorPlanFilter;
  showAddRoomModal: boolean;
  showRoomEditModal: boolean;
  viewportWidth: number;
  setSelectedRoomId: (id: string | null) => void;
  setSelectedPinId: (id: string | null) => void;
  setFilter: (filter: FloorPlanFilter) => void;
  setShowAddRoomModal: (show: boolean) => void;
  setShowRoomEditModal: (show: boolean) => void;
  setViewportWidth: (width: number) => void;
  resetFloorPlanUI: () => void;
}

export const useFloorPlanUIStore = create<FloorPlanUIState>()(
  (set) => ({
    selectedRoomId: null,
    selectedPinId: null,
    filter: 'all',
    showAddRoomModal: false,
    showRoomEditModal: false,
    viewportWidth: 1200,
    setSelectedRoomId: (id) => set({ selectedRoomId: id }),
    setSelectedPinId: (id) => set({ selectedPinId: id }),
    setFilter: (filter) => set({ filter }),
    setShowAddRoomModal: (show) => set({ showAddRoomModal: show }),
    setShowRoomEditModal: (show) => set({ showRoomEditModal: show }),
    setViewportWidth: (width) => set({ viewportWidth: width }),
    resetFloorPlanUI: () =>
      set({
        selectedRoomId: null,
        selectedPinId: null,
        filter: 'all',
        showAddRoomModal: false,
        showRoomEditModal: false,
      }),
  })
);
