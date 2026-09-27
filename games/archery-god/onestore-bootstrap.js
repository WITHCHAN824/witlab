import { createOnestoreHost } from './onestore-host.js';

const sdkUrl = 'https://h5sdk.onestore.net/lib/v1.1.0/onestore-h5-sdk.min.js';
const gameEntry = './assets/index-BxM5JEKh.js';
const message = document.createElement('div');
message.id = 'onestore-connection-error';
message.setAttribute('role', 'alert');
message.style.cssText = 'position:fixed;inset:0;z-index:100;background:#071827;color:#fff;display:none;place-content:center;text-align:center;padding:32px;font:16px/1.7 sans-serif';
message.innerHTML = '<strong style="font-size:24px">양궁의 신</strong><p>원스토어 연결에 실패했어요.<br>앱에서 다시 실행해 주세요.</p>';
document.body.append(message);

let sdk;
try {
  const { createSDK } = await import(/* @vite-ignore */ sdkUrl);
  sdk = createSDK();
} catch (error) {
  console.error('ONE Store SDK load failed', error);
  if (window.parent !== window) message.style.display = 'grid';
}

if (sdk || window.parent === window) {
  const host = createOnestoreHost(sdk);
  window.__archeryHost = host;
  try {
    const supported = await host.initialize();
    if (!supported && window.parent !== window) message.style.display = 'grid';
    else await import(/* @vite-ignore */ gameEntry);
  } catch (error) {
    console.error('ONE Store initializeAsync failed', error.reason, error.message);
    message.style.display = 'grid';
  }
}
