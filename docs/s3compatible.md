# S3-compatible storage listing

The `s3compatible` adapter accepts a caller-owned signer and now implements the S3 ListObjectsV2 contract in addition to put, get, head and delete. `list(prefix, options)` sends the `list-type=2` query, preserves the caller's prefix, follows continuation tokens and stops at a bounded page count.

```ts
const objects = await storage.list("runs/", {
  maxkeys: 1000,
  maxpages: 20,
});
```

Each returned object follows the storage adapter shape with `key`, `sizebytes`, `sha256` from the provider ETag when present, content type, creation time and provider metadata. XML entities are decoded before keys are returned. The adapter rejects a non-advancing continuation token and never creates credentials or chooses an endpoint on behalf of the caller.
