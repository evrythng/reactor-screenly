# reactor-screenly

Packaged Reactor script for communicating with the
[Screenly API](https://www.screenly.io/) for enabling/disabling playlists using
EVRYTHNG actions.

## What is it good for?

Screenly is a leading digital signage platform. By connecting it with the
EVRYTHNG platform you can now display personalized content on screens when
people interact with EVRYTHNG tagged products. For instance imagine changing the
content of in-store screens depending on the products customers pick up.  With
this connector, this is now possible within minutes!

## Screenly Setup

Using the [Screenly dashboard](https://mwc.screenlyapp.com), perform the
following steps to prepare the screens, playlists, and assets for the products
that will be displayed using this integration script:

### Setup screen, playlist, and assets

1. Add the screen to be used to the account - the dashboard will guide you
   through this process.
2. Add the screen to a group - playlists are displayed on a group basis.
3. Create a playlist for each EVRYTHNG product to be displayed.
4. Add the product's assets (images, web pages, etc.) for each product to its
   corresponding playlist.
5. Create a default playlist, and add a generic asset(s) to be shown when no
   products have been scanned recently, such as brand logos/information.


### Setup authentication

This integration script requires an access token in order to manipulate your
screenly account remotely in response to product scans. To obtain this token,
you need to go in your screenly account. Then Settings > Account and at the 
bottom of the page you should see a 'Token' section. Then, create a new token and 
save it somewhere, you'll need it in the reactor script configuration.

## Reactor Script Configuration

With the account and authentication configured, set the required constant fields
at the top of this script:

> Playlist IDs can be found in the browser URL when on the respective playlist's
> details page as the last URL segment. For example:
> 'https://mwc.screenlyapp.com/manage/playlists/5cdd7c24ba3f8a00157c563c'.

* `SCREENLY_TOKEN` - Screenly API token, obtained as described above. You need to 
create a .env file with this line inside : 
`SCREENLY_TOKEN=YOUR_TOKEN` (or just replace `process.env.SCREENLY_TOKEN` with your API token. 
In that case, you won't need the dotenv package anymore).
* `PLAYLIST_TTL_S` - Time in seconds a playlist should be active before being
  removed.
* `DEFAULT_PLAYLIST_ID` - Playlist to use if the product is not present in
  `PRODUCT_PLAYLIST_MAP`.
* `PRODUCT_PLAYLIST_MAP` - Map playlist IDs to an EVRYTHNG product that will be
  scanned. Example shown below:

```js
const PRODUCT_PLAYLIST_MAP = {
  // First product's ID mapped to its playlist ID
  Uq7rhrSyF5D8GRawa3Hsnwbp: '5cdd7c24ba3f8a00157c563c',

  // Others...
};
```


## Usage

Create an action with the `implicitScans` type and set the `product` as the
target (which dictates which playlist will be shown):

```json
{
  "type": "implicitScans",
  "product": "Uq7rhrSyF5D8GRawa3Hsnwbp"
}
```

After `PLAYLIST_TTL_S`, the script will be invoked again automatically to
disable the chosen playlist, leaving only the `DEFAULT_PLAYLIST_ID` displayed.

In the real world, a consumer using their phone to anonymously scan a product's
QR code results in the creation of an `implicitScans` action, thus triggering
the integration in the same manner.

### Multiple Screens/Products

If there are multiple screens to be used for multiple products (for insance in
different isles in a store), this can be achieved by ensuring that each
different Screenly Screen is listed in the 'Plays on' field of the appropriate
product playlists. In this manner, the request to enable each product's playlist
will then be displayed on the appropriate screen.
