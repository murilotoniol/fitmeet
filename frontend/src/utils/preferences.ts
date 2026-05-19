const PREFERENCES_SKIPPED_STORAGE_KEY = "fitmeet-preferences-skipped";

function markPreferencesSkipped() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PREFERENCES_SKIPPED_STORAGE_KEY, "true");
}

function clearPreferencesSkipped() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PREFERENCES_SKIPPED_STORAGE_KEY);
}

function hasSkippedPreferences() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(PREFERENCES_SKIPPED_STORAGE_KEY) === "true";
}

export {
  clearPreferencesSkipped,
  hasSkippedPreferences,
  markPreferencesSkipped,
  PREFERENCES_SKIPPED_STORAGE_KEY,
};
