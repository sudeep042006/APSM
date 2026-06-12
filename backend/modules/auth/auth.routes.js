// modules/auth/auth.routes.js


import express from 'express';
import authController from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const authRouter = express.Router();
const userRouter = express.Router();

// ─── Auth Routes ─────────────────────────────────────────────────────────────
// REGISTER
authRouter.post('/register', authController.register);

// LOGIN
authRouter.post('/login', authController.login);

// ME — get current logged-in user
authRouter.get('/me', requireAuth, authController.getMe);

// STATUS — which platforms are connected?
authRouter.get('/status', requireAuth, authController.getStatus);

// INITIATE OAUTH
authRouter.get('/:platform', requireAuth, authController.initiateOAuth);

// OAUTH CALLBACK
authRouter.get('/:platform/callback', authController.oauthCallback);

// DISCONNECT / REVOKE
authRouter.delete('/:platform', requireAuth, authController.disconnectPlatform);
authRouter.delete('/:platform/revoke', requireAuth, authController.disconnectPlatform);
authRouter.post('/:platform/revoke', requireAuth, authController.disconnectPlatform);


// ─── User Routes ─────────────────────────────────────────────────────────────
// GET PROFILE
userRouter.get('/profile', requireAuth, authController.getProfile);

// GET CONNECTED ACCOUNTS
userRouter.get('/connected-accounts', requireAuth, authController.getConnectedAccounts);


export {
  authRouter,
  userRouter
};
