import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isDarkMode: boolean;
  sidebarOpen: boolean;
  notificationPanelOpen: boolean;
  activeModal: string | null;
}

const initialState: UIState = {
  isDarkMode: false,
  sidebarOpen: true,
  notificationPanelOpen: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.isDarkMode = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleNotificationPanel(state) {
      state.notificationPanelOpen = !state.notificationPanelOpen;
    },
    closeNotificationPanel(state) {
      state.notificationPanelOpen = false;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
  },
});

export const {
  toggleDarkMode, setDarkMode,
  toggleSidebar, setSidebarOpen,
  toggleNotificationPanel, closeNotificationPanel,
  openModal, closeModal,
} = uiSlice.actions;
export default uiSlice.reducer;
