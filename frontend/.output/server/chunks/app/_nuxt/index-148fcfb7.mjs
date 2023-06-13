import { ref, reactive, withAsyncContext, computed, unref, useSSRContext, toRef, getCurrentInstance, onServerPrefetch } from 'vue';
import { a as useNuxtApp, c as createError } from '../server.mjs';
import { hash } from 'ohash';
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
import 'ofetch';
import 'hookable';
import 'unctx';
import 'h3';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';
import 'ufo';
import 'defu';
import '../../nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'node:http';
import 'node:https';
import 'destr';
import 'unenv/runtime/fetch/index';
import 'scule';
import 'klona';
import 'unstorage';
import 'radix3';
import 'node:fs';
import 'node:url';
import 'pathe';

const getDefault = () => null;
function useAsyncData(...args) {
  var _a, _b, _c, _d, _e;
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  let [key, handler, options = {}] = args;
  if (typeof key !== "string") {
    throw new TypeError("[nuxt] [asyncData] key must be a string.");
  }
  if (typeof handler !== "function") {
    throw new TypeError("[nuxt] [asyncData] handler must be a function.");
  }
  options.server = (_a = options.server) != null ? _a : true;
  options.default = (_b = options.default) != null ? _b : getDefault;
  options.lazy = (_c = options.lazy) != null ? _c : false;
  options.immediate = (_d = options.immediate) != null ? _d : true;
  const nuxt = useNuxtApp();
  const getCachedData = () => nuxt.isHydrating ? nuxt.payload.data[key] : nuxt.static.data[key];
  const hasCachedData = () => getCachedData() !== void 0;
  if (!nuxt._asyncData[key]) {
    nuxt._asyncData[key] = {
      data: ref((_e = getCachedData()) != null ? _e : options.default()),
      pending: ref(!hasCachedData()),
      error: toRef(nuxt.payload._errors, key)
    };
  }
  const asyncData = { ...nuxt._asyncData[key] };
  asyncData.refresh = asyncData.execute = (opts = {}) => {
    if (nuxt._asyncDataPromises[key]) {
      if (opts.dedupe === false) {
        return nuxt._asyncDataPromises[key];
      }
      nuxt._asyncDataPromises[key].cancelled = true;
    }
    if ((opts._initial || nuxt.isHydrating && opts._initial !== false) && hasCachedData()) {
      return getCachedData();
    }
    asyncData.pending.value = true;
    const promise = new Promise(
      (resolve, reject) => {
        try {
          resolve(handler(nuxt));
        } catch (err) {
          reject(err);
        }
      }
    ).then((_result) => {
      if (promise.cancelled) {
        return nuxt._asyncDataPromises[key];
      }
      let result = _result;
      if (options.transform) {
        result = options.transform(_result);
      }
      if (options.pick) {
        result = pick(result, options.pick);
      }
      asyncData.data.value = result;
      asyncData.error.value = null;
    }).catch((error) => {
      if (promise.cancelled) {
        return nuxt._asyncDataPromises[key];
      }
      asyncData.error.value = error;
      asyncData.data.value = unref(options.default());
    }).finally(() => {
      if (promise.cancelled) {
        return;
      }
      asyncData.pending.value = false;
      nuxt.payload.data[key] = asyncData.data.value;
      if (asyncData.error.value) {
        nuxt.payload._errors[key] = createError(asyncData.error.value);
      }
      delete nuxt._asyncDataPromises[key];
    });
    nuxt._asyncDataPromises[key] = promise;
    return nuxt._asyncDataPromises[key];
  };
  const initialFetch = () => asyncData.refresh({ _initial: true });
  const fetchOnServer = options.server !== false && nuxt.payload.serverRendered;
  if (fetchOnServer && options.immediate) {
    const promise = initialFetch();
    if (getCurrentInstance()) {
      onServerPrefetch(() => promise);
    } else {
      nuxt.hook("app:created", () => promise);
    }
  }
  const asyncDataPromise = Promise.resolve(nuxt._asyncDataPromises[key]).then(() => asyncData);
  Object.assign(asyncDataPromise, asyncData);
  return asyncDataPromise;
}
async function refreshNuxtData(keys) {
  {
    return Promise.resolve();
  }
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
function useRequestFetch() {
  var _a;
  const event = (_a = useNuxtApp().ssrContext) == null ? void 0 : _a.event;
  return (event == null ? void 0 : event.$fetch) || globalThis.$fetch;
}
function useFetch(request, arg1, arg2) {
  const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _key = opts.key || hash([autoKey, unref(opts.baseURL), typeof request === "string" ? request : "", unref(opts.params || opts.query)]);
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useFetch] key must be a string: " + _key);
  }
  if (!request) {
    throw new Error("[nuxt] [useFetch] request is missing.");
  }
  const key = _key === autoKey ? "$f" + _key : _key;
  const _request = computed(() => {
    let r = request;
    if (typeof r === "function") {
      r = r();
    }
    return unref(r);
  });
  if (!opts.baseURL && typeof _request.value === "string" && _request.value.startsWith("//")) {
    throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
  }
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    watch,
    immediate,
    ...fetchOptions
  } = opts;
  const _fetchOptions = reactive({
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  });
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    immediate,
    watch: watch === false ? [] : [_fetchOptions, _request, ...watch || []]
  };
  let controller;
  const asyncData = useAsyncData(key, () => {
    var _a;
    (_a = controller == null ? void 0 : controller.abort) == null ? void 0 : _a.call(controller);
    controller = typeof AbortController !== "undefined" ? new AbortController() : {};
    const isLocalFetch = typeof _request.value === "string" && _request.value.startsWith("/");
    let _$fetch = opts.$fetch || globalThis.$fetch;
    if (!opts.$fetch && isLocalFetch) {
      _$fetch = useRequestFetch();
    }
    return _$fetch(_request.value, { signal: controller.signal, ..._fetchOptions });
  }, _asyncDataOptions);
  return asyncData;
}
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const nick = ref("");
    const address = ref("");
    const sorting = reactive({
      nick_up: false,
      nick_down: false,
      addr_up: false,
      addr_down: false,
      age_up: false,
      age_down: false,
      create_up: false,
      create_down: false
    });
    const { data: table } = ([__temp, __restore] = withAsyncContext(() => useFetch("http://localhost:54321/status", "$PslAyef5YX")), __temp = await __temp, __restore(), __temp);
    const table2 = computed(() => {
      let tab = table.value;
      for (let i = 0; i < tab.length; i++) {
        tab[i].addresses = tab[i].addresses.sort((a, b) => {
          const num1 = Number(a.split(".").map((num) => `000${num}`.slice(-3)).join(""));
          const num2 = Number(b.split(".").map((num) => `000${num}`.slice(-3)).join(""));
          return num1 - num2;
        });
      }
      if (sorting.nick_down) {
        return tab.sort((a, b) => {
          let fa = a.nick.toLowerCase();
          let fb = b.nick.toLowerCase();
          return fa.localeCompare(fb, void 0, {
            numeric: true,
            sensitivity: "base"
          });
        });
      }
      if (sorting.nick_up) {
        return tab.sort((a, b) => {
          let fa = a.nick.toLowerCase();
          let fb = b.nick.toLowerCase();
          return fb.localeCompare(fa, void 0, {
            numeric: true,
            sensitivity: "base"
          });
        });
      }
      if (sorting.addr_down) {
        return tab.sort((a, b) => {
          let fa = "";
          for (let i = 0; i < a.addresses.length; i++) {
            fa += a.addresses[i].split(".").map((num) => `000${num}`.slice(-3)).join("");
          }
          let fb = "";
          for (let i = 0; i < b.addresses.length; i++) {
            fb += b.addresses[i].split(".").map((num) => `000${num}`.slice(-3)).join("");
          }
          if (fa < fb) {
            return -1;
          }
          if (fa > fb) {
            return 1;
          }
          return 0;
        });
      }
      if (sorting.addr_up) {
        return tab.sort((a, b) => {
          let fa = "";
          for (let i = 0; i < a.addresses.length; i++) {
            fa += a.addresses[i].split(".").map((num) => `000${num}`.slice(-3)).join("");
          }
          let fb = "";
          for (let i = 0; i < b.addresses.length; i++) {
            fb += b.addresses[i].split(".").map((num) => `000${num}`.slice(-3)).join("");
          }
          if (fa < fb) {
            return 1;
          }
          if (fa > fb) {
            return -1;
          }
          return 0;
        });
      }
      if (sorting.age_down) {
        return tab.sort((a, b) => {
          return b.atime_stamp - a.atime_stamp;
        });
      }
      if (sorting.age_up) {
        return tab.sort((a, b) => {
          return a.atime_stamp - b.atime_stamp;
        });
      }
      if (sorting.create_down) {
        return tab.sort((a, b) => {
          return b.ctime_stamp - a.ctime_stamp;
        });
      }
      if (sorting.create_up) {
        return tab.sort((a, b) => {
          return a.ctime_stamp - b.ctime_stamp;
        });
      }
      return tab;
    });
    const refreshing = ref(false);
    const refreshAll = async () => {
      refreshing.value = true;
      try {
        await refreshNuxtData();
      } finally {
        refreshing.value = false;
      }
    };
    setInterval(refreshAll, 7777);
    function timeview(seconds) {
      var days, hours, minutes;
      days = parseInt(seconds / 24 / 60 / 60);
      seconds %= 24 * 60 * 60;
      hours = parseInt(seconds / 60 / 60);
      seconds %= 60 * 60;
      minutes = parseInt(seconds / 60);
      seconds %= 60;
      var time = "";
      var print_sec = true;
      var print_min = true;
      if (days) {
        time += days + " days";
        print_min = false;
        print_sec = false;
      }
      if (hours) {
        time += " " + hours + " hours";
        print_sec = false;
      }
      if (minutes && print_min) {
        time += " " + minutes + " minutes";
      }
      if (print_sec) {
        time += " " + seconds + " seconds";
      }
      return time;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><div id="refresh"><button${ssrIncludeBooleanAttr(unref(refreshing)) ? " disabled" : ""}>Refetch</button></div><h2>Table of nicks</h2><table><thead><th><a href="#" id="nick_down" class="${ssrRenderClass([unref(sorting), { active: unref(sorting).nick_down }])}"> \u{1F81B} </a><a href="#" id="nick_up" class="${ssrRenderClass([unref(sorting), { active: unref(sorting).nick_up }])}"> \u{1F819} </a><a href="#">Nick </a><input${ssrRenderAttr("value", unref(nick))} type="text" placeholder="filter"></th><th><a href="#" id="addr_down" class="${ssrRenderClass({ active: unref(sorting).addr_down })}"> \u{1F81B} </a><a href="#" id="addr_up" class="${ssrRenderClass({ active: unref(sorting).addr_up })}"> \u{1F819} </a><a href="#">Addreses </a><input${ssrRenderAttr("value", unref(address))} type="text" placeholder="filter"></th><th><a href="#" id="age_down" class="${ssrRenderClass({ active: unref(sorting).age_down })}"> \u{1F81B} </a><a href="#" id="age_up" class="${ssrRenderClass({ active: unref(sorting).age_up })}"> \u{1F819} </a><a href="#">Age</a></th><th><a href="#" id="create_down" class="${ssrRenderClass({ active: unref(sorting).create_down })}"> \u{1F81B} </a><a href="#" id="create_up" class="${ssrRenderClass({ active: unref(sorting).create_up })}"> \u{1F819} </a> Create </th></thead><!--[-->`);
      ssrRenderList(unref(table2), (item) => {
        _push(`<tr><td>${ssrInterpolate(item.nick)}</td><td><ul><!--[-->`);
        ssrRenderList(item.addresses, (address2) => {
          _push(`<li>${ssrInterpolate(address2)}</li>`);
        });
        _push(`<!--]--></ul></td><td><span style="${ssrRenderStyle({ "color": "#777" })}">${ssrInterpolate(item.atime)}</span><br> ${ssrInterpolate(timeview(item.atime_diff))}</td><td><span style="${ssrRenderStyle({ "color": "#777" })}">${ssrInterpolate(item.ctime)}</span><br> ${ssrInterpolate(timeview(item.ctime_diff))}</td></tr>`);
      });
      _push(`<!--]--></table> N: ${ssrInterpolate(unref(nick))} A: ${ssrInterpolate(unref(address))}</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-148fcfb7.mjs.map
