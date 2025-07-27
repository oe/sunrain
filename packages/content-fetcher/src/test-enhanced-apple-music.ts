#!/usr/bin/env node

/**
 * Test script for enhanced Apple Music integration
 * Tests the new content validation, duplicate detection, and quality scoring features
 */

import { MusicFetcher } from './fetchers/music-fetcher.js';
import { loadConfig } from './config.js';
import { logger } from './logger.js';

async function testEnhancedAppleMusicIntegration() {
  console.log('🎵 Testing Enhanced Apple Music Integration...\n');

  try {
    const config = loadConfig();
    const musicFetcher = new MusicFetcher(config);

    // Test Apple Music content fetching with validation
    console.log('1. Testing Apple Music content fetching with validation...');
    const appleMusicItems = await (musicFetcher as any).fetchFromAppleMusic();

    console.log(`✅ Fetched ${appleMusicItems.length} validated Apple Music items`);

    if (appleMusicItems.length > 0) {
      console.log('\n📊 Sample Apple Music items:');
      appleMusicItems.slice(0, 3).forEach((item: any, index: number) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   Artist: ${item.artist}`);
        console.log(`   Type: ${item.type}`);
        console.log(`   Themes: ${item.themes?.join(', ') || 'None'}`);
        console.log(`   Benefits: ${item.benefits?.join(', ') || 'None'}`);
        console.log(`   Quality Score: ${item.qualityScore || 'N/A'}`);
        console.log(`   Relevance Score: ${item.relevanceScore || 'N/A'}`);
        console.log(`   Apple Music URL: ${item.appleMusicUrl ? '✅' : '❌'}`);
      });
    }

    // Test full music fetching with cross-platform deduplication
    console.log('\n\n2. Testing full music fetching with cross-platform deduplication...');
    const allMusicItems = await musicFetcher.fetchMusic();

    console.log(`✅ Total unique music items after deduplication: ${allMusicItems.length}`);

    // Analyze platform distribution
    const platformStats = {
      spotify: allMusicItems.filter(item => item.id.startsWith('spotify-')).length,
      appleMusic: allMusicItems.filter(item => item.id.startsWith('apple-music-')).length
    };

    console.log('\n📈 Platform distribution:');
    console.log(`   Spotify: ${platformStats.spotify} items`);
    console.log(`   Apple Music: ${platformStats.appleMusic} items`);

    // Analyze monetization coverage
    const monetizationStats = {
      withAppleMusicAffiliate: allMusicItems.filter(item =>
        item.appleMusicUrl && item.appleMusicUrl.includes('at=')
      ).length,
      withSpotifyAffiliate: allMusicItems.filter(item =>
        item.spotifyUrl && item.spotifyUrl.includes('si=')
      ).length
    };

    console.log('\n💰 Monetization coverage:');
    console.log(`   Items with Apple Music affiliate links: ${monetizationStats.withAppleMusicAffiliate}`);
    console.log(`   Items with Spotify affiliate links: ${monetizationStats.withSpotifyAffiliate}`);

    // Analyze content quality
    const qualityStats = {
      withThemes: allMusicItems.filter(item => item.themes && item.themes.length > 0).length,
      withBenefits: allMusicItems.filter(item => item.benefits && item.benefits.length > 0).length,
      withBoth: allMusicItems.filter(item =>
        item.themes && item.themes.length > 0 &&
        item.benefits && item.benefits.length > 0
      ).length
    };

    console.log('\n🎯 Content quality:');
    console.log(`   Items with themes: ${qualityStats.withThemes}`);
    console.log(`   Items with benefits: ${qualityStats.withBenefits}`);
    console.log(`   Items with both themes and benefits: ${qualityStats.withBoth}`);

    // Show top quality items
    const topQualityItems = allMusicItems
      .filter(item => (item as any).qualityScore || (item as any).relevanceScore)
      .sort((a, b) =>
        ((b as any).qualityScore || 0) + ((b as any).relevanceScore || 0) -
        ((a as any).qualityScore || 0) + ((a as any).relevanceScore || 0)
      )
      .slice(0, 5);

    if (topQualityItems.length > 0) {
      console.log('\n🏆 Top quality items:');
      topQualityItems.forEach((item: any, index: number) => {
        const totalScore = (item.qualityScore || 0) + (item.relevanceScore || 0);
        console.log(`\n${index + 1}. ${item.title} (Score: ${totalScore})`);
        console.log(`   Platform: ${item.id.startsWith('apple-music-') ? 'Apple Music' : 'Spotify'}`);
        console.log(`   Themes: ${item.themes?.slice(0, 3).join(', ') || 'None'}`);
        console.log(`   Benefits: ${item.benefits?.slice(0, 3).join(', ') || 'None'}`);
      });
    }

    console.log('\n✅ Enhanced Apple Music integration test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testEnhancedAppleMusicIntegration().catch(console.error);
