export const Mode = {
  NUMBER: 1 << 0,
  ALPHA_NUM: 1 << 1,
  BYTE: 1 << 2,
  KANJI: 1 << 3,
};

export const ErrorCorrectionLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};

export const MaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,
};

// Simplified version capacity and EC block info
// Format: [Total Codewords, EC Codewords, Blocks]
export const QR_TABLE = {
  1: {
    [ErrorCorrectionLevel.L]: [26, 7, 1],
    [ErrorCorrectionLevel.M]: [26, 10, 1],
    [ErrorCorrectionLevel.Q]: [26, 13, 1],
    [ErrorCorrectionLevel.H]: [26, 17, 1],
  },
  2: {
    [ErrorCorrectionLevel.L]: [44, 10, 1],
    [ErrorCorrectionLevel.M]: [44, 16, 1],
    [ErrorCorrectionLevel.Q]: [44, 22, 1],
    [ErrorCorrectionLevel.H]: [44, 28, 1],
  },
  // Adding more versions as needed or implementing a way to look them up.
  // For this "from scratch" demo, I'll provide a subset or a more complete table for common use.
};

// Alignment patterns for versions 1-7
export const ALIGNMENT_PATTERN_TABLE = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
];
