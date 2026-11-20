# sid-presence

Counts the tabs open on the site right now, for the footer. No storage, no identifiers.

Deploy: `cd workers/presence && npx wrangler login && npx wrangler deploy`.
Then set `presence_url: "wss://sid-presence.<account>.workers.dev"` in `_config.yml`.
Until that is set the footer shows nothing, and it also hides itself if the socket cannot connect.
