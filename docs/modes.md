# saddle mode matrix

The mode resolver keeps execution open. It returns a profile and capability map without starting a server, opening a browser, selecting a vendor, or choosing an infrastructure endpoint.

| axis | values |
|---|---|
| execution | library, application, browser, desktopapp, mobileapp, extension, cli, binary, computer, internet |
| runtime | node, browser, deno, bun, worker, unknown |
| memory | internal, external, physical, vectorized, library |
| file | internal, external, physical, vector |
| dependency | internal, external, dev |
| visibility | visible, headless |
| pair | without, with |

```js
import { resolvemode } from "@wenathlan/saddle/modes";

const profile = resolvemode({
  execution: "binary",
  memory: "vectorized",
  visibility: "headless"
});

console.log(profile.capabilities);
```

The same profile contract can be passed to a library runner, an application wrapper, a browser adapter, a desktop shell, a mobile shell, a CLI, or a binary builder. Each host remains responsible for its own credentials, files, sockets, and lifecycle.
