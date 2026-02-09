/**
 * Galois Field GF(2^8) operations for Reed-Solomon error correction
 */
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);

// Initialize tables
for (let i = 0, x = 1; i < 256; i++) {
  EXP_TABLE[i] = x;
  LOG_TABLE[x] = i;
  x <<= 1;
  if (x & 0x100) {
    x ^= 0x11d;
  }
}

function glog(n) {
  if (n < 1) throw new Error('log(' + n + ')');
  return LOG_TABLE[n];
}

function gexp(n) {
  while (n < 0) n += 255;
  while (n >= 255) n -= 255;
  return EXP_TABLE[n];
}

/**
 * Multiplies two numbers in GF(2^8)
 */
function multiply(a, b) {
  if (a === 0 || b === 0) return 0;
  return gexp(glog(a) + glog(b));
}

/**
 * Reed-Solomon Error Correction Generator
 */
export class ReedSolomon {
  static getGeneratorPolynomial(errorCorrectionLength) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < errorCorrectionLength; i++) {
      poly = ReedSolomon.multiplyPolynomials(poly, new Uint8Array([1, gexp(i)]));
    }
    return poly;
  }

  static multiplyPolynomials(p1, p2) {
    const result = new Uint8Array(p1.length + p2.length - 1);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        result[i + j] ^= multiply(p1[i], p2[j]);
      }
    }
    return result;
  }

  static encode(data, errorCorrectionLength) {
    const genPoly = ReedSolomon.getGeneratorPolynomial(errorCorrectionLength);
    const paddedData = new Uint8Array(data.length + errorCorrectionLength);
    paddedData.set(data);

    for (let i = 0; i < data.length; i++) {
      const factor = paddedData[i];
      if (factor !== 0) {
        for (let j = 0; j < genPoly.length; j++) {
          paddedData[i + j] ^= multiply(genPoly[j], factor);
        }
      }
    }

    return paddedData.slice(data.length);
  }
}
