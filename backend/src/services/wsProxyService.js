/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { WebSocketServer, WebSocket } from 'ws';
import { GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION } from '../config/env.js';
import { getAccessToken, getRequestHeaders } from './authService.js';

export function attachWsProxy(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', async (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === '/ws-proxy') {

      let targetUrl = url.searchParams.get('target');
      if (!targetUrl) {
        console.log('[Node Proxy] Missing target URL');
        socket.destroy();
        return;
      }

      if (targetUrl === 'wss://aiplatform.googleapis.com//ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent') {
        const location = GOOGLE_CLOUD_LOCATION === 'global' ? 'us-central1' : GOOGLE_CLOUD_LOCATION;
        targetUrl = `wss://${location}-aiplatform.googleapis.com//ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent`;
      } else {
        console.log('[Node Proxy] Invalid target URL');
        socket.destroy();
        return;
      }

      let accessToken;

      try {
        accessToken = await getAccessToken();
        if (!accessToken) throw new Error('No token');
      } catch (err) {
        console.log('[Node Proxy] Authentication failed');
        socket.destroy();
        return;
      }

      console.log(`[Node Proxy] Initiating upstream connection to: ${targetUrl}`);

      let upstreamWs;

      try {
        upstreamWs = new WebSocket(targetUrl, {
          headers: getRequestHeaders(accessToken)
        });
      } catch (e) {
        console.error('[Node Proxy] Invalid Upstream URL');
        socket.destroy();
        return;
      }

      const initialErrorHandler = (error) => {
        console.error('[Node Proxy] Upstream connection failed:', error);
        upstreamWs.removeEventListener('open', onUpstreamOpen);

        if (socket.writable) {
          socket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
          socket.destroy();
        }
      };

      upstreamWs.once('error', initialErrorHandler);

      // 5. Handle Successful Upstream Connection
      const onUpstreamOpen = () => {
        // Remove the "bootstrapping" error handler
        upstreamWs.removeListener('error', initialErrorHandler);

        // Perform the HTTP -> WebSocket upgrade for the Client
        wss.handleUpgrade(request, socket, head, (ws) => {

          upstreamWs.on('message', (data, isBinary) => {
            const logMsg = isBinary ? '<Binary Data>' : data.toString();
            console.log(`[Upstream -> Client] [${new Date().toISOString()}]: ${logMsg}`);

            if (ws.readyState === WebSocket.OPEN) {
              if (data === undefined || data === null) {
                console.warn('[Node Proxy] Attempted to send undefined/null data to client');
                return;
              }
              ws.send(data, { binary: isBinary });
            }
          });

          ws.on('message', (data, isBinary) => {
            const logMsg = isBinary ? '<Binary Data>' : data.toString();

            let dataJson = {};
            try {
              dataJson = JSON.parse(data.toString());
            } catch (error) {
              console.error('[Node Proxy] Failed to parse message from client:', error);
              ws.close(1011, 'Failed to parse message');
            }

            if (dataJson['setup']) {
              dataJson['setup']['model'] = `projects/${GOOGLE_CLOUD_PROJECT}/locations/${GOOGLE_CLOUD_LOCATION}/${dataJson['setup']['model']}`;
            }

            if (upstreamWs.readyState === WebSocket.OPEN) {
              upstreamWs.send(JSON.stringify(dataJson), { binary: false });
            }
          });

          upstreamWs.on('error', (error) => {
            console.error('[Node Proxy] Upstream error:', error);
            ws.close(1011, error.message);
          });

          upstreamWs.on('close', (code, reason) => {
            console.log(`[Node Proxy] Upstream closed: ${code} ${reason}`);
            if (ws.readyState === WebSocket.OPEN) {
              ws.close(code, reason);
            }
          });

          ws.on('error', (error) => {
            console.error('[Node Proxy] Client error:', error);
            upstreamWs.close(1011, error.message);
          });

          ws.on('close', (code, reason) => {
            console.log(`[Node Proxy] Client closed: ${code} ${reason}`);
            if (upstreamWs.readyState === WebSocket.OPEN) {
              upstreamWs.close(1000, reason);
            }
          });

          wss.emit('connection', ws, request);
        });
      };

      upstreamWs.once('open', onUpstreamOpen);

    } else {
      // Path did not match
      socket.destroy();
    }
  });
}
