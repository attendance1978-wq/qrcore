import { ReedSolomon } from './reedSolomon.js';
import { BitBuffer } from './BitBuffer.js';
import { Mode, ErrorCorrectionLevel, QR_TABLE, ALIGNMENT_PATTERN_TABLE } from './constants.js';

/**
 * QRByteData handles UTF-8 strings for Byte mode
 */
export class QRByteData {
  constructor(data) {
    this.mode = Mode.BYTE;
    this.data = new TextEncoder().encode(data);
    this.length = this.data.length;
  }

  write(buffer) {
    for (let i = 0; i < this.data.length; i++) {
      buffer.put(this.data[i], 8);
    }
  }
}

/**
 * Core QRCode engine
 */
export class QRCode {
  constructor(typeNumber, errorCorrectionLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectionLevel = errorCorrectionLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
  }

  addData(data) {
    this.dataCache = new QRByteData(data);
  }

  make() {
    this.makeImpl(false, this.getBestMaskPattern());
  }

  makeImpl(test, maskPattern) {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = Array.from({ length: this.moduleCount }, () => new Array(this.moduleCount).fill(null));

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);

    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }

    const data = QRCode.createData(this.typeNumber, this.errorCorrectionLevel, this.dataCache);
    this.mapData(data, maskPattern);
  }

  setupPositionProbePattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        const isDark = (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
                       (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
                       (2 <= r && r <= 4 && 2 <= c && c <= 4);
        this.modules[row + r][col + c] = isDark;
      }
    }
  }

  setupTimingPattern() {
    for (let i = 8; i < this.moduleCount - 8; i++) {
      if (this.modules[i][6] === null) this.modules[i][6] = (i % 2 === 0);
      if (this.modules[6][i] === null) this.modules[6][i] = (i % 2 === 0);
    }
  }

  setupPositionAdjustPattern() {
    const pos = ALIGNMENT_PATTERN_TABLE[this.typeNumber - 1] || [];
    for (const row of pos) {
      for (const col of pos) {
        if (this.modules[row][col] !== null) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            this.modules[row + r][col + c] = (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0));
          }
        }
      }
    }
  }

  setupTypeInfo(test, maskPattern) {
    const data = (this.errorCorrectionLevel << 3) | maskPattern;
    const bits = QRCode.getBCHTypeInfo(data);

    for (let i = 0; i < 15; i++) {
      const mod = (!test && ((bits >> i) & 1) === 1);
      if (i < 6) this.modules[i][8] = mod;
      else if (i < 8) this.modules[i + 1][8] = mod;
      else this.modules[this.moduleCount - 15 + i][8] = mod;

      if (i < 8) this.modules[8][this.moduleCount - i - 1] = mod;
      else if (i < 9) this.modules[8][15 - i - 1 + 1] = mod;
      else this.modules[8][15 - i - 1] = mod;
    }
    this.modules[this.moduleCount - 8][8] = !test;
  }

  static getBCHTypeInfo(data) {
    let d = data << 10;
    while (QRCode.getBCHDigit(d) >= QRCode.getBCHDigit(0x537)) {
      d ^= (0x537 << (QRCode.getBCHDigit(d) - QRCode.getBCHDigit(0x537)));
    }
    return ((data << 10) | d) ^ 0x5412;
  }

  static getBCHDigit(data) {
    let digit = 0;
    while (data !== 0) {
      digit++;
      data >>>= 1;
    }
    return digit;
  }

  getBestMaskPattern() {
    return 0; // Fixed for now
  }

  mapData(data, maskPattern) {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;

    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          const currentCol = col - c;
          if (this.modules[row][currentCol] === null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
            }
            if (QRCode.getMask(maskPattern, row, currentCol)) {
              dark = !dark;
            }
            this.modules[row][currentCol] = dark;
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  static getMask(maskPattern, i, j) {
    switch (maskPattern) {
      case 0: return (i + j) % 2 === 0;
      case 1: return i % 2 === 0;
      case 2: return j % 3 === 0;
      case 3: return (i + j) % 3 === 0;
      case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case 5: return (i * j) % 2 + (i * j) % 3 === 0;
      case 6: return ((i * j) % 2 + (i * j) % 3) % 2 === 0;
      case 7: return ((i * j) % 3 + (i + j) % 2) % 2 === 0;
      default: throw new Error('Invalid mask pattern: ' + maskPattern);
    }
  }

  static createData(typeNumber, errorCorrectionLevel, dataCache) {
    const rsBlocks = QR_TABLE[typeNumber][errorCorrectionLevel];
    const buffer = new BitBuffer();

    buffer.put(dataCache.mode, 4);
    buffer.put(dataCache.length, QRCode.getLengthInBits(dataCache.mode, typeNumber));
    dataCache.write(buffer);

    const totalDataCount = rsBlocks[0] - rsBlocks[1];
    if (buffer.length > totalDataCount * 8) {
      throw new Error(`Data too long for version ${typeNumber}`);
    }

    if (buffer.length + 4 <= totalDataCount * 8) buffer.put(0, 4);
    while (buffer.length % 8 !== 0) buffer.putBit(false);

    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (buffer.length < totalDataCount * 8) {
      buffer.put(padBytes[padIdx], 8);
      padIdx = (padIdx + 1) % 2;
    }

    return QRCode.createBytes(buffer, rsBlocks);
  }

  static getLengthInBits(mode, type) {
    if (1 <= type && type < 10) {
      return mode === Mode.BYTE ? 8 : 10; // Simplified for demo
    }
    return 16;
  }

  static createBytes(buffer, rsBlocks) {
    const [totalCodewords, ecCodewordsPerBlock, numBlocks] = rsBlocks;
    const dataCodewordsPerBlock = (totalCodewords / numBlocks) - ecCodewordsPerBlock;

    const dataBytes = new Uint8Array(dataCodewordsPerBlock);
    for (let i = 0; i < dataCodewordsPerBlock; i++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        if (buffer.get(i * 8 + bit)) byte |= (0x80 >>> bit);
      }
      dataBytes[i] = byte;
    }

    const ecBytes = ReedSolomon.encode(dataBytes, ecCodewordsPerBlock);
    const result = new Uint8Array(totalCodewords);
    result.set(dataBytes);
    result.set(ecBytes, dataCodewordsPerBlock);

    return result;
  }
}
