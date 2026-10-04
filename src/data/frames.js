const defaultImages = import.meta.glob('../assets/frames/day*-default.png', {
  eager: true,
  import: 'default',
})
const hoverImages = import.meta.glob('../assets/frames/day*-hover.png', {
  eager: true,
  import: 'default',
})
const giftImages = import.meta.glob('../assets/gifts/day*.{png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default',
})
const giftCodes = import.meta.glob('../assets/gifts/day*-code.{png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default',
})

const GIFT_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg']

function imageFor(map, day) {
  const key = Object.keys(map).find((path) => path.includes(`day${String(day).padStart(2, '0')}-`))
  return map[key]
}

function giftImageFor(day) {
  const padded = String(day).padStart(2, '0')
  const key = Object.keys(giftImages).find((path) =>
    GIFT_EXTENSIONS.some((ext) => path.endsWith(`day${padded}.${ext}`))
  )
  return key ? giftImages[key] : null
}

function giftCodeFor(day) {
  const key = Object.keys(giftCodes).find((path) => path.includes(`day${String(day).padStart(2, '0')}-code.`))
  return key ? giftCodes[key] : null
}

export const CALENDAR_YEAR = new Date().getFullYear()

// One gift/surprise per December day, revealed when its frame is opened.
const GIFTS = [
  'Peppermint Mocha on Me',
  'A Playlist Made Just for You',
  'A Jellycat Surprise',
  'Spa Date on Me',
  'Movie Night — You Pick',
  'A Cozy Night In',
  'A Little Flower Surprise',
  'Game Night — Your Choice',
  'Breakfast on Me',
  'A Little Gift of Your Choice',
  'Let’s Make a Memory',
  'A Bookshop Treat',
  'Something Cozy for You',
  'Christmas Market Date',
  'Let’s Bake Something Together',
  'Winner Picks the Prize',
  'Make a Wish',
  'Pottery Class Date',
  'Three Things I Love About You',
  'A Cozy Winter Walk',
  '€50 Treat — Your Choice',
  'Ugly Sweater Day',
  'One Big Hug — Anytime',
  'Here come the big christmas gifts!',
]

export const frames = Array.from({ length: 24 }, (_, i) => {
  const day = i + 1
  return {
    day,
    defaultImage: imageFor(defaultImages, day),
    hoverImage: imageFor(hoverImages, day),
    giftImage: giftImageFor(day),
    giftCode: giftCodeFor(day),
    unlockDate: new Date(CALENDAR_YEAR, 11, day),
    message: GIFTS[i],
  }
})
