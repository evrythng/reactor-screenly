# reactor-screenly

Packaged Reactor script for communicating with the Screenly API for
enabling/disabling playlists using EVRYTHNG actions.


## Usage

First, configure the constant fields at the top of the script:

* `SCREENLY_TOKEN` - Screenly API token.
* `PLAYLIST_TTL_M` - Time in minutes a playlist should be active before being
  removed.
* `DEFAULT_PLAYLIST_ID` - PLaylist to use if the product is not present in
  `PRODUCT_PLAYLIST_MAP`.
* `PRODUCT_PLAYLIST_MAP` - Map playlist IDs to an EVRYTHNG product that will be
  scanned.

Create an action with the `implicitScans` type and set the `product` as the
target (which dictates which playlist will be shown):

```json
{
  "type": "implicitScans",
  "product": "Uq7rhrSyF5D8GRawa3Hsnwbp"
}
```

After `PLAYLIST_TTL_M`, the script will be invoked again automatically to
disable the chosen playlist.
