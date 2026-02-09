import { QRCode } from './src/core.js';
import { ErrorCorrectionLevel } from './src/constants.js';
import { renderSVG, renderANSI } from './src/renderer.js';

export { QRCode, ErrorCorrectionLevel, renderSVG, renderANSI };

export function createQRCode(data, options = {}) {
  const typeNumber = options.typeNumber || 2;
  const errorCorrectionLevel = options.errorCorrectionLevel || ErrorCorrectionLevel.L;
  
  const qr = new QRCode(typeNumber, errorCorrectionLevel);
  qr.addData(data);
  qr.make();
  return qr;
}
