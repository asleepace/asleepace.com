import { h as http } from '../../../chunks/http_KD2o5bDQ.mjs';
import { e as endpoint, E as Exception } from '../../../chunks/index_DAnW_ggU.mjs';
export { renderers } from '../../../renderers.mjs';

const ALLOWED_GLOBALS = [
  "console",
  "setTimeout",
  "fetch",
  "Array",
  "Object",
  "JSON",
  "Math"
];
function createSafeContext(allowedGlobals) {
  const ctx = /* @__PURE__ */ Object.create(null);
  Object.entries(ctx).forEach(([key, value]) => {
    ctx[key] = value;
  });
  Object.values(allowedGlobals).forEach((item) => {
    ctx[item] = globalThis[item];
  });
  return new Proxy(ctx, {
    has() {
      return false;
    },
    get(target, prop) {
      if (prop in target || allowedGlobals.includes(prop)) {
        return target[prop];
      } else {
        throw new Error(
          `[safeEval] access to global '${String(prop)}' is not allowed.`
        );
      }
    }
  });
}
async function safeEval(code, context = {}) {
  try {
    const safeEvalFunc = new Function(
      ...Object.keys(context),
      `"use strict"; return ${code};`
    );
    const ctx = createSafeContext(ALLOWED_GLOBALS);
    let output = safeEvalFunc.call(ctx, ...Object.values(context));
    console.log("[api/sehll/exec] output:", output);
    if (output instanceof Function) {
      output = output.call(ctx);
    }
    console.log("[api/shell/exec] safeEvalResult:", output);
    if (output instanceof Promise) {
      return await output;
    } else {
      return output;
    }
  } catch (e) {
    return e;
  }
}

const prerender = false;
const GET = endpoint(async ({ request }) => {
  const { searchParams } = await http.parse(request);
  const { uri } = searchParams;
  Exception.assert(uri, 400, "Missing URI parameter");
  const proxy = http.host("api/proxy", {
    uri
  });
  const source = await fetch(proxy).then(async (res) => ({
    code: await res.text(),
    status: res.status,
    headers: Object.fromEntries(res.headers)
  })).catch((er) => er);
  const isSourceValid = source instanceof Error === false;
  Exception.assert(isSourceValid, 500, "Failed to fetch remote code");
  const output = await safeEval(source.code, {
    ...searchParams
    // exec args
  });
  return output instanceof Error ? http.failure(500, output.message) : http.success({ output, source: uri });
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
