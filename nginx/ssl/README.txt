Place your TLS certificate and private key here for a production HTTPS deployment
(e.g. fullchain.pem and privkey.pem from Let's Encrypt), then reference them in
nginx/conf.d/default.conf with a `listen 443 ssl;` server block.

Not used for local development.
