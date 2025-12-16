export interface DiscoTile {
  x: number;
  y: number;
  z: number;
  rotate: string;
  isBrightZone: boolean;
  delay: number;
}

export function generateDiscoBallTiles() {
  const tiles: DiscoTile[] = [];

  const radius = 50;
  const squareSize = 6.5;
  const prec = 19.55;
  const fuzzy = 0.001;
  const inc = (Math.PI - fuzzy) / prec;

  for (let t = fuzzy; t < Math.PI; t += inc) {
    const z = radius * Math.cos(t);

    const currentRadius = Math.abs(radius * Math.cos(0) * Math.sin(t) - radius * Math.cos(Math.PI) * Math.sin(t)) / 2.5;

    const circumference = Math.abs(2 * Math.PI * currentRadius);
    const squaresThatFit = Math.floor(circumference / squareSize);
    const angleInc = (Math.PI * 2 - fuzzy) / squaresThatFit;

    for (let i = angleInc / 2 + fuzzy; i < Math.PI * 2; i += angleInc) {
      tiles.push({
        x: radius * Math.cos(i) * Math.sin(t),
        y: radius * Math.sin(i) * Math.sin(t),
        z,
        rotate: `rotate(${i}rad) rotateY(${t}rad)`,
        isBrightZone: (t > 1.3 && t < 1.9) || (t < -1.3 && t > -1.9),
        delay: rand(0, 20) / 10,
      });
    }
  }

  return tiles;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
