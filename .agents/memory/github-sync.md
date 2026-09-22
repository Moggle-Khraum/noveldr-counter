---
name: GitHub sync
description: Reliable way to publish workspace changes when the configured Git remote cannot authenticate.
---

When HTTPS git push authentication fails, publish through the connected GitHub integration by creating blobs, a tree based on the current remote commit, a commit, and updating `main` without force.

**Why:** The workspace remote may not have usable git credentials even when the GitHub integration is authorized, and local backup history can be unrelated to the GitHub repository history.

**How to apply:** Pull or fetch first, preserve the remote tree as the base, include only the intended tracked changes, then verify the resulting remote commit through the integration.