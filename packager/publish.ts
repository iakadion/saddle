/**
 * publish plans describe registry targets without executing a publish or requiring credentials.
 */
export function publishplan(manifest, options = {}) {
  const version = manifest.version;
  const packageName = manifest.name;
  return {
    package: { registry: options.npm ?? "npm", name: packageName, version, command: "npm publish --access public" },
    github: { repository: options.repository ?? "", packages: true, command: "git push --follow-tags" },
    container: { registry: options.ghcr ?? "ghcr.io", image: options.image ?? packageName, version, command: "docker push" },
    maven: { registry: options.maven ?? "github-packages", name: packageName, version, command: "mvn deploy" },
    nuget: { registry: options.nuget ?? "github-packages", name: packageName, version, command: "dotnet nuget push" },
    rubygems: { registry: options.rubygems ?? "rubygems", name: packageName, version, command: "gem push" },
    cdn: [{ name: "jsdelivr", url: `https://cdn.jsdelivr.net/npm/${packageName}@${version}/index.js` }, { name: "unpkg", url: `https://unpkg.com/${packageName}@${version}/index.js` }, { name: "esm", url: `https://esm.sh/${packageName}@${version}` }]
  };
}

export function registrymanifest(manifest, options = {}) { return { name: manifest.name, version: manifest.version, surfaces: ["library", "application", "computer", "desktop", "mobile", "browser", "cli", "binary", "web", "extension", "container", ...(options.surfaces ?? [])], registries: ["npm", "github", "ghcr", "maven", "nuget", "rubygems", "jsdelivr", "unpkg", "esm.sh"] }; }
