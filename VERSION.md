# Darcnia Campaign – Version Notes

Manual version stamping has been removed. The campaign UI now surfaces the last modified time of the built files (via `document.lastModified`), so there is no single place where a version string must be updated.

## Release Checklist

1. Finish your code changes and ensure `bundle exec jekyll serve` (run from the root directory) behaves as expected, or at least spot-check the static `app/` pages directly.
2. Commit with a descriptive message; Git history now serves as the source of truth for release identifiers.
3. Deploy/publish. The footer will show “Updated &lt;timestamp&gt;” which reflects the timestamp of the deployed files.

> If a semantic version is still desired later, introduce it through the Jekyll config (e.g., `_config.yml`) or an environment variable at build time instead of sprinkling manual updates across files.

