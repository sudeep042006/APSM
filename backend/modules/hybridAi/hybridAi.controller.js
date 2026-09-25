import { estimateVariant, generatePlatformVariants, validateHybridRequest } from './hybridAi.service.js';

export async function predictAndSuggest(req, res) {
  try {
    const input = validateHybridRequest(req.body);
    const generated = await generatePlatformVariants({ caption: input.baseCaption, category: input.category, platforms: input.platforms });
    const predictions = Object.fromEntries(await Promise.all(input.platforms.map(async platform => {
      const variant = generated.variants[platform];
      const estimate = await estimateVariant({ platform, caption: variant.caption, hashtags: variant.hashtags, mediaType: input.mediaType, postingHour: input.postingHour, followerCount: input.followerCount });
      return [platform, { ...variant, ...estimate }];
    })));
    res.json({ status: 'success', generation_source: generated.source, generation_warning: generated.warning, predictions });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not generate suggestions.' });
  }
}
