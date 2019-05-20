# reactor-screenly

Packaged Reactor script for communicating with the Screenly API for
enabling/disabling playlists using EVRYTHNG actions.


## Screenly Setup

Using the [Screenly dashboard](https://mwc.screenlyapp.com), perform the
following steps to prepare the screens, playlists, and assets for the products
that will be displayed using this integration script:


### Setup screen

1. Add the screen to be used to the account - the dashboard will guide you
   through this process.
2. Add the screent to a group - playlists are displayed on a group basis.


### Setup playlists and assets

1. Create a playlist for each EVRYTHNG product to be displayed.
2. Add the product's assets (images, web pages, etc.) for each product to its
   corresponding playlist.
3. Create a default playlist, and add a generic asset(s) to be shown when no
   products have been scanned recently, such as brand logos/information.


### Setup authentication

This integration script requires an access token in order to manipulate your
screenly account remotely in response to product scans. To obtain this token,
make the following API request:

```
curl -i -H Content-Type:application/json \
  -X POST https://api.screenlyapp.com/api/v3/tokens/ \
  -d '{
  "username": "EMAIL_ADDRESS",
  "password": "PASSWORD"
}'
```

Where `EMAIL_ADDRESS` and `PASSWORD` are your Screenly dashboard login
credentials. The response contains the token to be used here as
`SCREENLY_TOKEN` (truncated here):

```
HTTP/2 200

{
  "username": "EMAIL_ADDRESS",
  "token": "3d41dbcd..."
}
```

### Reactor Script Configuration

With the account and authentication configured, set the required constant fields
at the top of this script:

> Playlist IDs can be found in the browser URL when on the respective playlist's
> details page as the last URL segment. For example:
> 'https://mwc.screenlyapp.com/manage/playlists/5cdd7c24ba3f8a00157c563c'.

* `SCREENLY_TOKEN` - Screenly API token, obtained as described above.
* `PLAYLIST_TTL_M` - Time in minutes a playlist should be active before being
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

After `PLAYLIST_TTL_M`, the script will be invoked again automatically to
disable the chosen playlist, leaving only the `DEFAULT_PLAYLIST_ID` displayed.

In the real world, a consumer using their phone to anonymously scan a product's
QR code results in the creation of an `implicitScans` action, thus triggering
the integration in the same manner.
