import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMediaUrlsFromHtml, extractWavyUrlsFromPayload } from '../api/download.mjs';

test('extracts mp4 URLs from embedded JSON and video tags', () => {
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
          {"video":{"contentUrl":"https://cdn.example.com/clip-1.mp4"}}
        </script>
        <script>
          window.__additionalData = {"node":{"is_video":true,"video_url":"https://cdn.example.com/clip-2.mp4"}};
        </script>
      </head>
      <body>
        <video src="https://cdn.example.com/clip-3.mp4"></video>
      </body>
    </html>
  `;

  const urls = extractMediaUrlsFromHtml(html);
  assert.deepEqual(urls, [
    'https://cdn.example.com/clip-1.mp4',
    'https://cdn.example.com/clip-2.mp4',
    'https://cdn.example.com/clip-3.mp4'
  ]);
});

test('parses Wavy payloads even when the upstream reports an error', () => {
  const payload = {
    success: false,
    error: 'Gagal mengekstrak data dari Instagram',
    result: {
      title: 'Reel sample',
      author: 'UserName',
      url: ['https://cdn.example.com/reel.mp4']
    }
  };

  assert.deepEqual(extractWavyUrlsFromPayload(payload), {
    urls: ['https://cdn.example.com/reel.mp4'],
    title: 'UserName - Reel sample',
    method: 'Wavy API'
  });
});
