const GRID = 12;

// Each icon is 12 rows of 12 chars. '.' = transparent, any other char = fill colour.
const ICONS = {
  rocket: [
    '....XX......',
    '....XX......',
    '...XXXX.....',
    '...X--X.....',
    '...X--X.....',
    '..XX--XX....',
    '..X----X....',
    '..X----X....',
    '..XX--XX....',
    '.XXX..XXX...',
    '...X..X.....',
    '..XX..XX....',
  ].map((r) => r.padEnd(GRID, '.').slice(0, GRID)),
  star: [
    '............',
    '.....X......',
    '.....X......',
    '....XXX.....',
    '...XXXXX....',
    '..XXXXXXX...',
    '.XXXXXXXXX..',
    '..XXXXXXX...',
    '...X...X....',
    '..XX...XX...',
    '............',
    '............',
  ],
  crew: [
    '............',
    '....XXXX....',
    '....X--X....',
    '....XXXX....',
    '...XXXXXX...',
    '..XXXXXXXX..',
    '..XX----XX..',
    '..XX----XX..',
    '..XXXXXXXX..',
    '...XX..XX...',
    '...XX..XX...',
    '............',
  ],
  bolt: [
    '........XX..',
    '.......XX...',
    '......XX....',
    '.....XX.....',
    '....XXXXXX..',
    '...XXXXXX...',
    '......XX....',
    '.....XX.....',
    '....XX......',
    '...XX.......',
    '............',
    '............',
  ],
  oxygen: [
    '............',
    '....XXXX....',
    '...X----X...',
    '..X------X..',
    '..X-XX---X..',
    '..X------X..',
    '..X------X..',
    '..X------X..',
    '...X----X...',
    '....XXXX....',
    '............',
    '............',
  ],
  water: [
    '.....X......',
    '....XXX.....',
    '....X-X.....',
    '...X---X....',
    '...X---X....',
    '..X-----X...',
    '..X--X--X...',
    '..X-----X...',
    '...X---X....',
    '....XXX.....',
    '............',
    '............',
  ],
  mars: [
    '............',
    '....XXXX....',
    '...XXXXXX...',
    '..XXX-XXXX..',
    '..XXXXX-XX..',
    '.XXXX-XXXXX.',
    '.XXXXXX-XXX.',
    '..XXX-XXXX..',
    '..XXXXXXXX..',
    '...XXXXXX...',
    '....XXXX....',
    '............',
  ],
};

export default function PixelIcon({ name, color = 'currentColor', secondary = 'transparent', size = 16, className }) {
  const grid = ICONS[name];
  if (!grid) return null;
  const cell = size / GRID;

  const rects = [];
  grid.forEach((row, y) => {
    row.split('').forEach((char, x) => {
      if (char === '.') return;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x * cell}
          y={y * cell}
          width={cell}
          height={cell}
          fill={char === '-' ? secondary : color}
        />
      );
    });
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}
