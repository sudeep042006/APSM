# 📄 Project Handover & Functionality Documentation

This document provides a comprehensive overview of the **Unified Social Media OS (APSM)** project for the incoming development team. It outlines all currently implemented features, explains the architecture, and details how to implement the remaining **LinkedIn Integration** and **Cross-Posting Functionality**.

---

## 📂 Table of Contents
1. [Project Overview & Current Status](#1-project-overview--current-status)
2. [Tech Stack](#2-tech-stack)
3. [Core Functionalities Implemented](#3-core-functionalities-implemented)
   - [Authentication & Session Management](#authentication--session-management)
   - [OAuth Connection Framework](#oauth-connection-framework)
   - [Credential Security (AES Encryption)](#credential-security-aes-encryption)
   - [Automated Token Refresh Management](#automated-token-refresh-management)
   - [Data Harvesting (Analytics Snapshots & Demographics)](#data-harvesting-analytics-snapshots--demographics)
   - [Background Operations (Cron Jobs & Redis)](#background-operations-cron-jobs--redis)
4. [Frontend Dashboards & Routing](#4-frontend-dashboards--routing)
5. [Guide: Implementing LinkedIn Integration](#5-guide-implementing-linkedin-integration)
6. [Guide: Implementing Cross-Posting & Scheduling](#6-guide-implementing-cross-posting--scheduling)
7. [Database Reference Guide](#7-database-reference-guide)

---

## 1. Project Overview & Current Status

The **Unified Social Media OS (APSM)** is a monorepo platform designed to centralize social media management, data harvesting, and scheduling. 

Currently, the project supports:
- Full user authentication (JWT-based).
- Secure OAuth 2.0 channel connection framework.
- Fully implemented **YouTube Analytics Integration** (fetching channel overview, content, audience, engagement, demographics, device stats, and playlists).
- Fully structured **Meta (Facebook & Instagram) Integration** with long-lived token exchange.
- A premium, responsive glassmorphism dashboard built with Tailwind CSS.
- Stubs for **LinkedIn** and **Cross-Posting** dashboards on both frontend and backend.

---

## 2. Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), Redis (Upstash/ioredis), JWT, bcrypt, Axios, node-cron.
- **Frontend**: React 19, React Router v6, Axios, Tailwind CSS (v3), Lucide React, Recharts (analytics graphs).
- **Tooling**: Vite (frontend builder), dotenv (environment configurations).

---

## 3. Core Functionalities Implemented

### Authentication & Session Management
- **User Registration & Login**: Works via hashed password storage (`bcrypt` with 12 rounds) and JWT signing. See [auth.controller.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/modules/auth/auth.controller.js).
- **JWT Authorization Middleware**: The `requireAuth` middleware (see [auth.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/middleware/auth.js)) authenticates requests by parsing the HTTP `Authorization` header (`Bearer <token>`).
- **Callback Authentication Bypass**: To allow standard browser redirects for OAuth callbacks, `requireAuth` also parses the JWT directly from a query parameter (`?token=...`), letting the backend verify and attach the session.

### OAuth Connection Framework
- **Dynamic Connection Initiation**: A request to `GET /auth/:platform` triggers a cryptographically secure OAuth flow. The controller:
  1. Generates a random `state` token to prevent CSRF attacks.
  2. Stores this state in an in-memory `pendingStates` map linked to the user's ID.
  3. Redirects the user's browser to the platform's OAuth login screen.
- **Trampoline Callbacks**: Once access is granted, the platform redirects to `GET /auth/:platform/callback`. The backend:
  1. Validates the CSRF `state`.
  2. Exchanges the callback `code` for access and refresh tokens.
  3. Queries the platform API for basic profile credentials (username, user ID).
  4. Upserts this data in the MongoDB `User` record under the `socialAccounts` array.
  5. Redirects the browser to the frontend `/settings` page with status parameters.

### Credential Security (AES Encryption)
- To protect OAuth credentials, all access and refresh tokens are encrypted prior to being saved in MongoDB.
- We use **AES-256-CBC** encryption with a user-defined, hex-encoded `ENCRYPTION_KEY` in `.env`.
- In [auth.model.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/modules/auth/auth.model.js), Mongoose virtuals (`accessToken` and `refreshToken`) automatically encrypt values when set, and decrypt values upon retrieval. 

### Automated Token Refresh Management
- Because social tokens expire quickly (e.g., Google tokens expire in 1 hour), the project implements a proactive token manager.
- The helper [getValidToken(userId, platform)](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/utils/tokenManager.js) is called before making platform API calls:
  1. It reads the platform's credentials from the database.
  2. Checks if `expiresAt` is in the past.
  3. If expired, it uses the platform-specific `refreshAccessToken` routine (see [platforms index](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/config/platforms/index.js)) to get a new access token.
  4. Saves the updated token in MongoDB and logs the refresh status.

### Data Harvesting (Analytics Snapshots & Demographics)
- **Analytics Snapshot Model**: A generalized data schema [analytics.model.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/modules/analytics/analytics.model.js) stores daily channel snap metrics (impressions, followers, reach, engagement) and pre-processed demographic vectors (age, gender, top country locations).
- **YouTube Analytics Engine**: Implemented in [youtube.analytics.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/modules/analytics/youtube.analytics.js). It fetches:
  - Channel statistics (`youtube/v3/channels`).
  - Recent uploads and their engagement (`youtube/v3/playlistItems` + `youtube/v3/videos`).
  - Demographic, geographic, device-type, and daily engagement reports from the Google Reporting API.
- **Meta (Facebook & Instagram) Engine**: Implemented in [meta.analytics.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/modules/analytics/meta.analytics.js). It performs a Facebook Pages list lookup, extracts linked Instagram Business account IDs, and requests insight metrics for both platforms.
- **Fallback Simulation**: If no accounts are connected, both engines automatically construct structured mock snapshots for trial accounts, keeping frontend charts functional for demo purposes.

### Background Operations (Cron Jobs & Redis)
- **Nightly Harvesting Scheduler**: In [cron.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/modules/analytics/cron.js), a `node-cron` daemon runs daily at 2:00 AM. It scans all database users, checks their active integrations, and triggers fresh analytics harvesting.
- **Redis Connection Client**: Configured in [redis.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/config/redis.js) using the `ioredis` library, connecting to an Upstash instance. This provides the fast in-memory store required for job-queues and background worker processing.

---

## 4. Frontend Dashboards & Routing

The frontend structure is configured in [index.jsx](file:///e:/Himanshu/internship%201.0/APSM-incubien/frontend/src/routes/index.jsx) and maps pages to views:
- **Landing Page**: Renders marketing features and funnels users into the authentication dashboard.
- **Auth Page**: Combines login and sign-up flows under a single responsive visual theme.
- **Settings Page**: Manages platform connection statuses. Acts as the callback landing pad which captures callback queries and displays success/error alerts before returning the user to the main page.
- **YouTube Dashboard**: A premium, fully functional sub-dashboard rendering detailed view cards (Overview, Realtime, Content, Engagement, Audience, Revenue) powered by the data parser [ytapi.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/frontend/src/services/ytapi.js).
- **Meta & LinkedIn Dashboards**: Render connected status overlays and structure analytics charts using mock payloads when actual APIs are offline or connection is missing.
- **Cross-Posting Panel**: A unified control dashboard representing connected platforms as active workspaces and available connections to publish/schedule posts.

---

## 5. Guide: Implementing LinkedIn Integration

LinkedIn analytics and login are currently stubbed. Follow these steps to complete the real integration:

### Step 1: Obtain LinkedIn Developer App
1. Go to the [LinkedIn Developer Portal](https://developer.linkedin.com/).
2. Create an app, associate it with a verified LinkedIn Page, and request the **Sign In with LinkedIn (OpenID Connect)** and **Share on LinkedIn** products.
3. Configure redirect URIs: `http://localhost:5000/auth/linkedin/callback`.
4. Add the following to backend `.env`:
   ```env
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

### Step 2: Configure Scopes and Profile Request
Update [linkedin.js (backend platform config)](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/config/platforms/linkedin.js):
- Modern OIDC login scopes: `['openid', 'profile', 'email', 'w_member_social']`.
- Update `getProfile` to query the modern Userinfo endpoint:
  ```javascript
  async getProfile(accessToken) {
    const res = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      platformUserId:   res.data.sub, // sub is the unique identifier
      platformUsername: res.data.name,
    };
  }
  ```

### Step 3: Implement Data Fetching
Implement `fetchAndSaveLinkedInAnalytics` in [linkedin.analytics.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/modules/analytics/linkedin.analytics.js):
1. Retrieve a valid access token using `getValidToken(userId, 'linkedin')`.
2. Query LinkedIn's **Share and Social Actions API** to retrieve post impressions and engagement details:
   - To get member updates: `GET https://api.linkedin.com/v2/shares?owners=urn:li:person:{personId}`.
   - To get statistics of organizational updates: `GET https://api.linkedin.com/v2/organizationalEntityShareStatistics?organizationalEntity=urn:li:organization:{orgId}`.
3. Parse metrics (Followers, Impressions, Reach, Clicks, Likes, Comments, Shares).
4. Upsert results into MongoDB `AnalyticsSnapshot`.
5. Update [cron.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/modules/analytics/cron.js) to include LinkedIn analytics in the nightly daemon.

### Step 4: Frontend Hookup
- Update [LinkedInDash.jsx](file:///e:/Himanshu/internship%201.0/APSM-incubien/frontend/src/pages/LinkedInDash/LinkedInDash.jsx) to call `/analytics/linkedin` instead of displaying hardcoded mock charts.
- Render actual followers and post details retrieved from the backend snapshot.

---

## 6. Guide: Implementing Cross-Posting & Scheduling

The scheduling panel is stubbed out. To implement cross-posting, build a queue-based system powered by **Redis** and **BullMQ** to safely process jobs in the background:

### Step 1: Create the Mongoose Job Schema
Create `backend/modules/automation/job.model.js` to store post logs:
```javascript
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mediaUrl: { type: String, default: null }, // S3 / Cloudinary asset URL
  platforms: [{ type: String, enum: ['facebook', 'instagram', 'youtube', 'linkedin'] }],
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  platformStatuses: [{
    platform: String,
    status: { type: String, enum: ['pending', 'completed', 'failed'] },
    postId: { type: String, default: null },
    error: { type: String, default: null }
  }],
  scheduledAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Job = mongoose.model('Job', JobSchema);
```

### Step 2: Configure BullMQ Queue
Install BullMQ (`npm install bullmq`) and configure `backend/modules/automation/queue.js`:
```javascript
import { Queue } from 'bullmq';
import { redisClient } from '../../config/redis.js';

export const postQueue = new Queue('postQueue', {
  connection: redisClient
});

export const addPostJob = async (jobData, delayMs = 0) => {
  await postQueue.add('publish-post', jobData, {
    delay: delayMs,
    removeOnComplete: true,
    removeOnFail: false
  });
};
```

### Step 3: Implement worker.js to Publish Posts
Build `backend/modules/automation/worker.js` to process jobs:
```javascript
import { Worker } from 'bullmq';
import { redisClient } from '../../config/redis.js';
import { Job } from './job.model.js';
import { getValidToken } from '../../utils/tokenManager.js';
import axios from 'axios';

const worker = new Worker('postQueue', async (bullJob) => {
  const { jobId } = bullJob.data;
  const job = await Job.findById(jobId);
  if (!job) return;

  job.status = 'processing';
  await job.save();

  for (const pStatus of job.platformStatuses) {
    if (pStatus.status === 'completed') continue;

    try {
      const token = await getValidToken(job.userId, pStatus.platform);
      let postId = null;

      if (pStatus.platform === 'facebook') {
        // Facebook Graph API - post to page feed
        const pagesRes = await axios.get('https://graph.facebook.com/me/accounts', { params: { access_token: token } });
        const page = pagesRes.data.data?.[0];
        if (!page) throw new Error('No Facebook Page found');
        
        const publishRes = await axios.post(`https://graph.facebook.com/${page.id}/feed`, {
          message: job.content,
          link: job.mediaUrl || undefined,
          access_token: page.access_token
        });
        postId = publishRes.data.id;
      } 
      
      else if (pStatus.platform === 'linkedin') {
        // LinkedIn Posts API (Version 202306 or newer)
        const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', { headers: { Authorization: `Bearer ${token}` } });
        const urn = `urn:li:person:${profileRes.data.sub}`;
        
        const publishRes = await axios.post('https://api.linkedin.com/v2/posts', {
          author: urn,
          commentary: job.content,
          visibility: 'PUBLIC',
          distribution: {
            feedDistribution: 'MAIN_FEED',
            targetEntities: []
          }
        }, { headers: { Authorization: `Bearer ${token}`, 'X-Restli-Protocol-Version': '2.0.0' } });
        
        postId = publishRes.headers['x-restli-id'] || 'success';
      }

      pStatus.status = 'completed';
      pStatus.postId = postId;
    } catch (err) {
      pStatus.status = 'failed';
      pStatus.error = err.message;
    }
  }

  const allCompleted = job.platformStatuses.every(p => p.status === 'completed');
  job.status = allCompleted ? 'completed' : 'failed';
  await job.save();
}, { connection: redisClient });
```

### Step 4: Hook controller and routes
Update [automation.controller.js](file:///e:/Himanshu/internship%201.0/APSM-incubien/backend/modules/automation/automation.controller.js):
```javascript
import { Job } from './job.model.js';
import { addPostJob } from './queue.js';

const createAutomationJob = async (req, res, next) => {
  try {
    const { content, mediaUrl, platforms, scheduledAt } = req.body;
    const userId = req.user._id;

    const platformStatuses = platforms.map(p => ({ platform: p, status: 'pending' }));
    const job = await Job.create({
      userId,
      content,
      mediaUrl,
      platforms,
      platformStatuses,
      scheduledAt: scheduledAt || new Date()
    });

    const delay = scheduledAt ? Math.max(0, new Date(scheduledAt) - Date.now()) : 0;
    await addPostJob({ jobId: job._id }, delay);

    res.status(201).json({ message: 'Post job queued successfully', job });
  } catch (err) {
    next(err);
  }
};

export default { createAutomationJob };
```

### Step 5: Frontend Editor Hookup
1. Connect inputs in [NewPostPage.jsx](file:///e:/Himanshu/internship%201.0/APSM-incubien/frontend/src/pages/CrossPostingDash/NewPostPage.jsx):
   - Text textarea for post body content.
   - Media selector/uploader field.
   - Platform checklist (filtering which connected social accounts to post to).
   - Date-Time Picker for scheduling option.
2. Submit values via `POST /automation/jobs` using the API client.

---

## 7. Database Reference Guide

### User Model Schema
*Matches users and holds nested decrypted tokens in virtuals.*
- `name` *(String, Required)*: User's registered identity.
- `email` *(String, Required, Unique)*: User's lookup address.
- `passwordHash` *(String, Required)*: Encrypted using Bcrypt.
- `socialAccounts` *(Array)*:
  - `platform` *(String - youtube, facebook, instagram, linkedin)*.
  - `platformUserId` *(String)*: Unique profile ID.
  - `platformUsername` *(String)*: Platform account display name.
  - `_accessToken` / `_refreshToken` *(Strings)*: AES encrypted tokens.
  - `expiresAt` *(Date)*: Expiration indicator.
  - `isActive` *(Boolean)*: Revocation toggle.

### Analytics Snapshot Schema
*Holds timeline snapshots of channel insights.*
- `incubationCenterId` *(ObjectId)*: User reference.
- `platform` *(String)*.
- `snapshotDate` *(Date)*.
- `metrics` *(Object)*: Followers, impressions, reach, profile views, engagement.
- `demographics` *(Object)*: `topCountries` (Array), `topCities` (Array), `ageAndGender` (Array).
- `rawPlatformData` *(Mixed)*: Full, unformatted payload returned by the target platform API.

---

### Dev Setup Checklist
To resume workspace development:
1. Initialize local processes: Run `npm install` inside both `/backend` and `/frontend`.
2. Configure `.env` keys. Must run Upstash Redis or local redis instance for automation.
3. Boot development instances using `npm run dev` in both terminals.
