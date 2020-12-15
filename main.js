require('dotenv').config();
const requestAsync = require('request-promise-native');

const SCREENLY_API = 'https://api.screenlyapp.com';
/** Screenly API token */
const SCREENLY_TOKEN = process.env.SCREENLY_TOKEN;
/** Time in seconds a playlist should be active before being removed */
const PLAYLIST_TTL_S = 60;
/** Playlist to use if the product is not present in PRODUCT_PLAYLIST_MAP */
const DEFAULT_PLAYLIST_ID = '';

const getPlaylistCorrespondingToProduct = async (productId) => {
  const product = await app.product(productId).read();
  const playlistId = product.customFields.playlistId;
  if (!playlistId) {
    logger.info(`No playlist for product ${product}, using default playlist ${DEFAULT_PLAYLIST_ID}`);
    return DEFAULT_PLAYLIST_ID;
  }
  return playlistId;
}

/**
 * Send a Screenly patch request for a specific playlist by ID.
 *
 * @param {string} playlistId - ID of the playlist to display.
 * @param {boolean} is_enabled - if the playlist has to be enable or not
 * @returns {object} The request response body.
 */
const screenlyRequest = async (playlistId, is_enabled) => requestAsync({
  url: `${SCREENLY_API}/api/v3/playlists/${playlistId}/`,
  headers: { authorization: `Token ${SCREENLY_TOKEN}` },
  method: 'patch',
  form: { is_enabled, priority: 1 },
}).then(res => JSON.parse(res))
  .then(json => {
    logger.debug(`Screenly response: ${JSON.stringify(json)}`);
    return json;
  });

/**
 * Schedule disabling this playlist after some time has elapsed.
 *
 * @param {string} playlistId - ID of the playlist to disable.
 * @returns {Promise} Promise that resolves after the Reactor schedule is created.
 */
const scheduleDisable = async (playlistId) => {
  const schedule = {
    executeAt: Date.now() + (PLAYLIST_TTL_S * 1000),
    event: { playlistId },
  };

  logger.info(`Scheduling disable of ${playlistId} for ${new Date(schedule.executeAt).toISOString()}`);
  return app.reactor.schedule().create(schedule);
};

/**
 * Run an async function and take care of calling done() and catching any errors.
 *
 * @param {function} f - The function to run.
 */
const runAsync = f => f().catch(e => logger.error(e.message || e.errors[0])).then(done);

/**
 * When a Reactor schedule elapses.
 *
 * @param {object} event - The event object prescribed in scheduleDisable().
 */
const onScheduledEvent = ({ playlistId }) => runAsync(async () => {
  logger.info(`Disabling playlist ${playlistId}`);

  await screenlyRequest(playlistId, false);
});

// @filter(onActionCreated) action.type=implicitScans
const onActionCreated = ({ action }) => runAsync(async () => {
  const { product } = action;

  let playlistId = await getPlaylistCorrespondingToProduct(product);

  logger.info(`Enabling playlist ${playlistId} for product ${product}`);
  await screenlyRequest(playlistId, true);

  await scheduleDisable(playlistId);
});

module.exports = {
  onActionCreated,
  onScheduledEvent,
};
