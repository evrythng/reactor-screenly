# reactor-screenly

Packaged Reactor script for communicating with the Screenly API for 
enabling/disabling playlists using EVRYTHNG actions.


## Usage

Create an action with the `_updateScreenly` type and includes the ID of the
playlist and its enabled state in the `customFields`:

```json
{
  "type": "_updateScreenly",
  "customFields": {
    "playlistId": "55da84471148c20a1155a583",
    "isEnabled": true
  }
}
```
