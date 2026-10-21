# ICS4U

Grade 12 Computer Science. Units, handouts, visualizers, quizzes.

**Study hub:** https://vasiniks.github.io/ICS4U/

## Units

- **Unit 3 — Algorithms & Sorting** (`unit-3-algorithms/` source files, guide at `docs/algorithms/`): BBC *Secret Rules of Modern Living*, bubble (4 variants), selection (in/out of place), insertion, counting (negatives, offset, money), Euclid GCD, fast powers, study guide, assignment details.
- Future units go in `unit-N-name/` folders with the same layout (source files + notes), plus a matching `docs/<unit>/` guide linked from the hub.

## Study site

Same look as the SBI4U guides: hub at `docs/index.html`, one folder per unit (`docs/algorithms/`), shared styles in `docs/assets/style.css`. Deploys via GitHub Pages from `main` → `/docs`.

Run locally:

```bash
python3 -m http.server 8000 --directory docs
# hub:      http://127.0.0.1:8000/
# algorithms: http://127.0.0.1:8000/algorithms/
```
