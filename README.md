# Contact

## by Amy Plant (November 2000)

Focusing on the public artworks and their audiences that comprised the North London Link, ‘Contact’ contextualises art works by:

Anna Best; Adam Chodzko; Christine and Irene Hohenbüchler; Anthony O’Flaherty, Esther Sayers and Claudia Kappenberg; Felix Gonzalez-Torres; Orla Barry; Maurice O’Connell

**technical collaborator:** Peter Edwards
**additional programming:** Karen Martin

**Commissioned by:** [Camden Arts Centre](http://www.camdenartscentre.org/)
**Produced by:** [e-2](http://www.e-2.org/)

## Redevelopment October 2026

Contact was originally a frameset site that opened in a full-screen popup window, needed Internet Explorer 4 or Netscape 6 with the QuickTime and Flash plugins, and opened every voice in its own popup. It has been rebuilt as a single page that works in current browsers and on phones, keeping the original text and media:

- **The scape** is one page, with the names bar fixed to the bottom of the screen and the introduction shown as an overlay that also puts the page into full screen.
- **With a mouse** the scape still scrolls when the pointer nears an edge, and boxes zoom on hover. **On touch screens** it is scrolled by hand, and the box nearest the centre of the screen zooms.
- **Popups** are now draggable overlay windows, sized and placed like the originals.
- **Videos** were converted from QuickTime to MP4. One clip (`media/sacred/s34.mov`) is damaged and can't be converted.
- **Links to outside websites** now open the Internet Archive's copy from as close to November 2000 as possible.
- **The content** is now data rather than separate HTML pages, and the site is built with Jekyll for GitHub Pages:
  - `_data/boxes.json`, `_data/themes.json` and `_data/names.json` hold the boxes, theme headings and names bar.
  - `_data/windows.json` holds the content of every window, which `js/scape.js` loads from `windows.json`.
  - All images and videos are in `media/`, in one folder per theme.

To run it locally, use `bundle install` and then `bundle exec jekyll serve`. Opening the HTML files directly from disk won't work.
