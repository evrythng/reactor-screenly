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
Screenly account remotely in response to product scans. To obtain this token,
you need to go into your Screenly account. Then Settings > Account and at the 
bottom of the page you should see a 'Token' section. Then, create a new token and 
save it somewhere, you'll need it in the reactor script configuration.

## Reactor Script Configuration

With the account and authentication configured, set the required constant fields
at the top of this script:

> Playlist IDs can be found in the browser URL when on the respective playlist's
> details page as the last URL segment. For example:
> 'https://mwc.screenlyapp.com/manage/playlists/5cdd7c24ba3f8a00157c563c'.

* `SCREENLY_TOKEN` - Screenly API token, obtained as described above. You need to 
update the .env file with this line inside : `SCREENLY_TOKEN="YOUR_TOKEN"`. 
* `PLAYLIST_TTL_S` - Time in seconds a playlist should be active before being removed.
* `DEFAULT_PLAYLIST_ID` - Playlist to use if the `playlistId` is not present in the custom fields of the product.

## Deploy the reactor script

First, you need to start by cloning this project.

Then, you need to configure a few variables as it is explained in the previous section.

Once you have configured the reactor script, you have to deploy it to your application. To deploy it, you can do it 
manually or use the EVRYTHNG API. I suggest you to use the deploy_reactor command that is defined in the `package.json`. 
You just need to modify this part of the command with your PROJECT_ID and APPLICATION_ID : 
`PUT 'https://api.evrythng.com/projects/PROJECT_ID/applications/APPLICATION_ID/reactor/script'`

And you need to update `access_key.secret` with your OPERATOR_API_KEY. To get it, you have to click on your account 
(top right corner of the EVRYTHNG dashboard) and go to 'Account settings'.

Finally, you run this command to deploy the script: 
```
npm run deploy_reactor
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
