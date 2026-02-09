# qrcore

A lightweight, zero-dependency QR Code generation library written in pure JavaScript.

## Features
- **Pure JavaScript**: No external dependencies.
- **Reed-Solomon**: Robust error correction.
- **Multiple Renderers**: SVG for web and ANSI for terminal.
- **UTF-8 Support**: Encode any string data.

## Installation
```bash
npm install
```

## Usage

### Terminal (ANSI)
```javascript
import { createQRCode, renderANSI } from './index.js';

const qr = createQRCode('Hello World');
console.log(renderANSI(qr));
```

### Web (SVG)
```javascript
import { createQRCode, renderSVG } from './index.js';

const qr = createQRCode('https://github.com/attendance1978-wq/qrcore');
const svg = renderSVG(qr);
// Insert svg into your HTML
```

## API

### `createQRCode(data, options)`
- `data`: String to encode.
- `options`:
    - `typeNumber`: QR version (1-40). Default: 2.
    - `errorCorrectionLevel`: L, M, Q, H. Default: L.

## Support
For support and updates, visit: [https://github.com/attendance1978-wq/qrcore/issues](https://github.com/attendance1978-wq/qrcore/issues)

## License
ISC
