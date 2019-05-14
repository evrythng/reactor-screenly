const requestAsync = require('request-promise-native');

const SCREENLY_API = 'https://api.screenlyapp.com';
const SCREENLY_TOKEN = '';

/**
 * Check the action has all the required information.
 *
 * @param {object} action - The event action.
 */
const checkAction = async (action) => {
  if (!action.customFields) {
    throw new Error('customFields was not present in action');    
  }

  if (!action.customFields.playlistId) {
    throw new Error('customFields.playlistId was not present in action');    
  }

  if (!action.customFields.isEnabled) {
    throw new Error('customFields.isEnabled was not present in action');
  }
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

// @filter(onActionCreated) action.type=_updateScreenly
const onActionCreated = async ({ action }) => {
  logger.info(`Received action ${action.id}`);

  try {
    checkAction(action);

    const { playlistId, isEnabled } = action.customFields;
    const res = await screenlyRequest(playlistId, isEnabled);
    logger.debug(JSON.stringify(res));
  } catch (err) {
    logger.error(err.message || err.errors[0]);
  }

  done();
};

module.exports = { onActionCreated };
