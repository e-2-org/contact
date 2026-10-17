# Session: porting Contact to a single-page site - summary

**Dates:** 15–16 October 2026
**Branch:** `spa-port` (from `main`)
**Commits:** `49e10ab`, `73a5666`, `c035772`, `fd70959`

The transcript is in [transcript.md](transcript.md).

Contact (Amy Plant, November 2000) was a frameset site. `index.html` opened a full-screen popup window. The scape (`scape.html`) was a 6000×2500px page of 393 small coloured boxes, scrolled by moving the mouse towards the edges of the screen. The names bar (`names.html`) sat in a frame below it, and every link opened a popup window. This session rebuilt it as one modern page that also works on phones, and modernised the content pages.

## What the site does now

- **`index.html`** links to **`contact.html`**, the old `scapeframe.html`, renamed.
- **Intro:** the text from `sign.html` appears as an overlay over the scape. Clicking anywhere closes it, and the first click also puts the page into full screen. The "?" button reopens it; clicking anywhere then just closes it.
- **Scape, with a mouse:** edge-scrolling as before, but with speed that ramps smoothly. Hovering a box zooms it.
- **Scape, on touch screens:** you scroll by hand. The box nearest the centre of the screen zooms, and boxes around it grow a little depending on how close they are. Tapping a box centres it, and tapping the zoomed box opens it.
- **Zoom animation:** the box's size animates while its text crossfades with a copy laid out at the zoomed size, so the text never re-flows mid-animation.
- **Names bar:** fixed to the bottom of the screen with larger names that wrap onto more rows when needed. Three to a row on phones, with the icons stacked on the right. Icon buttons for About, full screen and Close.
- **Windows:** links open overlay windows sized and placed like the original popups, one per window type as before. They are draggable, close with Escape, have a title bar in the box's colour, scale down to fit small screens, and grow up to 120px taller for pages that don't quite fit.
- **External links:** the 31 boxes that used to frame outside websites now open a link window. It shows the original address, linking to the Internet Archive capture closest to November 2000.
- **Videos:** 11 QuickTime (Sorenson) clips were converted to H.264 MP4 and play in a standard `<video>` player.
- **Content pages:** all 198 window pages were rewritten from table/`<font>` HTML 3/4 to semantic HTML5 with one stylesheet, `css/page.css`. Every page keeps exactly the same text and media.
- **Clean-up:** every file the site no longer used was deleted.

## Main files

| File | Role |
|---|---|
| `contact.html` | The scape: boxes, names bar and intro dialog |
| `css/scape.css` | Styles for the scape, windows, names bar and intro |
| `js/scape.js` | Edge-scrolling, centre focus, zooming, windows, intro and full screen |
| `css/page.css` | Styles for the window pages (replaced `contact.css`) |
| `index.html` | Front page; a CSS grid replaced the tables |

## Known gaps

- **`sacred/images/s34.mov`** is cut off partway through and has lost the data needed to decode it, so it can't be converted. Its page shows a video player that won't play. The file is kept in case a better copy turns up.
- **`alice_counting.mov`** was never in the repo, and its page was an orphan, so the page was deleted.
- **One BBC link** in the original had a typo (`newsid_000000` instead of `newsid_1000000`), so its window links to the corrected address (capture from 12 December 2000).
- **o2.uk.com:** the exact page was never archived, so it links to the site's home page (capture from 10 October 2000).
- **Captures far from November 2000:** Loot (March 2001), Rank (February 2001) and one BBC story (February 1999).
- **Window titles and growth** only work when the site is served over http(s). Opened from disk, windows show the theme name and scroll instead of growing.
- **Testing:** everything was tested in headless Chrome at 1280×800 and 390×780. Nothing was tested on a real phone or in Safari or Firefox.
- **Front page:** the "Requires: Internet Exp. 4 / Netscape 6…" line was left unchanged as part of the work's record.

## Data sources

- **Capture dates:** looked up with the Internet Archive's availability API, then its CDX search API (`closest=20001101`, status 200) for URLs the first API missed. For the internal BBC hostname `news6.thdo.bbc.co.uk`, the public `news.bbc.co.uk` address was also tried.
- **Video conversion:** `ffmpeg -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -an`. None of the source clips have a sound track.
