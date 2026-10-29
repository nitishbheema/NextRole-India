// Simple persistent saved jobs utility using localStorage

const SAVED_JOBS_KEY = 'nextrole_saved_job_ids';

export function getSavedJobIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isJobSaved(id: number): boolean {
  return getSavedJobIds().includes(id);
}

export function toggleSaveJob(id: number): boolean {
  const current = getSavedJobIds();
  let updated: number[];
  const isSaved = current.includes(id);

  if (isSaved) {
    updated = current.filter((jobId) => jobId !== id);
  } else {
    updated = [...current, id];
  }

  try {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('savedJobsChanged'));
  } catch {
    // Ignore storage errors
  }

  return !isSaved;
}
