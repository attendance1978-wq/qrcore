import { createQRCode, renderANSI } from './index.js';

try {
  const qr = createQRCode('Hello World');
  console.log('QR Code generated successfully!');
  let darkCount = 0;
  for (let r = 0; r < qr.moduleCount; r++) {
    for (let c = 0; c < qr.moduleCount; c++) {
      if (qr.modules[r][c]) darkCount++;
    }
  }
  console.log('Dark modules:', darkCount, '/', qr.moduleCount * qr.moduleCount);
  console.log(renderANSI(qr));
} catch (err) {
  console.error('Error generating QR Code:', err);
}
