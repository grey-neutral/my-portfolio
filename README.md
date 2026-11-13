# Janet B. — Portfolio

A static HTML portfolio hosted on [GitHub Pages](https://grey-neutral.github.io/my-portfolio/).
There is no framework, package installation or build step.

## Editing

- **Content, project links and order:** edit `index.html`. Each featured project is a clearly marked `<article class="project-card">`. Copy one complete article to add a project, then give its `id`, heading ID and `aria-labelledby` unique values.
- **Project pictures:** put WebP, JPG or PNG files in `images/projects/`, then update the image `src`, `alt`, `width` and `height` in the HTML. Keep descriptions outside the image. Use actual app captures or product photos; never include real patient data, passwords or private source code.
- **Colours, fonts and spacing:** edit the variables at the top of `css/style.css`. The original Bosch serif font and ocean artwork are retained.
- **Browser cache after publishing:** bump the `?v=...` value on the CSS/JavaScript links in `index.html` when changing these files, so returning visitors receive the new styles and navigation code together.
- **Navigation:** the links are ordinary HTML anchors. Keep `intro`, `portfolio`, `writing` and `contact` as the section IDs. CSS accounts for the fixed header. `js/main.js` only updates the active navigation item; all links and content work without it.
- **Research and writing:** all original publication, presentation, blog and book entries remain in `index.html`.

Preview from this folder with `python3 -m http.server 8765`, then open `http://localhost:8765`.
To publish, commit changes to the branch configured as the GitHub Pages source (currently `main`).

## Project imagery

All images are stored locally, with no third-party embeds or tracking. The image plates use real screenshots or a still from the project's public video:

| File | Source / context |
| --- | --- |
| `finmedio.webp` | Existing Finmedio prototype screenshot; displayed names and values were checked against the app's mock data. Labelled as a prototype with demo data. The live project requires an invitation. |
| `jaw-atlas.webp` | Capture of [Jaw Atlas](https://jaw-atlas.vercel.app/), anatomy study environment. |
| `kettlecoach-plan.webp`, `kettlecoach-anatomy.webp` | Still frames from the product-tour recordings in [KettleCoach](https://github.com/grey-neutral/kettlebell-coach/tree/main/docs/gifs). |
| `powerpoint-clicker.webp` | Thumbnail from the author's [public demo on X](https://x.com/dentist_dev/status/2115078534586646802). The project links to this post; its private source repository is not exposed. |
| `anaesthesia.webp` | Capture of the [educational Streamlit prototype](https://anaesthesia.streamlit.app/). |
| `travel-planner.webp` | Capture of the [Visual Travel Planner prototype](https://visual-travel-planner.streamlit.app/). |

KettleCoach's anatomy model derives from BodyParts3D (Database Center for Life Science, CC BY-SA 2.1 Japan); see the project's [third-party attribution](https://github.com/grey-neutral/kettlebell-coach/blob/main/THIRD_PARTY_LICENSES.md) for model details. The screenshot shows that model inside the app and is resized without changing its content.

The six visual projects are followed by four compact entries: OpenCare, AI Research Article Parser, Matcha Atelier and the stealth project. These have no fabricated product views. All ten projects remain visible without a carousel, filter or JavaScript.

The original PNG artwork and unused GSAP vendor files remain in the repository for reference; the page loads the compressed `images/ocean.webp` and the small native JavaScript file only.

