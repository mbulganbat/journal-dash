/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import express from 'express';
import { PORT, API_BACKEND_HOST, API_PAYLOAD_MAX_SIZE } from './src/config/env.js';
import { proxyRouter } from './src/routes/proxyRouter.js';
import { attachWsProxy } from './src/services/wsProxyService.js';

const app = express();
app.use(express.json({ limit: API_PAYLOAD_MAX_SIZE }));

app.set('trust proxy', 1 /* number of proxies between user and server */);

// HTTP proxy endpoint (rate limiter applied inside the router)
app.use('/api-proxy', proxyRouter);

const server = app.listen(PORT, API_BACKEND_HOST, () => {
  console.log(`Vertex AI Backend listening at http://localhost:${PORT}`);
});

// WebSocket (Live API) bidi proxy on /ws-proxy
attachWsProxy(server);
