const PREFERENCES_SKIPPED_STORAGE_KEY = "fitmeet-preferences-skipped";

function markPreferencesSkipped() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(PREFERENCES_SKIPPED_STORAGE_KEY, "true");
}

function clearPreferencesSkipped() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PREFERENCES_SKIPPED_STORAGE_KEY);
  window.localStorage.removeItem(PREFERENCES_SKIPPED_STORAGE_KEY);
}

function hasSkippedPreferences() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(PREFERENCES_SKIPPED_STORAGE_KEY) === "true";
}

export {
  clearPreferencesSkipped,
  hasSkippedPreferences,
  markPreferencesSkipped,
  PREFERENCES_SKIPPED_STORAGE_KEY,
};
