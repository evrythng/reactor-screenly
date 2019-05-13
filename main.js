const { promisify } = require('util');
const request = require('request');

const SCREENLY_API = 'https://api.screenlyapp.com';
const SCREENLY_TOKEN = '';
const PLAYLIST_TTL = 15000;

/** Map between EVRYTHNG products and Screenly playlist IDs.
 * 
 * TODO: Should this be in the action customFields?
 */
const SKU_PLAYLIST_MAP = {
  exampleProductId: ['examplePlaylistId'],
};

const requestAsync = promisify(request);

/**
 * Check the action has all the required information.
 *
 * @param {object} action - The event action.
 */
const checkAction = async (action) => {
  logger.info(`Received action ${action.id}`);
  if (!action.product) {
    throw new Error('No product specified in action');
  }

  logger.info(`Product ID: ${action.product}`);
};

/**
 * Send a Screenly patch request for a specific playlist by ID.
 *
 * @param {string} playlistId - ID of the playlist to display.
 * @returns {object} The request response body.
 */
const screenlyRequest = async (playlistId, is_enabled) => requestAsync({
  url: `${SCREENLY_API}/api/v3/playlists/${playlistId}`,
  headers: { authorization: `Token ${SCREENLY_TOKEN}` },
  method: 'patch',
  form: { is_enabled },
});

/**
 * Set up a Reactor schedule to reset the playlist.
 *
 * @param {string} productId - The product to use in the map lookup.
 */
const scheduleReset = async (productId) => {
  const payload = {
    event: {
      playlists: SKU_PLAYLIST_MAP[productId],
    },
    executeAt: Date.now() + PLAYLIST_TTL,
  };

  const schedule = await app.reactor.schedule().create(payload);
  logger.info(`Reactor scheduled reset for playlist at: ${schedule.executeAt}`);
};

// @filter(onActionCreated) action.type=implicitScans,scans
const onActionCreated = async (event) => {
  const { action } = event;
  const { product } = action;

  try {
    checkAction(action);

    await Promise.all(SKU_PLAYLIST_MAP[product].map((item, i) => {
      await screenlyRequest(item, true);
      logger.info(`Updated screen with ${item}`);
    }));

    await scheduleReset(product);
  } catch (err) {
    logger.error(err.message || err.errors[0]);
  }

  done();
};

/**
 * Disable the playlists once the Reactor schedule goes off.
 * 
 * TODO: Is this always the usage pattern? Separate events for enable/disable? Parameterized?
 *
 * @param {object} event - The schedule event object.
 */
const onScheduledEvent = async (event) => {
  logger.info('Scheduled playlist reset...');
  const { playlists } = event;

  try {
    await Promise.all(playlists.map((item) => {
      await screenlyRequest(item, false);
      logger.info(`Disabled playlist ${item}`);
    }));
  } catch (err) {
    logger.error(err.message || err.errors[0]);
  }

  done();
};
