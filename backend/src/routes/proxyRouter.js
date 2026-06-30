/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import express from 'express';
import { proxyLimiter } from '../middleware/rateLimiter.js';
import { proxyHandler } from '../controllers/proxyController.js';

export const proxyRouter = express.Router();

// Apply the rate limiter before the main proxy logic
proxyRouter.use(proxyLimiter);
proxyRouter.post('/', proxyHandler);
