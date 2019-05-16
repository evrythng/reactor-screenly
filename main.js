const requestAsync = require('request-promise-native');

const SCREENLY_API = 'https://api.screenlyapp.com';
/** Screenly API token */
const SCREENLY_TOKEN = '';
/** Time in minutes a playlist should be active before being removed */
const PLAYLIST_TTL_M = 5;
/** Playlist to use if the product is not present in PRODUCT_PLAYLIST_MAP */
const DEFAULT_PLAYLIST_ID = '';
/** Map playlist IDs to an EVRYTHNG product that will be scanned */
const PRODUCT_PLAYLIST_MAP = {
  exampleProductId: ['examplePlaylistId'],
};

/**
 * Send a Screenly patch request for a specific playlist by ID.
 *
 * @param {string} playlistId - ID of the playlist to display.
 * @returns {object} The request response body.
 */
const screenlyRequest = async (playlistId, is_enabled) => requestAsync({
  url: `${SCREENLY_API}/api/v3/playlists/${playlistId}/`,
  headers: { authorization: `Token ${SCREENLY_TOKEN}` },
  method: 'patch',
  form: { is_enabled },
});

/**
 * Schedule disabling this playlist after some time has elapsed.
 *
 * @param {string} playlistId - ID of the playlist to disable.
 * @returns {Promise} Promise that resolves after the Reactor schedule is created.
 */
const scheduleDisable = async (playlistId) => {
  const schedule = {
    executeAt: Date.now() + (PLAYLIST_TTL_M * 60000),
    event: { playlistId },
  };

  logger.info(`Scheduling disable of ${playlistId} for ${schedule.executeAt}`);
  return app.reactor.schedule().create(schedule);
};

/**
 * When a Reactor schedule elapses.
 *
 * @param {object} event - The event object prescribed in scheduleDisable().
 */
const onScheduledEvent = async ({ playlistId }) => {
  logger.info(`Disabling playlist ${playlistId}`);
  
  const res = await screenlyRequest(playlistId, false);
  logger.debug(`Screenly response: ${JSON.stringify(res)}`);
};

// @filter(onActionCreated) action.type=implicitScans
const onActionCreated = async ({ action }) => {
  const { id, product } = action;
  logger.info(`Received action ${id}`);

  try {
    let playlistId = PRODUCT_PLAYLIST_MAP[product];
    if (!playlistId) {
      logger.info(`No playlist for product ${product}, using default playlist ${DEFAULT_PLAYLIST_ID}`);
      playlistId = DEFAULT_PLAYLIST_ID;
    }

    logger.info(`Enabling playlist ${playlistId} for product ${product}`);
    const res = await screenlyRequest(playlistId, true);
    logger.debug(`Screenly response: ${JSON.stringify(res)}`);

    await scheduleDisable(playlistId);
  } catch (err) {
    logger.error(err.message || err.errors[0]);
  }

  done();
};

module.exports = { onActionCreated };
