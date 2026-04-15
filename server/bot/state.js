const sessions = new Map();

export const STATES = {
  IDLE: 'IDLE',
  SELECT_TYPE: 'SELECT_TYPE',
  ENTER_TITLE: 'ENTER_TITLE',
  ENTER_GENRE: 'ENTER_GENRE',
  ENTER_YEAR: 'ENTER_YEAR',
  ENTER_POSTER: 'ENTER_POSTER',
  ENTER_TRAILER: 'ENTER_TRAILER',
  ENTER_ABOUT: 'ENTER_ABOUT',
  ENTER_QUALITY_LABEL: 'ENTER_QUALITY_LABEL',
  ENTER_FILE: 'ENTER_FILE',
  ENTER_FILE_SIZE: 'ENTER_FILE_SIZE',
  ASK_MORE_QUALITY: 'ASK_MORE_QUALITY',
  SERIES_ENTER_SEASON: 'SERIES_ENTER_SEASON',
  SERIES_ENTER_EPISODE_NUM: 'SERIES_ENTER_EPISODE_NUM',
  SERIES_ENTER_EPISODE_TITLE: 'SERIES_ENTER_EPISODE_TITLE',
  SERIES_ENTER_EPISODE_QUALITY: 'SERIES_ENTER_EPISODE_QUALITY',
  SERIES_ENTER_EPISODE_FILE: 'SERIES_ENTER_EPISODE_FILE',
  SERIES_ASK_MORE_EPISODE: 'SERIES_ASK_MORE_EPISODE',
  SERIES_ASK_MORE_SEASON: 'SERIES_ASK_MORE_SEASON',
};

export function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, { state: STATES.IDLE, data: {} });
  }
  return sessions.get(userId);
}

export function setState(userId, state, data = {}) {
  const current = getSession(userId);
  sessions.set(userId, {
    state,
    data: { ...current.data, ...data },
  });
}

export function clearSession(userId) {
  sessions.set(userId, { state: STATES.IDLE, data: {} });
}

export function getState(userId) {
  return getSession(userId).state;
}

export function getData(userId) {
  return getSession(userId).data;
}
