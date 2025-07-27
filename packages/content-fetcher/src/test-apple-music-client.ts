#!/usr/bin/env tsx

/**
 * Test script for Apple Music API client
 * This script tests the Apple Music JWT service and API client functionality
 */

import { AppleMusicJWTService } from './services/apple-music-jwt.js';
import { AppleMusicClient } from './services/apple-music-client.js';
import { logger } from './logger.js';

async function testAppleMusicClient() {
  console.log('🎵 Testing Apple Music API Client...\n');

  // Mock configuration for testing (replace with real values for actual testing)
  const mockConfig = {
    teamId: process.env.APPLE_MUSIC_TEAM_ID || 'MOCK_TEAM_ID',
    keyId: process.env.APPLE_MUSIC_KEY_ID || 'MOCK_KEY_ID',
    privateKey: process.env.APPLE_MUSIC_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MOCK_PRIVATE_KEY_CONTENT
-----END PRIVATE KEY-----`
  };

  try {
    // Test JWT Service
    console.log('1. Testing JWT Service...');
    const jwtService = new AppleMusicJWTService(mockConfig);

    // Test token info before generation
    const initialTokenInfo = jwtService.getTokenInfo();
    console.log('   Initial token info:', {
      hasToken: !!initialTokenInfo.token,
      isValid: initialTokenInfo.isValid
    });

    // Test token validation with no token
    const isValidBeforeGeneration = jwtService.validateToken();
    console.log('   Token valid before generation:', isValidBeforeGeneration);

    if (process.env.APPLE_MUSIC_TEAM_ID && process.env.APPLE_MUSIC_KEY_ID && process.env.APPLE_MUSIC_PRIVATE_KEY) {
      // Only test actual token generation if real credentials are provided
      console.log('   Generating JWT token...');
      const token = await jwtService.generateToken();
      console.log('   ✅ JWT token generated successfully');
      console.log('   Token length:', token.length);

      // Test token validation
      const isValid = jwtService.validateToken();
      console.log('   Token is valid:', isValid);

      // Test token info after generation
      const tokenInfo = jwtService.getTokenInfo();
      console.log('   Token expiry:', tokenInfo.expiry?.toISOString());

      // Test Apple Music Client
      console.log('\n2. Testing Apple Music Client...');
      const client = new AppleMusicClient(jwtService);

      // Test authentication
      const isAuthenticated = await client.isAuthenticated();
      console.log('   Client authenticated:', isAuthenticated);

      if (isAuthenticated) {
        // Test connection
        console.log('   Testing connection...');
        const connectionTest = await client.testConnection();
        console.log('   Connection test:', connectionTest ? '✅ Success' : '❌ Failed');

        if (connectionTest) {
          // Test search functionality
          console.log('   Testing search functionality...');

          // Test playlist search
          console.log('   Searching for meditation playlists...');
          const playlists = await client.searchPlaylists('meditation music', 3);
          console.log(`   Found ${playlists.length} playlists`);

          if (playlists.length > 0) {
            console.log('   Sample playlist:', {
              id: playlists[0].id,
              name: playlists[0].attributes.name,
              curator: playlists[0].attributes.curatorName
            });

            // Test playlist details
            console.log('   Getting playlist details...');
            const playlistDetails = await client.getPlaylistDetails(playlists[0].id);
            if (playlistDetails) {
              console.log('   ✅ Playlist details retrieved');
              console.log('   Track count:', playlistDetails.attributes.trackCount);
            }
          }

          // Test album search
          console.log('   Searching for relaxation albums...');
          const albums = await client.searchAlbums('relaxation music', 3);
          console.log(`   Found ${albums.length} albums`);

          if (albums.length > 0) {
            console.log('   Sample album:', {
              id: albums[0].id,
              name: albums[0].attributes.name,
              artist: albums[0].attributes.artistName
            });
          }

          // Test therapeutic content search
          console.log('   Testing therapeutic content search...');
          const therapeuticContent = await client.searchTherapeuticContent(5);
          console.log(`   Found ${therapeuticContent.playlists.length} therapeutic playlists`);
          console.log(`   Found ${therapeuticContent.albums.length} therapeutic albums`);
        }
      }

      // Test token refresh
      console.log('\n3. Testing token refresh...');
      const refreshedToken = await jwtService.refreshToken();
      console.log('   ✅ Token refreshed successfully');
      console.log('   New token length:', refreshedToken.length);

      // Test token clearing
      console.log('\n4. Testing token clearing...');
      jwtService.clearToken();
      const clearedTokenInfo = jwtService.getTokenInfo();
      console.log('   Token cleared:', !clearedTokenInfo.token && !clearedTokenInfo.isValid);

    } else {
      console.log('   ⚠️  Skipping real API tests - no credentials provided');
      console.log('   To test with real Apple Music API:');
      console.log('   - Set APPLE_MUSIC_TEAM_ID environment variable');
      console.log('   - Set APPLE_MUSIC_KEY_ID environment variable');
      console.log('   - Set APPLE_MUSIC_PRIVATE_KEY environment variable');
    }

    console.log('\n✅ Apple Music client tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Apple Music client test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAppleMusicClient().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
