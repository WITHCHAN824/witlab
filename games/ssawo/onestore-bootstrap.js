import { createOnestoreHost } from './onestore-host.js';

const sdkUrl = 'https://h5sdk.onestore.net/lib/v1.1.0/onestore-h5-sdk.min.js';
const gameEntry = './assets/index-BK6NnK3-.js';
const errorPanel = document.createElement('div');
errorPanel.id = 'onestore-connection-error';
errorPanel.setAttribute('role', 'alert');
errorPanel.style.cssText = 'position:fixed;inset:0;z-index:100;background:#101915;color:#fff;display:none;place-content:center;text-align:center;padding:32px;font:16px/1.7 sans-serif';
errorPanel.innerHTML = '<strong style="font-size:24px">싸워</strong><p>원스토어 연결에 실패했어요.<br>앱에서 다시 실행해 주세요.</p>';
document.body.append(errorPanel);

let sdk;
try {
  const { createSDK } = await import(/* @vite-ignore */ sdkUrl);
  sdk = createSDK();
} catch (error) {
  console.error('ONE Store SDK load failed', error);
  if (window.parent !== window) errorPanel.style.display = 'grid';
}

if (sdk || window.parent === window) {
  const host = createOnestoreHost(sdk);
  window.__ssawoHost = host;
  try {
    const supported = await host.initialize();
    if (!supported && window.parent !== window) errorPanel.style.display = 'grid';
    else {
      host.progress(20);
      await import(/* @vite-ignore */ gameEntry);
      host.progress(80);
      await window.__ssawoReady;
      await host.start();
    }
  } catch (error) {
    console.error('ONE Store game initialization failed', error);
    errorPanel.style.display = 'grid';
  }
}
