# Tauri and glib advisory decision

The Tauri issue tracker confirms that Tauri's Linux surface can inherit the affected Rust GTK3/glib bindings transitively. The upstream discussion states that GTK3 bindings are archived and that the issue is blocked on upstream dependencies; a GTK4 migration remains an open feature request. Tauri maintainers also state that the affected iterator path is not used by Tauri itself, but this does not make the dependency advisory disappear from automated scanners.

Saddle must therefore treat `GHSA-wrw7-89jp-8q8g` as a documented transitive limitation until the resolved desktop graph proves otherwise. The security workflow should fail on a newly introduced reachable affected version, but its baseline policy may allow this specific existing Linux-only advisory only through a reviewed, time-bounded ignore entry with the exact rationale and upstream tracking links. The release manifest must expose the accepted-risk status instead of labeling the Linux bundle fully clean.

Sources:

1. [Tauri issue #12048: glib-rs advisory](https://github.com/tauri-apps/tauri/issues/12048)
2. [Tauri issue #7335: GTK4 migration](https://github.com/tauri-apps/tauri/issues/7335)
3. [GHSA-wrw7-89jp-8q8g](https://github.com/advisories/GHSA-wrw7-89jp-8q8g)
