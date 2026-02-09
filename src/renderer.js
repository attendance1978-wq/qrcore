export function renderSVG(qr, cellSize = 10, margin = 4) {
  const size = qr.moduleCount;
  const totalSize = (size + margin * 2) * cellSize;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">`;
  svg += `<rect width="100%" height="100%" fill="white"/>`;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (qr.modules[r][c]) {
        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }

  svg += '</svg>';
  return svg;
}

export function renderANSI(qr) {
  const size = qr.moduleCount;
  let result = '';
  const white = '\x1b[47m  \x1b[0m';
  const black = '\x1b[40m  \x1b[0m';
  
  // Margin
  for (let i = 0; i < 2; i++) {
    result += white.repeat(size + 4) + '\n';
  }

  for (let r = 0; r < size; r++) {
    result += white.repeat(2);
    for (let c = 0; c < size; c++) {
      result += qr.modules[r][c] ? black : white;
    }
    result += white.repeat(2) + '\n';
  }

  for (let i = 0; i < 2; i++) {
    result += white.repeat(size + 4) + '\n';
  }

  return result;
}
