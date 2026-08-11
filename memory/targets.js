/**
 * storage targets describe provider intent without importing a provider client.
 */
const types = new Set(["github", "gitlab", "forgejo", "gitea", "huggingface", "kaggle", "modelscope", "filehosting"]);

export function targetfactory(type, options = {}) {
  if (!types.has(type)) throw new TypeError(`unknown memory target: ${type}`);
  if (type === "github" || type === "gitlab" || type === "forgejo" || type === "gitea") return { type, platform: type, owner: options.owner, repo: options.repo, branch: options.branch ?? "main", path: options.path, token: options.token };
  if (type === "huggingface") return { type, space: options.space, revision: options.revision ?? "main", path: options.path, token: options.token };
  if (type === "kaggle") return { type, dataset: options.dataset, sslverification: options.sslverification ?? true, path: options.path, token: options.token };
  if (type === "modelscope") return { type, namespace: options.namespace, repo: options.repo, revision: options.revision ?? "master", path: options.path, token: options.token };
  return { type, host: options.host, path: options.path, method: options.method ?? "s3compatible", token: options.token };
}

export function targeturi(target) {
  if (target.type === "github" || target.type === "gitlab" || target.type === "forgejo" || target.type === "gitea") return `${target.type}://${target.owner}/${target.repo}/${target.path}`;
  if (target.type === "huggingface") return `hf://${target.space}/${target.path}`;
  if (target.type === "kaggle") return `kaggle://${target.dataset}/${target.path}`;
  if (target.type === "modelscope") return `modelscope://${target.namespace}/${target.repo}/${target.path}`;
  return `${target.method}://${target.host}/${target.path}`;
}
