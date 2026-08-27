/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$4 = globalThis, e$4 = t$4.ShadowRoot && (void 0 === t$4.ShadyCSS || t$4.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s$2 = Symbol(), o$5 = /* @__PURE__ */ new WeakMap();
let n$4 = class n {
  constructor(t2, e2, o2) {
    if (this._$cssResult$ = true, o2 !== s$2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e2;
  }
  get styleSheet() {
    let t2 = this.o;
    const s2 = this.t;
    if (e$4 && void 0 === t2) {
      const e2 = void 0 !== s2 && 1 === s2.length;
      e2 && (t2 = o$5.get(s2)), void 0 === t2 && ((this.o = t2 = new CSSStyleSheet()).replaceSync(this.cssText), e2 && o$5.set(s2, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
};
const r$4 = (t2) => new n$4("string" == typeof t2 ? t2 : t2 + "", void 0, s$2), i$5 = (t2, ...e2) => {
  const o2 = 1 === t2.length ? t2[0] : e2.reduce((e3, s2, o3) => e3 + ((t3) => {
    if (true === t3._$cssResult$) return t3.cssText;
    if ("number" == typeof t3) return t3;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t3 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s2) + t2[o3 + 1], t2[0]);
  return new n$4(o2, t2, s$2);
}, S$1 = (s2, o2) => {
  if (e$4) s2.adoptedStyleSheets = o2.map((t2) => t2 instanceof CSSStyleSheet ? t2 : t2.styleSheet);
  else for (const e2 of o2) {
    const o3 = document.createElement("style"), n3 = t$4.litNonce;
    void 0 !== n3 && o3.setAttribute("nonce", n3), o3.textContent = e2.cssText, s2.appendChild(o3);
  }
}, c$2 = e$4 ? (t2) => t2 : (t2) => t2 instanceof CSSStyleSheet ? ((t3) => {
  let e2 = "";
  for (const s2 of t3.cssRules) e2 += s2.cssText;
  return r$4(e2);
})(t2) : t2;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: i$4, defineProperty: e$3, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$3, getOwnPropertySymbols: o$4, getPrototypeOf: n$3 } = Object, a$1 = globalThis, c$1 = a$1.trustedTypes, l$1 = c$1 ? c$1.emptyScript : "", p$1 = a$1.reactiveElementPolyfillSupport, d$1 = (t2, s2) => t2, u$1 = { toAttribute(t2, s2) {
  switch (s2) {
    case Boolean:
      t2 = t2 ? l$1 : null;
      break;
    case Object:
    case Array:
      t2 = null == t2 ? t2 : JSON.stringify(t2);
  }
  return t2;
}, fromAttribute(t2, s2) {
  let i4 = t2;
  switch (s2) {
    case Boolean:
      i4 = null !== t2;
      break;
    case Number:
      i4 = null === t2 ? null : Number(t2);
      break;
    case Object:
    case Array:
      try {
        i4 = JSON.parse(t2);
      } catch (t3) {
        i4 = null;
      }
  }
  return i4;
} }, f$1 = (t2, s2) => !i$4(t2, s2), b$1 = { attribute: true, type: String, converter: u$1, reflect: false, useDefault: false, hasChanged: f$1 };
Symbol.metadata ??= Symbol("metadata"), a$1.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let y$1 = class y extends HTMLElement {
  static addInitializer(t2) {
    this._$Ei(), (this.l ??= []).push(t2);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t2, s2 = b$1) {
    if (s2.state && (s2.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t2) && ((s2 = Object.create(s2)).wrapped = true), this.elementProperties.set(t2, s2), !s2.noAccessor) {
      const i4 = Symbol(), h2 = this.getPropertyDescriptor(t2, i4, s2);
      void 0 !== h2 && e$3(this.prototype, t2, h2);
    }
  }
  static getPropertyDescriptor(t2, s2, i4) {
    const { get: e2, set: r2 } = h$1(this.prototype, t2) ?? { get() {
      return this[s2];
    }, set(t3) {
      this[s2] = t3;
    } };
    return { get: e2, set(s3) {
      const h2 = e2?.call(this);
      r2?.call(this, s3), this.requestUpdate(t2, h2, i4);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t2) {
    return this.elementProperties.get(t2) ?? b$1;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d$1("elementProperties"))) return;
    const t2 = n$3(this);
    t2.finalize(), void 0 !== t2.l && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d$1("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
      const t3 = this.properties, s2 = [...r$3(t3), ...o$4(t3)];
      for (const i4 of s2) this.createProperty(i4, t3[i4]);
    }
    const t2 = this[Symbol.metadata];
    if (null !== t2) {
      const s2 = litPropertyMetadata.get(t2);
      if (void 0 !== s2) for (const [t3, i4] of s2) this.elementProperties.set(t3, i4);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t3, s2] of this.elementProperties) {
      const i4 = this._$Eu(t3, s2);
      void 0 !== i4 && this._$Eh.set(i4, t3);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s2) {
    const i4 = [];
    if (Array.isArray(s2)) {
      const e2 = new Set(s2.flat(1 / 0).reverse());
      for (const s3 of e2) i4.unshift(c$2(s3));
    } else void 0 !== s2 && i4.push(c$2(s2));
    return i4;
  }
  static _$Eu(t2, s2) {
    const i4 = s2.attribute;
    return false === i4 ? void 0 : "string" == typeof i4 ? i4 : "string" == typeof t2 ? t2.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t2) => this.enableUpdating = t2), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t2) => t2(this));
  }
  addController(t2) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t2), void 0 !== this.renderRoot && this.isConnected && t2.hostConnected?.();
  }
  removeController(t2) {
    this._$EO?.delete(t2);
  }
  _$E_() {
    const t2 = /* @__PURE__ */ new Map(), s2 = this.constructor.elementProperties;
    for (const i4 of s2.keys()) this.hasOwnProperty(i4) && (t2.set(i4, this[i4]), delete this[i4]);
    t2.size > 0 && (this._$Ep = t2);
  }
  createRenderRoot() {
    const t2 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S$1(t2, this.constructor.elementStyles), t2;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t2) => t2.hostConnected?.());
  }
  enableUpdating(t2) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t2) => t2.hostDisconnected?.());
  }
  attributeChangedCallback(t2, s2, i4) {
    this._$AK(t2, i4);
  }
  _$ET(t2, s2) {
    const i4 = this.constructor.elementProperties.get(t2), e2 = this.constructor._$Eu(t2, i4);
    if (void 0 !== e2 && true === i4.reflect) {
      const h2 = (void 0 !== i4.converter?.toAttribute ? i4.converter : u$1).toAttribute(s2, i4.type);
      this._$Em = t2, null == h2 ? this.removeAttribute(e2) : this.setAttribute(e2, h2), this._$Em = null;
    }
  }
  _$AK(t2, s2) {
    const i4 = this.constructor, e2 = i4._$Eh.get(t2);
    if (void 0 !== e2 && this._$Em !== e2) {
      const t3 = i4.getPropertyOptions(e2), h2 = "function" == typeof t3.converter ? { fromAttribute: t3.converter } : void 0 !== t3.converter?.fromAttribute ? t3.converter : u$1;
      this._$Em = e2;
      const r2 = h2.fromAttribute(s2, t3.type);
      this[e2] = r2 ?? this._$Ej?.get(e2) ?? r2, this._$Em = null;
    }
  }
  requestUpdate(t2, s2, i4, e2 = false, h2) {
    if (void 0 !== t2) {
      const r2 = this.constructor;
      if (false === e2 && (h2 = this[t2]), i4 ??= r2.getPropertyOptions(t2), !((i4.hasChanged ?? f$1)(h2, s2) || i4.useDefault && i4.reflect && h2 === this._$Ej?.get(t2) && !this.hasAttribute(r2._$Eu(t2, i4)))) return;
      this.C(t2, s2, i4);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t2, s2, { useDefault: i4, reflect: e2, wrapped: h2 }, r2) {
    i4 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t2) && (this._$Ej.set(t2, r2 ?? s2 ?? this[t2]), true !== h2 || void 0 !== r2) || (this._$AL.has(t2) || (this.hasUpdated || i4 || (s2 = void 0), this._$AL.set(t2, s2)), true === e2 && this._$Em !== t2 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t2));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t3) {
      Promise.reject(t3);
    }
    const t2 = this.scheduleUpdate();
    return null != t2 && await t2, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t4, s3] of this._$Ep) this[t4] = s3;
        this._$Ep = void 0;
      }
      const t3 = this.constructor.elementProperties;
      if (t3.size > 0) for (const [s3, i4] of t3) {
        const { wrapped: t4 } = i4, e2 = this[s3];
        true !== t4 || this._$AL.has(s3) || void 0 === e2 || this.C(s3, void 0, i4, e2);
      }
    }
    let t2 = false;
    const s2 = this._$AL;
    try {
      t2 = this.shouldUpdate(s2), t2 ? (this.willUpdate(s2), this._$EO?.forEach((t3) => t3.hostUpdate?.()), this.update(s2)) : this._$EM();
    } catch (s3) {
      throw t2 = false, this._$EM(), s3;
    }
    t2 && this._$AE(s2);
  }
  willUpdate(t2) {
  }
  _$AE(t2) {
    this._$EO?.forEach((t3) => t3.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t2)), this.updated(t2);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t2) {
    return true;
  }
  update(t2) {
    this._$Eq &&= this._$Eq.forEach((t3) => this._$ET(t3, this[t3])), this._$EM();
  }
  updated(t2) {
  }
  firstUpdated(t2) {
  }
};
y$1.elementStyles = [], y$1.shadowRootOptions = { mode: "open" }, y$1[d$1("elementProperties")] = /* @__PURE__ */ new Map(), y$1[d$1("finalized")] = /* @__PURE__ */ new Map(), p$1?.({ ReactiveElement: y$1 }), (a$1.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$3 = globalThis, i$3 = (t2) => t2, s$1 = t$3.trustedTypes, e$2 = s$1 ? s$1.createPolicy("lit-html", { createHTML: (t2) => t2 }) : void 0, h = "$lit$", o$3 = `lit$${Math.random().toFixed(9).slice(2)}$`, n$2 = "?" + o$3, r$2 = `<${n$2}>`, l = document, c = () => l.createComment(""), a = (t2) => null === t2 || "object" != typeof t2 && "function" != typeof t2, u = Array.isArray, d = (t2) => u(t2) || "function" == typeof t2?.[Symbol.iterator], f = "[ 	\n\f\r]", v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _ = /-->/g, m = />/g, p = RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), g = /'/g, $ = /"/g, y2 = /^(?:script|style|textarea|title)$/i, x = (t2) => (i4, ...s2) => ({ _$litType$: t2, strings: i4, values: s2 }), b = x(1), w = x(2), E = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), C = /* @__PURE__ */ new WeakMap(), P = l.createTreeWalker(l, 129);
function V(t2, i4) {
  if (!u(t2) || !t2.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e$2 ? e$2.createHTML(i4) : i4;
}
const N = (t2, i4) => {
  const s2 = t2.length - 1, e2 = [];
  let n3, l2 = 2 === i4 ? "<svg>" : 3 === i4 ? "<math>" : "", c2 = v;
  for (let i5 = 0; i5 < s2; i5++) {
    const s3 = t2[i5];
    let a2, u2, d2 = -1, f2 = 0;
    for (; f2 < s3.length && (c2.lastIndex = f2, u2 = c2.exec(s3), null !== u2); ) f2 = c2.lastIndex, c2 === v ? "!--" === u2[1] ? c2 = _ : void 0 !== u2[1] ? c2 = m : void 0 !== u2[2] ? (y2.test(u2[2]) && (n3 = RegExp("</" + u2[2], "g")), c2 = p) : void 0 !== u2[3] && (c2 = p) : c2 === p ? ">" === u2[0] ? (c2 = n3 ?? v, d2 = -1) : void 0 === u2[1] ? d2 = -2 : (d2 = c2.lastIndex - u2[2].length, a2 = u2[1], c2 = void 0 === u2[3] ? p : '"' === u2[3] ? $ : g) : c2 === $ || c2 === g ? c2 = p : c2 === _ || c2 === m ? c2 = v : (c2 = p, n3 = void 0);
    const x2 = c2 === p && t2[i5 + 1].startsWith("/>") ? " " : "";
    l2 += c2 === v ? s3 + r$2 : d2 >= 0 ? (e2.push(a2), s3.slice(0, d2) + h + s3.slice(d2) + o$3 + x2) : s3 + o$3 + (-2 === d2 ? i5 : x2);
  }
  return [V(t2, l2 + (t2[s2] || "<?>") + (2 === i4 ? "</svg>" : 3 === i4 ? "</math>" : "")), e2];
};
class S {
  constructor({ strings: t2, _$litType$: i4 }, e2) {
    let r2;
    this.parts = [];
    let l2 = 0, a2 = 0;
    const u2 = t2.length - 1, d2 = this.parts, [f2, v2] = N(t2, i4);
    if (this.el = S.createElement(f2, e2), P.currentNode = this.el.content, 2 === i4 || 3 === i4) {
      const t3 = this.el.content.firstChild;
      t3.replaceWith(...t3.childNodes);
    }
    for (; null !== (r2 = P.nextNode()) && d2.length < u2; ) {
      if (1 === r2.nodeType) {
        if (r2.hasAttributes()) for (const t3 of r2.getAttributeNames()) if (t3.endsWith(h)) {
          const i5 = v2[a2++], s2 = r2.getAttribute(t3).split(o$3), e3 = /([.?@])?(.*)/.exec(i5);
          d2.push({ type: 1, index: l2, name: e3[2], strings: s2, ctor: "." === e3[1] ? I : "?" === e3[1] ? L : "@" === e3[1] ? z : H }), r2.removeAttribute(t3);
        } else t3.startsWith(o$3) && (d2.push({ type: 6, index: l2 }), r2.removeAttribute(t3));
        if (y2.test(r2.tagName)) {
          const t3 = r2.textContent.split(o$3), i5 = t3.length - 1;
          if (i5 > 0) {
            r2.textContent = s$1 ? s$1.emptyScript : "";
            for (let s2 = 0; s2 < i5; s2++) r2.append(t3[s2], c()), P.nextNode(), d2.push({ type: 2, index: ++l2 });
            r2.append(t3[i5], c());
          }
        }
      } else if (8 === r2.nodeType) if (r2.data === n$2) d2.push({ type: 2, index: l2 });
      else {
        let t3 = -1;
        for (; -1 !== (t3 = r2.data.indexOf(o$3, t3 + 1)); ) d2.push({ type: 7, index: l2 }), t3 += o$3.length - 1;
      }
      l2++;
    }
  }
  static createElement(t2, i4) {
    const s2 = l.createElement("template");
    return s2.innerHTML = t2, s2;
  }
}
function M(t2, i4, s2 = t2, e2) {
  if (i4 === E) return i4;
  let h2 = void 0 !== e2 ? s2._$Co?.[e2] : s2._$Cl;
  const o2 = a(i4) ? void 0 : i4._$litDirective$;
  return h2?.constructor !== o2 && (h2?._$AO?.(false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t2), h2._$AT(t2, s2, e2)), void 0 !== e2 ? (s2._$Co ??= [])[e2] = h2 : s2._$Cl = h2), void 0 !== h2 && (i4 = M(t2, h2._$AS(t2, i4.values), h2, e2)), i4;
}
class R {
  constructor(t2, i4) {
    this._$AV = [], this._$AN = void 0, this._$AD = t2, this._$AM = i4;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t2) {
    const { el: { content: i4 }, parts: s2 } = this._$AD, e2 = (t2?.creationScope ?? l).importNode(i4, true);
    P.currentNode = e2;
    let h2 = P.nextNode(), o2 = 0, n3 = 0, r2 = s2[0];
    for (; void 0 !== r2; ) {
      if (o2 === r2.index) {
        let i5;
        2 === r2.type ? i5 = new k(h2, h2.nextSibling, this, t2) : 1 === r2.type ? i5 = new r2.ctor(h2, r2.name, r2.strings, this, t2) : 6 === r2.type && (i5 = new Z(h2, this, t2)), this._$AV.push(i5), r2 = s2[++n3];
      }
      o2 !== r2?.index && (h2 = P.nextNode(), o2++);
    }
    return P.currentNode = l, e2;
  }
  p(t2) {
    let i4 = 0;
    for (const s2 of this._$AV) void 0 !== s2 && (void 0 !== s2.strings ? (s2._$AI(t2, s2, i4), i4 += s2.strings.length - 2) : s2._$AI(t2[i4])), i4++;
  }
}
class k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t2, i4, s2, e2) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t2, this._$AB = i4, this._$AM = s2, this.options = e2, this._$Cv = e2?.isConnected ?? true;
  }
  get parentNode() {
    let t2 = this._$AA.parentNode;
    const i4 = this._$AM;
    return void 0 !== i4 && 11 === t2?.nodeType && (t2 = i4.parentNode), t2;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t2, i4 = this) {
    t2 = M(this, t2, i4), a(t2) ? t2 === A || null == t2 || "" === t2 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t2 !== this._$AH && t2 !== E && this._(t2) : void 0 !== t2._$litType$ ? this.$(t2) : void 0 !== t2.nodeType ? this.T(t2) : d(t2) ? this.k(t2) : this._(t2);
  }
  O(t2) {
    return this._$AA.parentNode.insertBefore(t2, this._$AB);
  }
  T(t2) {
    this._$AH !== t2 && (this._$AR(), this._$AH = this.O(t2));
  }
  _(t2) {
    this._$AH !== A && a(this._$AH) ? this._$AA.nextSibling.data = t2 : this.T(l.createTextNode(t2)), this._$AH = t2;
  }
  $(t2) {
    const { values: i4, _$litType$: s2 } = t2, e2 = "number" == typeof s2 ? this._$AC(t2) : (void 0 === s2.el && (s2.el = S.createElement(V(s2.h, s2.h[0]), this.options)), s2);
    if (this._$AH?._$AD === e2) this._$AH.p(i4);
    else {
      const t3 = new R(e2, this), s3 = t3.u(this.options);
      t3.p(i4), this.T(s3), this._$AH = t3;
    }
  }
  _$AC(t2) {
    let i4 = C.get(t2.strings);
    return void 0 === i4 && C.set(t2.strings, i4 = new S(t2)), i4;
  }
  k(t2) {
    u(this._$AH) || (this._$AH = [], this._$AR());
    const i4 = this._$AH;
    let s2, e2 = 0;
    for (const h2 of t2) e2 === i4.length ? i4.push(s2 = new k(this.O(c()), this.O(c()), this, this.options)) : s2 = i4[e2], s2._$AI(h2), e2++;
    e2 < i4.length && (this._$AR(s2 && s2._$AB.nextSibling, e2), i4.length = e2);
  }
  _$AR(t2 = this._$AA.nextSibling, s2) {
    for (this._$AP?.(false, true, s2); t2 !== this._$AB; ) {
      const s3 = i$3(t2).nextSibling;
      i$3(t2).remove(), t2 = s3;
    }
  }
  setConnected(t2) {
    void 0 === this._$AM && (this._$Cv = t2, this._$AP?.(t2));
  }
}
class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t2, i4, s2, e2, h2) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t2, this.name = i4, this._$AM = e2, this.options = h2, s2.length > 2 || "" !== s2[0] || "" !== s2[1] ? (this._$AH = Array(s2.length - 1).fill(new String()), this.strings = s2) : this._$AH = A;
  }
  _$AI(t2, i4 = this, s2, e2) {
    const h2 = this.strings;
    let o2 = false;
    if (void 0 === h2) t2 = M(this, t2, i4, 0), o2 = !a(t2) || t2 !== this._$AH && t2 !== E, o2 && (this._$AH = t2);
    else {
      const e3 = t2;
      let n3, r2;
      for (t2 = h2[0], n3 = 0; n3 < h2.length - 1; n3++) r2 = M(this, e3[s2 + n3], i4, n3), r2 === E && (r2 = this._$AH[n3]), o2 ||= !a(r2) || r2 !== this._$AH[n3], r2 === A ? t2 = A : t2 !== A && (t2 += (r2 ?? "") + h2[n3 + 1]), this._$AH[n3] = r2;
    }
    o2 && !e2 && this.j(t2);
  }
  j(t2) {
    t2 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t2 ?? "");
  }
}
class I extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t2) {
    this.element[this.name] = t2 === A ? void 0 : t2;
  }
}
class L extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t2) {
    this.element.toggleAttribute(this.name, !!t2 && t2 !== A);
  }
}
class z extends H {
  constructor(t2, i4, s2, e2, h2) {
    super(t2, i4, s2, e2, h2), this.type = 5;
  }
  _$AI(t2, i4 = this) {
    if ((t2 = M(this, t2, i4, 0) ?? A) === E) return;
    const s2 = this._$AH, e2 = t2 === A && s2 !== A || t2.capture !== s2.capture || t2.once !== s2.once || t2.passive !== s2.passive, h2 = t2 !== A && (s2 === A || e2);
    e2 && this.element.removeEventListener(this.name, this, s2), h2 && this.element.addEventListener(this.name, this, t2), this._$AH = t2;
  }
  handleEvent(t2) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t2) : this._$AH.handleEvent(t2);
  }
}
class Z {
  constructor(t2, i4, s2) {
    this.element = t2, this.type = 6, this._$AN = void 0, this._$AM = i4, this.options = s2;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t2) {
    M(this, t2);
  }
}
const B = t$3.litHtmlPolyfillSupport;
B?.(S, k), (t$3.litHtmlVersions ??= []).push("3.3.3");
const D = (t2, i4, s2) => {
  const e2 = s2?.renderBefore ?? i4;
  let h2 = e2._$litPart$;
  if (void 0 === h2) {
    const t3 = s2?.renderBefore ?? null;
    e2._$litPart$ = h2 = new k(i4.insertBefore(c(), t3), t3, void 0, s2 ?? {});
  }
  return h2._$AI(t2), h2;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const s = globalThis;
let i$2 = class i extends y$1 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t2 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t2.firstChild, t2;
  }
  update(t2) {
    const r2 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t2), this._$Do = D(r2, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i$2._$litElement$ = true, i$2["finalized"] = true, s.litElementHydrateSupport?.({ LitElement: i$2 });
const o$2 = s.litElementPolyfillSupport;
o$2?.({ LitElement: i$2 });
(s.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2 = (t2) => (e2, o2) => {
  void 0 !== o2 ? o2.addInitializer(() => {
    customElements.define(t2, e2);
  }) : customElements.define(t2, e2);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o$1 = { attribute: true, type: String, converter: u$1, reflect: false, hasChanged: f$1 }, r$1 = (t2 = o$1, e2, r2) => {
  const { kind: n3, metadata: i4 } = r2;
  let s2 = globalThis.litPropertyMetadata.get(i4);
  if (void 0 === s2 && globalThis.litPropertyMetadata.set(i4, s2 = /* @__PURE__ */ new Map()), "setter" === n3 && ((t2 = Object.create(t2)).wrapped = true), s2.set(r2.name, t2), "accessor" === n3) {
    const { name: o2 } = r2;
    return { set(r3) {
      const n4 = e2.get.call(this);
      e2.set.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    }, init(e3) {
      return void 0 !== e3 && this.C(o2, void 0, t2, e3), e3;
    } };
  }
  if ("setter" === n3) {
    const { name: o2 } = r2;
    return function(r3) {
      const n4 = this[o2];
      e2.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    };
  }
  throw Error("Unsupported decorator location: " + n3);
};
function n$1(t2) {
  return (e2, o2) => "object" == typeof o2 ? r$1(t2, e2, o2) : ((t3, e3, o3) => {
    const r2 = e3.hasOwnProperty(o3);
    return e3.constructor.createProperty(o3, t3), r2 ? Object.getOwnPropertyDescriptor(e3, o3) : void 0;
  })(t2, e2, o2);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function r(r2) {
  return n$1({ ...r2, state: true, attribute: false });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1 = { ATTRIBUTE: 1, ELEMENT: 6 }, e$1 = (t2) => (...e2) => ({ _$litDirective$: t2, values: e2 });
let i$1 = class i2 {
  constructor(t2) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t2, e2, i4) {
    this._$Ct = t2, this._$AM = e2, this._$Ci = i4;
  }
  _$AS(t2, e2) {
    return this.update(t2, e2);
  }
  update(t2, e2) {
    return this.render(...e2);
  }
};
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const n2 = "important", i3 = " !" + n2, o = e$1(class extends i$1 {
  constructor(t2) {
    if (super(t2), t2.type !== t$1.ATTRIBUTE || "style" !== t2.name || t2.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(t2) {
    return Object.keys(t2).reduce((e2, r2) => {
      const s2 = t2[r2];
      return null == s2 ? e2 : e2 + `${r2 = r2.includes("-") ? r2 : r2.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s2};`;
    }, "");
  }
  update(e2, [r2]) {
    const { style: s2 } = e2.element;
    if (void 0 === this.ft) return this.ft = new Set(Object.keys(r2)), this.render(r2);
    for (const t2 of this.ft) null == r2[t2] && (this.ft.delete(t2), t2.includes("-") ? s2.removeProperty(t2) : s2[t2] = null);
    for (const t2 in r2) {
      const e3 = r2[t2];
      if (null != e3) {
        this.ft.add(t2);
        const r3 = "string" == typeof e3 && e3.endsWith(i3);
        t2.includes("-") || r3 ? s2.setProperty(t2, r3 ? e3.slice(0, -11) : e3, r3 ? n2 : "") : s2[t2] = e3;
      }
    }
    return E;
  }
});
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e = e$1(class extends i$1 {
  constructor(t2) {
    if (super(t2), t2.type !== t$1.ATTRIBUTE || "class" !== t2.name || t2.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t2) {
    return " " + Object.keys(t2).filter((s2) => t2[s2]).join(" ") + " ";
  }
  update(s2, [i4]) {
    if (void 0 === this.st) {
      this.st = /* @__PURE__ */ new Set(), void 0 !== s2.strings && (this.nt = new Set(s2.strings.join(" ").split(/\s/).filter((t2) => "" !== t2)));
      for (const t2 in i4) i4[t2] && !this.nt?.has(t2) && this.st.add(t2);
      return this.render(i4);
    }
    const r2 = s2.element.classList;
    for (const t2 of this.st) t2 in i4 || (r2.remove(t2), this.st.delete(t2));
    for (const t2 in i4) {
      const s3 = !!i4[t2];
      s3 === this.st.has(t2) || this.nt?.has(t2) || (s3 ? (r2.add(t2), this.st.add(t2)) : (r2.remove(t2), this.st.delete(t2)));
    }
    return E;
  }
});
const STATE_NOT_RUNNING = "NOT_RUNNING";
const UNAVAILABLE = "unavailable";
const UNKNOWN = "unknown";
const OFF = "off";
const UNAVAILABLE_STATES = [UNAVAILABLE, UNKNOWN];
const isUnavailable = (stateObj) => !stateObj || UNAVAILABLE_STATES.includes(stateObj.state);
const isActive = (stateObj) => {
  if (!stateObj) return false;
  const s2 = stateObj.state;
  return s2 !== OFF && s2 !== UNAVAILABLE && s2 !== UNKNOWN && s2 !== "idle" && s2 !== "closed" && s2 !== "locked";
};
const computeDomain = (entityId) => entityId.substring(0, entityId.indexOf("."));
const computeEntityName = (stateObj) => stateObj.attributes.friendly_name ?? stateObj.entity_id;
const numericState = (value) => {
  const n3 = Number(value);
  return Number.isFinite(n3) ? n3 : void 0;
};
const fireEvent = (node, type, detail, options) => {
  const event = new CustomEvent(type, {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail
  });
  node.dispatchEvent(event);
  return event;
};
const hasAction = (config) => config !== void 0 && config.action !== "none";
const handleAction = async (node, hass, config, action) => {
  let actionConfig;
  if (action === "double_tap") actionConfig = config.double_tap_action;
  else if (action === "hold") actionConfig = config.hold_action;
  else if (action === "tap") actionConfig = config.tap_action;
  if (!actionConfig) {
    actionConfig = { action: "more-info" };
  }
  const confirmation = actionConfig.confirmation;
  if (confirmation && !confirmation.exemptions) {
    const what = "perform_action" in actionConfig ? actionConfig.perform_action : actionConfig.action;
    if (!confirm(confirmation.text ?? `Confirmer « ${what} » ?`)) return;
  }
  switch (actionConfig.action) {
    case "none":
      break;
    case "more-info": {
      const entityId = actionConfig.entity ?? config.entity;
      if (entityId) fireEvent(node, "hass-more-info", { entityId });
      break;
    }
    case "navigate":
      if (actionConfig.navigation_path) {
        if (actionConfig.navigation_replace) {
          history.replaceState(null, "", actionConfig.navigation_path);
        } else {
          history.pushState(null, "", actionConfig.navigation_path);
        }
        window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
      }
      break;
    case "url":
      if (actionConfig.url_path) window.open(actionConfig.url_path, "_blank", "noreferrer=true");
      break;
    case "toggle":
      if (config.entity) {
        await hass.callService("homeassistant", "toggle", { entity_id: config.entity });
      }
      break;
    case "perform-action": {
      if (!actionConfig.perform_action) break;
      const [domain, service] = actionConfig.perform_action.split(".", 2);
      if (!domain || !service) break;
      await hass.callService(domain, service, actionConfig.data, actionConfig.target);
      break;
    }
    case "assist":
      fireEvent(node, "ll-custom", {
        action: "assist",
        pipeline_id: actionConfig.pipeline_id,
        start_listening: actionConfig.start_listening
      });
      break;
    case "fire-dom-event":
      fireEvent(node, "ll-custom", actionConfig);
      break;
  }
};
const HOLD_DELAY = 500;
const DOUBLE_TAP_DELAY = 250;
class ActionHandlerDirective extends i$1 {
  constructor(partInfo) {
    super(partInfo);
    this._options = {};
    this._held = false;
    this._bound = false;
    this._onKeyDown = (ev) => {
      if (this._options.disabled) return;
      if (ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
      this._fire("tap");
    };
    this._onDown = (ev) => {
      if (this._options.disabled || ev.button !== 0) return;
      this._held = false;
      if (this._options.hasHold) {
        this._holdTimer = window.setTimeout(() => {
          this._held = true;
          this._fire("hold");
        }, HOLD_DELAY);
      }
    };
    this._onUp = (ev) => {
      if (this._options.disabled || ev.button !== 0) return;
      this._clearHold();
      if (this._held) return;
      if (this._options.hasDoubleClick) {
        if (this._tapTimer !== void 0) {
          window.clearTimeout(this._tapTimer);
          this._tapTimer = void 0;
          this._fire("double_tap");
          return;
        }
        this._tapTimer = window.setTimeout(() => {
          this._tapTimer = void 0;
          this._fire("tap");
        }, DOUBLE_TAP_DELAY);
        return;
      }
      this._fire("tap");
    };
    this._cancel = () => {
      this._clearHold();
      this._held = false;
    };
    if (partInfo.type !== t$1.ELEMENT) {
      throw new Error("actionHandler can only be attached to an element");
    }
  }
  update(part, props) {
    this._options = props[0] ?? {};
    const element = part.element;
    if (this._element !== element) {
      this._detach();
      this._element = element;
      this._attach();
    }
    return this.render(this._options);
  }
  render(_options) {
  }
  _attach() {
    const el = this._element;
    if (!el || this._bound) return;
    el.addEventListener("pointerdown", this._onDown);
    el.addEventListener("pointerup", this._onUp);
    el.addEventListener("pointercancel", this._cancel);
    el.addEventListener("keydown", this._onKeyDown);
    el.style.touchAction = el.style.touchAction || "manipulation";
    this._bound = true;
  }
  _detach() {
    const el = this._element;
    if (!el || !this._bound) return;
    el.removeEventListener("pointerdown", this._onDown);
    el.removeEventListener("pointerup", this._onUp);
    el.removeEventListener("pointercancel", this._cancel);
    el.removeEventListener("keydown", this._onKeyDown);
    this._bound = false;
  }
  _clearHold() {
    if (this._holdTimer !== void 0) {
      window.clearTimeout(this._holdTimer);
      this._holdTimer = void 0;
    }
  }
  _fire(action) {
    this._element?.dispatchEvent(
      new CustomEvent("action", { bubbles: true, composed: true, detail: { action } })
    );
  }
}
const actionHandler = e$1(ActionHandlerDirective);
const FR = {
  brightness: "Intensité",
  color_temp: "Teinte",
  color: "Couleur",
  on: "Allumé",
  off: "Éteint",
  position: "Position",
  opening: "Ouverture",
  open: "Ouvrir",
  close: "Fermer",
  stop: "Stop",
  closed: "Fermé",
  opened: "Ouvert",
  setpoint: "Consigne",
  current: "Actuelle",
  power: "Marche",
  increase: "Augmenter",
  decrease: "Diminuer",
  heat: "Chaud",
  cool: "Froid",
  fan_only: "Vent.",
  auto: "Auto",
  dry: "Sec",
  heat_cool: "Auto",
  unavailable: "Indisponible",
  unknown: "Inconnu",
  entity_not_found: "Entité introuvable",
  starting: "Démarrage de Home Assistant",
  no_entity: "Aucune entité configurée",
  speed: "Vitesse",
  oscillate: "Oscill.",
  direction: "Sens",
  lock: "Verrou",
  latch: "Loquet",
  last_access: "Dernier accès",
  clean: "Nettoyage",
  dock: "Retour base",
  battery: "Batterie",
  arm_home: "Maison",
  arm_away: "Absence",
  arm_night: "Nuit",
  disarm: "Désarmé",
  eco: "Éco",
  performance: "Perf.",
  water: "Eau chaude",
  today: "Aujourd'hui",
  power_draw: "Puissance",
  code_required: "Code requis",
  forecast_unavailable: "Prévisions indisponibles",
  volume: "Volume",
  previous: "Précédent",
  play: "Lecture",
  pause: "Pause",
  next: "Suivant",
  preview: "Aperçu",
  motion: "Détection",
  record: "Enreg.",
  live: "Direct",
  paused_preview: "Figé",
  open_stream: "Ouvrir le direct"
};
const EN = {
  brightness: "Brightness",
  color_temp: "Warmth",
  color: "Color",
  on: "On",
  off: "Off",
  position: "Position",
  opening: "Opening",
  open: "Open",
  close: "Close",
  stop: "Stop",
  closed: "Closed",
  opened: "Open",
  setpoint: "Target",
  current: "Current",
  power: "Power",
  increase: "Increase",
  decrease: "Decrease",
  heat: "Heat",
  cool: "Cool",
  fan_only: "Fan",
  auto: "Auto",
  dry: "Dry",
  heat_cool: "Auto",
  unavailable: "Unavailable",
  unknown: "Unknown",
  entity_not_found: "Entity not found",
  starting: "Home Assistant is starting",
  no_entity: "No entity configured",
  speed: "Speed",
  oscillate: "Swing",
  direction: "Direction",
  lock: "Lock",
  latch: "Latch",
  last_access: "Last access",
  clean: "Cleaning",
  dock: "Dock",
  battery: "Battery",
  arm_home: "Home",
  arm_away: "Away",
  arm_night: "Night",
  disarm: "Disarmed",
  eco: "Eco",
  performance: "Boost",
  water: "Hot water",
  today: "Today",
  power_draw: "Power",
  code_required: "Code required",
  forecast_unavailable: "Forecast unavailable",
  volume: "Volume",
  previous: "Previous",
  play: "Play",
  pause: "Pause",
  next: "Next",
  preview: "Preview",
  motion: "Motion",
  record: "Record",
  live: "Live",
  paused_preview: "Frozen",
  open_stream: "Open live view"
};
const isFrench = (hass) => {
  const lang = hass?.locale?.language ?? hass?.language ?? navigator.language ?? "en";
  return lang.toLowerCase().startsWith("fr");
};
const t = (hass, key) => {
  const dict = isFrench(hass) ? FR : EN;
  return dict[key] ?? EN[key] ?? key;
};
const tHa = (hass, haKey, fallbackKey) => {
  if (hass?.localize) {
    const value = hass.localize(haKey);
    if (value && value !== haKey) return value;
  }
  return t(hass, fallbackKey);
};
const formatState = (hass, stateObj) => {
  if (!hass || !stateObj) return "";
  if (hass.formatEntityState) {
    try {
      return hass.formatEntityState(stateObj);
    } catch {
    }
  }
  const domain = stateObj.entity_id.split(".")[0];
  const key = `component.${domain}.entity_component._.state.${stateObj.state}`;
  const translated = hass.localize(key);
  return translated && translated !== key ? translated : stateObj.state;
};
const domainRequired = (domain, hass) => isFrench(hass) ? `\`entity\` doit être une entité du domaine \`${domain}\`.` : `\`entity\` must be an entity from the \`${domain}\` domain.`;
const wrongDomain = (entityId, domains, hass) => isFrench(hass) ? `\`${entityId}\` n'est pas utilisable ici (domaines acceptés : ${domains.join(", ")})` : `\`${entityId}\` cannot be used here (accepted domains: ${domains.join(", ")})`;
const DESIGN = { width: 615, height: 310 };
const SCALE_PROPERTY = "skeuoScale";
const MAX_STAGE_WIDTH = 1e3;
const GRID_ROW_HEIGHT = 56;
const GRID_ROW_GAP = 8;
class ScaleController {
  constructor(host) {
    this.scale = 1;
    this.stageWidth = DESIGN.width;
    this._host = host;
    host.addController(this);
  }
  hostConnected() {
    this._observer = new ResizeObserver(() => this._schedule());
    this._observer.observe(this._host);
    this._measure();
  }
  hostDisconnected() {
    this._observer?.disconnect();
    this._observer = void 0;
    if (this._frame !== void 0) {
      cancelAnimationFrame(this._frame);
      this._frame = void 0;
    }
  }
  /**
   * Le ResizeObserver peut émettre plusieurs fois par frame pendant un
   * redimensionnement ; on ne recalcule qu'une fois par frame pour ne pas
   * déclencher une cascade de rendus.
   */
  _schedule() {
    if (this._frame !== void 0) return;
    this._frame = requestAnimationFrame(() => {
      this._frame = void 0;
      this._measure();
    });
  }
  _measure() {
    const rect = this._host.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const byHeight = rect.height / DESIGN.height;
    let scale;
    let stageWidth;
    if (rect.width / byHeight >= DESIGN.width) {
      scale = byHeight;
      stageWidth = Math.min(rect.width / byHeight, MAX_STAGE_WIDTH);
    } else {
      scale = rect.width / DESIGN.width;
      stageWidth = DESIGN.width;
    }
    if (Math.abs(scale - this.scale) < 1e-3 && Math.abs(stageWidth - this.stageWidth) < 0.5) {
      return;
    }
    this.scale = scale;
    this.stageWidth = stageWidth;
    this._host.requestUpdate(SCALE_PROPERTY, scale);
  }
}
const rowsForColumns = (columns, sectionWidth = 492) => {
  const columnWidth = sectionWidth / 12;
  const width = columns * columnWidth;
  const height = width * DESIGN.height / DESIGN.width;
  return Math.max(1, Math.round((height + GRID_ROW_GAP) / (GRID_ROW_HEIGHT + GRID_ROW_GAP)));
};
const CARBON_TILE = r$4(
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cdefs%3E%3ClinearGradient id='gc' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0%25' stop-color='%23070707'/%3E%3Cstop offset='8%25' stop-color='%23141414'/%3E%3Cstop offset='30%25' stop-color='%23282828'/%3E%3Cstop offset='44%25' stop-color='%23333333'/%3E%3Cstop offset='66%25' stop-color='%231d1d1d'/%3E%3Cstop offset='92%25' stop-color='%230c0c0c'/%3E%3Cstop offset='100%25' stop-color='%23070707'/%3E%3C/linearGradient%3E%3ClinearGradient id='gt' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%230b0b0b'/%3E%3Cstop offset='8%25' stop-color='%231e1e1e'/%3E%3Cstop offset='30%25' stop-color='%233d3d3d'/%3E%3Cstop offset='44%25' stop-color='%234e4e4e'/%3E%3Cstop offset='66%25' stop-color='%232c2c2c'/%3E%3Cstop offset='92%25' stop-color='%23121212'/%3E%3Cstop offset='100%25' stop-color='%230a0a0a'/%3E%3C/linearGradient%3E%3CclipPath id='cp'%3E%3Crect width='20' height='20'/%3E%3C/clipPath%3E%3C/defs%3E%3Cg clip-path='url(%23cp)'%3E%3Crect width='20' height='20' fill='%23080808'/%3E%3Crect y='0' width='20' height='10' fill='url(%23gt)'/%3E%3Crect y='10' width='20' height='10' fill='url(%23gt)'/%3E%3Cg opacity='.55'%3E%3Crect y='1' height='.55' width='20' fill='%23fff' opacity='.05'/%3E%3Crect y='2' height='.55' width='20' fill='%23000' opacity='.09'/%3E%3Crect y='3' height='.55' width='20' fill='%23fff' opacity='.05'/%3E%3Crect y='4' height='.55' width='20' fill='%23000' opacity='.09'/%3E%3Crect y='5' height='.55' width='20' fill='%23fff' opacity='.05'/%3E%3Crect y='6' height='.55' width='20' fill='%23000' opacity='.09'/%3E%3Crect y='7' height='.55' width='20' fill='%23fff' opacity='.05'/%3E%3Crect y='8' height='.55' width='20' fill='%23000' opacity='.09'/%3E%3Crect y='9' height='.55' width='20' fill='%23fff' opacity='.05'/%3E%3Crect y='10' height='.55' width='20' fill='%23000' opacity='.09'/%3E%3C/g%3E%3Crect x='1.2' y='1.2' width='10' height='10' rx='0.8' fill='%23000' opacity='.5'/%3E%3Crect x='11.2' y='11.2' width='10' height='10' rx='0.8' fill='%23000' opacity='.5'/%3E%3Crect x='0' y='0' width='10' height='10' rx='0.8' fill='url(%23gc)'/%3E%3Crect x='10' y='10' width='10' height='10' rx='0.8' fill='url(%23gc)'/%3E%3Cg opacity='.55'%3E%3Crect x='1' width='.55' height='10' fill='%23fff' opacity='.05'/%3E%3Crect x='2' width='.55' height='10' fill='%23000' opacity='.09'/%3E%3Crect x='3' width='.55' height='10' fill='%23fff' opacity='.05'/%3E%3Crect x='4' width='.55' height='10' fill='%23000' opacity='.09'/%3E%3Crect x='5' width='.55' height='10' fill='%23fff' opacity='.05'/%3E%3Crect x='6' width='.55' height='10' fill='%23000' opacity='.09'/%3E%3Crect x='7' width='.55' height='10' fill='%23fff' opacity='.05'/%3E%3Crect x='8' width='.55' height='10' fill='%23000' opacity='.09'/%3E%3Crect x='9' width='.55' height='10' fill='%23fff' opacity='.05'/%3E%3Crect x='10' width='.55' height='10' fill='%23000' opacity='.09'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
);
const chromeStyles = i$5`
  :host {
    /* Rayon et ombre suivent le thème actif quand il les définit. */
    --skeuo-radius: var(--ha-card-border-radius, 16px);
    --skeuo-accent: #e2a659;
    --skeuo-label: #85888b;
    --skeuo-title: #ece8df;

    /* Densité du grain de la matière. 0.6 est le réglage retenu : la tuile de
       carbone fait alors 12 px et la mèche 6 px, assez pour que le croisement
       en damier se lise sans que le tissage prenne le pas sur les contrôles.
       Un tissage de carbone à 1 donne des mèches d'environ 2 mm sur une dalle
       de tablette, soit un 3K, le tissage réel le plus courant. Au-dessus, on
       va vers un 12K, celui des habitacles, qui se reconnaît de plus loin. En
       dessous de 0.7 le lustre de chaque mèche n'a plus assez de pixels pour se
       déployer et la matière cesse de se lire comme du tissu. À 0, il ne reste
       que la couleur de fond.
       Le graphite n'a pas de grain, la variable ne l'affecte donc pas. */
    --skeuo-texture: 0.6;

    /* Aucune police n'est embarquée dans le bundle : ce serait 30 ko de WOFF2
       pour un gain discutable, et une requête réseau si on passait par Google
       Fonts. On s'appuie sur une pile condensée disponible partout, et ces deux
       variables restent redéfinissables par l'utilisateur via card-mod ou son
       thème s'il veut installer Oswald / JetBrains Mono lui-même. */
    --skeuo-font-display: "Oswald", "Roboto Condensed", "Arial Narrow",
      var(--ha-font-family-body, Roboto), sans-serif;
    --skeuo-font-lcd: "JetBrains Mono", ui-monospace, SFMono-Regular, "DejaVu Sans Mono", Menlo,
      Consolas, monospace;

    font-family: var(--skeuo-font-display);

    /* Les vues Sections imposent une hauteur à la cellule et le ratio est alors
       ignoré, comme le veut la spec. Les vues Masonry, elles, laissent la carte
       décider : sans ce ratio, la hauteur retombe sur le min-height du module
       et le plan se retrouve écrasé dans une bande de 96 px. */
    display: block;
    aspect-ratio: ${r$4(DESIGN.width)} / ${r$4(DESIGN.height)};
  }

  .module {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 96px;
    border-radius: var(--skeuo-radius);
    overflow: hidden;
    box-shadow:
      inset 3px 3px 7px rgba(0, 0, 0, 0.75),
      inset -1px -1px 2px rgba(255, 255, 255, 0.06),
      1px 1px 0 rgba(255, 255, 255, 0.05);
    /* Isole la peinture de la carte du reste du dashboard : sans ça, chaque
       re-render d'une carte invalide une zone plus large que nécessaire. */
    contain: paint;
  }

  .mat-carbon {
    background-color: #080808;
    /* Deux couches. Le vernis est un balayage unique étalé sur toute la carte,
       surtout pas inclus dans la tuile : il s'y répéterait à chaque mèche au
       lieu de traverser la surface une seule fois. Son orientation suit la
       règle de lumière du projet, clair en haut-gauche, sombre en bas-droite. */
    background-image:
      linear-gradient(
        118deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.03) 22%,
        rgba(255, 255, 255, 0) 46%,
        rgba(0, 0, 0, 0.12) 100%
      ),
      ${CARBON_TILE};
    background-size:
      auto,
      calc(20px * var(--skeuo-texture)) calc(20px * var(--skeuo-texture));
  }

  .mat-graphite {
    background-color: #16181a;
    background-image:
      linear-gradient(160deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.35) 60%),
      radial-gradient(ellipse at 20% 15%, #2b2f33 0%, #16181a 55%, #0d0e10 100%);
  }

  .mat-brushed {
    background-color: #2a2c2e;
    background-image:
      repeating-linear-gradient(
        92deg,
        rgba(255, 255, 255, 0.055) 0px,
        rgba(255, 255, 255, 0.055) calc(1px * var(--skeuo-texture)),
        rgba(0, 0, 0, 0.05) calc(2px * var(--skeuo-texture)),
        rgba(0, 0, 0, 0.05) calc(3px * var(--skeuo-texture))
      ),
      linear-gradient(150deg, #3c4043 0%, #26292b 55%, #171a1c 100%);
  }

  /* Appareil éteint ou injoignable : la façade se désature entièrement, écrans
     et voyants compris. Pas d'opacity ni de voile sombre par-dessus : une carte
     translucide laisse voir le fond du tableau de bord au travers et perd son
     aspect de matière, alors qu'une façade grise reste une façade. */
  .module.off {
    filter: grayscale(1);
  }
  /* Injoignable : même désaturation, plus un assombrissement qui la fait
     reculer derrière les cartes actives et la distingue d'un simple arrêt.
     C'est une baisse de luminosité, pas un voile translucide. */
  .module.unavailable {
    filter: grayscale(1) brightness(0.62);
  }

  /* ------------------------------------------------------------- vis */

  .screw {
    position: absolute;
    z-index: 3;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: radial-gradient(circle at 34% 30%, #7d7d7d 0%, #4a4a4a 38%, #2a2a2a 72%, #151515 100%);
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.22),
      inset 0 -1px 1px rgba(0, 0, 0, 0.65),
      1px 1px 3px rgba(0, 0, 0, 0.6);
  }
  /* Empreinte cruciforme, deux barres croisées légèrement décentrées pour
     rester cohérentes avec la lumière en haut-gauche. */
  .screw::before,
  .screw::after {
    content: "";
    position: absolute;
    inset: 0;
    margin: auto;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.14));
    border-radius: 1px;
  }
  .screw::before {
    width: 62%;
    height: 2px;
  }
  .screw::after {
    width: 2px;
    height: 62%;
  }
  .screw.tl { top: 10px; left: 10px; }
  .screw.tr { top: 10px; right: 10px; }
  .screw.bl { bottom: 10px; left: 10px; }
  .screw.br { bottom: 10px; right: 10px; }

  /* --------------------------------------------------- plan de référence */

  .stage {
    position: absolute;
    /* Centrage par translation, pas par margin:auto : quand la boîte absolue
       est plus large que son conteneur (c'est le cas ici, le plan fait 615 px
       pour une carte souvent plus étroite), la spec impose margin-left:0 en
       LTR au lieu de répartir la marge négative, et le plan se retrouve décalé
       vers la droite.
       L'ordre scale() puis translate() est obligatoire : les pourcentages du
       translate se résolvent sur la boîte non transformée, il faut donc que le
       scale s'applique après pour que le décalage suive le facteur. */
    left: 50%;
    top: 50%;
    transform-origin: 0 0;
    display: flex;
    flex-direction: column;
    padding: 24px 26px 26px;
    box-sizing: border-box;
  }

  .head {
    flex: none;
    border-radius: 6px;
    outline: none;
  }
  .head.interactive {
    cursor: pointer;
  }
  .head.interactive:focus-visible {
    box-shadow: 0 0 0 2px var(--skeuo-accent);
  }

  .title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--skeuo-title);
    text-shadow: -1px -1px 1px rgba(0, 0, 0, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .subtitle {
    margin: 3px 0 0;
    font-size: 14px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #8d9093;
    text-shadow: -1px -1px 1px rgba(0, 0, 0, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin: 12px -26px 0;
    min-height: 0;
  }

  /* --------------------------------------------------- états dégradés */

  .skeleton {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: linear-gradient(100deg, #191919 30%, #202020 50%, #191919 70%);
    background-size: 200% 100%;
    animation: skeleton 1.4s ease-in-out infinite;
  }

  @keyframes skeleton {
    from { background-position: 150% 0; }
    to { background-position: -50% 0; }
  }

  .notice {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
    padding: 0 26px;
  }
  .notice-message {
    margin: 0;
    font-size: 17px;
    letter-spacing: 1px;
    color: #d8985c;
  }
  .notice-entity {
    margin: 0;
    font-family: var(--skeuo-font-lcd);
    font-size: 14px;
    color: #7d8083;
    word-break: break-all;
  }

  /* Le frontend force cette durée à 1ms quand l'utilisateur a demandé moins
     d'animations ; on suit la même règle pour nos propres transitions. */
  @media (prefers-reduced-motion: reduce) {
    .skeleton {
      animation: none;
    }
    * {
      transition-duration: 1ms !important;
      animation-duration: 1ms !important;
    }
  }
`;
var __defProp$d = Object.defineProperty;
var __decorateClass$p = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(target, key, result) || result;
  if (result) __defProp$d(target, key, result);
  return result;
};
const DEFAULT_ACCENT = "#e2a659";
const DEFAULT_TEXTURE = 60;
class SkeuoBaseCard extends i$2 {
  constructor() {
    super(...arguments);
    this.preview = false;
    this._scaler = new ScaleController(this);
  }
  static {
    this.gridColumns = 12;
  }
  /* -------------------------------------------------------------- config */
  setConfig(config) {
    if (!config) {
      throw new Error(t(this.hass, "no_entity"));
    }
    if (!config.entity) {
      throw new Error(t(this.hass, "no_entity"));
    }
    this.validateConfig(config);
    this._config = { screws: true, material: "carbon", ...config };
  }
  /** Surcharge côté carte pour vérifier le domaine attendu. */
  validateConfig(_config) {
  }
  /**
   * L'appareil est-il à l'arrêt ? La carte passe alors en gris.
   *
   * Faux par défaut : tous les domaines n'ont pas d'état « éteint ». Un volet
   * fermé ou un capteur bas sont des états de fonctionnement normaux, pas un
   * appareil hors service.
   */
  isOff(_stateObj) {
    return false;
  }
  expectDomain(config, ...domains) {
    const domain = config.entity.split(".")[0];
    if (!domains.includes(domain)) {
      throw new Error(wrongDomain(config.entity, domains, this.hass));
    }
  }
  /* ------------------------------------------------------------- sizing */
  getCardSize() {
    return Math.ceil(DESIGN.height / 50);
  }
  getGridOptions() {
    const columns = this.constructor.gridColumns;
    return {
      columns,
      rows: rowsForColumns(columns),
      min_columns: 6,
      min_rows: 2
    };
  }
  /* ------------------------------------------------------------ réactivité */
  /**
   * hass est réassigné à chaque changement d'état de n'importe quelle entité
   * du système, soit plusieurs fois par seconde sur une installation moyenne.
   * Sans ce filtre, toutes les cartes du dashboard rendraient à chaque tick :
   * c'est la première cause de dashboards injouables sur petit matériel.
   *
   * Les objets d'état étant immuables, la comparaison de référence suffit.
   */
  shouldUpdate(changedProps) {
    if (!this._config) return false;
    if (!changedProps.has("hass")) return changedProps.size > 0;
    const oldHass = changedProps.get("hass");
    if (!oldHass || !this.hass) return true;
    if (oldHass.themes !== this.hass.themes || oldHass.locale !== this.hass.locale || oldHass.connected !== this.hass.connected || oldHass.config?.state !== this.hass.config?.state) {
      return true;
    }
    return this.entityIds().some((id) => oldHass.states[id] !== this.hass.states[id]);
  }
  /** Entités suivies par la carte. Redéfini si la carte en lit plusieurs. */
  entityIds() {
    return this._config?.entity ? [this._config.entity] : [];
  }
  get stateObj() {
    if (!this.hass || !this._config?.entity) return void 0;
    return this.hass.states[this._config.entity];
  }
  get accent() {
    return this._config?.accent ?? DEFAULT_ACCENT;
  }
  /**
   * Facteur de grain, borné à l'intervalle 0 à 1.5.
   *
   * 0 retire complètement le motif et laisse la couleur de fond nue, ce qui est
   * un rendu valable en soi. Entre 0 et 0.4 en revanche, la matière se dégrade :
   * les rayures du métal brossé passent sous le pixel et moirent, et le lustre
   * de chaque mèche du tissage n'a plus assez de pixels pour se déployer. Ces
   * valeurs restent accessibles, c'est un choix d'affichage, pas une erreur.
   */
  get textureScale() {
    const pct = this._config?.texture;
    if (pct === void 0 || !Number.isFinite(pct)) return DEFAULT_TEXTURE / 100;
    return Math.min(1.5, Math.max(0, pct / 100));
  }
  /* -------------------------------------------------------------- services */
  /**
   * En preview (vignette du picker, aperçu de l'éditeur), la carte est rendue
   * plusieurs fois simultanément et ne doit surtout pas piloter d'appareil.
   */
  callService(domain, service, data = {}) {
    if (this.preview || !this.hass || !this._config?.entity) return;
    this.hass.callService(domain, service, { entity_id: this._config.entity, ...data });
  }
  /* --------------------------------------------------------------- rendu */
  render() {
    if (!this._config) return A;
    if (!this.hass) return this._renderShell(this._renderSkeleton());
    const stateObj = this.stateObj;
    if (!stateObj) {
      const message = this.hass.config?.state !== STATE_NOT_RUNNING ? t(this.hass, "entity_not_found") : t(this.hass, "starting");
      return this._renderShell(this._renderNotice(message, this._config.entity));
    }
    return this._renderShell(this.renderContent(stateObj), stateObj);
  }
  /**
   * Chrome commun : matière, vis d'angle, titre, sous-titre, et le plan de
   * référence mis à l'échelle. Seul le contenu diffère d'une carte à l'autre.
   */
  _renderShell(content, stateObj) {
    const config = this._config;
    const interactive = config.tap_action?.action !== "none";
    const title = config.name ?? (stateObj ? computeEntityName(stateObj) : config.entity);
    return b`
      <div
        class=${e({
      module: true,
      [`mat-${config.material ?? "carbon"}`]: true,
      unavailable: isUnavailable(stateObj),
      off: !!stateObj && !isUnavailable(stateObj) && this.isOff(stateObj)
    })}
        style=${o({
      "--skeuo-accent": this.accent,
      "--skeuo-texture": String(this.textureScale)
    })}
      >
        ${config.screws !== false ? this._renderScrews() : A}
        <div
          class="stage"
          style=${o({
      width: `${this._scaler.stageWidth}px`,
      height: `${DESIGN.height}px`,
      transform: `scale(${this._scaler.scale}) translate(-50%, -50%)`
    })}
        >
          <div
            class=${e({ head: true, interactive })}
            role=${interactive ? "button" : "presentation"}
            tabindex=${interactive ? "0" : "-1"}
            @action=${this._handleAction}
            ${actionHandler({
      hasHold: hasAction(config.hold_action),
      hasDoubleClick: hasAction(config.double_tap_action),
      disabled: !interactive
    })}
          >
            <p class="title">${title}</p>
            ${config.subtitle ? b`<p class="subtitle">${config.subtitle}</p>` : A}
          </div>
          <div class="body">${content}</div>
        </div>
      </div>
    `;
  }
  _renderScrews() {
    return b`
      <i class="screw tl"></i><i class="screw tr"></i>
      <i class="screw bl"></i><i class="screw br"></i>
    `;
  }
  _renderSkeleton() {
    return b`<div class="skeleton"></div>`;
  }
  _renderNotice(message, entityId) {
    return b`
      <div class="notice">
        <p class="notice-message">${message}</p>
        <p class="notice-entity">${entityId}</p>
      </div>
    `;
  }
  _handleAction(ev) {
    if (!this.hass || !this._config || !ev.detail?.action) return;
    handleAction(this, this.hass, this._config, ev.detail.action);
  }
  static {
    this.styles = [
      chromeStyles,
      i$5`
      :host {
        display: block;
        height: 100%;
      }
    `
    ];
  }
}
__decorateClass$p([
  n$1({ attribute: false })
], SkeuoBaseCard.prototype, "hass");
__decorateClass$p([
  n$1({ type: Boolean })
], SkeuoBaseCard.prototype, "preview");
__decorateClass$p([
  n$1({ reflect: true, type: String })
], SkeuoBaseCard.prototype, "layout");
__decorateClass$p([
  r()
], SkeuoBaseCard.prototype, "_config");
const DOCS = "https://github.com/dcybeldesign/dcy-skeuo-cards";
const registerCard = (entry) => {
  window.customCards = window.customCards ?? [];
  if (window.customCards.some((c2) => c2.type === entry.type)) return;
  const fr = isFrench();
  window.customCards.push({
    documentationURL: DOCS,
    type: entry.type,
    preview: entry.preview,
    name: fr ? entry.name.fr : entry.name.en,
    description: entry.description ? fr ? entry.description.fr : entry.description.en : void 0
  });
};
const LABELS_FR = {
  entity: "Entité",
  name: "Titre",
  subtitle: "Sous-titre",
  material: "Matière",
  accent: "Couleur d'accent",
  screws: "Vis d'angle",
  texture: "Densité du grain",
  tap_action: "Appui",
  hold_action: "Appui long",
  double_tap_action: "Double appui",
  show_color_temp: "Fader de teinte",
  show_color: "Fader de couleur",
  modes: "Modes affichés",
  min: "Minimum de l'échelle",
  max: "Maximum de l'échelle",
  warn: "Seuil orange",
  danger: "Seuil rouge",
  power_entity: "Entité de puissance",
  days: "Jours affichés",
  refresh: "Rafraîchissement",
  record_filename: "Fichier d'enregistrement",
  record_duration: "Durée d'enregistrement",
  energy_entity: "Entité d'énergie"
};
const LABELS_EN = {
  entity: "Entity",
  name: "Title",
  subtitle: "Subtitle",
  material: "Material",
  accent: "Accent colour",
  screws: "Corner screws",
  texture: "Grain density",
  tap_action: "Tap",
  hold_action: "Hold",
  double_tap_action: "Double tap",
  show_color_temp: "Warmth fader",
  show_color: "Colour fader",
  modes: "Displayed modes",
  min: "Scale minimum",
  max: "Scale maximum",
  warn: "Amber threshold",
  danger: "Red threshold",
  power_entity: "Power entity",
  days: "Days shown",
  refresh: "Refresh",
  record_filename: "Recording file",
  record_duration: "Recording length",
  energy_entity: "Energy entity"
};
const HELPERS_FR = {
  accent: "Couleur des écrans et des arcs, en hexadécimal",
  texture: "100 % = réglage d'origine. Sans effet sur le graphite, qui n'a pas de grain.",
  warn: "Fraction de l'échelle, entre 0 et 1",
  danger: "Fraction de l'échelle, entre 0 et 1",
  power_entity: "Capteur de puissance instantanée de la prise, optionnel",
  energy_entity: "Compteur d'énergie de la prise, optionnel",
  modes: "Vide = les modes que l'entité déclare elle-même",
  days: "De 3 à 7. La carte s'adapte au nombre de jours réellement reçus.",
  refresh: "Intervalle entre deux images. 0 fige l'aperçu.",
  record_filename: "Chemin complet attendu par le service `camera.record`. Sans lui, le bouton reste inerte."
};
const HELPERS_EN = {
  accent: "Colour of the screens and arcs, in hexadecimal",
  texture: "100% is the original setting. No effect on graphite, which has no grain.",
  warn: "Fraction of the scale, between 0 and 1",
  danger: "Fraction of the scale, between 0 and 1",
  power_entity: "Instant power sensor for the plug, optional",
  energy_entity: "Energy meter for the plug, optional",
  modes: "Empty means the modes the entity declares itself",
  days: "From 3 to 7. The card adapts to the number of days actually received.",
  refresh: "Delay between two frames. 0 freezes the preview.",
  record_filename: "Full path expected by the `camera.record` service. Without it the button stays inert."
};
const computeLabel = (schema) => (isFrench() ? LABELS_FR : LABELS_EN)[schema.name];
const computeHelper = (schema) => (isFrench() ? HELPERS_FR : HELPERS_EN)[schema.name];
const baseSchema = () => [
  { name: "entity", required: true, selector: { entity: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "name", selector: { text: {} } },
      { name: "subtitle", selector: { text: {} } }
    ]
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "material",
        selector: {
          select: {
            mode: "dropdown",
            options: isFrench() ? [
              { value: "carbon", label: "Carbone" },
              { value: "graphite", label: "Graphite" },
              { value: "brushed", label: "Métal brossé" }
            ] : [
              { value: "carbon", label: "Carbon fibre" },
              { value: "graphite", label: "Graphite" },
              { value: "brushed", label: "Brushed metal" }
            ]
          }
        }
      },
      { name: "accent", selector: { text: {} } },
      { name: "screws", selector: { boolean: {} } }
    ]
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "texture",
        selector: {
          number: { min: 0, max: 150, step: 10, mode: "slider", unit_of_measurement: "%" }
        }
      }
    ]
  },
  {
    type: "expandable",
    name: "",
    title: "Actions",
    schema: [
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } }
    ]
  }
];
const TICK = "__skeuoSmoothTick";
const easeInOutCubic = (t2) => t2 < 0.5 ? 4 * t2 * t2 * t2 : 1 - Math.pow(-2 * t2 + 2, 3) / 2;
const prefersReducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
class SmoothValue {
  constructor(host, options = {}) {
    this._current = 0;
    this._from = 0;
    this._target = 0;
    this._startedAt = 0;
    this._duration = 0;
    this._initialised = false;
    this._seq = 0;
    this._tick = (now) => {
      const elapsed = now - this._startedAt;
      const t2 = this._duration === 0 ? 1 : Math.min(1, elapsed / this._duration);
      this._current = this._from + (this._target - this._from) * easeInOutCubic(t2);
      if (t2 >= 1) {
        this._current = this._target;
        this._frame = void 0;
      } else {
        this._frame = requestAnimationFrame(this._tick);
      }
      this._notify();
    };
    this._host = host;
    this._opts = {
      minDuration: options.minDuration ?? 300,
      maxDuration: options.maxDuration ?? 820,
      msPerUnit: options.msPerUnit ?? 6.5,
      epsilon: options.epsilon ?? 0.5,
      duration: options.duration
    };
    host.addController(this);
  }
  get value() {
    return this._current;
  }
  get animating() {
    return this._frame !== void 0;
  }
  /**
   * Vise une nouvelle valeur.
   *
   * `immediate` sert quand le changement vient du geste de l'utilisateur
   * lui-même : sans lui, le curseur reviendrait à son ancienne position au
   * relâchement pour ensuite glisser jusqu'à là où le doigt l'avait déjà mis.
   */
  set(target, immediate = false) {
    if (!Number.isFinite(target)) return;
    if (!this._initialised) {
      this._initialised = true;
      this._current = target;
      this._target = target;
      return;
    }
    if (target === this._target && !immediate) return;
    this._target = target;
    if (immediate || prefersReducedMotion()) {
      this._cancel();
      this._current = target;
      this._notify();
      return;
    }
    const delta = Math.abs(target - this._current);
    if (delta < this._opts.epsilon) {
      this._cancel();
      this._current = target;
      this._notify();
      return;
    }
    this._from = this._current;
    this._duration = this._opts.duration ? this._opts.duration(delta) : Math.min(
      this._opts.maxDuration,
      Math.max(this._opts.minDuration, delta * this._opts.msPerUnit)
    );
    this._startedAt = performance.now();
    if (this._frame === void 0) this._frame = requestAnimationFrame(this._tick);
  }
  /** Marque un changement que Lit ne peut pas prendre pour un non-événement. */
  _notify() {
    const previous = this._seq;
    this._host[TICK] = ++this._seq;
    this._host.requestUpdate(TICK, previous);
  }
  _cancel() {
    if (this._frame !== void 0) {
      cancelAnimationFrame(this._frame);
      this._frame = void 0;
    }
  }
  hostDisconnected() {
    this._cancel();
  }
}
var __defProp$c = Object.defineProperty;
var __getOwnPropDesc$o = Object.getOwnPropertyDescriptor;
var __decorateClass$o = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$o(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$c(target, key, result);
  return result;
};
let SkeuoScreen = class extends i$2 {
  constructor() {
    super(...arguments);
    this.value = "";
    this.label = "";
    this.width = 190;
    this.height = 142.5;
    this.valueSize = 44.1;
    this.bare = false;
  }
  render() {
    return b`
      <div
        class="screen"
        style=${o({ width: `${this.width}px`, height: `${this.height}px` })}
      >
        ${this.bare ? A : b`
              <p
                class="value"
                style=${o({
      color: this.color ?? "var(--skeuo-accent, #e2a659)",
      fontSize: `${this.valueSize}px`
    })}
              >
                ${this.value}
              </p>
            `}
        ${this.label ? b`<p class="label">${this.label}</p>` : A}
        <slot class=${this.bare ? "fill" : ""}></slot>
      </div>
    `;
  }
};
SkeuoScreen.styles = i$5`
    :host {
      display: block;
      flex: none;
    }

    .screen {
      position: relative;
      box-sizing: border-box;
      border-radius: 13.6px;
      padding: 13.6px 10.2px;
      display: flex;
      flex-direction: column;
      align-items: center;
      /* Creux : zone sombre en haut-gauche, léger reflet en bas-droite,
         ombre portée vers le bas-droite. */
      background: radial-gradient(ellipse at 50% 30%, #241a10, #140d07 75%);
      box-shadow:
        inset 5.1px 5.1px 3.4px rgba(0, 0, 0, 0.9),
        inset 3.4px 3.4px 8.5px rgba(0, 0, 0, 0.85),
        inset -1.7px -1.7px 1.7px rgba(255, 255, 255, 0.05),
        0 0 0 3.4px #100b06,
        5.1px 5.1px 8.5px rgba(0, 0, 0, 0.55);
    }

    .value {
      flex: 1;
      width: 100%;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--skeuo-font-lcd);
      font-weight: 700;
      line-height: 1;
      text-align: center;
      text-shadow: 0 0 11.9px currentColor;
      overflow: hidden;
    }

    /* En mode nu, le slot prend la place que la ligne de valeur occupait,
       et centre son contenu dans la vitre. */
    slot.fill {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }

    .label {
      flex: none;
      margin: 0;
      font-family: var(--skeuo-font-lcd);
      font-size: 14px;
      color: #cf9a5c;
      letter-spacing: 0.88px;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.3;
    }
  `;
__decorateClass$o([
  n$1({ type: String })
], SkeuoScreen.prototype, "value", 2);
__decorateClass$o([
  n$1({ type: String })
], SkeuoScreen.prototype, "label", 2);
__decorateClass$o([
  n$1({ type: String })
], SkeuoScreen.prototype, "color", 2);
__decorateClass$o([
  n$1({ type: Number })
], SkeuoScreen.prototype, "width", 2);
__decorateClass$o([
  n$1({ type: Number })
], SkeuoScreen.prototype, "height", 2);
__decorateClass$o([
  n$1({ type: Number, attribute: "value-size" })
], SkeuoScreen.prototype, "valueSize", 2);
__decorateClass$o([
  n$1({ type: Boolean })
], SkeuoScreen.prototype, "bare", 2);
SkeuoScreen = __decorateClass$o([
  t$2("skeuo-screen")
], SkeuoScreen);
var __defProp$b = Object.defineProperty;
var __getOwnPropDesc$n = Object.getOwnPropertyDescriptor;
var __decorateClass$n = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$n(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$b(target, key, result);
  return result;
};
let SkeuoFader = class extends i$2 {
  constructor() {
    super(...arguments);
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.caption = "";
    this.gradient = "level";
    this.disabled = false;
    this.inactive = false;
    this.ariaLabelText = "";
  }
  get _shown() {
    return this._dragging ?? this.value;
  }
  render() {
    return b`
      <div class="col">
        <div class="row">
          <div class=${e({ strip: true, [this.gradient]: true })}></div>
          <div class="wrap">
            <input
              type="range"
              class="fader"
              .min=${String(this.min)}
              .max=${String(this.max)}
              .step=${String(this.step)}
              .value=${String(this._shown)}
              ?disabled=${this.disabled}
              aria-label=${this.ariaLabelText || this.caption}
              @input=${this._onInput}
              @change=${this._onChange}
            />
          </div>
        </div>
        ${this.caption ? b`<p class="caption">${this.caption}</p>` : A}
      </div>
    `;
  }
  /** Retour visuel immédiat, sans appel de service. */
  _onInput(ev) {
    this._dragging = Number(ev.target.value);
    this.dispatchEvent(
      new CustomEvent("fader-input", { detail: { value: this._dragging }, bubbles: true, composed: true })
    );
  }
  /**
   * Un seul appel de service, au relâchement. Piloter l'appareil à chaque
   * pixel de glissement noierait le bus d'événements et ferait clignoter
   * l'ampoule.
   */
  _onChange(ev) {
    const value = Number(ev.target.value);
    this._dragging = void 0;
    this.dispatchEvent(
      new CustomEvent("fader-change", { detail: { value }, bubbles: true, composed: true })
    );
  }
};
SkeuoFader.styles = i$5`
    :host {
      display: block;
      flex: none;
    }
    :host([disabled]) {
      /* Désaturation, pas d'opacity : un contrôle translucide laisse voir la
         façade au travers, ce qui casse l'illusion de matière. */
      filter: grayscale(1);
      pointer-events: none;
    }
    /* Inactif : seule la bande sémantique se décolore, le rail et le curseur
       gardent leur aspect normal pour qu'on voie qu'ils répondent encore. */
    :host([inactive]) .strip {
      filter: grayscale(1) brightness(0.75);
    }
    :host([inactive]) .caption {
      color: #5f6265;
    }
    .strip,
    .caption {
      transition: filter 0.25s ease, color 0.25s ease;
    }

    .col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .strip {
      width: 6px;
      height: 150px;
      border-radius: 3px;
      flex: none;
      box-shadow:
        inset 1px 1px 1px rgba(0, 0, 0, 0.3),
        inset -1px -1px 1px rgba(255, 255, 255, 0.15),
        1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    /* Le maximum du fader étant en haut, la valeur forte de chaque bande est
       en fin de dégradé. */
    .warmth {
      background: linear-gradient(to top, #a9d4ff 0%, #eef6ff 35%, #ffe9c7 55%, #ff9d42 100%);
    }
    .hue {
      background: linear-gradient(
        to top,
        #ff3b3b,
        #ffb23b,
        #f4e04d,
        #6bdc6b,
        #3bc7e0,
        #4d6bf4,
        #b23bf4,
        #ff3b9d
      );
    }
    .position {
      background: linear-gradient(to top, #3a3d41 0%, #5c6a75 35%, #9db8c9 70%, #cfe6f0 100%);
    }
    .airflow {
      background: linear-gradient(to top, #3a3d41 0%, #3ddc73 45%, #c9a23a 75%, #e0503a 100%);
    }
    .level {
      background: linear-gradient(to top, #3a3d41 0%, #6b6f74 45%, #b9bfc5 75%, #eef1f4 100%);
    }

    .wrap {
      position: relative;
      width: 30px;
      height: 150px;
      flex: none;
    }

    input[type="range"].fader {
      -webkit-appearance: none;
      appearance: none;
      width: 150px;
      height: 30px;
      background: transparent;
      position: absolute;
      left: 50%;
      top: 50%;
      margin: 0;
      transform: translate(-50%, -50%) rotate(-90deg);
      touch-action: none;
    }
    input[type="range"].fader:focus {
      outline: none;
    }
    input[type="range"].fader:focus-visible::-webkit-slider-thumb {
      box-shadow:
        -4px 4px 8px rgba(0, 0, 0, 0.6),
        0 0 0 2px var(--skeuo-accent, #e2a659);
    }

    input[type="range"].fader::-webkit-slider-runnable-track {
      width: 100%;
      height: 10px;
      cursor: ns-resize;
      background: #0a0a0a;
      border-radius: 5px;
      border: 1px solid #111;
      box-shadow:
        inset 2px 2px 4px rgba(0, 0, 0, 0.9),
        inset -1px -1px 1px rgba(255, 255, 255, 0.1);
    }
    input[type="range"].fader::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 34px;
      width: 20px;
      border-radius: 3px;
      cursor: ns-resize;
      margin-top: -12px;
      border: 1px solid #c4bc9f;
      background:
        linear-gradient(to right, transparent 46%, #111 46%, #111 54%, transparent 54%),
        linear-gradient(to bottom, #fdfbf7 0%, #e8e3d2 10%, #f5f0e1 50%, #dcd6c0 90%, #b8b096 100%);
      box-shadow:
        -4px 4px 8px rgba(0, 0, 0, 0.6),
        inset 0 2px 3px rgba(255, 255, 255, 0.9),
        inset 2px 0 3px rgba(255, 255, 255, 0.6),
        inset -2px 0 3px rgba(0, 0, 0, 0.1),
        inset 0 -3px 4px rgba(0, 0, 0, 0.3);
    }

    input[type="range"].fader::-moz-range-track {
      width: 100%;
      height: 10px;
      cursor: ns-resize;
      background: #0a0a0a;
      border-radius: 5px;
      box-shadow:
        inset 2px 2px 4px rgba(0, 0, 0, 0.9),
        inset -1px -1px 1px rgba(255, 255, 255, 0.1);
    }
    input[type="range"].fader::-moz-range-thumb {
      height: 34px;
      width: 20px;
      border-radius: 3px;
      cursor: ns-resize;
      border: 1px solid #c4bc9f;
      background:
        linear-gradient(to right, transparent 46%, #111 46%, #111 54%, transparent 54%),
        linear-gradient(to bottom, #fdfbf7 0%, #e8e3d2 10%, #f5f0e1 50%, #dcd6c0 90%, #b8b096 100%);
      box-shadow:
        -4px 4px 8px rgba(0, 0, 0, 0.6),
        inset 0 2px 3px rgba(255, 255, 255, 0.9),
        inset 0 -3px 4px rgba(0, 0, 0, 0.3);
    }

    .caption {
      margin: 0;
      font-size: 14px;
      letter-spacing: 2.1px;
      color: var(--skeuo-label, #85888b);
      text-transform: uppercase;
      white-space: nowrap;
    }
  `;
__decorateClass$n([
  n$1({ type: Number })
], SkeuoFader.prototype, "value", 2);
__decorateClass$n([
  n$1({ type: Number })
], SkeuoFader.prototype, "min", 2);
__decorateClass$n([
  n$1({ type: Number })
], SkeuoFader.prototype, "max", 2);
__decorateClass$n([
  n$1({ type: Number })
], SkeuoFader.prototype, "step", 2);
__decorateClass$n([
  n$1({ type: String })
], SkeuoFader.prototype, "caption", 2);
__decorateClass$n([
  n$1({ type: String })
], SkeuoFader.prototype, "gradient", 2);
__decorateClass$n([
  n$1({ type: Boolean, reflect: true })
], SkeuoFader.prototype, "disabled", 2);
__decorateClass$n([
  n$1({ type: Boolean, reflect: true })
], SkeuoFader.prototype, "inactive", 2);
__decorateClass$n([
  n$1({ type: String, attribute: "aria-label" })
], SkeuoFader.prototype, "ariaLabelText", 2);
__decorateClass$n([
  r()
], SkeuoFader.prototype, "_dragging", 2);
SkeuoFader = __decorateClass$n([
  t$2("skeuo-fader")
], SkeuoFader);
var __defProp$a = Object.defineProperty;
var __getOwnPropDesc$m = Object.getOwnPropertyDescriptor;
var __decorateClass$m = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$m(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$a(target, key, result);
  return result;
};
let SkeuoToggle = class extends i$2 {
  constructor() {
    super(...arguments);
    this.checked = false;
    this.disabled = false;
    this.caption = "";
    this.label = "";
  }
  render() {
    return b`
      <div class="stack" style=${o({ "--tgl-color": this.color ?? "var(--skeuo-accent, #e2a659)" })}>
        <button
          class="frame"
          role="switch"
          aria-checked=${this.checked ? "true" : "false"}
          aria-label=${this.label || this.caption}
          ?disabled=${this.disabled}
          @click=${this._onClick}
        >
          <span class="rocker">
            <span class="sym on">I</span>
            <span class="sym off">O</span>
          </span>
        </button>
        ${this.caption ? b`<div class="caption-slot"><p class="caption">${this.caption}</p></div>` : A}
      </div>
    `;
  }
  _onClick() {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent("toggle", { detail: { checked: !this.checked }, bubbles: true, composed: true })
    );
  }
};
SkeuoToggle.styles = i$5`
    :host {
      display: block;
      flex: none;
    }
    :host([disabled]) {
      /* Désaturation, pas d'opacity : un contrôle translucide laisse voir la
         façade au travers, ce qui casse l'illusion de matière. */
      filter: grayscale(1);
      pointer-events: none;
    }

    .stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .frame {
      display: block;
      width: 46px;
      height: 78px;
      padding: 4px;
      border: none;
      border-radius: 6px;
      background: #111;
      cursor: pointer;
      box-sizing: border-box;
      perspective: 200px;
      box-shadow:
        inset 4px 4px 8px rgba(0, 0, 0, 0.8),
        inset -2px -2px 4px rgba(255, 255, 255, 0.1),
        2px 2px 2px rgba(255, 255, 255, 0.05);
      transition: box-shadow 0.2s;
    }
    .frame:focus-visible {
      outline: 2px solid var(--skeuo-accent, #e2a659);
      outline-offset: 2px;
    }

    .rocker {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 9px 0;
      box-sizing: border-box;
      border-radius: 3px;
      overflow: hidden;
      transform-origin: center;
      transform: rotateX(-15deg);
      background: linear-gradient(to bottom, #2a2a2a 0%, #151515 100%);
      box-shadow:
        0 -6px 4px -3px rgba(0, 0, 0, 0.9),
        inset 0 -1px 2px rgba(255, 255, 255, 0.1),
        inset 0 1px 1px rgba(0, 0, 0, 0.5);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s;
    }

    .sym {
      position: relative;
      z-index: 2;
      font-size: 14px;
      font-weight: 700;
      color: #444;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.1), 0 -1px 1px rgba(0, 0, 0, 0.8);
      transition: color 0.2s, text-shadow 0.2s;
    }

    /* Basculé : la palette s'inverse et la façade s'éclaire par en dessous. */
    :host([checked]) .rocker {
      transform: rotateX(15deg);
      background: linear-gradient(to bottom, #1a1a1a 0%, #2a2a2a 100%);
      box-shadow:
        0 6px 4px -3px rgba(0, 0, 0, 0.9),
        inset 0 1px 2px rgba(255, 255, 255, 0.1),
        inset 0 -1px 1px rgba(0, 0, 0, 0.5);
    }
    :host([checked]) .rocker::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 1;
      background:
        radial-gradient(circle at 50% 30%, var(--tgl-color) 0%, transparent 60%),
        radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px);
      background-size: 100% 100%, 3px 3px;
      opacity: 0.85;
      mix-blend-mode: color-dodge;
    }
    :host([checked]) .frame {
      box-shadow:
        inset 4px 4px 8px rgba(0, 0, 0, 0.8),
        inset -2px -2px 4px rgba(255, 255, 255, 0.1),
        2px 2px 14px var(--tgl-color);
    }
    :host([checked]) .sym.on {
      color: #fff;
      text-shadow: 0 0 6px var(--tgl-color), 0 0 10px #fff;
    }

    /* La légende est plus large que l'interrupteur et change avec l'état
       (Allumé / Éteint). Laissée dans le flux, c'est elle qui fixerait la
       largeur du composant : au basculement, la largeur changeait et tout le
       contenu de la carte se décalait de quelques pixels. Le conteneur garde
       donc la largeur de l'interrupteur et la hauteur de la ligne, et le texte
       est centré par-dessus sans peser sur la mise en page. */
    .caption-slot {
      position: relative;
      width: 100%;
      height: 17px;
    }
    .caption {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      margin: 0;
      font-size: 14px;
      line-height: 17px;
      letter-spacing: 2.1px;
      color: var(--skeuo-label, #85888b);
      text-transform: uppercase;
      white-space: nowrap;
    }
  `;
__decorateClass$m([
  n$1({ type: Boolean, reflect: true })
], SkeuoToggle.prototype, "checked", 2);
__decorateClass$m([
  n$1({ type: Boolean, reflect: true })
], SkeuoToggle.prototype, "disabled", 2);
__decorateClass$m([
  n$1({ type: String })
], SkeuoToggle.prototype, "color", 2);
__decorateClass$m([
  n$1({ type: String })
], SkeuoToggle.prototype, "caption", 2);
__decorateClass$m([
  n$1({ type: String })
], SkeuoToggle.prototype, "label", 2);
SkeuoToggle = __decorateClass$m([
  t$2("skeuo-toggle")
], SkeuoToggle);
var __defProp$9 = Object.defineProperty;
var __getOwnPropDesc$l = Object.getOwnPropertyDescriptor;
var __decorateClass$l = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$l(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$9(target, key, result);
  return result;
};
const START_ANGLE = -135;
const SWEEP$1 = 270;
const TICK_COUNT = 25;
const clamp$3 = (v2, lo, hi) => Math.min(hi, Math.max(lo, v2));
let SkeuoKnob = class extends i$2 {
  constructor() {
    super(...arguments);
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.size = 200;
    this.disabled = false;
    this.label = "";
  }
  get _shown() {
    return clamp$3(this._dragging ?? this.value, this.min, this.max);
  }
  get _fraction() {
    const span = this.max - this.min;
    return span === 0 ? 0 : (this._shown - this.min) / span;
  }
  render() {
    const size = this.size;
    const angle = START_ANGLE + this._fraction * SWEEP$1;
    return b`
      <div
        class="wrap"
        style=${o({ width: `${size}px`, height: `${size}px` })}
        role="slider"
        tabindex=${this.disabled ? "-1" : "0"}
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-valuenow=${Math.round(this._shown)}
        aria-label=${this.label}
        @pointerdown=${this._onPointerDown}
        @keydown=${this._onKeyDown}
      >
        <svg class="ticks" viewBox="0 0 200 200" aria-hidden="true">
          ${this._renderTicks()}
        </svg>
        <div class="disc" style=${o({ transform: `rotate(${angle}deg)` })}>
          <span class="plate"></span>
          <span class="cap"></span>
          <span class="pointer"></span>
        </div>
      </div>
    `;
  }
  _renderTicks() {
    const out = [];
    for (let i4 = 0; i4 < TICK_COUNT; i4++) {
      const f2 = i4 / (TICK_COUNT - 1);
      const deg = START_ANGLE + f2 * SWEEP$1;
      const rad = (deg - 90) * Math.PI / 180;
      const major = i4 % 6 === 0;
      const r1 = major ? 84 : 88;
      const r2 = 96;
      const on = f2 <= this._fraction + 1e-4;
      out.push(w`<line
        x1=${(100 + Math.cos(rad) * r1).toFixed(2)}
        y1=${(100 + Math.sin(rad) * r1).toFixed(2)}
        x2=${(100 + Math.cos(rad) * r2).toFixed(2)}
        y2=${(100 + Math.sin(rad) * r2).toFixed(2)}
        stroke=${on ? "var(--skeuo-accent, #e2a659)" : "#4a4d50"}
        stroke-width=${major ? 3 : 1.8}
        stroke-linecap="round"
        opacity=${on ? "1" : "0.75"}
      />`);
    }
    return out;
  }
  /* ------------------------------------------------------------ pilotage */
  _onKeyDown(ev) {
    if (this.disabled) return;
    const step = ev.shiftKey ? 10 : 1;
    let next;
    if (ev.key === "ArrowUp" || ev.key === "ArrowRight") next = this._shown + step;
    else if (ev.key === "ArrowDown" || ev.key === "ArrowLeft") next = this._shown - step;
    else if (ev.key === "Home") next = this.min;
    else if (ev.key === "End") next = this.max;
    if (next === void 0) return;
    ev.preventDefault();
    this._commit(clamp$3(next, this.min, this.max));
  }
  _onPointerDown(ev) {
    if (this.disabled || ev.button !== 0) return;
    const wrap = ev.currentTarget;
    wrap.setPointerCapture(ev.pointerId);
    ev.preventDefault();
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const toValue = (e2) => {
      const deg = Math.atan2(e2.clientX - cx, cy - e2.clientY) * 180 / Math.PI;
      const clamped = clamp$3(deg, START_ANGLE, START_ANGLE + SWEEP$1);
      const f2 = (clamped - START_ANGLE) / SWEEP$1;
      return this.min + f2 * (this.max - this.min);
    };
    const move = (e2) => {
      this._dragging = toValue(e2);
      this.dispatchEvent(
        new CustomEvent("knob-input", {
          detail: { value: this._dragging },
          bubbles: true,
          composed: true
        })
      );
    };
    const up = (e2) => {
      wrap.removeEventListener("pointermove", move);
      wrap.removeEventListener("pointerup", up);
      wrap.removeEventListener("pointercancel", up);
      const final = this._dragging ?? toValue(e2);
      this._dragging = void 0;
      this._commit(final);
    };
    wrap.addEventListener("pointermove", move);
    wrap.addEventListener("pointerup", up);
    wrap.addEventListener("pointercancel", up);
  }
  /** Un seul appel de service, au relâchement. */
  _commit(value) {
    this.dispatchEvent(
      new CustomEvent("knob-change", {
        detail: { value: Math.round(value) },
        bubbles: true,
        composed: true
      })
    );
  }
};
SkeuoKnob.styles = i$5`
    :host {
      display: block;
      flex: none;
    }
    :host([disabled]) {
      /* Désaturation, pas d'opacity : un contrôle translucide laisse voir la
         façade au travers, ce qui casse l'illusion de matière. */
      filter: grayscale(1);
      pointer-events: none;
    }

    .wrap {
      position: relative;
      touch-action: none;
      cursor: grab;
      border-radius: 50%;
      outline: none;
    }
    .wrap:active {
      cursor: grabbing;
    }
    .wrap:focus-visible {
      box-shadow: 0 0 0 2px var(--skeuo-accent, #e2a659);
    }

    .ticks {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    /* Jupe moletée. Le moletage est un dégradé conique : ses secteurs
       convergent forcément au centre et y produisent une étoile de moiré, d'où
       les deux couches posées par-dessus (plateau puis chapeau) qui masquent
       exactement cette zone, comme sur une molette usinée réelle. */
    .disc {
      position: absolute;
      inset: 12%;
      border-radius: 50%;
      background-image:
        radial-gradient(circle at 33% 26%, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 46%),
        radial-gradient(circle at 74% 80%, rgba(0, 0, 0, 0.52) 0%, rgba(0, 0, 0, 0) 52%),
        repeating-conic-gradient(
          from 0deg,
          rgba(255, 255, 255, 0.14) 0deg 1.5deg,
          rgba(0, 0, 0, 0.16) 1.5deg 3deg
        ),
        radial-gradient(circle at 50% 50%, #8a8a8a 0%, #6f6f6f 62%, #4a4a4a 88%, #333333 100%);
      box-shadow:
        10px 10px 18px rgba(0, 0, 0, 0.6),
        3px 3px 6px rgba(0, 0, 0, 0.5),
        inset 0 2px 2px rgba(255, 255, 255, 0.35),
        inset 0 -3px 5px rgba(0, 0, 0, 0.6),
        inset 0 0 0 1px rgba(0, 0, 0, 0.4);
    }

    /* Plateau supérieur, en retrait de la jupe, brossé beaucoup plus finement. */
    .plate {
      position: absolute;
      inset: 13%;
      border-radius: 50%;
      background-image:
        radial-gradient(circle at 35% 27%, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0) 55%),
        repeating-conic-gradient(
          from 0.35deg,
          rgba(255, 255, 255, 0.05) 0deg 0.7deg,
          rgba(0, 0, 0, 0.05) 0.7deg 1.4deg
        ),
        radial-gradient(circle at 50% 50%, #9b9b9b 0%, #838383 68%, #616161 100%);
      box-shadow:
        inset 1px 1px 2px rgba(0, 0, 0, 0.5),
        inset -1px -1px 2px rgba(255, 255, 255, 0.22);
    }

    /* Chapeau central : sa seule fonction est de couvrir le point de
       convergence des deux dégradés coniques. */
    .cap {
      position: absolute;
      inset: 34%;
      border-radius: 50%;
      background-image:
        radial-gradient(circle at 36% 29%, #b4b4b4 0%, #8f8f8f 52%, #6d6d6d 100%);
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.45),
        inset 0 -1px 2px rgba(0, 0, 0, 0.45),
        1px 1px 3px rgba(0, 0, 0, 0.45);
    }

    .pointer {
      position: absolute;
      z-index: 2;
      top: 7%;
      left: 50%;
      transform: translateX(-50%);
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 25%, #ff6b5c, #a8261a 75%);
      box-shadow:
        0 0 5px #ff4433,
        0 0 2px rgba(0, 0, 0, 0.5),
        inset -1px -1px 1px rgba(0, 0, 0, 0.35),
        inset 1px 1px 1px rgba(255, 255, 255, 0.35);
    }
  `;
__decorateClass$l([
  n$1({ type: Number })
], SkeuoKnob.prototype, "value", 2);
__decorateClass$l([
  n$1({ type: Number })
], SkeuoKnob.prototype, "min", 2);
__decorateClass$l([
  n$1({ type: Number })
], SkeuoKnob.prototype, "max", 2);
__decorateClass$l([
  n$1({ type: Number })
], SkeuoKnob.prototype, "size", 2);
__decorateClass$l([
  n$1({ type: Boolean, reflect: true })
], SkeuoKnob.prototype, "disabled", 2);
__decorateClass$l([
  n$1({ type: String })
], SkeuoKnob.prototype, "label", 2);
__decorateClass$l([
  r()
], SkeuoKnob.prototype, "_dragging", 2);
SkeuoKnob = __decorateClass$l([
  t$2("skeuo-knob")
], SkeuoKnob);
var __getOwnPropDesc$k = Object.getOwnPropertyDescriptor;
var __decorateClass$k = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$k(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
const COLOR_MODES = ["hs", "xy", "rgb", "rgbw", "rgbww"];
const clamp255 = (v2) => Math.min(255, Math.max(0, Math.round(v2)));
const kelvinToRgb = (kelvin) => {
  const k2 = Math.min(4e4, Math.max(1e3, kelvin)) / 100;
  let r2;
  let g2;
  let b2;
  if (k2 <= 66) {
    r2 = 255;
    g2 = 99.4708025861 * Math.log(k2) - 161.1195681661;
    b2 = k2 <= 19 ? 0 : 138.5177312231 * Math.log(k2 - 10) - 305.0447927307;
  } else {
    r2 = 329.698727446 * Math.pow(k2 - 60, -0.1332047592);
    g2 = 288.1221695283 * Math.pow(k2 - 60, -0.0755148492);
    b2 = 255;
  }
  return [clamp255(r2), clamp255(g2), clamp255(b2)];
};
const hsToRgb = (hue, saturation) => {
  const h2 = (hue % 360 + 360) % 360;
  const s2 = Math.min(100, Math.max(0, saturation)) / 100;
  const c2 = s2;
  const x2 = c2 * (1 - Math.abs(h2 / 60 % 2 - 1));
  const m2 = 1 - c2;
  const seg = h2 < 60 ? [c2, x2, 0] : h2 < 120 ? [x2, c2, 0] : h2 < 180 ? [0, c2, x2] : h2 < 240 ? [0, x2, c2] : h2 < 300 ? [x2, 0, c2] : [c2, 0, x2];
  return [clamp255((seg[0] + m2) * 255), clamp255((seg[1] + m2) * 255), clamp255((seg[2] + m2) * 255)];
};
let SkeuoLightCard = class extends SkeuoBaseCard {
  constructor() {
    super(...arguments);
    this._brightness = new SmoothValue(this);
  }
  validateConfig(config) {
    this.expectDomain(config, "light");
  }
  willUpdate(changed) {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    if (stateObj) this._brightness.set(this._brightnessPct(stateObj));
  }
  isOff(stateObj) {
    return !isActive(stateObj);
  }
  static getConfigForm() {
    return {
      schema: [
        ...baseSchema(),
        {
          type: "grid",
          name: "",
          schema: [
            { name: "show_color_temp", selector: { boolean: {} } },
            { name: "show_color", selector: { boolean: {} } }
          ]
        }
      ],
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("light.")) {
          throw new Error(domainRequired("light"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("light.")) ?? entitiesFallback.find((e2) => e2.startsWith("light.")) ?? "light.living_room";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  /* --------------------------------------------------------- capacités */
  _colorModes(stateObj) {
    const modes = stateObj.attributes.supported_color_modes;
    return Array.isArray(modes) ? modes : [];
  }
  _supportsBrightness(stateObj) {
    return this._colorModes(stateObj).some((m2) => m2 !== "onoff");
  }
  _supportsColorTemp(stateObj) {
    if (this._config?.show_color_temp === false) return false;
    return this._colorModes(stateObj).includes("color_temp");
  }
  _supportsColor(stateObj) {
    if (this._config?.show_color === false) return false;
    return this._colorModes(stateObj).some((m2) => COLOR_MODES.includes(m2));
  }
  /**
   * Réglage aux commandes en ce moment.
   *
   * Une lampe ne peut pas être à la fois sur une température de blanc et sur
   * une couleur : Home Assistant bascule `color_mode` dès qu'on lui envoie
   * l'un ou l'autre. On lit donc cet attribut au lieu de retenir nous-mêmes le
   * dernier fader touché, ce qui garderait aussi la carte juste quand la
   * lumière est pilotée d'ailleurs (scène, autre tablette, automatisation).
   */
  _activeMode(stateObj) {
    const mode = stateObj.attributes.color_mode;
    if (mode === "color_temp") return "color_temp";
    if (mode && COLOR_MODES.includes(mode)) return "color";
    if (mode === void 0) {
      if (numericState(stateObj.attributes.color_temp_kelvin) !== void 0) return "color_temp";
      if (Array.isArray(stateObj.attributes.hs_color)) return "color";
    }
    return "none";
  }
  /* ------------------------------------------------------------ valeurs */
  _brightnessPct(stateObj) {
    const raw = numericState(stateObj.attributes.brightness);
    if (raw === void 0) return isActive(stateObj) ? 100 : 0;
    return Math.round(raw / 255 * 100);
  }
  get _minKelvin() {
    return numericState(this.stateObj?.attributes.min_color_temp_kelvin) ?? 2e3;
  }
  get _maxKelvin() {
    return numericState(this.stateObj?.attributes.max_color_temp_kelvin) ?? 6500;
  }
  /**
   * Le fader a son maximum en haut et la bande de couleur y place le chaud.
   * Or un blanc chaud correspond à une température de couleur basse : la
   * conversion est donc inversée, sinon le curseur monte vers le bleu.
   */
  _warmthFromKelvin(kelvin) {
    const span = this._maxKelvin - this._minKelvin;
    if (span <= 0) return 50;
    return Math.round((this._maxKelvin - kelvin) / span * 100);
  }
  _kelvinFromWarmth(warmth) {
    const span = this._maxKelvin - this._minKelvin;
    return Math.round(this._maxKelvin - warmth / 100 * span);
  }
  _currentWarmth(stateObj) {
    const k2 = numericState(stateObj.attributes.color_temp_kelvin);
    return k2 === void 0 ? 50 : this._warmthFromKelvin(k2);
  }
  _currentHue(stateObj) {
    const hs = stateObj.attributes.hs_color;
    if (!Array.isArray(hs) || hs.length < 1) return 0;
    return Math.round(hs[0] / 360 * 100);
  }
  /**
   * Couleur émise par l'ampoule, pour la lueur et le symbole de l'interrupteur.
   *
   * Elle suit le réglage aux commandes : blanc chaud ou froid quand la lampe
   * est sur sa température de couleur, teinte choisie quand elle est sur une
   * couleur. `rgb_color` reflète déjà ce mode quand l'intégration le fournit ;
   * sinon on le reconstruit depuis la grandeur du mode actif.
   */
  _lightColor(stateObj) {
    const rgb = stateObj.attributes.rgb_color;
    if (Array.isArray(rgb) && rgb.length >= 3) {
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
    const mode = this._activeMode(stateObj);
    if (mode === "color_temp") {
      const kelvin = numericState(stateObj.attributes.color_temp_kelvin);
      if (kelvin !== void 0) {
        const [r2, g2, b2] = kelvinToRgb(kelvin);
        return `rgb(${r2}, ${g2}, ${b2})`;
      }
    }
    if (mode === "color") {
      const hs = stateObj.attributes.hs_color;
      if (Array.isArray(hs) && hs.length >= 2) {
        const [r2, g2, b2] = hsToRgb(hs[0], hs[1]);
        return `rgb(${r2}, ${g2}, ${b2})`;
      }
    }
    return this.accent;
  }
  /* ------------------------------------------------------------- actions */
  /**
   * La molette est déjà sous le doigt à sa nouvelle position : on y cale la
   * valeur lissée sans animer, sinon elle reviendrait en arrière au
   * relâchement pour re-parcourir le trajet que l'utilisateur venait de faire.
   */
  _setBrightness(pct) {
    this._brightness.set(pct, true);
    if (pct <= 0) {
      this.callService("light", "turn_off");
      return;
    }
    this.callService("light", "turn_on", { brightness_pct: pct });
  }
  _setWarmth(warmth) {
    this.callService("light", "turn_on", { color_temp_kelvin: this._kelvinFromWarmth(warmth) });
  }
  _setHue(value, stateObj) {
    const hs = stateObj.attributes.hs_color;
    const saturation = Array.isArray(hs) && hs.length > 1 ? hs[1] : 100;
    this.callService("light", "turn_on", { hs_color: [value / 100 * 360, saturation] });
  }
  _toggle() {
    this.callService("light", "toggle");
  }
  /* --------------------------------------------------------------- rendu */
  renderContent(stateObj) {
    const off = isUnavailable(stateObj);
    const on = isActive(stateObj);
    const dimmable = this._supportsBrightness(stateObj);
    const mode = this._activeMode(stateObj);
    const brightness = this._brightness.value;
    return b`
      ${dimmable ? b`
            <skeuo-knob
              .value=${brightness}
              .size=${170}
              .disabled=${off}
              .label=${tHa(this.hass, "ui.card.light.brightness", "brightness")}
              @knob-change=${(e2) => this._setBrightness(e2.detail.value)}
            ></skeuo-knob>
          ` : A}
      ${this._supportsColorTemp(stateObj) ? b`
            <skeuo-fader
              gradient="warmth"
              .value=${this._currentWarmth(stateObj)}
              .caption=${t(this.hass, "color_temp")}
              .disabled=${off || !on}
              .inactive=${mode !== "color_temp"}
              @fader-change=${(e2) => this._setWarmth(e2.detail.value)}
            ></skeuo-fader>
          ` : A}
      ${this._supportsColor(stateObj) ? b`
            <skeuo-fader
              gradient="hue"
              .value=${this._currentHue(stateObj)}
              .caption=${t(this.hass, "color")}
              .disabled=${off || !on}
              .inactive=${mode !== "color"}
              @fader-change=${(e2) => this._setHue(e2.detail.value, stateObj)}
            ></skeuo-fader>
          ` : A}

      <skeuo-screen
        .value=${dimmable ? `${Math.round(brightness)}%` : on ? t(this.hass, "on") : t(this.hass, "off")}
        .label=${dimmable ? tHa(this.hass, "ui.card.light.brightness", "brightness") : stateObj.attributes.friendly_name ?? ""}
        .color=${on ? this.accent : "#6b5a44"}
      ></skeuo-screen>

      <skeuo-toggle
        .checked=${on}
        .disabled=${off}
        .color=${this._lightColor(stateObj)}
        .caption=${on ? t(this.hass, "on") : t(this.hass, "off")}
        .label=${tHa(this.hass, "ui.card.common.turn_on", "on")}
        @toggle=${this._toggle}
      ></skeuo-toggle>
    `;
  }
};
SkeuoLightCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      .body {
        gap: 4px;
      }
    `
];
SkeuoLightCard = __decorateClass$k([
  t$2("skeuo-light-card")
], SkeuoLightCard);
registerCard({
  type: "skeuo-light-card",
  name: { fr: "Skeuo · Lumière", en: "Skeuo · Light" },
  description: {
    fr: "Variateur à molette métal, faders teinte et couleur, interrupteur à bascule.",
    en: "Machined metal dimmer knob, warmth and colour faders, rocker switch."
  },
  preview: true
});
const box = (inner, size = 16) => w`<svg width=${size} height=${size} viewBox="0 0 16 16">${inner}</svg>`;
const iconPower = () => box(w`
    <path fill="none" stroke="currentColor" d="M11.44 4.08 A6 6 0 1 1 4.56 4.08" stroke-width="1.6" stroke-linecap="round"/>
    <line stroke="currentColor" x1="8" y1="1" x2="8" y2="7" stroke-width="1.6" stroke-linecap="round"/>
  `);
const iconPlus = () => box(w`<rect x="3" y="7" width="10" height="2"/><rect x="7" y="3" width="2" height="10"/>`);
const iconMinus = () => box(w`<rect x="3" y="7" width="10" height="2"/>`);
const iconUp = () => box(w`<polygon points="8,3 13,11 3,11"/>`);
const iconDown = () => box(w`<polygon points="3,5 13,5 8,13"/>`);
const iconStop = () => box(w`<rect x="3" y="3" width="10" height="10" rx="1"/>`, 14);
const iconFlame = () => box(w`
    <path d="M8 2 C6 4 4.5 6.5 4.5 9 C4.5 11.5 6 13.5 8 13.5 C10 13.5 11.5 11.5 11.5 9
             C11.5 7.5 10.8 6.5 10 6 C10.2 7 9.5 7.5 9 7 C9.3 5 8.5 3.5 8 2 Z"/>
  `);
const iconSnowflake = () => box(w`
    <line fill="none" stroke="currentColor" x1="8" y1="2" x2="8" y2="14" stroke-width="1.4" stroke-linecap="round"/>
    <line fill="none" stroke="currentColor" x1="2.8" y1="5" x2="13.2" y2="11" stroke-width="1.4" stroke-linecap="round"/>
    <line fill="none" stroke="currentColor" x1="13.2" y1="5" x2="2.8" y2="11" stroke-width="1.4" stroke-linecap="round"/>
  `);
const iconFan = () => box(w`
    <ellipse cx="8" cy="4.3" rx="1.6" ry="3"/>
    <ellipse cx="8" cy="4.3" rx="1.6" ry="3" transform="rotate(120 8 8)"/>
    <ellipse cx="8" cy="4.3" rx="1.6" ry="3" transform="rotate(240 8 8)"/>
    <circle cx="8" cy="8" r="1.3"/>
  `);
const iconAuto = () => box(w`<text x="8" y="12" font-size="11" font-weight="700" text-anchor="middle">A</text>`);
const iconDroplet = () => box(w`<ellipse cx="8" cy="8" rx="3" ry="6" transform="rotate(45 8 8)"/>`);
const iconLock = () => box(w`
    <rect x="4" y="8" width="8" height="6" rx="1"/>
    <path fill="none" stroke="currentColor" d="M6 8 V6 a2 2 0 0 1 4 0 V8" stroke-width="1.6"/>
  `);
const iconUnlock = () => box(w`
    <rect x="4" y="8" width="8" height="6" rx="1"/>
    <path fill="none" stroke="currentColor" d="M6 8 V6 a2 2 0 0 1 4 0" stroke-width="1.6"/>
  `);
const iconLatch = () => box(w`
    <rect fill="none" stroke="currentColor" x="3" y="2" width="9" height="12" rx="1" stroke-width="1.3"/>
    <circle cx="10" cy="8" r="1"/>
  `);
const iconHome = () => box(w`<path d="M8 2 L14 7 L14 13 L10 13 L10 9 L6 9 L6 13 L2 13 L2 7 Z"/>`);
const iconAway = () => box(w`
    <rect fill="none" stroke="currentColor" x="2" y="3" width="8" height="10" rx="1" stroke-width="1.3"/>
    <path fill="none" stroke="currentColor" d="M10 8 H14 M14 8 L11.5 5.5 M14 8 L11.5 10.5" stroke-width="1.3" stroke-linecap="round"/>
  `);
const iconMoon = () => box(w`<path d="M14 8.53 A6 6 0 1 1 7.47 2 A4.67 4.67 0 0 0 14 8.53 Z"/>`);
const iconShieldOff = () => box(w`
    <path fill="none" stroke="currentColor" d="M8 2 L13 4 V8 C13 11 10.5 13 8 14 C5.5 13 3 11 3 8 V4 Z" stroke-width="1.3"/>
    <path fill="none" stroke="currentColor" d="M4 4 L12 12" stroke-width="1.3" stroke-linecap="round"/>
  `);
const iconOscillate = () => box(w`
    <path fill="none" stroke="currentColor" d="M3 8 H13 M3 8 L6 5 M3 8 L6 11 M13 8 L10 5 M13 8 L10 11"
          stroke-width="1.4" stroke-linecap="round"/>
  `);
const iconRotate = () => box(w`
    <path fill="none" stroke="currentColor" d="M12.5 8 A4.5 4.5 0 1 1 8 3.5" stroke-width="1.4"/>
    <polygon points="8,1.5 8,5.5 11,3.5"/>
  `);
const iconPlay = () => box(w`<polygon points="4.5,2.5 13.5,8 4.5,13.5"/>`);
const iconPause = () => box(w`<rect x="4" y="3" width="3.2" height="10"/><rect x="8.8" y="3" width="3.2" height="10"/>`);
const iconDock = () => box(w`
    <circle fill="none" stroke="currentColor" cx="8" cy="8" r="5" stroke-width="1.3"/>
    <circle cx="8" cy="8" r="1.5"/>
  `);
const iconPrev = () => box(w`<polygon points="14,2 5,8 14,14"/><rect x="2" y="2" width="2.4" height="12" rx="0.6"/>`);
const iconNext = () => box(w`<polygon points="2,2 11,8 2,14"/><rect x="11.6" y="2" width="2.4" height="12" rx="0.6"/>`);
const iconCamera = () => box(w`
    <rect fill="none" stroke="currentColor" x="2" y="5" width="12" height="8" rx="1.5" stroke-width="1.3"/>
    <rect fill="none" stroke="currentColor" x="5.5" y="3" width="5" height="2.5" rx="0.5" stroke-width="1.3"/>
    <circle fill="none" stroke="currentColor" cx="8" cy="9" r="2.3" stroke-width="1.3"/>
  `);
const iconMotion = () => box(w`
    <path fill="none" stroke="currentColor" stroke-width="1.3"
          d="M1.5 8 C3 4.5 6 3 8 3 C10 3 13 4.5 14.5 8 C13 11.5 10 13 8 13 C6 13 3 11.5 1.5 8 Z"/>
    <circle cx="8" cy="8" r="2"/>
  `);
const iconRecord = () => box(w`
    <circle fill="none" stroke="currentColor" cx="8" cy="8" r="6" stroke-width="1.3"/>
    <circle cx="8" cy="8" r="3"/>
  `);
var __defProp$8 = Object.defineProperty;
var __getOwnPropDesc$j = Object.getOwnPropertyDescriptor;
var __decorateClass$j = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$j(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$8(target, key, result);
  return result;
};
let SkeuoButton = class extends i$2 {
  constructor() {
    super(...arguments);
    this.active = false;
    this.disabled = false;
    this.primary = false;
    this.variant = "default";
    this.caption = "";
    this.label = "";
  }
  render() {
    return b`
      <div class="stack">
        <div class=${e({ wrap: true, primary: this.primary })}>
          <button
            class=${e({
      cap: true,
      on: this.active,
      [this.variant]: true
    })}
            ?disabled=${this.disabled}
            aria-pressed=${this.active ? "true" : "false"}
            aria-label=${this.label || this.caption}
            @click=${this._onClick}
          >
            <span class="icon"><slot></slot></span>
            <span class="led"></span>
          </button>
        </div>
        ${this.caption ? b`<div class="caption-slot"><p class="caption">${this.caption}</p></div>` : A}
      </div>
    `;
  }
  _onClick() {
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent("press", { bubbles: true, composed: true }));
  }
};
SkeuoButton.styles = i$5`
    :host {
      display: block;
      flex: none;
    }
    :host([disabled]) {
      /* Désaturation, pas d'opacity : un contrôle translucide laisse voir la
         façade au travers, ce qui casse l'illusion de matière. */
      filter: grayscale(1);
      pointer-events: none;
    }

    .stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    /* Logement creusé dans la façade : sombre en haut-gauche, reflet en bas-droite. */
    .wrap {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: #141414;
      padding: 4px;
      box-sizing: border-box;
      box-shadow:
        inset 2px 2px 5px rgba(0, 0, 0, 0.85),
        inset -1px -1px 2px rgba(255, 255, 255, 0.05);
    }
    .wrap.primary {
      width: 58px;
      height: 58px;
    }

    .cap {
      position: relative;
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 6px;
      padding: 0;
      cursor: pointer;
      display: block;
      font: inherit;
      color: inherit;
      -webkit-tap-highlight-color: transparent;
      background: linear-gradient(to bottom, #cfcfcf 0%, #b0b0b0 45%, #999999 65%, #868686 100%);
      box-shadow:
        0 3px 5px rgba(0, 0, 0, 0.5),
        inset 0 1px 1px rgba(255, 255, 255, 0.45),
        inset 0 -2px 3px rgba(0, 0, 0, 0.25),
        inset 0 0 0 1px rgba(0, 0, 0, 0.18);
      transition: background 0.1s ease-out, box-shadow 0.1s ease-out;
    }
    .cap:focus-visible {
      outline: 2px solid var(--skeuo-accent, #e2a659);
      outline-offset: 2px;
    }

    /* Enfoncé : le capuchon plonge, la lumière ne l'atteint plus. */
    .cap:active {
      background: linear-gradient(to bottom, #3c3c3c 0%, #2a2a2a 45%, #1f1f1f 65%, #161616 100%);
      box-shadow:
        inset 0 2px 5px rgba(0, 0, 0, 0.85),
        inset 0 -1px 1px rgba(255, 255, 255, 0.06),
        inset 0 0 0 1px rgba(0, 0, 0, 0.3);
    }
    .cap.on {
      background: linear-gradient(to bottom, #4a2c2c 0%, #341c1c 45%, #241313 65%, #180d0d 100%);
      box-shadow:
        inset 0 2px 5px rgba(0, 0, 0, 0.85),
        inset 0 -1px 1px rgba(255, 255, 255, 0.05),
        inset 0 0 0 1px rgba(0, 0, 0, 0.3);
    }
    .cap.on.secure {
      background: linear-gradient(to bottom, #2c4a30 0%, #1c341f 45%, #132412 65%, #0d180e 100%);
    }
    .cap.on.alert {
      background: linear-gradient(to bottom, #4a3a2c 0%, #34281c 45%, #241a13 65%, #18110d 100%);
    }

    .icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
      line-height: 0;
    }
    /* Les icônes sont des SVG passés en slot. On pilote color : les tracés
       pleins héritent via fill: currentColor, les tracés au trait via leur
       stroke="currentColor". Une seule variable pour les deux, l'état actif
       n'a donc pas à être répercuté dans chaque carte. */
    .icon ::slotted(svg) {
      display: block;
      color: #3a3a3a;
      fill: currentColor;
      transition: color 0.1s;
    }
    .cap:active .icon ::slotted(svg) {
      color: #cfcfcf;
    }
    .cap.on .icon ::slotted(svg) {
      color: #e8d4d4;
    }
    .cap.on.secure .icon ::slotted(svg) {
      color: #d4e8d4;
    }

    .led {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #8f8f8f;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.4);
    }
    .cap:active .led {
      background: #e8b23b;
      box-shadow: 0 0 5px #e8b23b, 0 0 2px #ffdb99;
    }
    .cap.on .led {
      background: #ff4d4d;
      box-shadow: 0 0 6px #ff4d4d, 0 0 3px #ff9d9d;
    }
    .cap.on.secure .led {
      background: #4dff6a;
      box-shadow: 0 0 6px #4dff6a, 0 0 3px #9dff9d;
    }
    .cap.on.alert .led {
      background: #ff6b5c;
      box-shadow: 0 0 6px #ff6b5c, 0 0 3px #ffb0a6;
    }

    /* Même principe que sur l'interrupteur : la légende est souvent plus large
       que le bouton, et une carte qui la ferait changer en cours de route
       ferait varier la largeur du composant, donc glisser tout le contenu
       autour. Le conteneur garde la largeur du bouton et la hauteur de la
       ligne, le texte déborde symétriquement par-dessus. */
    .caption-slot {
      position: relative;
      width: 100%;
      height: 17px;
    }
    .caption {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      margin: 0;
      font-size: 14px;
      line-height: 17px;
      letter-spacing: 2.1px;
      color: var(--skeuo-label, #85888b);
      text-transform: uppercase;
      white-space: nowrap;
      text-align: center;
    }
  `;
__decorateClass$j([
  n$1({ type: Boolean, reflect: true })
], SkeuoButton.prototype, "active", 2);
__decorateClass$j([
  n$1({ type: Boolean, reflect: true })
], SkeuoButton.prototype, "disabled", 2);
__decorateClass$j([
  n$1({ type: Boolean })
], SkeuoButton.prototype, "primary", 2);
__decorateClass$j([
  n$1({ type: String })
], SkeuoButton.prototype, "variant", 2);
__decorateClass$j([
  n$1({ type: String })
], SkeuoButton.prototype, "caption", 2);
__decorateClass$j([
  n$1({ type: String })
], SkeuoButton.prototype, "label", 2);
SkeuoButton = __decorateClass$j([
  t$2("skeuo-button")
], SkeuoButton);
var __defProp$7 = Object.defineProperty;
var __getOwnPropDesc$i = Object.getOwnPropertyDescriptor;
var __decorateClass$i = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$i(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$7(target, key, result);
  return result;
};
const START = -135;
const SWEEP = 270;
const R_TRACK = 100;
const R_TICK_IN = 108;
const R_TICK_OUT = 118;
const R_EDGE = 100;
const EDGE_ANGLE = 158;
const VIEW = 260;
const clamp$2 = (v2, lo, hi) => Math.min(hi, Math.max(lo, v2));
const polar$1 = (deg, r2) => {
  const rad = (deg - 90) * Math.PI / 180;
  return [VIEW / 2 + Math.cos(rad) * r2, VIEW / 2 + Math.sin(rad) * r2];
};
let SkeuoDial = class extends i$2 {
  constructor() {
    super(...arguments);
    this.value = 0;
    this.min = 7;
    this.max = 35;
    this.size = 200;
    this.dimmed = false;
  }
  get _fraction() {
    const span = this.max - this.min;
    if (span === 0) return 0;
    return clamp$2((this.value - this.min) / span, 0, 1);
  }
  render() {
    const accent = this.color ?? "var(--skeuo-accent, #e2a659)";
    const deg = START + this._fraction * SWEEP;
    const [px, py] = polar$1(deg, R_TRACK);
    const [sx, sy] = polar$1(START, R_TRACK);
    const large = this._fraction * SWEEP > 180 ? 1 : 0;
    const arc = `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${R_TRACK} ${R_TRACK} 0 ${large} 1 ${px.toFixed(2)} ${py.toFixed(2)}`;
    const [minX, minY] = polar$1(-EDGE_ANGLE, R_EDGE);
    const [maxX, maxY] = polar$1(EDGE_ANGLE, R_EDGE);
    const track = `M ${polar$1(START, R_TRACK)[0].toFixed(2)} ${polar$1(START, R_TRACK)[1].toFixed(2)} A ${R_TRACK} ${R_TRACK} 0 1 1 ${polar$1(START + SWEEP, R_TRACK)[0].toFixed(2)} ${polar$1(START + SWEEP, R_TRACK)[1].toFixed(2)}`;
    return b`
      <div
        class="wrap"
        style=${o({
      width: `${this.size}px`,
      height: `${this.size}px`,
      filter: this.dimmed ? "grayscale(1)" : "none"
    })}
      >
        <svg viewBox="0 0 ${VIEW} ${VIEW}" aria-hidden="true">
          <path d=${track} fill="none" stroke="#4a4d52" stroke-width="10" stroke-linecap="round" />
          ${this._renderTicks()}
          ${this._fraction > 1e-3 ? w`<path d=${arc} fill="none" stroke=${accent} stroke-width="6" stroke-linecap="round"
                        style="filter: drop-shadow(0 0 5px ${accent})"/>` : null}
          <circle
            cx=${px.toFixed(2)}
            cy=${py.toFixed(2)}
            r="5"
            fill=${accent}
            style="filter: drop-shadow(0 0 4px ${accent})"
          />
          <text x=${minX.toFixed(1)} y=${(minY + 4).toFixed(1)} text-anchor="middle" class="edge">
            ${Math.round(this.min)}°
          </text>
          <text x=${maxX.toFixed(1)} y=${(maxY + 4).toFixed(1)} text-anchor="middle" class="edge">
            ${Math.round(this.max)}°
          </text>
        </svg>
        <div class="lcd"><slot></slot></div>
      </div>
    `;
  }
  _renderTicks() {
    const out = [];
    const count = 23;
    for (let i4 = 0; i4 < count; i4++) {
      const f2 = i4 / (count - 1);
      const deg = START + f2 * SWEEP;
      const major = i4 % 11 === 0;
      const [x1, y1] = polar$1(deg, R_TICK_OUT);
      const [x2, y22] = polar$1(deg, major ? R_TICK_IN : R_TICK_IN + 5);
      out.push(w`<line
        x1=${x1.toFixed(2)} y1=${y1.toFixed(2)} x2=${x2.toFixed(2)} y2=${y22.toFixed(2)}
        stroke="#8b8e91" stroke-width=${major ? 2.6 : 1.6} stroke-linecap="round" opacity="0.7"
      />`);
    }
    return out;
  }
};
SkeuoDial.styles = i$5`
    :host {
      display: block;
      flex: none;
    }
    .wrap {
      position: relative;
      transition: filter 0.2s;
    }
    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .edge {
      font-family: var(--skeuo-font-lcd);
      font-size: 13px;
      fill: #8b8e91;
    }

    /* Écran circulaire encastré : creux sombre en haut-gauche, reflet en
       bas-droite, ombre portée vers le bas-droite. */
    .lcd {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 58%;
      height: 58%;
      border-radius: 50%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at 50% 35%, #241a10, #140d07 75%);
      box-shadow:
        inset 4.5px 4.5px 3.4px rgba(0, 0, 0, 0.9),
        inset 3.4px 3.4px 7.9px rgba(0, 0, 0, 0.85),
        inset -1.7px -1.7px 1.7px rgba(255, 255, 255, 0.05),
        0 0 0 3.4px #100b06,
        3.4px 3.4px 6.7px rgba(0, 0, 0, 0.55);
    }
  `;
__decorateClass$i([
  n$1({ type: Number })
], SkeuoDial.prototype, "value", 2);
__decorateClass$i([
  n$1({ type: Number })
], SkeuoDial.prototype, "min", 2);
__decorateClass$i([
  n$1({ type: Number })
], SkeuoDial.prototype, "max", 2);
__decorateClass$i([
  n$1({ type: Number })
], SkeuoDial.prototype, "size", 2);
__decorateClass$i([
  n$1({ type: String })
], SkeuoDial.prototype, "color", 2);
__decorateClass$i([
  n$1({ type: Boolean })
], SkeuoDial.prototype, "dimmed", 2);
SkeuoDial = __decorateClass$i([
  t$2("skeuo-dial")
], SkeuoDial);
var __getOwnPropDesc$h = Object.getOwnPropertyDescriptor;
var __decorateClass$h = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$h(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
const MODE_ICONS$1 = {
  heat: iconFlame,
  cool: iconSnowflake,
  fan_only: iconFan,
  auto: iconAuto,
  heat_cool: iconAuto,
  dry: iconDroplet
};
const ACTION_COLORS = {
  heating: "#e2762f",
  cooling: "#4aa8e0",
  drying: "#c9a23a",
  fan: "#7fb98a"
};
let SkeuoClimateCard = class extends SkeuoBaseCard {
  constructor() {
    super(...arguments);
    this._setpoint = new SmoothValue(this, {
      epsilon: 0.02,
      minDuration: 260,
      maxDuration: 700,
      msPerUnit: 26
    });
  }
  validateConfig(config) {
    this.expectDomain(config, "climate");
  }
  willUpdate(changed) {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    const target = stateObj ? this._target(stateObj) : void 0;
    if (target !== void 0) this._setpoint.set(target);
  }
  isOff(stateObj) {
    return stateObj.state === "off";
  }
  static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("climate.")) {
          throw new Error(domainRequired("climate"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("climate.")) ?? entitiesFallback.find((e2) => e2.startsWith("climate.")) ?? "climate.thermostat";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  /* ------------------------------------------------------------ valeurs */
  _modes(stateObj) {
    const declared = this._config?.modes;
    const available = stateObj.attributes.hvac_modes ?? [];
    const list = declared ?? available.filter((m2) => m2 !== "off");
    return list.slice(0, 4);
  }
  _step(stateObj) {
    return numericState(stateObj.attributes.target_temp_step) ?? 0.5;
  }
  _target(stateObj) {
    return numericState(stateObj.attributes.temperature);
  }
  get _unit() {
    return this.hass?.config?.unit_system?.temperature ?? "°C";
  }
  /**
   * On garde la précision d'affichage de l'entité pendant le glissement : une
   * consigne au demi-degré ne doit pas se mettre à afficher des décimales
   * parasites en cours de route.
   */
  _formatSetpoint() {
    const step = this._step(this.stateObj);
    const decimals = step < 1 ? 1 : 0;
    return this._setpoint.value.toFixed(decimals);
  }
  _actionColor(stateObj) {
    const action = stateObj.attributes.hvac_action;
    return (action && ACTION_COLORS[action]) ?? this.accent;
  }
  /* ------------------------------------------------------------- actions */
  _setMode(mode) {
    this.callService("climate", "set_hvac_mode", { hvac_mode: mode });
  }
  _togglePower(stateObj) {
    if (stateObj.state === "off") {
      const fallback = this._modes(stateObj)[0] ?? "auto";
      this.callService("climate", "set_hvac_mode", { hvac_mode: fallback });
    } else {
      this.callService("climate", "set_hvac_mode", { hvac_mode: "off" });
    }
  }
  _nudge(stateObj, direction) {
    const current = this._target(stateObj);
    if (current === void 0) return;
    const min = numericState(stateObj.attributes.min_temp) ?? 7;
    const max = numericState(stateObj.attributes.max_temp) ?? 35;
    const next = Math.min(max, Math.max(min, current + direction * this._step(stateObj)));
    this.callService("climate", "set_temperature", { temperature: Number(next.toFixed(1)) });
  }
  /* --------------------------------------------------------------- rendu */
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const isOff = stateObj.state === "off";
    const target = this._target(stateObj);
    const current = numericState(stateObj.attributes.current_temperature);
    const color = isOff ? "#6b5a44" : this._actionColor(stateObj);
    const action = stateObj.attributes.hvac_action;
    const stateLabel = tHa(
      this.hass,
      `component.climate.entity_component._.state.${stateObj.state}`,
      stateObj.state
    );
    const actionLabel = action ? tHa(this.hass, `component.climate.entity_component._.state_attributes.hvac_action.state.${action}`, action) : void 0;
    return b`
      <div class="col left">
        <div class="modes">
          ${this._modes(stateObj).map((mode) => {
      const icon = MODE_ICONS$1[mode] ?? iconAuto;
      return b`
              <skeuo-button
                .active=${stateObj.state === mode}
                .disabled=${dead}
                .caption=${t(this.hass, mode)}
                .label=${tHa(this.hass, `component.climate.entity_component._.state.${mode}`, mode)}
                @press=${() => this._setMode(mode)}
                >${icon()}</skeuo-button
              >
            `;
    })}
        </div>
        <skeuo-screen
          .width=${222}
          .height=${112}
          .valueSize=${26}
          .value=${target !== void 0 ? `${this._formatSetpoint()}${this._unit}` : "—"}
          .label=${`${t(this.hass, "setpoint")} · ${actionLabel ?? stateLabel}`}
          .color=${color}
        ></skeuo-screen>
      </div>

      <skeuo-dial
        .size=${202}
        .value=${target !== void 0 ? this._setpoint.value : 0}
        .min=${numericState(stateObj.attributes.min_temp) ?? 7}
        .max=${numericState(stateObj.attributes.max_temp) ?? 35}
        .color=${color}
        .dimmed=${isOff || dead}
      >
        <p class="dial-value" style="color:${color}">
          ${current !== void 0 ? `${Math.round(current)}°` : "—"}
        </p>
        <p class="dial-label">${t(this.hass, "current")}</p>
      </skeuo-dial>

      <div class="col right">
        <skeuo-button
          .active=${!isOff}
          .disabled=${dead}
          .caption=${t(this.hass, "power")}
          @press=${() => this._togglePower(stateObj)}
          >${iconPower()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || isOff || target === void 0}
          .caption=${t(this.hass, "increase")}
          @press=${() => this._nudge(stateObj, 1)}
          >${iconPlus()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || isOff || target === void 0}
          .caption=${t(this.hass, "decrease")}
          @press=${() => this._nudge(stateObj, -1)}
          >${iconMinus()}</skeuo-button
        >
      </div>
      ${A}
    `;
  }
};
SkeuoClimateCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      .col {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .left {
        gap: 8px;
      }
      /* Le corps déborde volontairement des marges du module pour occuper toute
         la largeur ; on lui rend une marge symétrique ici. Elle sert à deux
         choses : garder la légende « Diminuer » à l'écart de la vis d'angle
         bas-droite, et surtout laisser la répartition jouer sur des couloirs de
         la largeur réelle des boutons. Élargir le seul couloir de droite, comme
         je l'avais fait, ajoute un vide invisible à sa gauche : les écarts
         optiques de part et d'autre du cadran cessent d'être égaux et le cadran
         paraît décalé. */
      .body {
        padding: 0 24px;
      }
      .right {
        gap: 2px;
      }
      .modes {
        display: flex;
        gap: 10px;
      }

      .dial-value {
        margin: 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 36px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.5px;
        text-shadow: 0 0 8px currentColor;
      }
      .dial-label {
        margin: 7px 0 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 14px;
        color: #cf9a5c;
        letter-spacing: 0.9px;
        text-transform: uppercase;
      }
    `
];
SkeuoClimateCard = __decorateClass$h([
  t$2("skeuo-climate-card")
], SkeuoClimateCard);
registerCard({
  type: "skeuo-climate-card",
  name: { fr: "Skeuo · Climatisation", en: "Skeuo · Climate" },
  description: {
    fr: "Thermostat à cadran gradué, écran de consigne et boutons de mode.",
    en: "Graduated dial thermostat, setpoint screen and mode buttons."
  },
  preview: true
});
var __getOwnPropDesc$g = Object.getOwnPropertyDescriptor;
var __decorateClass$g = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$g(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
const SUPPORT_OPEN$1 = 1;
const SUPPORT_CLOSE = 2;
const SUPPORT_SET_POSITION = 4;
const SUPPORT_STOP$1 = 8;
let SkeuoCoverCard = class extends SkeuoBaseCard {
  constructor() {
    super(...arguments);
    this._shown = new SmoothValue(this);
  }
  validateConfig(config) {
    this.expectDomain(config, "cover");
  }
  /**
   * On vise la nouvelle position avant le rendu plutôt que pendant : déclencher
   * une animation depuis `render()` relancerait un rendu à chaque image, donc
   * une boucle.
   */
  willUpdate(changed) {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    if (stateObj) this._shown.set(this._position(stateObj));
  }
  static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("cover.")) {
          throw new Error(domainRequired("cover"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("cover.")) ?? entitiesFallback.find((e2) => e2.startsWith("cover.")) ?? "cover.living_room";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  _supports(stateObj, bit) {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    return (features & bit) !== 0;
  }
  /**
   * Le curseur suit déjà le doigt : on cale la valeur lissée dessus sans
   * animer, sinon il repartirait en arrière au relâchement pour re-glisser
   * jusqu'où l'utilisateur l'avait déjà amené.
   */
  _onFaderChange(ev) {
    this._shown.set(ev.detail.value, true);
    this.callService("cover", "set_cover_position", { position: ev.detail.value });
  }
  /**
   * current_position peut manquer sur un volet qui ne sait pas se
   * positionner : on retombe alors sur l'état ouvert / fermé.
   */
  _position(stateObj) {
    const pos = numericState(stateObj.attributes.current_position);
    if (pos !== void 0) return Math.round(pos);
    return stateObj.state === "open" || stateObj.state === "opening" ? 100 : 0;
  }
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const positionable = this._supports(stateObj, SUPPORT_SET_POSITION);
    const moving = stateObj.state === "opening" || stateObj.state === "closing";
    const shown = this._shown.value;
    return b`
      ${positionable ? b`
            <skeuo-fader
              gradient="position"
              .value=${shown}
              .caption=${t(this.hass, "position")}
              .disabled=${dead}
              .label=${tHa(this.hass, "ui.card.cover.position", "position")}
              @fader-change=${this._onFaderChange}
            ></skeuo-fader>
          ` : A}

      <skeuo-screen
        .value=${positionable ? `${Math.round(shown)}%` : formatState(this.hass, stateObj)}
        .label=${positionable ? t(this.hass, "opening") : formatState(this.hass, stateObj)}
        .valueSize=${positionable ? 44.1 : 30}
        .color=${moving ? "#9db8c9" : this.accent}
      ></skeuo-screen>

      <div class="btn-col">
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_OPEN$1)}
          .active=${stateObj.state === "opening"}
          .label=${tHa(this.hass, "ui.card.cover.open_cover", "open")}
          @press=${() => this.callService("cover", "open_cover")}
          >${iconUp()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_STOP$1)}
          .label=${tHa(this.hass, "ui.card.cover.stop_cover", "stop")}
          @press=${() => this.callService("cover", "stop_cover")}
          >${iconStop()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_CLOSE)}
          .active=${stateObj.state === "closing"}
          .label=${tHa(this.hass, "ui.card.cover.close_cover", "close")}
          @press=${() => this.callService("cover", "close_cover")}
          >${iconDown()}</skeuo-button
        >
      </div>
    `;
  }
};
SkeuoCoverCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      .btn-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }
    `
];
SkeuoCoverCard = __decorateClass$g([
  t$2("skeuo-cover-card")
], SkeuoCoverCard);
registerCard({
  type: "skeuo-cover-card",
  name: { fr: "Skeuo · Volet roulant", en: "Skeuo · Cover" },
  description: {
    fr: "Fader de position, écran d'ouverture et boutons ouvrir / stop / fermer.",
    en: "Position fader, opening screen and open / stop / close buttons."
  },
  preview: true
});
var __defProp$6 = Object.defineProperty;
var __getOwnPropDesc$f = Object.getOwnPropertyDescriptor;
var __decorateClass$f = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$f(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$6(target, key, result);
  return result;
};
const PIVOT_X = 150;
const PIVOT_Y = 156;
const HALF_SWEEP = 56;
const R_SCALE = 120;
const R_TICK_IN_MAJOR = 104;
const R_TICK_IN_MINOR = 112;
const R_LABEL = 92;
const NEEDLE_LEN = 112;
const clamp$1 = (v2, lo, hi) => Math.min(hi, Math.max(lo, v2));
const polar = (deg, r2) => {
  const rad = (deg - 90) * Math.PI / 180;
  return [PIVOT_X + Math.cos(rad) * r2, PIVOT_Y + Math.sin(rad) * r2];
};
const arcPath = (fromDeg, toDeg, r2) => {
  const [x1, y1] = polar(fromDeg, r2);
  const [x2, y22] = polar(toDeg, r2);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r2} ${r2} 0 ${large} 1 ${x2.toFixed(2)} ${y22.toFixed(2)}`;
};
let SkeuoVuMeter = class extends i$2 {
  constructor() {
    super(...arguments);
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.unit = "";
    this.warn = 0.6;
    this.danger = 0.85;
    this.width = 225;
    this.height = 142.5;
    this.label = "";
    this._needle = new SmoothValue(this, {
      epsilon: 0,
      duration: (delta) => {
        const span = Math.abs(this.max - this.min) || 1;
        return clamp$1(delta / span * 760, 160, 760);
      }
    });
  }
  willUpdate(changed) {
    super.willUpdate?.(changed);
    this._needle.set(this.value);
  }
  get _fraction() {
    const span = this.max - this.min;
    if (span === 0) return 0;
    return clamp$1((this._needle.value - this.min) / span, 0, 1);
  }
  _deg(fraction) {
    return -HALF_SWEEP + fraction * HALF_SWEEP * 2;
  }
  render() {
    const needleDeg = this._deg(this._fraction);
    const [nx, ny] = polar(needleDeg, NEEDLE_LEN);
    return b`
      <div
        class="face"
        style=${o({ width: `${this.width}px`, height: `${this.height}px` })}
        role="img"
        aria-label=${this.label || `${this.value}${this.unit}`}
      >
        <svg viewBox="0 0 300 190" aria-hidden="true">
          <path
            d=${arcPath(this._deg(0), this._deg(this.warn), R_SCALE)}
            fill="none"
            stroke="#5f9e5a"
            stroke-width="4"
            opacity="0.75"
          />
          <path
            d=${arcPath(this._deg(this.warn), this._deg(this.danger), R_SCALE)}
            fill="none"
            stroke="#c9a23a"
            stroke-width="4"
            opacity="0.8"
          />
          <path
            d=${arcPath(this._deg(this.danger), this._deg(1), R_SCALE)}
            fill="none"
            stroke="#b5473a"
            stroke-width="4"
            opacity="0.85"
          />
          ${this._renderTicks()} ${this._renderLabels()}

          <!-- Aiguille : un trait sombre épais doublé d'un filet rouge, comme
               sur un galvanomètre réel où l'aiguille laquée capte la lumière. -->
          <line
            x1=${PIVOT_X}
            y1=${PIVOT_Y}
            x2=${nx.toFixed(2)}
            y2=${ny.toFixed(2)}
            stroke="#2b2419"
            stroke-width="4"
            stroke-linecap="round"
          />
          <line
            x1=${PIVOT_X}
            y1=${PIVOT_Y}
            x2=${nx.toFixed(2)}
            y2=${ny.toFixed(2)}
            stroke="#a4392e"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <circle cx=${PIVOT_X} cy=${PIVOT_Y} r="7" fill="#3c342a" stroke="#0f0d09" stroke-width="1.5" />

          ${this.unit ? w`<text x="150" y="186" text-anchor="middle" class="unit">${this.unit}</text>` : null}
        </svg>
        <div class="glass"></div>
      </div>
    `;
  }
  _renderTicks() {
    const out = [];
    for (let i4 = 0; i4 <= 20; i4++) {
      const f2 = i4 / 20;
      const deg = this._deg(f2);
      const major = i4 % 4 === 0;
      const [x1, y1] = polar(deg, major ? R_TICK_IN_MAJOR : R_TICK_IN_MINOR);
      const [x2, y22] = polar(deg, R_SCALE - 6);
      out.push(w`<line
        x1=${x1.toFixed(2)} y1=${y1.toFixed(2)}
        x2=${x2.toFixed(2)} y2=${y22.toFixed(2)}
        stroke="#2e2717" stroke-width=${major ? 2.4 : 1.2}
        stroke-linecap="round" opacity="0.75"
      />`);
    }
    return out;
  }
  _renderLabels() {
    const out = [];
    for (let i4 = 0; i4 <= 4; i4++) {
      const f2 = i4 / 4;
      const [x2, y3] = polar(this._deg(f2), R_LABEL);
      const value = Math.round(this.min + f2 * (this.max - this.min));
      out.push(
        w`<text x=${x2.toFixed(1)} y=${(y3 + 4).toFixed(1)} text-anchor="middle" class="grad">${value}</text>`
      );
    }
    return out;
  }
};
SkeuoVuMeter.styles = i$5`
    :host {
      display: block;
      flex: none;
    }

    .face {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      box-sizing: border-box;
      background: radial-gradient(circle at 40% 28%, #f5ecd8, #e6d7b3 55%, #c7b487 100%);
      box-shadow:
        inset 3px 3px 3px rgba(0, 0, 0, 0.9),
        inset -1px -1px 1px rgba(255, 255, 255, 0.06),
        0 0 0 1px rgba(0, 0, 0, 0.6);
    }

    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .grad {
      font-family: var(--skeuo-font-lcd);
      font-size: 13px;
      fill: #3c3220;
    }
    .unit {
      font-family: var(--skeuo-font-lcd);
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0.5px;
      fill: #3c3220;
      opacity: 0.85;
    }

    /* Reflet du verre bombé, cohérent avec la lumière en haut-gauche. */
    .glass {
      position: absolute;
      inset: 0;
      pointer-events: none;
      mix-blend-mode: screen;
      background: linear-gradient(
        115deg,
        rgba(255, 255, 255, 0.22) 0%,
        rgba(255, 255, 255, 0.06) 28%,
        rgba(255, 255, 255, 0) 46%
      );
    }
  `;
__decorateClass$f([
  n$1({ type: Number })
], SkeuoVuMeter.prototype, "value", 2);
__decorateClass$f([
  n$1({ type: Number })
], SkeuoVuMeter.prototype, "min", 2);
__decorateClass$f([
  n$1({ type: Number })
], SkeuoVuMeter.prototype, "max", 2);
__decorateClass$f([
  n$1({ type: String })
], SkeuoVuMeter.prototype, "unit", 2);
__decorateClass$f([
  n$1({ type: Number })
], SkeuoVuMeter.prototype, "warn", 2);
__decorateClass$f([
  n$1({ type: Number })
], SkeuoVuMeter.prototype, "danger", 2);
__decorateClass$f([
  n$1({ type: Number })
], SkeuoVuMeter.prototype, "width", 2);
__decorateClass$f([
  n$1({ type: Number })
], SkeuoVuMeter.prototype, "height", 2);
__decorateClass$f([
  n$1({ type: String })
], SkeuoVuMeter.prototype, "label", 2);
SkeuoVuMeter = __decorateClass$f([
  t$2("skeuo-vu-meter")
], SkeuoVuMeter);
var __getOwnPropDesc$e = Object.getOwnPropertyDescriptor;
var __decorateClass$e = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$e(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
const RANGES = {
  humidity: { min: 0, max: 100, warn: 0.6, danger: 0.75 },
  temperature: { min: -10, max: 40, warn: 0.7, danger: 0.85 },
  pressure: { min: 950, max: 1050 },
  atmospheric_pressure: { min: 950, max: 1050 },
  battery: { min: 0, max: 100, warn: 0.3, danger: 0.15 },
  carbon_dioxide: { min: 400, max: 2e3, warn: 0.35, danger: 0.6 },
  illuminance: { min: 0, max: 1e3 },
  power: { min: 0, max: 3e3, warn: 0.6, danger: 0.85 },
  pm25: { min: 0, max: 100, warn: 0.25, danger: 0.5 },
  volatile_organic_compounds: { min: 0, max: 1e3, warn: 0.3, danger: 0.6 }
};
let SkeuoSensorCard = class extends SkeuoBaseCard {
  validateConfig(config) {
    this.expectDomain(config, "sensor", "number", "input_number");
  }
  static getConfigForm() {
    return {
      schema: [
        ...baseSchema(),
        {
          type: "grid",
          name: "",
          schema: [
            { name: "min", selector: { number: { mode: "box", step: "any" } } },
            { name: "max", selector: { number: { mode: "box", step: "any" } } }
          ]
        },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "warn", selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } } },
            { name: "danger", selector: { number: { min: 0, max: 1, step: 0.05, mode: "box" } } }
          ]
        }
      ],
      computeLabel,
      computeHelper
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("sensor.")) ?? entitiesFallback.find((e2) => e2.startsWith("sensor.")) ?? "sensor.humidity";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  _range(stateObj) {
    const deviceClass = stateObj.attributes.device_class;
    const preset = (deviceClass ? RANGES[deviceClass] : void 0) ?? { min: 0, max: 100 };
    return {
      min: this._config?.min ?? preset.min,
      max: this._config?.max ?? preset.max,
      warn: this._config?.warn ?? preset.warn ?? 0.6,
      danger: this._config?.danger ?? preset.danger ?? 0.85
    };
  }
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const value = numericState(stateObj.state);
    const { min, max, warn, danger } = this._range(stateObj);
    const unit = stateObj.attributes.unit_of_measurement ?? "";
    const name = computeEntityName(stateObj);
    return b`
      <skeuo-vu-meter
        .value=${value ?? min}
        .min=${min}
        .max=${max}
        .warn=${warn}
        .danger=${danger}
        .unit=${unit}
        .label=${`${name} : ${formatState(this.hass, stateObj)}`}
      ></skeuo-vu-meter>

      <skeuo-screen
        .value=${dead || value === void 0 ? "—" : `${value}${unit}`}
        .label=${name}
        .valueSize=${this._valueSize(value, unit)}
        .color=${dead ? "#6b5a44" : this.accent}
      ></skeuo-screen>
    `;
  }
  /**
   * On réduit la taille plutôt que de laisser un long relevé déborder du
   * cadre : la règle du projet interdit toute troncature de texte.
   */
  _valueSize(value, unit) {
    const length = `${value ?? "—"}${unit}`.length;
    if (length <= 5) return 44.1;
    if (length <= 7) return 36;
    if (length <= 9) return 29;
    return 24;
  }
};
SkeuoSensorCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      .body {
        gap: 12px;
      }
    `
];
SkeuoSensorCard = __decorateClass$e([
  t$2("skeuo-sensor-card")
], SkeuoSensorCard);
registerCard({
  type: "skeuo-sensor-card",
  name: { fr: "Skeuo · Capteur", en: "Skeuo · Sensor" },
  description: {
    fr: "Cadran à aiguille avec zones de seuil et écran de relevé.",
    en: "Needle dial with threshold zones and a reading screen."
  },
  preview: true
});
const VALUE_SIZE = 44.1;
const fitValueSize = (text) => {
  const length = text.length;
  if (length <= 5) return VALUE_SIZE;
  if (length <= 7) return 36;
  if (length <= 9) return 29;
  if (length <= 12) return 24;
  return 19;
};
const trimNumber = (value) => {
  const rounded = Math.abs(value) >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return String(rounded);
};
const shortTime = (iso, language) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
};
var __getOwnPropDesc$d = Object.getOwnPropertyDescriptor;
var __decorateClass$d = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$d(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
let SkeuoSwitchCard = class extends SkeuoBaseCard {
  validateConfig(config) {
    this.expectDomain(config, "switch", "input_boolean", "light", "fan");
  }
  isOff(stateObj) {
    return stateObj.state === "off";
  }
  /**
   * Les deux capteurs comptent autant que l'interrupteur pour le filtre de
   * rendu : sans eux, la puissance affichée resterait figée entre deux
   * changements d'état de la prise elle-même.
   */
  entityIds() {
    return [this._config?.entity, this._config?.power_entity, this._config?.energy_entity].filter(
      (id) => !!id
    );
  }
  static getConfigForm() {
    return {
      schema: [
        ...baseSchema(),
        {
          type: "grid",
          name: "",
          schema: [
            { name: "power_entity", selector: { entity: { domain: "sensor" } } },
            { name: "energy_entity", selector: { entity: { domain: "sensor" } } }
          ]
        }
      ],
      computeLabel,
      computeHelper
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("switch.")) ?? entitiesFallback.find((e2) => e2.startsWith("switch.")) ?? "switch.outlet";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  /* ------------------------------------------------------------- lecture */
  /**
   * Relevé d'un capteur associé, avec son unité.
   *
   * L'unité est toujours celle de l'entité : c'est ce qui permet à la même
   * carte d'afficher des watts ici et des kilowatts ailleurs sans que rien ne
   * soit écrit en dur, donc sans traduction à maintenir.
   */
  _reading(entityId) {
    if (!entityId || !this.hass) return void 0;
    const stateObj = this.hass.states[entityId];
    if (!stateObj || isUnavailable(stateObj)) return void 0;
    const value = numericState(stateObj.state);
    if (value === void 0) return void 0;
    const unit = stateObj.attributes.unit_of_measurement ?? "";
    return `${trimNumber(value)}${unit}`;
  }
  _onToggle(stateObj) {
    const domain = computeDomain(stateObj.entity_id);
    this.callService(domain, stateObj.state === "on" ? "turn_off" : "turn_on");
  }
  /* --------------------------------------------------------------- rendu */
  _meter(entityId, label, dimmed) {
    const reading = this._reading(entityId);
    return b`
      <skeuo-screen
        .value=${reading ?? "—"}
        .label=${label}
        .valueSize=${fitValueSize(reading ?? "—")}
        .color=${dimmed || reading === void 0 ? "#6b5a44" : this.accent}
      ></skeuo-screen>
    `;
  }
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const on = stateObj.state === "on";
    const measured = !!(this._config?.power_entity || this._config?.energy_entity);
    const state = formatState(this.hass, stateObj);
    return b`
      <skeuo-toggle
        .checked=${on}
        .disabled=${dead}
        .caption=${t(this.hass, "power")}
        .label=${tHa(this.hass, "ui.card.common.turn_on", "power")}
        .color=${this.accent}
        @toggle=${() => this._onToggle(stateObj)}
      ></skeuo-toggle>

      ${measured ? b`
            ${this._config?.power_entity ? this._meter(this._config.power_entity, t(this.hass, "power_draw"), dead || !on) : A}
            ${this._config?.energy_entity ? this._meter(this._config.energy_entity, t(this.hass, "today"), dead) : A}
          ` : b`
            <skeuo-screen
              .value=${state}
              .label=${computeEntityName(stateObj)}
              .valueSize=${fitValueSize(state)}
              .color=${dead || !on ? "#6b5a44" : this.accent}
            ></skeuo-screen>
          `}
    `;
  }
};
SkeuoSwitchCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      .body {
        gap: 10px;
        padding: 0 12px;
      }
    `
];
SkeuoSwitchCard = __decorateClass$d([
  t$2("skeuo-switch-card")
], SkeuoSwitchCard);
registerCard({
  type: "skeuo-switch-card",
  name: { fr: "Skeuo · Prise connectée", en: "Skeuo · Smart plug" },
  description: {
    fr: "Interrupteur à bascule, écran de puissance et écran d'énergie.",
    en: "Rocker switch, power screen and energy screen."
  },
  preview: true
});
var __getOwnPropDesc$c = Object.getOwnPropertyDescriptor;
var __decorateClass$c = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$c(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
const SUPPORT_OPEN = 1;
const STATE_COLORS$1 = {
  locked: "#4dff6a",
  unlocked: "#e2a659",
  open: "#e2a659",
  jammed: "#ff6b5c"
};
let SkeuoLockCard = class extends SkeuoBaseCard {
  validateConfig(config) {
    this.expectDomain(config, "lock");
  }
  static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("lock.")) {
          throw new Error(domainRequired("lock"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("lock.")) ?? entitiesFallback.find((e2) => e2.startsWith("lock.")) ?? "lock.front_door";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  /* ------------------------------------------------------------- lecture */
  _supportsOpen(stateObj) {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    return (features & SUPPORT_OPEN) !== 0;
  }
  /**
   * Une serrure qui déclare un code_format attend un code à chaque manœuvre.
   * Le stocker dans la configuration du tableau de bord reviendrait à écrire
   * le code de la porte d'entrée en clair dans un fichier YAML sauvegardé et
   * synchronisé : on renvoie plutôt vers la fiche de l'entité, qui sait
   * demander le code au moment voulu.
   */
  _needsCode(stateObj) {
    return !!stateObj.attributes.code_format;
  }
  _busy(stateObj) {
    return stateObj.state === "locking" || stateObj.state === "unlocking" || stateObj.state === "opening";
  }
  /* ------------------------------------------------------------- actions */
  _openMoreInfo() {
    fireEvent(this, "hass-more-info", { entityId: this._config?.entity ?? null });
  }
  _toggleLock(stateObj) {
    if (this._needsCode(stateObj)) {
      this._openMoreInfo();
      return;
    }
    this.callService("lock", stateObj.state === "locked" ? "unlock" : "lock");
  }
  _openLatch(stateObj) {
    if (this._needsCode(stateObj)) {
      this._openMoreInfo();
      return;
    }
    this.callService("lock", "open");
  }
  /* --------------------------------------------------------------- rendu */
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const locked = stateObj.state === "locked";
    const busy = this._busy(stateObj);
    const label = formatState(this.hass, stateObj);
    const color = dead ? "#6b5a44" : busy ? "#9db8c9" : STATE_COLORS$1[stateObj.state] ?? this.accent;
    const time = shortTime(stateObj.last_changed, isFrench(this.hass) ? "fr-FR" : "en-GB");
    const by = stateObj.attributes.changed_by;
    const access = [t(this.hass, "last_access"), by, time].filter(Boolean).join(" · ");
    return b`
      <div class="slot">
        <skeuo-button
          primary
          variant="secure"
          .active=${locked}
          .disabled=${dead || busy}
          .caption=${t(this.hass, "lock")}
          .label=${tHa(this.hass, locked ? "ui.card.lock.unlock" : "ui.card.lock.lock", "lock")}
          @press=${() => this._toggleLock(stateObj)}
          >${locked ? iconLock() : iconUnlock()}</skeuo-button
        >
      </div>

      <div class="mid">
        <skeuo-screen
          .value=${label}
          .label=${computeEntityName(stateObj)}
          .valueSize=${fitValueSize(label)}
          .color=${color}
        ></skeuo-screen>
        ${time ? b`<p class="access">${access}</p>` : A}
      </div>

      <div class="slot">
        <skeuo-button
          .disabled=${dead || busy || !this._supportsOpen(stateObj)}
          .caption=${t(this.hass, "latch")}
          .label=${tHa(this.hass, "ui.card.lock.open", "latch")}
          @press=${() => this._openLatch(stateObj)}
          >${iconLatch()}</skeuo-button
        >
      </div>
    `;
  }
};
SkeuoLockCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      /* Les deux boutons sont calés sur la hauteur de la colonne centrale, pas
         sur la leur : sans ça, le grand bouton verrou et le petit loquet se
         centreraient chacun sur sa propre hauteur et ne seraient pas alignés
         entre eux. */
      .slot {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 180px;
      }
      .mid {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 9px;
      }
      .access {
        margin: 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 13px;
        letter-spacing: 0.6px;
        color: var(--skeuo-label, #85888b);
        white-space: nowrap;
      }
      .body {
        padding: 0 20px;
      }
    `
];
SkeuoLockCard = __decorateClass$c([
  t$2("skeuo-lock-card")
], SkeuoLockCard);
registerCard({
  type: "skeuo-lock-card",
  name: { fr: "Skeuo · Serrure", en: "Skeuo · Lock" },
  description: {
    fr: "Bouton de verrouillage, écran d'état, dernier accès et bouton de loquet.",
    en: "Locking button, state screen, last access and latch button."
  },
  preview: true
});
var __getOwnPropDesc$b = Object.getOwnPropertyDescriptor;
var __decorateClass$b = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$b(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
const SUPPORT_SET_SPEED = 1;
const SUPPORT_OSCILLATE = 2;
const SUPPORT_DIRECTION = 4;
let SkeuoFanCard = class extends SkeuoBaseCard {
  constructor() {
    super(...arguments);
    this._speed = new SmoothValue(this);
  }
  validateConfig(config) {
    this.expectDomain(config, "fan");
  }
  isOff(stateObj) {
    return stateObj.state === "off";
  }
  willUpdate(changed) {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    if (stateObj) this._speed.set(this._percentage(stateObj));
  }
  static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("fan.")) {
          throw new Error(domainRequired("fan"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("fan.")) ?? entitiesFallback.find((e2) => e2.startsWith("fan.")) ?? "fan.office";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  /* ------------------------------------------------------------- lecture */
  _supports(stateObj, bit) {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    return (features & bit) !== 0;
  }
  /**
   * percentage est absent tant que le ventilateur est à l'arrêt sur certaines
   * intégrations : on retombe alors sur zéro plutôt que de laisser le curseur
   * à sa dernière position, qui ferait croire que l'appareil tourne encore.
   */
  _percentage(stateObj) {
    if (stateObj.state === "off") return 0;
    return Math.round(numericState(stateObj.attributes.percentage) ?? 0);
  }
  /**
   * Certains ventilateurs n'ont que trois ou quatre vitesses : le pas déclaré
   * par l'entité cale le curseur dessus au lieu de laisser choisir un
   * pourcentage que l'appareil arrondirait dans son coin.
   */
  _step(stateObj) {
    return numericState(stateObj.attributes.percentage_step) ?? 1;
  }
  /* ------------------------------------------------------------- actions */
  _onFaderChange(ev) {
    this._speed.set(ev.detail.value, true);
    this.callService("fan", "set_percentage", { percentage: ev.detail.value });
  }
  _togglePower(stateObj) {
    this.callService("fan", stateObj.state === "off" ? "turn_on" : "turn_off");
  }
  _toggleOscillation(stateObj) {
    this.callService("fan", "oscillate", { oscillating: !stateObj.attributes.oscillating });
  }
  _toggleDirection(stateObj) {
    const reverse = stateObj.attributes.direction === "reverse";
    this.callService("fan", "set_direction", { direction: reverse ? "forward" : "reverse" });
  }
  /* --------------------------------------------------------------- rendu */
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const on = stateObj.state !== "off";
    const speed = Math.round(this._speed.value);
    const settable = this._supports(stateObj, SUPPORT_SET_SPEED);
    return b`
      ${settable ? b`
            <skeuo-fader
              gradient="airflow"
              .value=${speed}
              .step=${this._step(stateObj)}
              .disabled=${dead}
              .inactive=${!on}
              .caption=${t(this.hass, "speed")}
              .label=${t(this.hass, "speed")}
              @fader-change=${this._onFaderChange}
            ></skeuo-fader>
          ` : A}

      <skeuo-screen
        .value=${settable ? `${speed}%` : formatState(this.hass, stateObj)}
        .label=${settable ? t(this.hass, "speed") : computeEntityName(stateObj)}
        .valueSize=${settable ? 44.1 : 30}
        .color=${dead || !on ? "#6b5a44" : this.accent}
      ></skeuo-screen>

      <div class="btn-col">
        <skeuo-button
          .active=${on}
          .disabled=${dead}
          .caption=${t(this.hass, "power")}
          .label=${tHa(this.hass, "ui.card.common.turn_on", "power")}
          @press=${() => this._togglePower(stateObj)}
          >${iconPower()}</skeuo-button
        >
        <skeuo-button
          .active=${!!stateObj.attributes.oscillating}
          .disabled=${dead || !this._supports(stateObj, SUPPORT_OSCILLATE)}
          .caption=${t(this.hass, "oscillate")}
          @press=${() => this._toggleOscillation(stateObj)}
          >${iconOscillate()}</skeuo-button
        >
        <skeuo-button
          .active=${stateObj.attributes.direction === "reverse"}
          .disabled=${dead || !this._supports(stateObj, SUPPORT_DIRECTION)}
          .caption=${t(this.hass, "direction")}
          @press=${() => this._toggleDirection(stateObj)}
          >${iconRotate()}</skeuo-button
        >
      </div>
    `;
  }
};
SkeuoFanCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      .btn-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      /* Marge symétrique : elle tient la légende la plus longue de la colonne
         de droite à l'écart de la vis d'angle, sans creuser un couloir plus
         large d'un côté que de l'autre. */
      .body {
        padding: 0 24px;
      }
    `
];
SkeuoFanCard = __decorateClass$b([
  t$2("skeuo-fan-card")
], SkeuoFanCard);
registerCard({
  type: "skeuo-fan-card",
  name: { fr: "Skeuo · Ventilateur", en: "Skeuo · Fan" },
  description: {
    fr: "Fader de vitesse, écran et boutons marche, oscillation, sens de rotation.",
    en: "Speed fader, screen and power, oscillation and direction buttons."
  },
  preview: true
});
var __getOwnPropDesc$a = Object.getOwnPropertyDescriptor;
var __decorateClass$a = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$a(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
const MODE_ICONS = {
  eco: iconDroplet,
  off: iconPower
};
const MODE_KEYS = {
  eco: "eco",
  performance: "performance",
  high_demand: "performance",
  off: "off"
};
let SkeuoWaterHeaterCard = class extends SkeuoBaseCard {
  constructor() {
    super(...arguments);
    this._setpoint = new SmoothValue(this, {
      epsilon: 0.02,
      minDuration: 260,
      maxDuration: 700,
      msPerUnit: 26
    });
  }
  validateConfig(config) {
    this.expectDomain(config, "water_heater");
  }
  isOff(stateObj) {
    return stateObj.state === "off";
  }
  willUpdate(changed) {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    const target = stateObj ? numericState(stateObj.attributes.temperature) : void 0;
    if (target !== void 0) this._setpoint.set(target);
  }
  static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("water_heater.")) {
          throw new Error(domainRequired("water_heater"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("water_heater.")) ?? entitiesFallback.find((e2) => e2.startsWith("water_heater.")) ?? "water_heater.tank";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  /* ------------------------------------------------------------- lecture */
  get _unit() {
    return this.hass?.config?.unit_system?.temperature ?? "°C";
  }
  _bounds(stateObj) {
    return {
      min: numericState(stateObj.attributes.min_temp) ?? 30,
      max: numericState(stateObj.attributes.max_temp) ?? 65,
      step: numericState(stateObj.attributes.target_temp_step) ?? 1
    };
  }
  /**
   * Trois boutons est ce que la colonne peut porter. On garde les deux
   * premiers modes de chauffe et on réserve la dernière place à l'arrêt, qui
   * doit rester atteignable quelle que soit la longueur de la liste.
   */
  _modes(stateObj) {
    const declared = this._config?.modes;
    if (declared) return declared.slice(0, 3);
    const list = stateObj.attributes.operation_list ?? [];
    const heating = list.filter((m2) => m2 !== "off").slice(0, 2);
    return list.includes("off") ? [...heating, "off"] : heating.slice(0, 3);
  }
  _modeLabel(mode) {
    const key = MODE_KEYS[mode];
    if (key) return t(this.hass, key);
    return tHa(this.hass, `component.water_heater.entity_component._.state.${mode}`, mode);
  }
  /* ------------------------------------------------------------- actions */
  _onFaderChange(ev) {
    this._setpoint.set(ev.detail.value, true);
    this.callService("water_heater", "set_temperature", { temperature: ev.detail.value });
  }
  _setMode(mode) {
    this.callService("water_heater", "set_operation_mode", { operation_mode: mode });
  }
  /* --------------------------------------------------------------- rendu */
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const isOff = stateObj.state === "off";
    const { min, max, step } = this._bounds(stateObj);
    const target = numericState(stateObj.attributes.temperature);
    const current = numericState(stateObj.attributes.current_temperature);
    const showsCurrent = current !== void 0;
    const shown = showsCurrent ? current : this._setpoint.value;
    const decimals = step < 1 ? 1 : 0;
    const text = target === void 0 && !showsCurrent ? "—" : `${shown.toFixed(decimals)}${this._unit}`;
    return b`
      <skeuo-fader
        gradient="warmth"
        .value=${this._setpoint.value}
        .min=${min}
        .max=${max}
        .step=${step}
        .disabled=${dead || target === void 0}
        .inactive=${isOff}
        .caption=${t(this.hass, "setpoint")}
        .label=${t(this.hass, "setpoint")}
        @fader-change=${this._onFaderChange}
      ></skeuo-fader>

      <skeuo-screen
        .value=${text}
        .label=${showsCurrent ? t(this.hass, "water") : t(this.hass, "setpoint")}
        .valueSize=${fitValueSize(text)}
        .color=${dead || isOff ? "#6b5a44" : this.accent}
      ></skeuo-screen>

      <div class="btn-col">
        ${this._modes(stateObj).map((mode) => {
      const icon = MODE_ICONS[mode] ?? iconFlame;
      return b`
            <skeuo-button
              .active=${stateObj.state === mode}
              .disabled=${dead}
              .caption=${this._modeLabel(mode)}
              @press=${() => this._setMode(mode)}
              >${icon()}</skeuo-button
            >
          `;
    })}
      </div>
    `;
  }
};
SkeuoWaterHeaterCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      .btn-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .body {
        padding: 0 24px;
      }
    `
];
SkeuoWaterHeaterCard = __decorateClass$a([
  t$2("skeuo-water-heater-card")
], SkeuoWaterHeaterCard);
registerCard({
  type: "skeuo-water-heater-card",
  name: { fr: "Skeuo · Chauffe-eau", en: "Skeuo · Water heater" },
  description: {
    fr: "Fader de consigne, écran de température et boutons de mode de chauffe.",
    en: "Setpoint fader, temperature screen and heating mode buttons."
  },
  preview: true
});
var __getOwnPropDesc$9 = Object.getOwnPropertyDescriptor;
var __decorateClass$9 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$9(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
const SUPPORT_PAUSE$1 = 4;
const SUPPORT_RETURN_HOME = 16;
const SUPPORT_BATTERY = 64;
const SUPPORT_START = 8192;
const BUSY_STATES = ["cleaning", "returning"];
let SkeuoVacuumCard = class extends SkeuoBaseCard {
  validateConfig(config) {
    this.expectDomain(config, "vacuum");
  }
  static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("vacuum.")) {
          throw new Error(domainRequired("vacuum"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("vacuum.")) ?? entitiesFallback.find((e2) => e2.startsWith("vacuum.")) ?? "vacuum.robot";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  /* ------------------------------------------------------------- lecture */
  _supports(stateObj, bit) {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    return (features & bit) !== 0;
  }
  /* ------------------------------------------------------------- actions */
  /**
   * Un seul bouton pour lancer et suspendre : c'est le geste attendu sur ce
   * genre d'appareil, et il évite un troisième poussoir dans une carte qui n'a
   * la place que pour deux.
   */
  _toggleRun(stateObj) {
    if (stateObj.state === "cleaning") {
      this.callService("vacuum", this._supports(stateObj, SUPPORT_PAUSE$1) ? "pause" : "stop");
    } else {
      this.callService("vacuum", "start");
    }
  }
  /* --------------------------------------------------------------- rendu */
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const cleaning = stateObj.state === "cleaning";
    const docked = stateObj.state === "docked";
    const busy = BUSY_STATES.includes(stateObj.state);
    const error = stateObj.state === "error";
    const battery = this._supports(stateObj, SUPPORT_BATTERY) ? numericState(stateObj.attributes.battery_level) : void 0;
    const text = battery !== void 0 ? `${Math.round(battery)}%` : formatState(this.hass, stateObj);
    return b`
      <div class="slot">
        <skeuo-button
          primary
          .active=${cleaning}
          .disabled=${dead || !cleaning && !this._supports(stateObj, SUPPORT_START)}
          .caption=${t(this.hass, "clean")}
          .label=${tHa(this.hass, cleaning ? "ui.card.vacuum.pause" : "ui.card.vacuum.start", "clean")}
          @press=${() => this._toggleRun(stateObj)}
          >${cleaning ? iconPause() : iconPlay()}</skeuo-button
        >
      </div>

      <skeuo-screen
        .value=${text}
        .label=${battery !== void 0 ? t(this.hass, "battery") : computeEntityName(stateObj)}
        .valueSize=${fitValueSize(text)}
        .color=${dead ? "#6b5a44" : error ? "#ff6b5c" : busy ? "#9db8c9" : this.accent}
      ></skeuo-screen>

      <div class="slot">
        <skeuo-button
          .active=${stateObj.state === "returning"}
          .disabled=${dead || docked || !this._supports(stateObj, SUPPORT_RETURN_HOME)}
          .caption=${t(this.hass, "dock")}
          .label=${tHa(this.hass, "ui.card.vacuum.return_to_base", "dock")}
          @press=${() => this.callService("vacuum", "return_to_base")}
          >${iconDock()}</skeuo-button
        >
      </div>
    `;
  }
};
SkeuoVacuumCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      /* Hauteur commune aux deux colonnes de boutons : le gros bouton de
         nettoyage et le petit retour base se centrent ainsi sur la même ligne
         plutôt que chacun sur sa propre hauteur. */
      .slot {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 142px;
      }
      .body {
        padding: 0 24px;
      }
    `
];
SkeuoVacuumCard = __decorateClass$9([
  t$2("skeuo-vacuum-card")
], SkeuoVacuumCard);
registerCard({
  type: "skeuo-vacuum-card",
  name: { fr: "Skeuo · Aspirateur robot", en: "Skeuo · Robot vacuum" },
  description: {
    fr: "Bouton nettoyage et pause, écran de batterie et retour à la base.",
    en: "Clean and pause button, battery screen and return to base."
  },
  preview: true
});
var __getOwnPropDesc$8 = Object.getOwnPropertyDescriptor;
var __decorateClass$8 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$8(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
const SUPPORT_ARM_HOME = 1;
const SUPPORT_ARM_AWAY = 2;
const SUPPORT_ARM_NIGHT = 4;
const MODES = [
  {
    key: "arm_home",
    service: "alarm_arm_home",
    state: "armed_home",
    bit: SUPPORT_ARM_HOME,
    icon: iconHome,
    haKey: "ui.card.alarm_control_panel.arm_home"
  },
  {
    key: "arm_away",
    service: "alarm_arm_away",
    state: "armed_away",
    bit: SUPPORT_ARM_AWAY,
    icon: iconAway,
    haKey: "ui.card.alarm_control_panel.arm_away"
  },
  {
    key: "arm_night",
    service: "alarm_arm_night",
    state: "armed_night",
    bit: SUPPORT_ARM_NIGHT,
    icon: iconMoon,
    haKey: "ui.card.alarm_control_panel.arm_night"
  },
  {
    key: "disarm",
    service: "alarm_disarm",
    state: "disarmed",
    icon: iconShieldOff,
    haKey: "ui.card.alarm_control_panel.disarm"
  }
];
const STATE_COLORS = {
  disarmed: "#4dff6a",
  arming: "#e2a659",
  pending: "#e2a659",
  armed_home: "#ff6b5c",
  armed_away: "#ff6b5c",
  armed_night: "#ff6b5c",
  armed_vacation: "#ff6b5c",
  armed_custom_bypass: "#ff6b5c",
  triggered: "#ff6b5c"
};
let SkeuoAlarmCard = class extends SkeuoBaseCard {
  validateConfig(config) {
    this.expectDomain(config, "alarm_control_panel");
  }
  static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("alarm_control_panel.")) {
          throw new Error(domainRequired("alarm_control_panel"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("alarm_control_panel.")) ?? entitiesFallback.find((e2) => e2.startsWith("alarm_control_panel.")) ?? "alarm_control_panel.house";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  /* ------------------------------------------------------------- lecture */
  _modes(stateObj) {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    if (!features) return MODES;
    return MODES.filter((mode) => mode.bit === void 0 || (features & mode.bit) !== 0);
  }
  /**
   * Une centrale qui déclare un code_format en attend un à chaque manœuvre.
   * Le mettre dans la configuration du tableau de bord reviendrait à écrire le
   * code de l'alarme en clair dans un fichier YAML : on ouvre la fiche de
   * l'entité, qui sait présenter le pavé numérique.
   */
  _needsCode(stateObj, mode) {
    if (!stateObj.attributes.code_format) return false;
    if (mode.key === "disarm") return true;
    return stateObj.attributes.code_arm_required !== false;
  }
  /* ------------------------------------------------------------- actions */
  _press(stateObj, mode) {
    if (this._needsCode(stateObj, mode)) {
      fireEvent(this, "hass-more-info", { entityId: this._config?.entity ?? null });
      return;
    }
    this.callService("alarm_control_panel", mode.service);
  }
  /* --------------------------------------------------------------- rendu */
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const label = formatState(this.hass, stateObj);
    const color = dead ? "#6b5a44" : STATE_COLORS[stateObj.state] ?? this.accent;
    const coded = !!stateObj.attributes.code_format;
    return b`
      <div class="modes">
        ${this._modes(stateObj).map(
      (mode) => b`
            <skeuo-button
              variant=${mode.key === "disarm" ? "secure" : "alert"}
              .active=${stateObj.state === mode.state}
              .disabled=${dead}
              .caption=${t(this.hass, mode.key)}
              .label=${tHa(this.hass, mode.haKey, mode.key)}
              @press=${() => this._press(stateObj, mode)}
            >
              ${mode.icon()}
            </skeuo-button>
          `
    )}
      </div>

      <skeuo-screen
        .value=${label}
        .label=${coded ? t(this.hass, "code_required") : computeEntityName(stateObj)}
        .valueSize=${fitValueSize(label)}
        .color=${color}
      ></skeuo-screen>
    `;
  }
};
SkeuoAlarmCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      /* L'écart est calé sur les légendes, pas sur les boutons : « Absence »
         et « Disarmed » sont nettement plus larges que le poussoir de 48 px
         qu'elles nomment, et un écart réglé sur le poussoir les ferait se
         toucher deux à deux. */
      .modes {
        display: flex;
        gap: 30px;
      }
      .body {
        padding: 0 22px;
      }
    `
];
SkeuoAlarmCard = __decorateClass$8([
  t$2("skeuo-alarm-card")
], SkeuoAlarmCard);
registerCard({
  type: "skeuo-alarm-card",
  name: { fr: "Skeuo · Alarme", en: "Skeuo · Alarm" },
  description: {
    fr: "Quatre modes d'armement et écran d'état de la centrale.",
    en: "Four arming modes and a panel state screen."
  },
  preview: true
});
const DAY = 864e5;
const HORIZON = 26 * 36e5;
const isNight = (hass, when) => {
  const sun = hass?.states["sun.sun"];
  if (!sun) return void 0;
  const now = sun.state === "below_horizon";
  if (!when) return now;
  const rising = Date.parse(sun.attributes.next_rising);
  const setting = Date.parse(sun.attributes.next_setting);
  if (!Number.isFinite(rising) || !Number.isFinite(setting)) return now;
  const target = when.getTime();
  const reference = Math.min(rising, setting);
  if (target <= reference) return now;
  if (rising - reference > HORIZON || setting - reference > HORIZON) return now;
  const events = [];
  for (let k2 = 0; k2 * DAY <= target - reference + DAY; k2++) {
    if (k2 > 10) break;
    events.push([rising + k2 * DAY, false], [setting + k2 * DAY, true]);
  }
  events.sort((a2, b2) => a2[0] - b2[0]);
  let night = now;
  for (const [at, nightAfter] of events) {
    if (at > target) break;
    night = nightAfter;
  }
  return night;
};
var __defProp$5 = Object.defineProperty;
var __getOwnPropDesc$7 = Object.getOwnPropertyDescriptor;
var __decorateClass$7 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$7(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$5(target, key, result);
  return result;
};
const weatherIconName = (condition, night) => night && condition === "partlycloudy" ? "partlycloudy-night" : condition;
const cloud = (cx, cy, k2) => w`
  <circle cx=${cx - 8 * k2} cy=${cy + 2 * k2} r=${10 * k2}/>
  <circle cx=${cx + 4 * k2} cy=${cy - 2 * k2} r=${13 * k2}/>
  <circle cx=${cx + 13 * k2} cy=${cy + 5 * k2} r=${8 * k2}/>
  <rect x=${cx - 8 * k2} y=${cy + 5 * k2} width=${21 * k2} height=${8 * k2} rx=${4 * k2}/>
`;
const CRESCENT_P1 = [0.8398, 0.5428];
const CRESCENT_P2 = [-0.5428, -0.8398];
const crescent = (cx, cy, r2, opening = "up") => {
  const sign = opening === "up" ? 1 : -1;
  const x1 = cx + CRESCENT_P1[0] * r2;
  const y1 = cy + CRESCENT_P1[1] * r2 * sign;
  const x2 = cx + CRESCENT_P2[0] * r2;
  const y22 = cy + CRESCENT_P2[1] * r2 * sign;
  const [outer, inner] = opening === "up" ? [1, 0] : [0, 1];
  return w`
    <path d=${`M${x1} ${y1} A${r2} ${r2} 0 1 ${outer} ${x2} ${y22} A${r2} ${r2} 0 0 ${inner} ${x1} ${y1} Z`}/>
  `;
};
const rays = (cx, cy, inner, outer) => w`
  <g class="spin" style=${`transform-origin:${cx}px ${cy}px`}>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
  const a2 = deg * Math.PI / 180;
  return w`<line
        x1=${cx + Math.cos(a2) * inner} y1=${cy + Math.sin(a2) * inner}
        x2=${cx + Math.cos(a2) * outer} y2=${cy + Math.sin(a2) * outer}
        stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>`;
})}
  </g>
`;
const drops = (xs, y3, length) => w`
  ${xs.map(
  (x2, i4) => w`<line class="fall" style=${`animation-delay:${i4 * 0.22}s`}
      x1=${x2} y1=${y3} x2=${x2 - length * 0.35} y2=${y3 + length}
      stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>`
)}
`;
const flake = (cx, cy, r2, delay) => w`
  <g class="twinkle" style=${`animation-delay:${delay}s`}>
    ${[0, 60, 120].map((deg) => {
  const a2 = deg * Math.PI / 180;
  return w`<line
        x1=${cx - Math.cos(a2) * r2} y1=${cy - Math.sin(a2) * r2}
        x2=${cx + Math.cos(a2) * r2} y2=${cy + Math.sin(a2) * r2}
        stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`;
})}
  </g>
`;
const gust = (x2, y3, k2, delay) => w`
  <path class="sway" style=${`animation-delay:${delay}s`} fill="none" stroke="currentColor"
        stroke-width=${3.2 * k2} stroke-linecap="round"
        d=${`M${x2 + 12 * k2} ${y3 - 9 * k2} A${5 * k2} ${5 * k2} 0 1 1 ${x2 + 16 * k2} ${y3} L${x2 - 18 * k2} ${y3}`}/>
`;
const bolt = () => w`
  <polygon class="flash" points="33,34 24,50 31,50 27,60 41,43 33,43 37,34"/>
`;
const streaks = (ys, x1, x2) => w`
  ${ys.map(
  (y3, i4) => w`<line class="sway" style=${`animation-delay:${i4 * 0.35}s`}
      x1=${x1 + i4 % 2 * 5} y1=${y3} x2=${x2 - i4 % 2 * 6} y2=${y3}
      stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>`
)}
`;
const SHAPES = {
  sunny: () => w`
    ${rays(32, 32, 16, 26)}
    <circle cx="32" cy="32" r="11"/>
  `,
  "clear-night": () => w`
    ${crescent(30, 34, 16)}
    ${flake(50, 15, 3.4, 0)}
    ${flake(14, 14, 2.6, 0.7)}
  `,
  cloudy: () => w`<g class="drift">${cloud(30, 30, 1.15)}</g>`,
  partlycloudy: () => w`
    ${rays(24, 24, 11, 19)}
    <circle cx="24" cy="24" r="8"/>
    <g class="drift">${cloud(34, 38, 1)}</g>
  `,
  /** Même composition que le jour, la lune à la place du soleil. */
  "partlycloudy-night": () => w`
    ${crescent(24, 23, 12, "down")}
    <g class="drift">${cloud(34, 38, 1)}</g>
  `,
  rainy: () => w`
    <g class="drift">${cloud(30, 24, 1)}</g>
    ${drops([22, 32, 42], 42, 12)}
  `,
  pouring: () => w`
    <g class="drift">${cloud(30, 22, 1)}</g>
    ${drops([18, 27, 36, 45], 40, 16)}
  `,
  snowy: () => w`
    <g class="drift">${cloud(30, 24, 1)}</g>
    ${flake(21, 47, 4.6, 0)}
    ${flake(32, 52, 4.6, 0.5)}
    ${flake(43, 47, 4.6, 1)}
  `,
  /**
   * Pluie et neige mêlées. Les deux signes sont posés côte à côte : superposés,
   * les branches du flocon et les traits de pluie se croisent et la vignette ne
   * ressemble plus qu'à un gribouillis une fois réduite.
   */
  "snowy-rainy": () => w`
    <g class="drift">${cloud(30, 24, 1)}</g>
    ${drops([24], 42, 13)}
    ${flake(41, 48, 5, 0.3)}
  `,
  hail: () => w`
    <g class="drift">${cloud(30, 24, 1)}</g>
    <circle class="fall" cx="22" cy="45" r="3.2"/>
    <circle class="fall" style="animation-delay:.25s" cx="32" cy="45" r="3.2"/>
    <circle class="fall" style="animation-delay:.5s" cx="42" cy="45" r="3.2"/>
  `,
  lightning: () => w`
    <g class="drift">${cloud(30, 24, 1)}</g>
    ${bolt()}
  `,
  "lightning-rainy": () => w`
    <g class="drift">${cloud(30, 22, 1)}</g>
    ${bolt()}
    ${drops([20, 45], 40, 13)}
  `,
  fog: () => w`
    <g class="drift">${cloud(30, 22, 0.95)}</g>
    ${streaks([44, 52], 15, 49)}
  `,
  /**
   * Vent. Deux filets seulement : un troisième au milieu tomberait exactement
   * sur le retour de la bourrasque, et les deux tracés confondus formaient un
   * pâté au centre de l'icône.
   */
  windy: () => w`
    ${streaks([23, 43], 12, 44)}
    ${gust(32, 33, 1, 0.15)}
  `,
  /**
   * Vent avec nuage. La bourrasque plutôt que des filets droits : avec des
   * filets, l'icône était le sosie du brouillard, qui est justement le contraire
   * d'un temps venté.
   */
  "windy-variant": () => w`
    <g class="drift">${cloud(28, 23, 0.95)}</g>
    ${gust(30, 48, 0.9, 0.2)}
  `,
  /**
   * Conditions extrêmes. Le triangle d'avertissement est un signe universel,
   * là où une icône de temps n'aurait aucun sens pour un état qui recouvre
   * aussi bien une tempête qu'une alerte de l'organisme météo.
   */
  exceptional: () => w`
    <path d="M32 12 L54 50 A3.5 3.5 0 0 1 51 55.5 L13 55.5 A3.5 3.5 0 0 1 10 50 Z"/>
    <rect x="29.4" y="27" width="5.2" height="15" rx="2.6" fill="#0d0906"/>
    <circle cx="32" cy="48" r="3" fill="#0d0906"/>
  `
};
let SkeuoWeatherIcon = class extends i$2 {
  constructor() {
    super(...arguments);
    this.condition = "sunny";
    this.size = 105;
    this.glow = true;
    this.label = "";
  }
  render() {
    const shape = SHAPES[this.condition] ?? SHAPES.exceptional;
    return b`
      <div
        class="slot"
        style=${o({
      width: `${this.size}px`,
      height: `${this.size}px`,
      // La lueur est proportionnelle au tracé. Une valeur fixe convient à
      // une seule taille : la même diffusion de dix pixels qui nimbe une
      // icône de cent pixels noie complètement une vignette de trente.
      "--halo-blur": `${this.size * 0.15}px`,
      "--art-glow": `${this.size * 0.055}px`
    })}
      >
        ${this.glow ? b`<div
              class="halo"
              style=${o({ width: `${this.size * 0.55}px`, height: `${this.size * 0.55}px` })}
            ></div>` : A}
        <svg
          class="art"
          viewBox="0 0 64 64"
          role=${this.label ? "img" : "presentation"}
          aria-label=${this.label || A}
        >
          ${shape()}
        </svg>
      </div>
    `;
  }
};
SkeuoWeatherIcon.styles = i$5`
    :host {
      display: block;
      flex: none;
      color: var(--skeuo-accent, #e2a659);
    }

    .slot {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Halo posé derrière le tracé, comme la diffusion d'un rétroéclairage dans
       la vitre de l'écran. */
    .halo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: currentColor;
      filter: blur(var(--halo-blur, 16px));
      opacity: 0.3;
      z-index: 0;
    }

    .art {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      fill: currentColor;
      filter: drop-shadow(0 0 var(--art-glow, 5px) currentColor);
    }

    /* Les groupes animés ont besoin d'une boîte de référence explicite : sans
       transform-box, une rotation se calcule sur le repère du SVG entier et
       fait décrire un arc à l'élément au lieu de le faire tourner sur lui-même.
       Le soleil pose son propre transform-origin en coordonnées du dessin, il
       est donc exclu de cette règle. */
    .drift,
    .fall,
    .flash,
    .sway,
    .twinkle {
      transform-box: fill-box;
      transform-origin: center;
    }

    .spin {
      animation: spin 24s linear infinite;
    }
    .drift {
      animation: drift 7s ease-in-out infinite alternate;
    }
    .fall {
      animation: fall 1.5s ease-in infinite;
    }
    .flash {
      animation: flash 3.2s ease-in-out infinite;
    }
    .sway {
      animation: sway 4.5s ease-in-out infinite alternate;
    }
    .twinkle {
      animation: twinkle 4s ease-in-out infinite alternate;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @keyframes drift {
      from {
        transform: translateX(-1.6px);
      }
      to {
        transform: translateX(1.6px);
      }
    }
    @keyframes fall {
      0% {
        transform: translateY(-5px);
        opacity: 0;
      }
      25% {
        opacity: 1;
      }
      100% {
        transform: translateY(7px);
        opacity: 0;
      }
    }
    @keyframes flash {
      0%,
      62%,
      70%,
      100% {
        opacity: 1;
      }
      66% {
        opacity: 0.25;
      }
    }
    @keyframes sway {
      from {
        transform: translateX(-2.4px);
      }
      to {
        transform: translateX(2.4px);
      }
    }
    @keyframes twinkle {
      from {
        opacity: 0.45;
        transform: rotate(-12deg);
      }
      to {
        opacity: 1;
        transform: rotate(12deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .spin,
      .drift,
      .fall,
      .flash,
      .sway,
      .twinkle {
        animation: none;
      }
      .fall {
        opacity: 1;
      }
    }
  `;
__decorateClass$7([
  n$1({ type: String })
], SkeuoWeatherIcon.prototype, "condition", 2);
__decorateClass$7([
  n$1({ type: Number })
], SkeuoWeatherIcon.prototype, "size", 2);
__decorateClass$7([
  n$1({ type: Boolean })
], SkeuoWeatherIcon.prototype, "glow", 2);
__decorateClass$7([
  n$1({ type: String })
], SkeuoWeatherIcon.prototype, "label", 2);
SkeuoWeatherIcon = __decorateClass$7([
  t$2("skeuo-weather-icon")
], SkeuoWeatherIcon);
var __getOwnPropDesc$6 = Object.getOwnPropertyDescriptor;
var __decorateClass$6 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$6(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
let SkeuoWeatherCard = class extends SkeuoBaseCard {
  validateConfig(config) {
    this.expectDomain(config, "weather");
  }
  /**
   * Le soleil compte autant que la météo pour le filtre de rendu : sans lui,
   * l'icône garderait son soleil derrière le nuage jusqu'au prochain
   * changement de temps, plusieurs heures après le coucher.
   */
  entityIds() {
    const ids = super.entityIds();
    return this.hass?.states["sun.sun"] ? [...ids, "sun.sun"] : ids;
  }
  static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("weather.")) {
          throw new Error(domainRequired("weather"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("weather.")) ?? entitiesFallback.find((e2) => e2.startsWith("weather.")) ?? "weather.home";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  /**
   * Unité de température de l'entité et non du système : une station qui
   * publie en Fahrenheit garde son unité, exactement comme le fait la carte
   * météo native.
   */
  _unit(stateObj) {
    return stateObj.attributes.temperature_unit ?? this.hass?.config?.unit_system?.temperature ?? "°C";
  }
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const temperature = numericState(stateObj.attributes.temperature);
    const condition = formatState(this.hass, stateObj);
    const text = dead || temperature === void 0 ? "—" : `${trimNumber(temperature)}${this._unit(stateObj)}`;
    return b`
      <skeuo-screen bare>
        <skeuo-weather-icon
          .condition=${dead ? "exceptional" : weatherIconName(stateObj.state, isNight(this.hass))}
          .size=${105}
          .label=${condition}
          style=${dead ? "color:#6b5a44" : ""}
        ></skeuo-weather-icon>
      </skeuo-screen>

      <skeuo-screen
        .value=${text}
        .label=${condition}
        .valueSize=${fitValueSize(text)}
        .color=${dead ? "#6b5a44" : this.accent}
      ></skeuo-screen>
    `;
  }
};
SkeuoWeatherCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      .body {
        gap: 16px;
      }
    `
];
SkeuoWeatherCard = __decorateClass$6([
  t$2("skeuo-weather-card")
], SkeuoWeatherCard);
registerCard({
  type: "skeuo-weather-card",
  name: { fr: "Skeuo · Météo", en: "Skeuo · Weather" },
  description: {
    fr: "Icône animée sur écran LCD et relevé de température.",
    en: "Animated icon on an LCD screen and a temperature reading."
  },
  preview: true
});
const SUPPORT_FORECAST_DAILY = 1;
const SUPPORT_FORECAST_HOURLY = 2;
const SUPPORT_FORECAST_TWICE_DAILY = 4;
const bestForecastType = (stateObj) => {
  const features = Number(stateObj.attributes.supported_features) || 0;
  if (features & SUPPORT_FORECAST_DAILY) return "daily";
  if (features & SUPPORT_FORECAST_TWICE_DAILY) return "twice_daily";
  if (features & SUPPORT_FORECAST_HOURLY) return "hourly";
  return void 0;
};
class ForecastController {
  /**
   * onData doit provoquer une mise à jour de l'hôte. Sur les cartes du pack,
   * l'écriture dans une propriété @state s'en charge ; le contrôleur ne
   * demande pas le rendu lui-même, un requestUpdate() sans argument étant de
   * toute façon rejeté par leur filtre de rendu.
   */
  constructor(host, onData) {
    this._token = 0;
    this._connected = false;
    this._pending = false;
    this._onData = onData;
    host.addController(this);
  }
  /**
   * Découpage retenu pour l'abonnement en cours. Une prévision quotidienne
   * couvre la journée entière : lui appliquer une icône de nuit n'aurait pas
   * de sens, d'où le besoin pour la carte de savoir sur quoi elle est branchée.
   */
  get type() {
    return this._type;
  }
  /**
   * Au remontage, l'abonnement coupé au détachement doit être rétabli tout de
   * suite. Attendre le prochain rendu ne marcherait pas : rien n'a changé du
   * point de vue de Lit, donc rien ne le déclenche, et la carte resterait
   * indéfiniment sur les prévisions figées d'avant le détachement.
   */
  hostConnected() {
    this._connected = true;
    this._key = void 0;
    if (this._hass && this._stateObj) this.sync(this._hass, this._stateObj);
  }
  hostDisconnected() {
    this._connected = false;
    this._stop();
    this._key = void 0;
  }
  /**
   * À appeler avant chaque rendu. Ne fait rien tant que l'entité, le type de
   * prévision et la connexion n'ont pas changé.
   */
  sync(hass, stateObj) {
    this._hass = hass;
    this._stateObj = stateObj;
    if (!hass || !stateObj) {
      this._stop();
      this._key = void 0;
      return;
    }
    const type = bestForecastType(stateObj);
    const connection = hass.connection;
    if (!type || !connection?.subscribeMessage) {
      this._type = "daily";
      const legacy = stateObj.attributes.forecast;
      const key2 = `legacy:${stateObj.entity_id}:${legacy?.length ?? 0}:${legacy?.[0]?.datetime ?? ""}`;
      if (key2 !== this._key) {
        this._stop();
        this._key = key2;
        this._onData(legacy);
      }
      return;
    }
    const key = `${stateObj.entity_id}:${type}`;
    if (key === this._key && (this._unsub || this._pending)) return;
    this._stop();
    this._key = key;
    this._type = type;
    this._pending = true;
    const token = ++this._token;
    connection.subscribeMessage(
      (event) => {
        if (token !== this._token) return;
        this._onData(event?.forecast);
      },
      { type: "weather/subscribe_forecast", forecast_type: type, entity_id: stateObj.entity_id }
    ).then((unsub) => {
      if (token !== this._token || !this._connected) {
        void unsub();
        return;
      }
      this._pending = false;
      this._unsub = unsub;
    }).catch(() => {
      if (token !== this._token) return;
      this._pending = false;
      this._key = void 0;
      this._onData(void 0);
    });
  }
  _stop() {
    this._token++;
    this._pending = false;
    const unsub = this._unsub;
    this._unsub = void 0;
    if (unsub) void unsub().catch(() => void 0);
  }
}
var __defProp$4 = Object.defineProperty;
var __getOwnPropDesc$5 = Object.getOwnPropertyDescriptor;
var __decorateClass$5 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$5(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$4(target, key, result);
  return result;
};
const BODY_PADDING = 22;
const MAX_COLUMN = 130;
const MAX_SCREEN = 118;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const layout = (count, stageWidth) => {
  const gap = count > 5 ? 10 : 16;
  const available = stageWidth - 2 * BODY_PADDING;
  const column = Math.min(MAX_COLUMN, (available - (count - 1) * gap) / count);
  const screen = Math.min(MAX_SCREEN, column);
  return {
    gap,
    column,
    screen,
    screenHeight: Math.min(112, column * 1.25),
    icon: screen * 0.46,
    // La ligne de températures est ce qui sature une colonne étroite en
    // premier : elle ne se coupe pas, elle rétrécit.
    tempSize: clamp(column * 0.17, 12, 19),
    tempGap: clamp(column * 0.08, 5, 9)
  };
};
let SkeuoForecastCard = class extends SkeuoBaseCard {
  constructor() {
    super(...arguments);
    this._subscription = new ForecastController(this, (items) => {
      this._forecast = items;
    });
  }
  validateConfig(config) {
    this.expectDomain(config, "weather");
  }
  willUpdate(changed) {
    super.willUpdate?.(changed);
    this._subscription.sync(this.hass, this.stateObj);
  }
  /**
   * Le soleil n'est suivi que si la carte peut en avoir besoin. Sur des
   * prévisions quotidiennes, l'icône ne change pas avec l'heure et suivre
   * `sun.sun` ne ferait que redessiner la carte deux fois par jour pour rien.
   */
  entityIds() {
    const ids = super.entityIds();
    const daily = this._subscription.type === void 0 || this._subscription.type === "daily";
    return !daily && this.hass?.states["sun.sun"] ? [...ids, "sun.sun"] : ids;
  }
  static getConfigForm() {
    return {
      schema: [
        ...baseSchema(),
        {
          type: "grid",
          name: "",
          schema: [
            { name: "days", selector: { number: { min: 3, max: 7, step: 1, mode: "slider" } } }
          ]
        }
      ],
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("weather.")) {
          throw new Error(domainRequired("weather"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("weather.")) ?? entitiesFallback.find((e2) => e2.startsWith("weather.")) ?? "weather.home";
    return { entity: pick, days: 5, texture: DEFAULT_TEXTURE };
  }
  /* ------------------------------------------------------------- lecture */
  get _days() {
    const asked = this._config?.days;
    if (asked === void 0 || !Number.isFinite(asked)) return 5;
    return Math.min(7, Math.max(3, Math.round(asked)));
  }
  _unit(stateObj) {
    return stateObj.attributes.temperature_unit ?? this.hass?.config?.unit_system?.temperature ?? "°C";
  }
  /**
   * Unité raccourcie au seul degré.
   *
   * Une colonne de prévision porte deux nombres côte à côte : garder le C ou le
   * F sur chacun ferait quatre caractères de plus par jour, et sur sept jours
   * la rangée ne tient plus. Le degré seul est la convention de tous les
   * bulletins, et l'échelle complète reste lisible sur la carte météo. Une
   * unité qui ne commencerait pas par un degré est laissée intacte, faute de
   * savoir quoi en retirer.
   */
  _shortUnit(stateObj) {
    const unit = this._unit(stateObj);
    return unit.startsWith("°") ? "°" : unit;
  }
  get _language() {
    return isFrench(this.hass) ? "fr-FR" : this.hass?.locale?.language || "en-GB";
  }
  /**
   * Cet élément de prévision tombe-t-il de nuit ?
   *
   * Une prévision quotidienne couvre le jour entier, la question ne se pose
   * pas. Le découpage bi-quotidien porte la réponse dans `is_daytime`. Pour
   * l'horaire, elle se déduit du soleil, en tenant compte des levers et
   * couchers à venir et non du seul moment présent.
   */
  _isNight(item) {
    if (this._subscription.type === void 0 || this._subscription.type === "daily") return false;
    if (item.is_daytime !== void 0) return !item.is_daytime;
    const at = new Date(item.datetime);
    if (Number.isNaN(at.getTime())) return false;
    return isNight(this.hass, at) ?? false;
  }
  /**
   * Étiquette de colonne.
   *
   * Sur des prévisions horaires, le nom du jour ne distingue rien : les sept
   * colonnes tombent presque toujours dans la même journée et affichent sept
   * fois la même abréviation. C'est l'heure qui porte l'information à ce
   * découpage.
   *
   * Le point final que certaines langues ajoutent au nom du jour est retiré :
   * l'étiquette est déjà en capitales et déjà comprise comme une abréviation,
   * le point ne fait qu'ajouter du bruit sous une vignette de moins de cent
   * pixels.
   */
  _dayLabel(item) {
    const date = new Date(item.datetime);
    if (Number.isNaN(date.getTime())) return "";
    if (this._subscription.type === "hourly") {
      return date.toLocaleTimeString(this._language, { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString(this._language, { weekday: "short" }).replace(/\.$/, "");
  }
  /* --------------------------------------------------------------- rendu */
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const items = (this._forecast ?? []).slice(0, this._days);
    if (dead || items.length === 0) {
      return b`
        <p class="empty">
          ${dead ? t(this.hass, "unavailable") : t(this.hass, "forecast_unavailable")}
        </p>
      `;
    }
    const geo = layout(items.length, this._scaler.stageWidth);
    const unit = this._shortUnit(stateObj);
    return b`
      <div class="row" style=${o({ gap: `${geo.gap}px` })}>
        ${items.map((item) => this._renderDay(item, geo, unit))}
      </div>
    `;
  }
  _renderDay(item, geo, unit) {
    const high = numericState(item.temperature);
    const low = numericState(item.templow);
    return b`
      <div class="day" style=${o({ width: `${geo.column}px` })}>
        <p class="label">${this._dayLabel(item)}</p>
        <skeuo-screen bare .width=${geo.screen} .height=${geo.screenHeight}>
          <skeuo-weather-icon
            .condition=${weatherIconName(item.condition ?? "exceptional", this._isNight(item))}
            .size=${geo.icon}
            .glow=${false}
          ></skeuo-weather-icon>
        </skeuo-screen>
        <p
          class="temps"
          style=${o({ fontSize: `${geo.tempSize}px`, gap: `${geo.tempGap}px` })}
        >
          <span class="hi">${high !== void 0 ? `${trimNumber(high)}${unit}` : "—"}</span>
          ${low !== void 0 ? b`<span class="lo">${trimNumber(low)}${unit}</span>` : A}
        </p>
      </div>
    `;
  }
};
SkeuoForecastCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      .body {
        padding: 0 22px;
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 7px;
      }

      .label {
        margin: 0;
        font-size: 14px;
        line-height: 17px;
        letter-spacing: 2.1px;
        color: var(--skeuo-label, #85888b);
        text-transform: uppercase;
        white-space: nowrap;
      }

      /* Le maximum en ambre, le minimum en gris : la hiérarchie se lit d'un
         coup d'œil sans avoir à décoder deux chiffres de même poids. */
      /* La taille et l'écart sont posés à l'unité près par le rendu, qui est le
         seul à connaître la largeur de colonne du moment. */
      .temps {
        margin: 0;
        display: flex;
        font-family: var(--skeuo-font-lcd);
        line-height: 1.2;
        white-space: nowrap;
      }
      .hi {
        color: var(--skeuo-accent, #e2a659);
        text-shadow: 0 0 7px currentColor;
      }
      /* Le minimum reste en retrait du maximum, mais pas au point de disparaître
         sur la façade : le gris du mockup passait sous le seuil de lecture une
         fois ramené à la taille réelle d'une colonne. */
      .lo {
        color: #8d9093;
      }

      .empty {
        margin: 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 20px;
        letter-spacing: 1px;
        color: #6b5a44;
      }
    `
];
__decorateClass$5([
  r()
], SkeuoForecastCard.prototype, "_forecast", 2);
SkeuoForecastCard = __decorateClass$5([
  t$2("skeuo-forecast-card")
], SkeuoForecastCard);
registerCard({
  type: "skeuo-forecast-card",
  name: { fr: "Skeuo · Prévisions", en: "Skeuo · Forecast" },
  description: {
    fr: "Trois à sept jours, chacun avec son icône sur écran et ses températures.",
    en: "Three to seven days, each with its icon on screen and its temperatures."
  },
  preview: true
});
var __defProp$3 = Object.defineProperty;
var __getOwnPropDesc$4 = Object.getOwnPropertyDescriptor;
var __decorateClass$4 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$4(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$3(target, key, result);
  return result;
};
let SkeuoHFader = class extends i$2 {
  constructor() {
    super(...arguments);
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.width = 244;
    this.caption = "";
    this.gradient = "level";
    this.disabled = false;
    this.inactive = false;
    this.ariaLabelText = "";
  }
  get _shown() {
    return this._dragging ?? this.value;
  }
  render() {
    return b`
      <div class="col" style=${o({ width: `${this.width}px` })}>
        <div class=${e({ strip: true, [this.gradient]: true })}></div>
        <div class="wrap">
          <input
            type="range"
            class="fader"
            .min=${String(this.min)}
            .max=${String(this.max)}
            .step=${String(this.step)}
            .value=${String(this._shown)}
            ?disabled=${this.disabled}
            aria-label=${this.ariaLabelText || this.caption}
            @input=${this._onInput}
            @change=${this._onChange}
          />
        </div>
        ${this.caption ? b`<p class="caption">${this.caption}</p>` : A}
      </div>
    `;
  }
  /** Retour visuel immédiat, sans appel de service. */
  _onInput(ev) {
    this._dragging = Number(ev.target.value);
    this.dispatchEvent(
      new CustomEvent("fader-input", {
        detail: { value: this._dragging },
        bubbles: true,
        composed: true
      })
    );
  }
  /**
   * Un seul appel de service, au relâchement. Piloter le volume à chaque pixel
   * de glissement noierait le bus d'événements et ferait hoqueter le son.
   */
  _onChange(ev) {
    const value = Number(ev.target.value);
    this._dragging = void 0;
    this.dispatchEvent(
      new CustomEvent("fader-change", { detail: { value }, bubbles: true, composed: true })
    );
  }
};
SkeuoHFader.styles = i$5`
    :host {
      display: block;
      flex: none;
    }
    :host([disabled]) {
      /* Désaturation, pas d'opacity : un contrôle translucide laisse voir la
         façade au travers, ce qui casse l'illusion de matière. */
      filter: grayscale(1);
      pointer-events: none;
    }
    :host([inactive]) .strip {
      filter: grayscale(1) brightness(0.75);
    }
    :host([inactive]) .caption {
      color: #5f6265;
    }
    .strip,
    .caption {
      transition: filter 0.25s ease, color 0.25s ease;
    }

    .col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
    }

    .strip {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      flex: none;
      box-shadow:
        inset 1px 1px 1px rgba(0, 0, 0, 0.3),
        inset -1px -1px 1px rgba(255, 255, 255, 0.15),
        1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    .level {
      background: linear-gradient(to right, #3a3d41 0%, #6b6f74 45%, #b9bfc5 75%, #eef1f4 100%);
    }
    .position {
      background: linear-gradient(to right, #3a3d41 0%, #5c6a75 35%, #9db8c9 70%, #cfe6f0 100%);
    }
    .warmth {
      background: linear-gradient(to right, #a9d4ff 0%, #eef6ff 35%, #ffe9c7 55%, #ff9d42 100%);
    }

    .wrap {
      position: relative;
      width: 100%;
      height: 34px;
    }

    input[type="range"].fader {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 34px;
      background: transparent;
      margin: 0;
      display: block;
      touch-action: none;
    }
    input[type="range"].fader:focus {
      outline: none;
    }
    input[type="range"].fader:focus-visible::-webkit-slider-thumb {
      box-shadow:
        -4px 4px 8px rgba(0, 0, 0, 0.6),
        0 0 0 2px var(--skeuo-accent, #e2a659);
    }

    input[type="range"].fader::-webkit-slider-runnable-track {
      width: 100%;
      height: 10px;
      cursor: ew-resize;
      background: #0a0a0a;
      border-radius: 5px;
      border: 1px solid #111;
      box-shadow:
        inset 2px 2px 4px rgba(0, 0, 0, 0.9),
        inset -1px -1px 1px rgba(255, 255, 255, 0.1);
    }
    /* Le capuchon est plus haut que large, et son trait gravé court en travers
       de la course : c'est ce qui distingue à l'oeil un fader horizontal d'un
       fader vertical couché. */
    input[type="range"].fader::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 30px;
      width: 18px;
      border-radius: 3px;
      cursor: ew-resize;
      margin-top: -10px;
      border: 1px solid #c4bc9f;
      background:
        linear-gradient(to bottom, transparent 46%, #111 46%, #111 54%, transparent 54%),
        linear-gradient(to right, #fdfbf7 0%, #e8e3d2 10%, #f5f0e1 50%, #dcd6c0 90%, #b8b096 100%);
      box-shadow:
        -4px 4px 8px rgba(0, 0, 0, 0.6),
        inset 0 2px 3px rgba(255, 255, 255, 0.9),
        inset 2px 0 3px rgba(255, 255, 255, 0.6),
        inset -2px 0 3px rgba(0, 0, 0, 0.1),
        inset 0 -3px 4px rgba(0, 0, 0, 0.3);
    }

    input[type="range"].fader::-moz-range-track {
      width: 100%;
      height: 10px;
      cursor: ew-resize;
      background: #0a0a0a;
      border-radius: 5px;
      box-shadow:
        inset 2px 2px 4px rgba(0, 0, 0, 0.9),
        inset -1px -1px 1px rgba(255, 255, 255, 0.1);
    }
    input[type="range"].fader::-moz-range-thumb {
      height: 30px;
      width: 18px;
      border-radius: 3px;
      cursor: ew-resize;
      border: 1px solid #c4bc9f;
      background:
        linear-gradient(to bottom, transparent 46%, #111 46%, #111 54%, transparent 54%),
        linear-gradient(to right, #fdfbf7 0%, #e8e3d2 10%, #f5f0e1 50%, #dcd6c0 90%, #b8b096 100%);
      box-shadow:
        -4px 4px 8px rgba(0, 0, 0, 0.6),
        inset 0 2px 3px rgba(255, 255, 255, 0.9),
        inset 0 -3px 4px rgba(0, 0, 0, 0.3);
    }

    .caption {
      margin: 0;
      font-size: 14px;
      line-height: 17px;
      letter-spacing: 2.1px;
      color: var(--skeuo-label, #85888b);
      text-transform: uppercase;
      white-space: nowrap;
    }
  `;
__decorateClass$4([
  n$1({ type: Number })
], SkeuoHFader.prototype, "value", 2);
__decorateClass$4([
  n$1({ type: Number })
], SkeuoHFader.prototype, "min", 2);
__decorateClass$4([
  n$1({ type: Number })
], SkeuoHFader.prototype, "max", 2);
__decorateClass$4([
  n$1({ type: Number })
], SkeuoHFader.prototype, "step", 2);
__decorateClass$4([
  n$1({ type: Number })
], SkeuoHFader.prototype, "width", 2);
__decorateClass$4([
  n$1({ type: String })
], SkeuoHFader.prototype, "caption", 2);
__decorateClass$4([
  n$1({ type: String })
], SkeuoHFader.prototype, "gradient", 2);
__decorateClass$4([
  n$1({ type: Boolean, reflect: true })
], SkeuoHFader.prototype, "disabled", 2);
__decorateClass$4([
  n$1({ type: Boolean, reflect: true })
], SkeuoHFader.prototype, "inactive", 2);
__decorateClass$4([
  n$1({ type: String, attribute: "aria-label" })
], SkeuoHFader.prototype, "ariaLabelText", 2);
__decorateClass$4([
  r()
], SkeuoHFader.prototype, "_dragging", 2);
SkeuoHFader = __decorateClass$4([
  t$2("skeuo-hfader")
], SkeuoHFader);
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
var __decorateClass$3 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$3(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$2(target, key, result);
  return result;
};
let SkeuoLedMeter = class extends i$2 {
  constructor() {
    super(...arguments);
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.segments = 15;
    this.warn = 0.6;
    this.danger = 0.8;
    this.segmentWidth = 26;
    this.segmentHeight = 10.5;
    this.gap = 2;
    this.label = "";
  }
  _colour(index) {
    const position = (index + 1) / this.segments;
    if (position > this.danger) return "#e0503a";
    if (position > this.warn) return "#c9a23a";
    return "#3ddc73";
  }
  render() {
    const span = this.max - this.min;
    const ratio = span > 0 ? (this.value - this.min) / span : 0;
    const lit = Math.round(Math.min(1, Math.max(0, ratio)) * this.segments);
    return b`
      <div
        class="ladder"
        role="meter"
        aria-valuenow=${this.value}
        aria-valuemin=${this.min}
        aria-valuemax=${this.max}
        aria-label=${this.label}
        style=${o({ gap: `${this.gap}px` })}
      >
        ${Array.from({ length: this.segments }, (_2, i4) => {
      const index = this.segments - 1 - i4;
      const on = index < lit;
      const colour = this._colour(index);
      return b`<i
            class="led"
            style=${o({
        width: `${this.segmentWidth}px`,
        height: `${this.segmentHeight}px`,
        background: on ? colour : "#3a3d41",
        boxShadow: on ? `0 0 3px ${colour}, inset 0 1px 1px rgba(255, 255, 255, 0.35)` : "inset 1px 1px 2px rgba(0, 0, 0, 0.55)"
      })}
          ></i>`;
    })}
      </div>
    `;
  }
};
SkeuoLedMeter.styles = i$5`
    :host {
      display: block;
      flex: none;
    }
    :host([disabled]) {
      filter: grayscale(1);
    }

    .ladder {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .led {
      display: block;
      flex: none;
      border-radius: 3px;
      transition: background 0.12s linear, box-shadow 0.12s linear;
    }
  `;
__decorateClass$3([
  n$1({ type: Number })
], SkeuoLedMeter.prototype, "value", 2);
__decorateClass$3([
  n$1({ type: Number })
], SkeuoLedMeter.prototype, "min", 2);
__decorateClass$3([
  n$1({ type: Number })
], SkeuoLedMeter.prototype, "max", 2);
__decorateClass$3([
  n$1({ type: Number })
], SkeuoLedMeter.prototype, "segments", 2);
__decorateClass$3([
  n$1({ type: Number })
], SkeuoLedMeter.prototype, "warn", 2);
__decorateClass$3([
  n$1({ type: Number })
], SkeuoLedMeter.prototype, "danger", 2);
__decorateClass$3([
  n$1({ type: Number })
], SkeuoLedMeter.prototype, "segmentWidth", 2);
__decorateClass$3([
  n$1({ type: Number })
], SkeuoLedMeter.prototype, "segmentHeight", 2);
__decorateClass$3([
  n$1({ type: Number })
], SkeuoLedMeter.prototype, "gap", 2);
__decorateClass$3([
  n$1({ type: String })
], SkeuoLedMeter.prototype, "label", 2);
SkeuoLedMeter = __decorateClass$3([
  t$2("skeuo-led-meter")
], SkeuoLedMeter);
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __decorateClass$2 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$2(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$1(target, key, result);
  return result;
};
let SkeuoVinyl = class extends i$2 {
  constructor() {
    super(...arguments);
    this.size = 118;
    this.spinning = false;
    this.badge = "";
    this.label = "";
  }
  render() {
    const size = this.size;
    return b`
      <div
        class="disc"
        role=${this.label ? "img" : "presentation"}
        aria-label=${this.label || A}
        style=${o({ width: `${size}px`, height: `${size}px` })}
      >
        <div class="grooves"></div>
        <div
          class="centre"
          style=${o({
      width: `${size * 0.42}px`,
      height: `${size * 0.42}px`,
      backgroundImage: this.art ? `url("${this.art}")` : "none"
    })}
        >
          ${this.art ? A : b`<span class="badge" style=${o({ fontSize: `${size * 0.14}px` })}
                >${this.badge}</span
              >`}
        </div>
        <div class="spindle" style=${o({ width: `${size * 0.038}px`, height: `${size * 0.038}px` })}></div>
      </div>
    `;
  }
};
SkeuoVinyl.styles = i$5`
    :host {
      display: block;
      flex: none;
    }

    .disc {
      position: relative;
      border-radius: 50%;
      overflow: hidden;
      /* Reflet en bas-droite, ombre portée dans le même sens : la source de
         lumière du projet est en haut à gauche. */
      background:
        radial-gradient(circle at 68% 72%, rgba(255, 255, 255, 0.09), transparent 42%),
        radial-gradient(circle at 30% 26%, #2a2a2a, #0b0b0b 70%);
      box-shadow:
        4px 4px 9px rgba(0, 0, 0, 0.6),
        inset 2px 2px 4px rgba(0, 0, 0, 0.7),
        inset -2px -2px 3px rgba(255, 255, 255, 0.06);
    }

    /* Les sillons tournent, le corps du disque et son reflet restent fixes :
       un reflet qui tournerait avec le disque trahirait aussitôt le décor. */
    .grooves {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: repeating-radial-gradient(
        circle at 50% 50%,
        rgba(255, 255, 255, 0.055) 0 1px,
        rgba(0, 0, 0, 0.5) 1px 3px
      );
      animation: turn 3.4s linear infinite;
      animation-play-state: paused;
    }
    :host([spinning]) .grooves,
    :host([spinning]) .centre {
      animation-play-state: running;
    }

    .centre {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      /* Colonne, et non rangée : le texte doit descendre sous le trou central
         comme sur une étiquette de disque, et justify-content ne travaille sur
         la verticale qu'à cette condition. Centré, le texte se faisait
         traverser par l'axe. */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 6%;
      box-sizing: border-box;
      background-color: var(--skeuo-accent, #e2a659);
      background-size: cover;
      background-position: center;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.45);
      animation: turn 3.4s linear infinite;
      animation-play-state: paused;
      transform-origin: center;
    }

    /* La pastille suit le diamètre du disque : une taille fixe devient illisible
       dès que la carte est posée dans une cellule étroite, et le seul texte de
       l'étiquette se réduit alors à une tache. */
    .badge {
      font-family: var(--skeuo-font-lcd);
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0.5px;
      color: #1a1207;
      text-transform: uppercase;
    }

    /* Trou d'axe : sept millimètres sur un disque de trente centimètres, soit
       un peu moins de quatre pour cent du diamètre. Plus large, il mordait sur
       le texte de l'étiquette. */
    .spindle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: #0a0a0a;
      box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.9);
    }

    @keyframes turn {
      to {
        transform: rotate(360deg);
      }
    }

    /* La pastille est déjà centrée par une translation : sa rotation doit s'y
       ajouter, sinon l'animation écrase la translation et la pastille saute en
       haut à gauche du disque. */
    @keyframes turn-centre {
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }
    .centre {
      animation-name: turn-centre;
    }

    @media (prefers-reduced-motion: reduce) {
      .grooves,
      .centre {
        animation: none;
      }
      .centre {
        transform: translate(-50%, -50%);
      }
    }
  `;
__decorateClass$2([
  n$1({ type: Number })
], SkeuoVinyl.prototype, "size", 2);
__decorateClass$2([
  n$1({ type: Boolean, reflect: true })
], SkeuoVinyl.prototype, "spinning", 2);
__decorateClass$2([
  n$1({ type: String })
], SkeuoVinyl.prototype, "art", 2);
__decorateClass$2([
  n$1({ type: String })
], SkeuoVinyl.prototype, "badge", 2);
__decorateClass$2([
  n$1({ type: String })
], SkeuoVinyl.prototype, "label", 2);
SkeuoVinyl = __decorateClass$2([
  t$2("skeuo-vinyl")
], SkeuoVinyl);
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = decorator(result) || result;
  return result;
};
const LED_SEGMENT = 11.4;
const SUPPORT_PAUSE = 1;
const SUPPORT_VOLUME_SET = 4;
const SUPPORT_PREVIOUS_TRACK = 16;
const SUPPORT_NEXT_TRACK = 32;
const SUPPORT_STOP = 4096;
const SUPPORT_PLAY = 16384;
let SkeuoMediaCard = class extends SkeuoBaseCard {
  constructor() {
    super(...arguments);
    this._volume = new SmoothValue(this);
  }
  validateConfig(config) {
    this.expectDomain(config, "media_player");
  }
  isOff(stateObj) {
    return stateObj.state === "off" || stateObj.state === "standby";
  }
  willUpdate(changed) {
    super.willUpdate?.(changed);
    const stateObj = this.stateObj;
    if (stateObj) this._volume.set(this._volumePercent(stateObj));
  }
  static getConfigForm() {
    return {
      schema: baseSchema(),
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("media_player.")) {
          throw new Error(domainRequired("media_player"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("media_player.")) ?? entitiesFallback.find((e2) => e2.startsWith("media_player.")) ?? "media_player.living_room";
    return { entity: pick, texture: DEFAULT_TEXTURE };
  }
  /* ------------------------------------------------------------- lecture */
  _supports(stateObj, bit) {
    const features = numericState(stateObj.attributes.supported_features) ?? 0;
    return (features & bit) !== 0;
  }
  /** volume_level est une fraction de 0 à 1 côté Home Assistant. */
  _volumePercent(stateObj) {
    const level = numericState(stateObj.attributes.volume_level);
    return level === void 0 ? 0 : Math.round(level * 100);
  }
  _playing(stateObj) {
    return stateObj.state === "playing";
  }
  /**
   * Ce qui passe, en une ligne.
   *
   * Les intégrations ne remplissent pas les mêmes champs : une radio n'a
   * souvent qu'un `media_title`, une série remonte `media_series_title`, et
   * certaines applications ne donnent que leur nom. On descend la liste
   * jusqu'à trouver quelque chose plutôt que d'afficher une ligne vide.
   */
  _title(stateObj) {
    const a2 = stateObj.attributes;
    return a2.media_title ?? a2.media_series_title ?? a2.app_name ?? a2.source ?? "";
  }
  _subtitle(stateObj) {
    const a2 = stateObj.attributes;
    return a2.media_artist ?? a2.media_album_name ?? a2.app_name ?? "";
  }
  /* ------------------------------------------------------------- actions */
  _onVolume(ev) {
    this._volume.set(ev.detail.value, true);
    this.callService("media_player", "volume_set", { volume_level: ev.detail.value / 100 });
  }
  /**
   * Un seul appel pour les deux sens : `media_play_pause` bascule selon l'état
   * réel de l'appareil, ce qui évite de le déduire d'un état qui peut avoir
   * changé entre le rendu et l'appui.
   */
  _togglePlay() {
    this.callService("media_player", "media_play_pause");
  }
  /* --------------------------------------------------------------- rendu */
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const playing = this._playing(stateObj);
    const volume = Math.round(this._volume.value);
    const settable = this._supports(stateObj, SUPPORT_VOLUME_SET);
    const stateLabel = tHa(
      this.hass,
      `component.media_player.entity_component._.state.${stateObj.state}`,
      stateObj.state
    );
    const title = this._title(stateObj);
    const art = stateObj.attributes.entity_picture;
    return b`
      <div class="left">
        <div class="top">
          <skeuo-vinyl
          .size=${118}
          .spinning=${playing && !dead}
          .art=${art}
            .badge=${"33"}
            .label=${title || stateLabel}
          ></skeuo-vinyl>

          <div class="mid">
            <p class="plate state">${stateLabel}</p>
            <p class="plate title">${title || this._subtitle(stateObj)}</p>
            ${settable ? b`
                  <skeuo-hfader
                    gradient="level"
                    .value=${volume}
                    .width=${244}
                    .disabled=${dead}
                    .caption=${t(this.hass, "volume")}
                    .label=${t(this.hass, "volume")}
                    @fader-change=${this._onVolume}
                  ></skeuo-hfader>
                ` : A}
          </div>
        </div>

        <div class="btn-row">
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_PREVIOUS_TRACK)}
          .label=${tHa(this.hass, "ui.card.media_player.media_previous_track", "previous")}
          @press=${() => this.callService("media_player", "media_previous_track")}
          >${iconPrev()}</skeuo-button
        >
        <skeuo-button
          primary
          .active=${playing}
          .disabled=${dead || !(this._supports(stateObj, SUPPORT_PLAY) || this._supports(stateObj, SUPPORT_PAUSE))}
          .label=${tHa(
      this.hass,
      playing ? "ui.card.media_player.media_pause" : "ui.card.media_player.media_play",
      playing ? "pause" : "play"
    )}
          @press=${this._togglePlay}
          >${playing ? iconPause() : iconPlay()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_NEXT_TRACK)}
          .label=${tHa(this.hass, "ui.card.media_player.media_next_track", "next")}
          @press=${() => this.callService("media_player", "media_next_track")}
          >${iconNext()}</skeuo-button
        >
        <skeuo-button
          .disabled=${dead || !this._supports(stateObj, SUPPORT_STOP)}
          .label=${tHa(this.hass, "ui.card.media_player.media_stop", "stop")}
          @press=${() => this.callService("media_player", "media_stop")}
            >${iconStop()}</skeuo-button
          >
        </div>
      </div>

      <skeuo-led-meter
        class="ladder"
        .value=${settable ? volume : 0}
        .segments=${15}
        .segmentHeight=${LED_SEGMENT}
        .label=${t(this.hass, "volume")}
        ?disabled=${dead || !settable}
      ></skeuo-led-meter>
    `;
  }
};
SkeuoMediaCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      /* L'échelle occupe toute la hauteur du corps, à côté d'une colonne qui
         porte elle-même deux étages, les indicateurs puis le transport. La
         mettre dans la rangée du haut la limiterait à la hauteur du vinyle et
         lui ferait perdre la moitié de ses segments. */
      .body {
        align-items: stretch;
        justify-content: flex-start;
        padding: 0 26px;
        gap: 20px;
      }

      /* Les vis occupent les quatre coins du module, de 13 à 33 unités du bord.
         Tout ce qui court sur toute la hauteur ou toute la largeur du corps
         passe donc dessous si on le laisse aller jusqu'aux marges : la marge de
         26 unités ne suffit pas, il faut dégager les couloirs des vis. */
      .left {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
        /* Remonte la rangée de transport au-dessus des vis du bas. */
        padding-bottom: 8px;
      }

      /* Écarte l'échelle du couloir des vis de droite. */
      .ladder {
        align-self: center;
        margin-right: 16px;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 18px;
        min-height: 0;
      }

      .mid {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      /* Plaques gravées : le nom de ce qui passe est en clair, l'état au-dessus
         reste en retrait. Une seule ligne chacune, coupée proprement plutôt que
         de faire respirer la carte à chaque changement de titre. */
      .plate {
        margin: 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 14px;
        line-height: 18px;
        letter-spacing: 0.6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .state {
        color: #85888b;
        text-transform: uppercase;
        letter-spacing: 2.1px;
      }
      .title {
        color: #e4e0d4;
        margin-bottom: 6px;
      }

      .btn-row {
        display: flex;
        align-items: center;
        gap: 14px;
      }
    `
];
SkeuoMediaCard = __decorateClass$1([
  t$2("skeuo-media-card")
], SkeuoMediaCard);
registerCard({
  type: "skeuo-media-card",
  name: { fr: "Skeuo · Multimédia", en: "Skeuo · Media player" },
  description: {
    fr: "Vinyle, échelle à LED, fader de volume et transport complet.",
    en: "Vinyl record, LED ladder, volume fader and full transport."
  },
  preview: true
});
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
    if (decorator = decorators[i4])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
const DEFAULT_REFRESH = 10;
let SkeuoCameraCard = class extends SkeuoBaseCard {
  constructor() {
    super(...arguments);
    this._frame = 0;
    this._live = true;
  }
  validateConfig(config) {
    this.expectDomain(config, "camera");
  }
  /* ------------------------------------------------------- cycle de vie */
  connectedCallback() {
    super.connectedCallback();
    this._schedule();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._stop();
  }
  static getConfigForm() {
    return {
      schema: [
        ...baseSchema(),
        {
          type: "grid",
          name: "",
          schema: [
            {
              name: "refresh",
              selector: { number: { min: 0, max: 60, step: 1, mode: "slider", unit_of_measurement: "s" } }
            }
          ]
        },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "record_filename", selector: { text: {} } },
            {
              name: "record_duration",
              selector: { number: { min: 5, max: 300, step: 5, mode: "box", unit_of_measurement: "s" } }
            }
          ]
        }
      ],
      computeLabel,
      computeHelper,
      assertConfig: (config) => {
        if (config.entity && !config.entity.startsWith("camera.")) {
          throw new Error(domainRequired("camera"));
        }
      }
    };
  }
  static getStubConfig(_hass, entities, entitiesFallback) {
    const pick = entities.find((e2) => e2.startsWith("camera.")) ?? entitiesFallback.find((e2) => e2.startsWith("camera.")) ?? "camera.front_door";
    return { entity: pick, refresh: DEFAULT_REFRESH, texture: DEFAULT_TEXTURE };
  }
  /* ------------------------------------------------------ rafraîchissement */
  get _interval() {
    const asked = this._config?.refresh;
    if (asked === void 0 || !Number.isFinite(asked)) return DEFAULT_REFRESH;
    return Math.min(60, Math.max(0, Math.round(asked)));
  }
  /**
   * Une minuterie plutôt qu'un flux vidéo.
   *
   * Le direct passe par HLS ou WebRTC, que le frontend gère avec ses propres
   * éléments et que rien ne permet de piloter proprement depuis une carte
   * externe. La carte affiche donc l'instantané que Home Assistant publie déjà
   * sur `entity_picture`, redemandé à intervalle réglable, et le bouton Direct
   * ouvre la fiche de l'entité, où le vrai flux est joué.
   *
   * Rien n'est demandé en aperçu de configuration ni dans la vignette du
   * sélecteur : la carte y est instanciée plusieurs fois d'affilée, et autant
   * de minuteries taperaient sur la caméra pour rien.
   */
  _schedule() {
    this._stop();
    if (this.preview || !this._live || this._interval === 0) return;
    this._timer = window.setInterval(() => {
      this._frame = Date.now();
    }, this._interval * 1e3);
  }
  _stop() {
    if (this._timer !== void 0) {
      window.clearInterval(this._timer);
      this._timer = void 0;
    }
  }
  /* ------------------------------------------------------------- lecture */
  /**
   * `entity_picture` porte déjà un jeton signé et donc une chaîne de requête.
   * Le paramètre anti-cache s'y ajoute, sans quoi le navigateur resservirait
   * la même image à chaque tour de minuterie.
   */
  _frameUrl(stateObj) {
    const base = stateObj.attributes.entity_picture;
    if (!base) return void 0;
    if (this._frame === 0 || this._interval === 0) return base;
    return `${base}${base.includes("?") ? "&" : "?"}skeuo=${this._frame}`;
  }
  get _clock() {
    const at = this._frame === 0 ? /* @__PURE__ */ new Date() : new Date(this._frame);
    return at.toLocaleTimeString(isFrench(this.hass) ? "fr-FR" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }
  get _canRecord() {
    return !!this._config?.record_filename;
  }
  /* ------------------------------------------------------------- actions */
  _togglePreview() {
    this._live = !this._live;
    if (this._live) this._frame = Date.now();
    this._schedule();
  }
  _toggleMotion(stateObj) {
    const on = stateObj.attributes.motion_detection === true;
    this.callService("camera", on ? "disable_motion_detection" : "enable_motion_detection");
  }
  _record() {
    if (!this._canRecord) return;
    this.callService("camera", "record", {
      filename: this._config.record_filename,
      duration: this._config?.record_duration ?? 30
    });
  }
  _openStream() {
    fireEvent(this, "hass-more-info", { entityId: this._config?.entity ?? null });
  }
  /* --------------------------------------------------------------- rendu */
  renderContent(stateObj) {
    const dead = isUnavailable(stateObj);
    const off = stateObj.state === "off" || stateObj.state === "unavailable";
    const url = this._frameUrl(stateObj);
    const motion = stateObj.attributes.motion_detection;
    const streaming = this._live && this._interval > 0 && !off && !dead;
    return b`
      <div class="btn-col">
        <skeuo-button
          .active=${streaming}
          .disabled=${dead}
          .caption=${t(this.hass, "preview")}
          .label=${t(this.hass, "preview")}
          @press=${this._togglePreview}
          >${iconCamera()}</skeuo-button
        >
        <skeuo-button
          .active=${motion === true}
          .disabled=${dead || motion === void 0}
          .caption=${t(this.hass, "motion")}
          .label=${t(this.hass, "motion")}
          @press=${() => this._toggleMotion(stateObj)}
          >${iconMotion()}</skeuo-button
        >
        <skeuo-button
          variant="alert"
          .disabled=${dead || !this._canRecord}
          .caption=${t(this.hass, "record")}
          .label=${t(this.hass, "record")}
          @press=${this._record}
          >${iconRecord()}</skeuo-button
        >
      </div>

      <div
        class="viewport"
        role="button"
        tabindex="0"
        aria-label=${t(this.hass, "open_stream")}
        @click=${this._openStream}
        @keydown=${(ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        this._openStream();
      }
    }}
      >
        ${url && !off ? b`<img class="frame" src=${url} alt=${t(this.hass, "preview")} />` : b`<div class="blank">${iconCamera()}</div>`}

        <div class=${streaming ? "badge on" : "badge"}>
          <i class="dot"></i>
          <p class="badge-text">
            ${streaming ? t(this.hass, "live") : t(this.hass, "paused_preview")}
          </p>
        </div>
        ${url && !off ? b`<p class="clock">${this._clock}</p>` : A}
      </div>
    `;
  }
};
SkeuoCameraCard.styles = [
  SkeuoBaseCard.styles,
  i$5`
      .body {
        justify-content: flex-start;
        align-items: center;
        gap: 30px;
        padding: 0 26px;
      }

      /* Trois boutons et leurs légendes font 207 unités pour 202 de corps
         disponible : l'écart entre eux passe à zéro, et la colonne se décale
         vers l'intérieur. Sans ce décalage, la légende du bas se superpose à la
         vis d'angle, que la colonne dépasse forcément en hauteur. Le décalage
         est porté par la colonne et non par la marge du corps, qui doit rester
         symétrique pour que l'écran garde son inclusion habituelle. */
      .btn-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
        margin-left: 14px;
        flex: none;
      }

      /* Vitre du moniteur : creusée comme les écrans LCD du pack, mais neutre,
         l'ambre teinterait l'image de la caméra. */
      /* Le moniteur court sur presque toute la largeur : sans cette marge, son
         angle bas-droite passerait sous la vis du même coin. */
      .viewport {
        position: relative;
        flex: 1;
        min-width: 0;
        margin-right: 16px;
        height: 196px;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        background: radial-gradient(ellipse at 50% 35%, #1b1b1d, #0c0c0d 78%);
        box-shadow:
          inset 5px 5px 4px rgba(0, 0, 0, 0.9),
          inset 3px 3px 9px rgba(0, 0, 0, 0.85),
          inset -2px -2px 2px rgba(255, 255, 255, 0.05),
          0 0 0 3px #100b06,
          5px 5px 9px rgba(0, 0, 0, 0.55);
      }
      .viewport:focus-visible {
        outline: 2px solid var(--skeuo-accent, #e2a659);
        outline-offset: 3px;
      }

      .frame {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .blank {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4a4d50;
      }
      .blank svg {
        width: 38px;
        height: 38px;
      }

      .badge {
        position: absolute;
        top: 10px;
        left: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #5a5d60;
      }
      .badge.on .dot {
        background: #ff4d4d;
        box-shadow: 0 0 6px #ff4d4d, 0 0 3px #ff9d9d;
        animation: beat 2s ease-in-out infinite;
      }
      .badge-text {
        margin: 0;
        font-size: 14px;
        line-height: 17px;
        letter-spacing: 2.2px;
        font-weight: 700;
        text-transform: uppercase;
        color: #7f8285;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }
      .badge.on .badge-text {
        color: #ff8a8a;
      }

      .clock {
        position: absolute;
        bottom: 9px;
        right: 12px;
        margin: 0;
        font-family: var(--skeuo-font-lcd);
        font-size: 14px;
        letter-spacing: 0.9px;
        color: #b6b2a6;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
      }

      @keyframes beat {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.35;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .badge.on .dot {
          animation: none;
        }
      }
    `
];
__decorateClass([
  r()
], SkeuoCameraCard.prototype, "_frame", 2);
__decorateClass([
  r()
], SkeuoCameraCard.prototype, "_live", 2);
SkeuoCameraCard = __decorateClass([
  t$2("skeuo-camera-card")
], SkeuoCameraCard);
registerCard({
  type: "skeuo-camera-card",
  name: { fr: "Skeuo · Caméra", en: "Skeuo · Camera" },
  description: {
    fr: "Moniteur d'aperçu avec badge direct, détection de mouvement et enregistrement.",
    en: "Preview monitor with a live badge, motion detection and recording."
  },
  preview: true
});
console.info(
  `%c  SKEUO-CARDS  %c  v${"1.0.1"}  `,
  "color:#141414; font-weight:700; background:#e2a659",
  "color:#e2a659; font-weight:700; background:#141414"
);
export {
  SkeuoAlarmCard,
  SkeuoCameraCard,
  SkeuoClimateCard,
  SkeuoCoverCard,
  SkeuoFanCard,
  SkeuoForecastCard,
  SkeuoLightCard,
  SkeuoLockCard,
  SkeuoMediaCard,
  SkeuoSensorCard,
  SkeuoSwitchCard,
  SkeuoVacuumCard,
  SkeuoWaterHeaterCard,
  SkeuoWeatherCard
};
