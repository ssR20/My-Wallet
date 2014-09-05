! function(e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
    else if ("function" == typeof define && define.amd) define([], e);
    else {
        var f;
        "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.Bitcoin = e()
    }
}(function() {
    var define, module, exports;
    return function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    }({
        1: [
            function(require, module, exports) {
                var assert = require("assert");
                module.exports = BigInteger;
                var canary = 0xdeadbeefcafe;
                var j_lm = (canary & 16777215) == 15715070;

                function BigInteger(a, b, c) {
                    if (!(this instanceof BigInteger)) {
                        return new BigInteger(a, b, c)
                    }
                    if (a != null) {
                        if ("number" == typeof a) this.fromNumber(a, b, c);
                        else if (b == null && "string" != typeof a) this.fromString(a, 256);
                        else this.fromString(a, b)
                    }
                }
                var proto = BigInteger.prototype;

                function nbi() {
                    return new BigInteger(null)
                }
                var dbits;

                function am1(i, x, w, j, c, n) {
                    while (--n >= 0) {
                        var v = x * this[i++] + w[j] + c;
                        c = Math.floor(v / 67108864);
                        w[j++] = v & 67108863
                    }
                    return c
                }

                function am2(i, x, w, j, c, n) {
                    var xl = x & 32767,
                        xh = x >> 15;
                    while (--n >= 0) {
                        var l = this[i] & 32767;
                        var h = this[i++] >> 15;
                        var m = xh * l + h * xl;
                        l = xl * l + ((m & 32767) << 15) + w[j] + (c & 1073741823);
                        c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
                        w[j++] = l & 1073741823
                    }
                    return c
                }

                function am3(i, x, w, j, c, n) {
                    var xl = x & 16383,
                        xh = x >> 14;
                    while (--n >= 0) {
                        var l = this[i] & 16383;
                        var h = this[i++] >> 14;
                        var m = xh * l + h * xl;
                        l = xl * l + ((m & 16383) << 14) + w[j] + c;
                        c = (l >> 28) + (m >> 14) + xh * h;
                        w[j++] = l & 268435455
                    }
                    return c
                }
                BigInteger.prototype.am = am1;
                dbits = 26;
                BigInteger.prototype.DB = dbits;
                BigInteger.prototype.DM = (1 << dbits) - 1;
                var DV = BigInteger.prototype.DV = 1 << dbits;
                var BI_FP = 52;
                BigInteger.prototype.FV = Math.pow(2, BI_FP);
                BigInteger.prototype.F1 = BI_FP - dbits;
                BigInteger.prototype.F2 = 2 * dbits - BI_FP;
                var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
                var BI_RC = new Array;
                var rr, vv;
                rr = "0".charCodeAt(0);
                for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
                rr = "a".charCodeAt(0);
                for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
                rr = "A".charCodeAt(0);
                for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

                function int2char(n) {
                    return BI_RM.charAt(n)
                }

                function intAt(s, i) {
                    var c = BI_RC[s.charCodeAt(i)];
                    return c == null ? -1 : c
                }

                function bnpCopyTo(r) {
                    for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
                    r.t = this.t;
                    r.s = this.s
                }

                function bnpFromInt(x) {
                    this.t = 1;
                    this.s = x < 0 ? -1 : 0;
                    if (x > 0) this[0] = x;
                    else if (x < -1) this[0] = x + DV;
                    else this.t = 0
                }

                function nbv(i) {
                    var r = nbi();
                    r.fromInt(i);
                    return r
                }

                function bnpFromString(s, b) {
                    var self = this;
                    var k;
                    if (b == 16) k = 4;
                    else if (b == 8) k = 3;
                    else if (b == 256) k = 8;
                    else if (b == 2) k = 1;
                    else if (b == 32) k = 5;
                    else if (b == 4) k = 2;
                    else {
                        self.fromRadix(s, b);
                        return
                    }
                    self.t = 0;
                    self.s = 0;
                    var i = s.length,
                        mi = false,
                        sh = 0;
                    while (--i >= 0) {
                        var x = k == 8 ? s[i] & 255 : intAt(s, i);
                        if (x < 0) {
                            if (s.charAt(i) == "-") mi = true;
                            continue
                        }
                        mi = false;
                        if (sh == 0) self[self.t++] = x;
                        else if (sh + k > self.DB) {
                            self[self.t - 1] |= (x & (1 << self.DB - sh) - 1) << sh;
                            self[self.t++] = x >> self.DB - sh
                        } else self[self.t - 1] |= x << sh;
                        sh += k;
                        if (sh >= self.DB) sh -= self.DB
                    }
                    if (k == 8 && (s[0] & 128) != 0) {
                        self.s = -1;
                        if (sh > 0) self[self.t - 1] |= (1 << self.DB - sh) - 1 << sh
                    }
                    self.clamp();
                    if (mi) BigInteger.ZERO.subTo(self, self)
                }

                function bnpClamp() {
                    var c = this.s & this.DM;
                    while (this.t > 0 && this[this.t - 1] == c) --this.t
                }

                function bnToString(b) {
                    var self = this;
                    if (self.s < 0) return "-" + self.negate().toString(b);
                    var k;
                    if (b == 16) k = 4;
                    else if (b == 8) k = 3;
                    else if (b == 2) k = 1;
                    else if (b == 32) k = 5;
                    else if (b == 4) k = 2;
                    else return self.toRadix(b);
                    var km = (1 << k) - 1,
                        d, m = false,
                        r = "",
                        i = self.t;
                    var p = self.DB - i * self.DB % k;
                    if (i-- > 0) {
                        if (p < self.DB && (d = self[i] >> p) > 0) {
                            m = true;
                            r = int2char(d)
                        }
                        while (i >= 0) {
                            if (p < k) {
                                d = (self[i] & (1 << p) - 1) << k - p;
                                d |= self[--i] >> (p += self.DB - k)
                            } else {
                                d = self[i] >> (p -= k) & km;
                                if (p <= 0) {
                                    p += self.DB;
                                    --i
                                }
                            } if (d > 0) m = true;
                            if (m) r += int2char(d)
                        }
                    }
                    return m ? r : "0"
                }

                function bnNegate() {
                    var r = nbi();
                    BigInteger.ZERO.subTo(this, r);
                    return r
                }

                function bnAbs() {
                    return this.s < 0 ? this.negate() : this
                }

                function bnCompareTo(a) {
                    var r = this.s - a.s;
                    if (r != 0) return r;
                    var i = this.t;
                    r = i - a.t;
                    if (r != 0) return this.s < 0 ? -r : r;
                    while (--i >= 0)
                        if ((r = this[i] - a[i]) != 0) return r;
                    return 0
                }

                function nbits(x) {
                    var r = 1,
                        t;
                    if ((t = x >>> 16) != 0) {
                        x = t;
                        r += 16
                    }
                    if ((t = x >> 8) != 0) {
                        x = t;
                        r += 8
                    }
                    if ((t = x >> 4) != 0) {
                        x = t;
                        r += 4
                    }
                    if ((t = x >> 2) != 0) {
                        x = t;
                        r += 2
                    }
                    if ((t = x >> 1) != 0) {
                        x = t;
                        r += 1
                    }
                    return r
                }

                function bnBitLength() {
                    if (this.t <= 0) return 0;
                    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM)
                }

                function bnpDLShiftTo(n, r) {
                    var i;
                    for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
                    for (i = n - 1; i >= 0; --i) r[i] = 0;
                    r.t = this.t + n;
                    r.s = this.s
                }

                function bnpDRShiftTo(n, r) {
                    for (var i = n; i < this.t; ++i) r[i - n] = this[i];
                    r.t = Math.max(this.t - n, 0);
                    r.s = this.s
                }

                function bnpLShiftTo(n, r) {
                    var self = this;
                    var bs = n % self.DB;
                    var cbs = self.DB - bs;
                    var bm = (1 << cbs) - 1;
                    var ds = Math.floor(n / self.DB),
                        c = self.s << bs & self.DM,
                        i;
                    for (i = self.t - 1; i >= 0; --i) {
                        r[i + ds + 1] = self[i] >> cbs | c;
                        c = (self[i] & bm) << bs
                    }
                    for (i = ds - 1; i >= 0; --i) r[i] = 0;
                    r[ds] = c;
                    r.t = self.t + ds + 1;
                    r.s = self.s;
                    r.clamp()
                }

                function bnpRShiftTo(n, r) {
                    var self = this;
                    r.s = self.s;
                    var ds = Math.floor(n / self.DB);
                    if (ds >= self.t) {
                        r.t = 0;
                        return
                    }
                    var bs = n % self.DB;
                    var cbs = self.DB - bs;
                    var bm = (1 << bs) - 1;
                    r[0] = self[ds] >> bs;
                    for (var i = ds + 1; i < self.t; ++i) {
                        r[i - ds - 1] |= (self[i] & bm) << cbs;
                        r[i - ds] = self[i] >> bs
                    }
                    if (bs > 0) r[self.t - ds - 1] |= (self.s & bm) << cbs;
                    r.t = self.t - ds;
                    r.clamp()
                }

                function bnpSubTo(a, r) {
                    var self = this;
                    var i = 0,
                        c = 0,
                        m = Math.min(a.t, self.t);
                    while (i < m) {
                        c += self[i] - a[i];
                        r[i++] = c & self.DM;
                        c >>= self.DB
                    }
                    if (a.t < self.t) {
                        c -= a.s;
                        while (i < self.t) {
                            c += self[i];
                            r[i++] = c & self.DM;
                            c >>= self.DB
                        }
                        c += self.s
                    } else {
                        c += self.s;
                        while (i < a.t) {
                            c -= a[i];
                            r[i++] = c & self.DM;
                            c >>= self.DB
                        }
                        c -= a.s
                    }
                    r.s = c < 0 ? -1 : 0;
                    if (c < -1) r[i++] = self.DV + c;
                    else if (c > 0) r[i++] = c;
                    r.t = i;
                    r.clamp()
                }

                function bnpMultiplyTo(a, r) {
                    var x = this.abs(),
                        y = a.abs();
                    var i = x.t;
                    r.t = i + y.t;
                    while (--i >= 0) r[i] = 0;
                    for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
                    r.s = 0;
                    r.clamp();
                    if (this.s != a.s) BigInteger.ZERO.subTo(r, r)
                }

                function bnpSquareTo(r) {
                    var x = this.abs();
                    var i = r.t = 2 * x.t;
                    while (--i >= 0) r[i] = 0;
                    for (i = 0; i < x.t - 1; ++i) {
                        var c = x.am(i, x[i], r, 2 * i, 0, 1);
                        if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
                            r[i + x.t] -= x.DV;
                            r[i + x.t + 1] = 1
                        }
                    }
                    if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
                    r.s = 0;
                    r.clamp()
                }

                function bnpDivRemTo(m, q, r) {
                    var self = this;
                    var pm = m.abs();
                    if (pm.t <= 0) return;
                    var pt = self.abs();
                    if (pt.t < pm.t) {
                        if (q != null) q.fromInt(0);
                        if (r != null) self.copyTo(r);
                        return
                    }
                    if (r == null) r = nbi();
                    var y = nbi(),
                        ts = self.s,
                        ms = m.s;
                    var nsh = self.DB - nbits(pm[pm.t - 1]);
                    if (nsh > 0) {
                        pm.lShiftTo(nsh, y);
                        pt.lShiftTo(nsh, r)
                    } else {
                        pm.copyTo(y);
                        pt.copyTo(r)
                    }
                    var ys = y.t;
                    var y0 = y[ys - 1];
                    if (y0 == 0) return;
                    var yt = y0 * (1 << self.F1) + (ys > 1 ? y[ys - 2] >> self.F2 : 0);
                    var d1 = self.FV / yt,
                        d2 = (1 << self.F1) / yt,
                        e = 1 << self.F2;
                    var i = r.t,
                        j = i - ys,
                        t = q == null ? nbi() : q;
                    y.dlShiftTo(j, t);
                    if (r.compareTo(t) >= 0) {
                        r[r.t++] = 1;
                        r.subTo(t, r)
                    }
                    BigInteger.ONE.dlShiftTo(ys, t);
                    t.subTo(y, y);
                    while (y.t < ys) y[y.t++] = 0;
                    while (--j >= 0) {
                        var qd = r[--i] == y0 ? self.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
                        if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
                            y.dlShiftTo(j, t);
                            r.subTo(t, r);
                            while (r[i] < --qd) r.subTo(t, r)
                        }
                    }
                    if (q != null) {
                        r.drShiftTo(ys, q);
                        if (ts != ms) BigInteger.ZERO.subTo(q, q)
                    }
                    r.t = ys;
                    r.clamp();
                    if (nsh > 0) r.rShiftTo(nsh, r);
                    if (ts < 0) BigInteger.ZERO.subTo(r, r)
                }

                function bnMod(a) {
                    var r = nbi();
                    this.abs().divRemTo(a, null, r);
                    if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
                    return r
                }

                function Classic(m) {
                    this.m = m
                }

                function cConvert(x) {
                    if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
                    else return x
                }

                function cRevert(x) {
                    return x
                }

                function cReduce(x) {
                    x.divRemTo(this.m, null, x)
                }

                function cMulTo(x, y, r) {
                    x.multiplyTo(y, r);
                    this.reduce(r)
                }

                function cSqrTo(x, r) {
                    x.squareTo(r);
                    this.reduce(r)
                }
                Classic.prototype.convert = cConvert;
                Classic.prototype.revert = cRevert;
                Classic.prototype.reduce = cReduce;
                Classic.prototype.mulTo = cMulTo;
                Classic.prototype.sqrTo = cSqrTo;

                function bnpInvDigit() {
                    if (this.t < 1) return 0;
                    var x = this[0];
                    if ((x & 1) == 0) return 0;
                    var y = x & 3;
                    y = y * (2 - (x & 15) * y) & 15;
                    y = y * (2 - (x & 255) * y) & 255;
                    y = y * (2 - ((x & 65535) * y & 65535)) & 65535;
                    y = y * (2 - x * y % this.DV) % this.DV;
                    return y > 0 ? this.DV - y : -y
                }

                function Montgomery(m) {
                    this.m = m;
                    this.mp = m.invDigit();
                    this.mpl = this.mp & 32767;
                    this.mph = this.mp >> 15;
                    this.um = (1 << m.DB - 15) - 1;
                    this.mt2 = 2 * m.t
                }

                function montConvert(x) {
                    var r = nbi();
                    x.abs().dlShiftTo(this.m.t, r);
                    r.divRemTo(this.m, null, r);
                    if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
                    return r
                }

                function montRevert(x) {
                    var r = nbi();
                    x.copyTo(r);
                    this.reduce(r);
                    return r
                }

                function montReduce(x) {
                    while (x.t <= this.mt2) x[x.t++] = 0;
                    for (var i = 0; i < this.m.t; ++i) {
                        var j = x[i] & 32767;
                        var u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
                        j = i + this.m.t;
                        x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
                        while (x[j] >= x.DV) {
                            x[j] -= x.DV;
                            x[++j] ++
                        }
                    }
                    x.clamp();
                    x.drShiftTo(this.m.t, x);
                    if (x.compareTo(this.m) >= 0) x.subTo(this.m, x)
                }

                function montSqrTo(x, r) {
                    x.squareTo(r);
                    this.reduce(r)
                }

                function montMulTo(x, y, r) {
                    x.multiplyTo(y, r);
                    this.reduce(r)
                }
                Montgomery.prototype.convert = montConvert;
                Montgomery.prototype.revert = montRevert;
                Montgomery.prototype.reduce = montReduce;
                Montgomery.prototype.mulTo = montMulTo;
                Montgomery.prototype.sqrTo = montSqrTo;

                function bnpIsEven() {
                    return (this.t > 0 ? this[0] & 1 : this.s) == 0
                }

                function bnpExp(e, z) {
                    if (e > 4294967295 || e < 1) return BigInteger.ONE;
                    var r = nbi(),
                        r2 = nbi(),
                        g = z.convert(this),
                        i = nbits(e) - 1;
                    g.copyTo(r);
                    while (--i >= 0) {
                        z.sqrTo(r, r2);
                        if ((e & 1 << i) > 0) z.mulTo(r2, g, r);
                        else {
                            var t = r;
                            r = r2;
                            r2 = t
                        }
                    }
                    return z.revert(r)
                }

                function bnModPowInt(e, m) {
                    var z;
                    if (e < 256 || m.isEven()) z = new Classic(m);
                    else z = new Montgomery(m);
                    return this.exp(e, z)
                }
                proto.copyTo = bnpCopyTo;
                proto.fromInt = bnpFromInt;
                proto.fromString = bnpFromString;
                proto.clamp = bnpClamp;
                proto.dlShiftTo = bnpDLShiftTo;
                proto.drShiftTo = bnpDRShiftTo;
                proto.lShiftTo = bnpLShiftTo;
                proto.rShiftTo = bnpRShiftTo;
                proto.subTo = bnpSubTo;
                proto.multiplyTo = bnpMultiplyTo;
                proto.squareTo = bnpSquareTo;
                proto.divRemTo = bnpDivRemTo;
                proto.invDigit = bnpInvDigit;
                proto.isEven = bnpIsEven;
                proto.exp = bnpExp;
                proto.toString = bnToString;
                proto.negate = bnNegate;
                proto.abs = bnAbs;
                proto.compareTo = bnCompareTo;
                proto.bitLength = bnBitLength;
                proto.mod = bnMod;
                proto.modPowInt = bnModPowInt;

                function nbi() {
                    return new BigInteger(null)
                }

                function bnClone() {
                    var r = nbi();
                    this.copyTo(r);
                    return r
                }

                function bnIntValue() {
                    if (this.s < 0) {
                        if (this.t == 1) return this[0] - this.DV;
                        else if (this.t == 0) return -1
                    } else if (this.t == 1) return this[0];
                    else if (this.t == 0) return 0;
                    return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0]
                }

                function bnByteValue() {
                    return this.t == 0 ? this.s : this[0] << 24 >> 24
                }

                function bnShortValue() {
                    return this.t == 0 ? this.s : this[0] << 16 >> 16
                }

                function bnpChunkSize(r) {
                    return Math.floor(Math.LN2 * this.DB / Math.log(r))
                }

                function bnSigNum() {
                    if (this.s < 0) return -1;
                    else if (this.t <= 0 || this.t == 1 && this[0] <= 0) return 0;
                    else return 1
                }

                function bnpToRadix(b) {
                    if (b == null) b = 10;
                    if (this.signum() == 0 || b < 2 || b > 36) return "0";
                    var cs = this.chunkSize(b);
                    var a = Math.pow(b, cs);
                    var d = nbv(a),
                        y = nbi(),
                        z = nbi(),
                        r = "";
                    this.divRemTo(d, y, z);
                    while (y.signum() > 0) {
                        r = (a + z.intValue()).toString(b).substr(1) + r;
                        y.divRemTo(d, y, z)
                    }
                    return z.intValue().toString(b) + r
                }

                function bnpFromRadix(s, b) {
                    var self = this;
                    self.fromInt(0);
                    if (b == null) b = 10;
                    var cs = self.chunkSize(b);
                    var d = Math.pow(b, cs),
                        mi = false,
                        j = 0,
                        w = 0;
                    for (var i = 0; i < s.length; ++i) {
                        var x = intAt(s, i);
                        if (x < 0) {
                            if (s.charAt(i) == "-" && self.signum() == 0) mi = true;
                            continue
                        }
                        w = b * w + x;
                        if (++j >= cs) {
                            self.dMultiply(d);
                            self.dAddOffset(w, 0);
                            j = 0;
                            w = 0
                        }
                    }
                    if (j > 0) {
                        self.dMultiply(Math.pow(b, j));
                        self.dAddOffset(w, 0)
                    }
                    if (mi) BigInteger.ZERO.subTo(self, self)
                }

                function bnpFromNumber(a, b, c) {
                    var self = this;
                    if ("number" == typeof b) {
                        if (a < 2) self.fromInt(1);
                        else {
                            self.fromNumber(a, c);
                            if (!self.testBit(a - 1)) self.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, self);
                            if (self.isEven()) self.dAddOffset(1, 0);
                            while (!self.isProbablePrime(b)) {
                                self.dAddOffset(2, 0);
                                if (self.bitLength() > a) self.subTo(BigInteger.ONE.shiftLeft(a - 1), self)
                            }
                        }
                    } else {
                        var x = new Array,
                            t = a & 7;
                        x.length = (a >> 3) + 1;
                        b.nextBytes(x);
                        if (t > 0) x[0] &= (1 << t) - 1;
                        else x[0] = 0;
                        self.fromString(x, 256)
                    }
                }

                function bnToByteArray() {
                    var self = this;
                    var i = self.t,
                        r = new Array;
                    r[0] = self.s;
                    var p = self.DB - i * self.DB % 8,
                        d, k = 0;
                    if (i-- > 0) {
                        if (p < self.DB && (d = self[i] >> p) != (self.s & self.DM) >> p) r[k++] = d | self.s << self.DB - p;
                        while (i >= 0) {
                            if (p < 8) {
                                d = (self[i] & (1 << p) - 1) << 8 - p;
                                d |= self[--i] >> (p += self.DB - 8)
                            } else {
                                d = self[i] >> (p -= 8) & 255;
                                if (p <= 0) {
                                    p += self.DB;
                                    --i
                                }
                            } if ((d & 128) != 0) d |= -256;
                            if (k === 0 && (self.s & 128) != (d & 128)) ++k;
                            if (k > 0 || d != self.s) r[k++] = d
                        }
                    }
                    return r
                }

                function bnEquals(a) {
                    return this.compareTo(a) == 0
                }

                function bnMin(a) {
                    return this.compareTo(a) < 0 ? this : a
                }

                function bnMax(a) {
                    return this.compareTo(a) > 0 ? this : a
                }

                function bnpBitwiseTo(a, op, r) {
                    var self = this;
                    var i, f, m = Math.min(a.t, self.t);
                    for (i = 0; i < m; ++i) r[i] = op(self[i], a[i]);
                    if (a.t < self.t) {
                        f = a.s & self.DM;
                        for (i = m; i < self.t; ++i) r[i] = op(self[i], f);
                        r.t = self.t
                    } else {
                        f = self.s & self.DM;
                        for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
                        r.t = a.t
                    }
                    r.s = op(self.s, a.s);
                    r.clamp()
                }

                function op_and(x, y) {
                    return x & y
                }

                function bnAnd(a) {
                    var r = nbi();
                    this.bitwiseTo(a, op_and, r);
                    return r
                }

                function op_or(x, y) {
                    return x | y
                }

                function bnOr(a) {
                    var r = nbi();
                    this.bitwiseTo(a, op_or, r);
                    return r
                }

                function op_xor(x, y) {
                    return x ^ y
                }

                function bnXor(a) {
                    var r = nbi();
                    this.bitwiseTo(a, op_xor, r);
                    return r
                }

                function op_andnot(x, y) {
                    return x & ~y
                }

                function bnAndNot(a) {
                    var r = nbi();
                    this.bitwiseTo(a, op_andnot, r);
                    return r
                }

                function bnNot() {
                    var r = nbi();
                    for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
                    r.t = this.t;
                    r.s = ~this.s;
                    return r
                }

                function bnShiftLeft(n) {
                    var r = nbi();
                    if (n < 0) this.rShiftTo(-n, r);
                    else this.lShiftTo(n, r);
                    return r
                }

                function bnShiftRight(n) {
                    var r = nbi();
                    if (n < 0) this.lShiftTo(-n, r);
                    else this.rShiftTo(n, r);
                    return r
                }

                function lbit(x) {
                    if (x == 0) return -1;
                    var r = 0;
                    if ((x & 65535) == 0) {
                        x >>= 16;
                        r += 16
                    }
                    if ((x & 255) == 0) {
                        x >>= 8;
                        r += 8
                    }
                    if ((x & 15) == 0) {
                        x >>= 4;
                        r += 4
                    }
                    if ((x & 3) == 0) {
                        x >>= 2;
                        r += 2
                    }
                    if ((x & 1) == 0) ++r;
                    return r
                }

                function bnGetLowestSetBit() {
                    for (var i = 0; i < this.t; ++i)
                        if (this[i] != 0) return i * this.DB + lbit(this[i]);
                    if (this.s < 0) return this.t * this.DB;
                    return -1
                }

                function cbit(x) {
                    var r = 0;
                    while (x != 0) {
                        x &= x - 1;
                        ++r
                    }
                    return r
                }

                function bnBitCount() {
                    var r = 0,
                        x = this.s & this.DM;
                    for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
                    return r
                }

                function bnTestBit(n) {
                    var j = Math.floor(n / this.DB);
                    if (j >= this.t) return this.s != 0;
                    return (this[j] & 1 << n % this.DB) != 0
                }

                function bnpChangeBit(n, op) {
                    var r = BigInteger.ONE.shiftLeft(n);
                    this.bitwiseTo(r, op, r);
                    return r
                }

                function bnSetBit(n) {
                    return this.changeBit(n, op_or)
                }

                function bnClearBit(n) {
                    return this.changeBit(n, op_andnot)
                }

                function bnFlipBit(n) {
                    return this.changeBit(n, op_xor)
                }

                function bnpAddTo(a, r) {
                    var self = this;
                    var i = 0,
                        c = 0,
                        m = Math.min(a.t, self.t);
                    while (i < m) {
                        c += self[i] + a[i];
                        r[i++] = c & self.DM;
                        c >>= self.DB
                    }
                    if (a.t < self.t) {
                        c += a.s;
                        while (i < self.t) {
                            c += self[i];
                            r[i++] = c & self.DM;
                            c >>= self.DB
                        }
                        c += self.s
                    } else {
                        c += self.s;
                        while (i < a.t) {
                            c += a[i];
                            r[i++] = c & self.DM;
                            c >>= self.DB
                        }
                        c += a.s
                    }
                    r.s = c < 0 ? -1 : 0;
                    if (c > 0) r[i++] = c;
                    else if (c < -1) r[i++] = self.DV + c;
                    r.t = i;
                    r.clamp()
                }

                function bnAdd(a) {
                    var r = nbi();
                    this.addTo(a, r);
                    return r
                }

                function bnSubtract(a) {
                    var r = nbi();
                    this.subTo(a, r);
                    return r
                }

                function bnMultiply(a) {
                    var r = nbi();
                    this.multiplyTo(a, r);
                    return r
                }

                function bnSquare() {
                    var r = nbi();
                    this.squareTo(r);
                    return r
                }

                function bnDivide(a) {
                    var r = nbi();
                    this.divRemTo(a, r, null);
                    return r
                }

                function bnRemainder(a) {
                    var r = nbi();
                    this.divRemTo(a, null, r);
                    return r
                }

                function bnDivideAndRemainder(a) {
                    var q = nbi(),
                        r = nbi();
                    this.divRemTo(a, q, r);
                    return new Array(q, r)
                }

                function bnpDMultiply(n) {
                    this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
                    ++this.t;
                    this.clamp()
                }

                function bnpDAddOffset(n, w) {
                    if (n == 0) return;
                    while (this.t <= w) this[this.t++] = 0;
                    this[w] += n;
                    while (this[w] >= this.DV) {
                        this[w] -= this.DV;
                        if (++w >= this.t) this[this.t++] = 0;
                        ++this[w]
                    }
                }

                function NullExp() {}

                function nNop(x) {
                    return x
                }

                function nMulTo(x, y, r) {
                    x.multiplyTo(y, r)
                }

                function nSqrTo(x, r) {
                    x.squareTo(r)
                }
                NullExp.prototype.convert = nNop;
                NullExp.prototype.revert = nNop;
                NullExp.prototype.mulTo = nMulTo;
                NullExp.prototype.sqrTo = nSqrTo;

                function bnPow(e) {
                    return this.exp(e, new NullExp)
                }

                function bnpMultiplyLowerTo(a, n, r) {
                    var i = Math.min(this.t + a.t, n);
                    r.s = 0;
                    r.t = i;
                    while (i > 0) r[--i] = 0;
                    var j;
                    for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
                    for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
                    r.clamp()
                }

                function bnpMultiplyUpperTo(a, n, r) {
                    --n;
                    var i = r.t = this.t + a.t - n;
                    r.s = 0;
                    while (--i >= 0) r[i] = 0;
                    for (i = Math.max(n - this.t, 0); i < a.t; ++i) r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
                    r.clamp();
                    r.drShiftTo(1, r)
                }

                function Barrett(m) {
                    this.r2 = nbi();
                    this.q3 = nbi();
                    BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
                    this.mu = this.r2.divide(m);
                    this.m = m
                }

                function barrettConvert(x) {
                    if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
                    else if (x.compareTo(this.m) < 0) return x;
                    else {
                        var r = nbi();
                        x.copyTo(r);
                        this.reduce(r);
                        return r
                    }
                }

                function barrettRevert(x) {
                    return x
                }

                function barrettReduce(x) {
                    var self = this;
                    x.drShiftTo(self.m.t - 1, self.r2);
                    if (x.t > self.m.t + 1) {
                        x.t = self.m.t + 1;
                        x.clamp()
                    }
                    self.mu.multiplyUpperTo(self.r2, self.m.t + 1, self.q3);
                    self.m.multiplyLowerTo(self.q3, self.m.t + 1, self.r2);
                    while (x.compareTo(self.r2) < 0) x.dAddOffset(1, self.m.t + 1);
                    x.subTo(self.r2, x);
                    while (x.compareTo(self.m) >= 0) x.subTo(self.m, x)
                }

                function barrettSqrTo(x, r) {
                    x.squareTo(r);
                    this.reduce(r)
                }

                function barrettMulTo(x, y, r) {
                    x.multiplyTo(y, r);
                    this.reduce(r)
                }
                Barrett.prototype.convert = barrettConvert;
                Barrett.prototype.revert = barrettRevert;
                Barrett.prototype.reduce = barrettReduce;
                Barrett.prototype.mulTo = barrettMulTo;
                Barrett.prototype.sqrTo = barrettSqrTo;

                function bnModPow(e, m) {
                    var i = e.bitLength(),
                        k, r = nbv(1),
                        z;
                    if (i <= 0) return r;
                    else if (i < 18) k = 1;
                    else if (i < 48) k = 3;
                    else if (i < 144) k = 4;
                    else if (i < 768) k = 5;
                    else k = 6; if (i < 8) z = new Classic(m);
                    else if (m.isEven()) z = new Barrett(m);
                    else z = new Montgomery(m);
                    var g = new Array,
                        n = 3,
                        k1 = k - 1,
                        km = (1 << k) - 1;
                    g[1] = z.convert(this);
                    if (k > 1) {
                        var g2 = nbi();
                        z.sqrTo(g[1], g2);
                        while (n <= km) {
                            g[n] = nbi();
                            z.mulTo(g2, g[n - 2], g[n]);
                            n += 2
                        }
                    }
                    var j = e.t - 1,
                        w, is1 = true,
                        r2 = nbi(),
                        t;
                    i = nbits(e[j]) - 1;
                    while (j >= 0) {
                        if (i >= k1) w = e[j] >> i - k1 & km;
                        else {
                            w = (e[j] & (1 << i + 1) - 1) << k1 - i;
                            if (j > 0) w |= e[j - 1] >> this.DB + i - k1
                        }
                        n = k;
                        while ((w & 1) == 0) {
                            w >>= 1;
                            --n
                        }
                        if ((i -= n) < 0) {
                            i += this.DB;
                            --j
                        }
                        if (is1) {
                            g[w].copyTo(r);
                            is1 = false
                        } else {
                            while (n > 1) {
                                z.sqrTo(r, r2);
                                z.sqrTo(r2, r);
                                n -= 2
                            }
                            if (n > 0) z.sqrTo(r, r2);
                            else {
                                t = r;
                                r = r2;
                                r2 = t
                            }
                            z.mulTo(r2, g[w], r)
                        }
                        while (j >= 0 && (e[j] & 1 << i) == 0) {
                            z.sqrTo(r, r2);
                            t = r;
                            r = r2;
                            r2 = t;
                            if (--i < 0) {
                                i = this.DB - 1;
                                --j
                            }
                        }
                    }
                    return z.revert(r)
                }

                function bnGCD(a) {
                    var x = this.s < 0 ? this.negate() : this.clone();
                    var y = a.s < 0 ? a.negate() : a.clone();
                    if (x.compareTo(y) < 0) {
                        var t = x;
                        x = y;
                        y = t
                    }
                    var i = x.getLowestSetBit(),
                        g = y.getLowestSetBit();
                    if (g < 0) return x;
                    if (i < g) g = i;
                    if (g > 0) {
                        x.rShiftTo(g, x);
                        y.rShiftTo(g, y)
                    }
                    while (x.signum() > 0) {
                        if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
                        if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
                        if (x.compareTo(y) >= 0) {
                            x.subTo(y, x);
                            x.rShiftTo(1, x)
                        } else {
                            y.subTo(x, y);
                            y.rShiftTo(1, y)
                        }
                    }
                    if (g > 0) y.lShiftTo(g, y);
                    return y
                }

                function bnpModInt(n) {
                    if (n <= 0) return 0;
                    var d = this.DV % n,
                        r = this.s < 0 ? n - 1 : 0;
                    if (this.t > 0)
                        if (d == 0) r = this[0] % n;
                        else
                            for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
                    return r
                }

                function bnModInverse(m) {
                    var ac = m.isEven();
                    if (this.isEven() && ac || m.signum() == 0) return BigInteger.ZERO;
                    var u = m.clone(),
                        v = this.clone();
                    var a = nbv(1),
                        b = nbv(0),
                        c = nbv(0),
                        d = nbv(1);
                    while (u.signum() != 0) {
                        while (u.isEven()) {
                            u.rShiftTo(1, u);
                            if (ac) {
                                if (!a.isEven() || !b.isEven()) {
                                    a.addTo(this, a);
                                    b.subTo(m, b)
                                }
                                a.rShiftTo(1, a)
                            } else if (!b.isEven()) b.subTo(m, b);
                            b.rShiftTo(1, b)
                        }
                        while (v.isEven()) {
                            v.rShiftTo(1, v);
                            if (ac) {
                                if (!c.isEven() || !d.isEven()) {
                                    c.addTo(this, c);
                                    d.subTo(m, d)
                                }
                                c.rShiftTo(1, c)
                            } else if (!d.isEven()) d.subTo(m, d);
                            d.rShiftTo(1, d)
                        }
                        if (u.compareTo(v) >= 0) {
                            u.subTo(v, u);
                            if (ac) a.subTo(c, a);
                            b.subTo(d, b)
                        } else {
                            v.subTo(u, v);
                            if (ac) c.subTo(a, c);
                            d.subTo(b, d)
                        }
                    }
                    if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
                    if (d.compareTo(m) >= 0) return d.subtract(m);
                    if (d.signum() < 0) d.addTo(m, d);
                    else return d; if (d.signum() < 0) return d.add(m);
                    else return d
                }
                proto.chunkSize = bnpChunkSize;
                proto.toRadix = bnpToRadix;
                proto.fromRadix = bnpFromRadix;
                proto.fromNumber = bnpFromNumber;
                proto.bitwiseTo = bnpBitwiseTo;
                proto.changeBit = bnpChangeBit;
                proto.addTo = bnpAddTo;
                proto.dMultiply = bnpDMultiply;
                proto.dAddOffset = bnpDAddOffset;
                proto.multiplyLowerTo = bnpMultiplyLowerTo;
                proto.multiplyUpperTo = bnpMultiplyUpperTo;
                proto.modInt = bnpModInt;
                proto.clone = bnClone;
                proto.intValue = bnIntValue;
                proto.byteValue = bnByteValue;
                proto.shortValue = bnShortValue;
                proto.signum = bnSigNum;
                proto.toByteArray = bnToByteArray;
                proto.equals = bnEquals;
                proto.min = bnMin;
                proto.max = bnMax;
                proto.and = bnAnd;
                proto.or = bnOr;
                proto.xor = bnXor;
                proto.andNot = bnAndNot;
                proto.not = bnNot;
                proto.shiftLeft = bnShiftLeft;
                proto.shiftRight = bnShiftRight;
                proto.getLowestSetBit = bnGetLowestSetBit;
                proto.bitCount = bnBitCount;
                proto.testBit = bnTestBit;
                proto.setBit = bnSetBit;
                proto.clearBit = bnClearBit;
                proto.flipBit = bnFlipBit;
                proto.add = bnAdd;
                proto.subtract = bnSubtract;
                proto.multiply = bnMultiply;
                proto.divide = bnDivide;
                proto.remainder = bnRemainder;
                proto.divideAndRemainder = bnDivideAndRemainder;
                proto.modPow = bnModPow;
                proto.modInverse = bnModInverse;
                proto.pow = bnPow;
                proto.gcd = bnGCD;
                proto.square = bnSquare;
                BigInteger.ZERO = nbv(0);
                BigInteger.ONE = nbv(1);
                BigInteger.valueOf = nbv
            }, {
                assert: 75
            }
        ],
        2: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var BigInteger = require("./bigi");
                    BigInteger.fromByteArrayUnsigned = function(byteArray) {
                        if (byteArray[0] & 128) {
                            return new BigInteger([0].concat(byteArray))
                        }
                        return new BigInteger(byteArray)
                    };
                    BigInteger.prototype.toByteArrayUnsigned = function() {
                        var byteArray = this.toByteArray();
                        return byteArray[0] === 0 ? byteArray.slice(1) : byteArray
                    };
                    BigInteger.fromDERInteger = function(byteArray) {
                        return new BigInteger(byteArray)
                    };
                    BigInteger.prototype.toDERInteger = BigInteger.prototype.toByteArray;
                    BigInteger.fromBuffer = function(buffer) {
                        if (buffer[0] & 128) {
                            var byteArray = Array.prototype.slice.call(buffer);
                            return new BigInteger([0].concat(byteArray))
                        }
                        return new BigInteger(buffer)
                    };
                    BigInteger.fromHex = function(hex) {
                        if (hex === "") return BigInteger.ZERO;
                        assert.equal(hex, hex.match(/^[A-Fa-f0-9]+/), "Invalid hex string");
                        assert.equal(hex.length % 2, 0, "Incomplete hex");
                        return new BigInteger(hex, 16)
                    };
                    BigInteger.prototype.toBuffer = function(size) {
                        var byteArray = this.toByteArrayUnsigned();
                        var zeros = [];
                        var padding = size - byteArray.length;
                        while (zeros.length < padding) zeros.push(0);
                        return new Buffer(zeros.concat(byteArray))
                    };
                    BigInteger.prototype.toHex = function(size) {
                        return this.toBuffer(size).toString("hex")
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                "./bigi": 1,
                assert: 75,
                buffer: 78
            }
        ],
        3: [
            function(require, module, exports) {
                var BigInteger = require("./bigi");
                require("./convert");
                module.exports = BigInteger
            }, {
                "./bigi": 1,
                "./convert": 2
            }
        ],
        4: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
                    var ALPHABET_MAP = {};
                    for (var i = 0; i < ALPHABET.length; i++) {
                        ALPHABET_MAP[ALPHABET.charAt(i)] = i
                    }
                    var BASE = 58;

                    function encode(buffer) {
                        if (buffer.length === 0) return "";
                        var i, j, digits = [0];
                        for (i = 0; i < buffer.length; i++) {
                            for (j = 0; j < digits.length; j++) digits[j] <<= 8;
                            digits[0] += buffer[i];
                            var carry = 0;
                            for (j = 0; j < digits.length; ++j) {
                                digits[j] += carry;
                                carry = digits[j] / BASE | 0;
                                digits[j] %= BASE
                            }
                            while (carry) {
                                digits.push(carry % BASE);
                                carry = carry / BASE | 0
                            }
                        }
                        for (i = 0; i < buffer.length - 1 && buffer[i] == 0; i++) digits.push(0);
                        return digits.reverse().map(function(digit) {
                            return ALPHABET[digit]
                        }).join("")
                    }

                    function decode(string) {
                        if (string.length === 0) return new Buffer(0);
                        var input = string.split("").map(function(c) {
                            assert(c in ALPHABET_MAP, "Non-base58 character");
                            return ALPHABET_MAP[c]
                        });
                        var i, j, bytes = [0];
                        for (i = 0; i < input.length; i++) {
                            for (j = 0; j < bytes.length; j++) bytes[j] *= BASE;
                            bytes[0] += input[i];
                            var carry = 0;
                            for (j = 0; j < bytes.length; ++j) {
                                bytes[j] += carry;
                                carry = bytes[j] >> 8;
                                bytes[j] &= 255
                            }
                            while (carry) {
                                bytes.push(carry & 255);
                                carry >>= 8
                            }
                        }
                        for (i = 0; i < input.length - 1 && input[i] == 0; i++) bytes.push(0);
                        return new Buffer(bytes.reverse())
                    }
                    module.exports = {
                        encode: encode,
                        decode: decode
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                assert: 75,
                buffer: 78
            }
        ],
        5: [
            function(require, module, exports) {
                (function(Buffer) {
                    "use strict";
                    var assert = require("assert");
                    var base58 = require("bs58");
                    var crypto = require("crypto");

                    function sha256x2(buffer) {
                        buffer = crypto.createHash("sha256").update(buffer).digest();
                        return crypto.createHash("sha256").update(buffer).digest()
                    }

                    function encode(payload) {
                        var checksum = sha256x2(payload).slice(0, 4);
                        return base58.encode(Buffer.concat([payload, checksum]))
                    }

                    function decode(string) {
                        var buffer = base58.decode(string);
                        var payload = buffer.slice(0, -4);
                        var checksum = buffer.slice(-4);
                        var newChecksum = sha256x2(payload).slice(0, 4);
                        assert.deepEqual(newChecksum, checksum, "Invalid checksum");
                        return payload
                    }
                    module.exports = {
                        encode: encode,
                        decode: decode
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                assert: 75,
                bs58: 4,
                buffer: 78,
                crypto: 84
            }
        ],
        6: [
            function(require, module, exports) {
                (function(Buffer) {
                    var createHash = require("sha.js");
                    var md5 = toConstructor(require("./md5"));
                    var rmd160 = toConstructor(require("ripemd160"));

                    function toConstructor(fn) {
                        return function() {
                            var buffers = [];
                            var m = {
                                update: function(data, enc) {
                                    if (!Buffer.isBuffer(data)) data = new Buffer(data, enc);
                                    buffers.push(data);
                                    return this
                                },
                                digest: function(enc) {
                                    var buf = Buffer.concat(buffers);
                                    var r = fn(buf);
                                    buffers = null;
                                    return enc ? r.toString(enc) : r
                                }
                            };
                            return m
                        }
                    }
                    module.exports = function(alg) {
                        if ("md5" === alg) return new md5;
                        if ("rmd160" === alg) return new rmd160;
                        return createHash(alg)
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                "./md5": 10,
                buffer: 78,
                ripemd160: 11,
                "sha.js": 13
            }
        ],
        7: [
            function(require, module, exports) {
                (function(Buffer) {
                    var createHash = require("./create-hash");
                    var blocksize = 64;
                    var zeroBuffer = new Buffer(blocksize);
                    zeroBuffer.fill(0);
                    module.exports = Hmac;

                    function Hmac(alg, key) {
                        if (!(this instanceof Hmac)) return new Hmac(alg, key);
                        this._opad = opad;
                        this._alg = alg;
                        key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key;
                        if (key.length > blocksize) {
                            key = createHash(alg).update(key).digest()
                        } else if (key.length < blocksize) {
                            key = Buffer.concat([key, zeroBuffer], blocksize)
                        }
                        var ipad = this._ipad = new Buffer(blocksize);
                        var opad = this._opad = new Buffer(blocksize);
                        for (var i = 0; i < blocksize; i++) {
                            ipad[i] = key[i] ^ 54;
                            opad[i] = key[i] ^ 92
                        }
                        this._hash = createHash(alg).update(ipad)
                    }
                    Hmac.prototype.update = function(data, enc) {
                        this._hash.update(data, enc);
                        return this
                    };
                    Hmac.prototype.digest = function(enc) {
                        var h = this._hash.digest();
                        return createHash(this._alg).update(this._opad).update(h).digest(enc)
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                "./create-hash": 6,
                buffer: 78
            }
        ],
        8: [
            function(require, module, exports) {
                (function(Buffer) {
                    var intSize = 4;
                    var zeroBuffer = new Buffer(intSize);
                    zeroBuffer.fill(0);
                    var chrsz = 8;

                    function toArray(buf, bigEndian) {
                        if (buf.length % intSize !== 0) {
                            var len = buf.length + (intSize - buf.length % intSize);
                            buf = Buffer.concat([buf, zeroBuffer], len)
                        }
                        var arr = [];
                        var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
                        for (var i = 0; i < buf.length; i += intSize) {
                            arr.push(fn.call(buf, i))
                        }
                        return arr
                    }

                    function toBuffer(arr, size, bigEndian) {
                        var buf = new Buffer(size);
                        var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
                        for (var i = 0; i < arr.length; i++) {
                            fn.call(buf, arr[i], i * 4, true)
                        }
                        return buf
                    }

                    function hash(buf, fn, hashSize, bigEndian) {
                        if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
                        var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
                        return toBuffer(arr, hashSize, bigEndian)
                    }
                    module.exports = {
                        hash: hash
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                buffer: 78
            }
        ],
        9: [
            function(require, module, exports) {
                (function(Buffer) {
                    var rng = require("./rng");

                    function error() {
                        var m = [].slice.call(arguments).join(" ");
                        throw new Error([m, "we accept pull requests", "http://github.com/dominictarr/crypto-browserify"].join("\n"))
                    }
                    exports.createHash = require("./create-hash");
                    exports.createHmac = require("./create-hmac");
                    exports.randomBytes = function(size, callback) {
                        if (callback && callback.call) {
                            try {
                                callback.call(this, undefined, new Buffer(rng(size)))
                            } catch (err) {
                                callback(err)
                            }
                        } else {
                            return new Buffer(rng(size))
                        }
                    };

                    function each(a, f) {
                        for (var i in a) f(a[i], i)
                    }
                    exports.getHashes = function() {
                        return ["sha1", "sha256", "md5", "rmd160"]
                    };
                    var p = require("./pbkdf2")(exports.createHmac);
                    exports.pbkdf2 = p.pbkdf2;
                    exports.pbkdf2Sync = p.pbkdf2Sync;
                    each(["createCredentials", "createCipher", "createCipheriv", "createDecipher", "createDecipheriv", "createSign", "createVerify", "createDiffieHellman"], function(name) {
                        exports[name] = function() {
                            error("sorry,", name, "is not implemented yet")
                        }
                    })
                }).call(this, require("buffer").Buffer)
            }, {
                "./create-hash": 6,
                "./create-hmac": 7,
                "./pbkdf2": 17,
                "./rng": 18,
                buffer: 78
            }
        ],
        10: [
            function(require, module, exports) {
                var helpers = require("./helpers");

                function core_md5(x, len) {
                    x[len >> 5] |= 128 << len % 32;
                    x[(len + 64 >>> 9 << 4) + 14] = len;
                    var a = 1732584193;
                    var b = -271733879;
                    var c = -1732584194;
                    var d = 271733878;
                    for (var i = 0; i < x.length; i += 16) {
                        var olda = a;
                        var oldb = b;
                        var oldc = c;
                        var oldd = d;
                        a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                        d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                        c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                        b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                        a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                        d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                        c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                        b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                        a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                        d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                        c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                        b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                        a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                        d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                        c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                        b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
                        a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                        d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                        c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                        b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                        a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                        d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                        c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                        b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                        a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                        d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                        c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                        b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                        a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                        d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                        c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                        b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
                        a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                        d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                        c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                        b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                        a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                        d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                        c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                        b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                        a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                        d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                        c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                        b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                        a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                        d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                        c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                        b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
                        a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                        d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                        c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                        b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                        a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                        d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                        c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                        b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                        a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                        d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                        c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                        b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                        a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                        d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                        c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                        b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
                        a = safe_add(a, olda);
                        b = safe_add(b, oldb);
                        c = safe_add(c, oldc);
                        d = safe_add(d, oldd)
                    }
                    return Array(a, b, c, d)
                }

                function md5_cmn(q, a, b, x, s, t) {
                    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
                }

                function md5_ff(a, b, c, d, x, s, t) {
                    return md5_cmn(b & c | ~b & d, a, b, x, s, t)
                }

                function md5_gg(a, b, c, d, x, s, t) {
                    return md5_cmn(b & d | c & ~d, a, b, x, s, t)
                }

                function md5_hh(a, b, c, d, x, s, t) {
                    return md5_cmn(b ^ c ^ d, a, b, x, s, t)
                }

                function md5_ii(a, b, c, d, x, s, t) {
                    return md5_cmn(c ^ (b | ~d), a, b, x, s, t)
                }

                function safe_add(x, y) {
                    var lsw = (x & 65535) + (y & 65535);
                    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                    return msw << 16 | lsw & 65535
                }

                function bit_rol(num, cnt) {
                    return num << cnt | num >>> 32 - cnt
                }
                module.exports = function md5(buf) {
                    return helpers.hash(buf, core_md5, 16)
                }
            }, {
                "./helpers": 8
            }
        ],
        11: [
            function(require, module, exports) {
                (function(Buffer) {
                    module.exports = ripemd160;
                    var zl = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13];
                    var zr = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11];
                    var sl = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6];
                    var sr = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];
                    var hl = [0, 1518500249, 1859775393, 2400959708, 2840853838];
                    var hr = [1352829926, 1548603684, 1836072691, 2053994217, 0];
                    var bytesToWords = function(bytes) {
                        var words = [];
                        for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
                            words[b >>> 5] |= bytes[i] << 24 - b % 32
                        }
                        return words
                    };
                    var wordsToBytes = function(words) {
                        var bytes = [];
                        for (var b = 0; b < words.length * 32; b += 8) {
                            bytes.push(words[b >>> 5] >>> 24 - b % 32 & 255)
                        }
                        return bytes
                    };
                    var processBlock = function(H, M, offset) {
                        for (var i = 0; i < 16; i++) {
                            var offset_i = offset + i;
                            var M_offset_i = M[offset_i];
                            M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360
                        }
                        var al, bl, cl, dl, el;
                        var ar, br, cr, dr, er;
                        ar = al = H[0];
                        br = bl = H[1];
                        cr = cl = H[2];
                        dr = dl = H[3];
                        er = el = H[4];
                        var t;
                        for (var i = 0; i < 80; i += 1) {
                            t = al + M[offset + zl[i]] | 0;
                            if (i < 16) {
                                t += f1(bl, cl, dl) + hl[0]
                            } else if (i < 32) {
                                t += f2(bl, cl, dl) + hl[1]
                            } else if (i < 48) {
                                t += f3(bl, cl, dl) + hl[2]
                            } else if (i < 64) {
                                t += f4(bl, cl, dl) + hl[3]
                            } else {
                                t += f5(bl, cl, dl) + hl[4]
                            }
                            t = t | 0;
                            t = rotl(t, sl[i]);
                            t = t + el | 0;
                            al = el;
                            el = dl;
                            dl = rotl(cl, 10);
                            cl = bl;
                            bl = t;
                            t = ar + M[offset + zr[i]] | 0;
                            if (i < 16) {
                                t += f5(br, cr, dr) + hr[0]
                            } else if (i < 32) {
                                t += f4(br, cr, dr) + hr[1]
                            } else if (i < 48) {
                                t += f3(br, cr, dr) + hr[2]
                            } else if (i < 64) {
                                t += f2(br, cr, dr) + hr[3]
                            } else {
                                t += f1(br, cr, dr) + hr[4]
                            }
                            t = t | 0;
                            t = rotl(t, sr[i]);
                            t = t + er | 0;
                            ar = er;
                            er = dr;
                            dr = rotl(cr, 10);
                            cr = br;
                            br = t
                        }
                        t = H[1] + cl + dr | 0;
                        H[1] = H[2] + dl + er | 0;
                        H[2] = H[3] + el + ar | 0;
                        H[3] = H[4] + al + br | 0;
                        H[4] = H[0] + bl + cr | 0;
                        H[0] = t
                    };

                    function f1(x, y, z) {
                        return x ^ y ^ z
                    }

                    function f2(x, y, z) {
                        return x & y | ~x & z
                    }

                    function f3(x, y, z) {
                        return (x | ~y) ^ z
                    }

                    function f4(x, y, z) {
                        return x & z | y & ~z
                    }

                    function f5(x, y, z) {
                        return x ^ (y | ~z)
                    }

                    function rotl(x, n) {
                        return x << n | x >>> 32 - n
                    }

                    function ripemd160(message) {
                        var H = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
                        if (typeof message == "string") message = new Buffer(message, "utf8");
                        var m = bytesToWords(message);
                        var nBitsLeft = message.length * 8;
                        var nBitsTotal = message.length * 8;
                        m[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
                        m[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotal << 8 | nBitsTotal >>> 24) & 16711935 | (nBitsTotal << 24 | nBitsTotal >>> 8) & 4278255360;
                        for (var i = 0; i < m.length; i += 16) {
                            processBlock(H, m, i)
                        }
                        for (var i = 0; i < 5; i++) {
                            var H_i = H[i];
                            H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360
                        }
                        var digestbytes = wordsToBytes(H);
                        return new Buffer(digestbytes)
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                buffer: 78
            }
        ],
        12: [
            function(require, module, exports) {
                var u = require("./util");
                var write = u.write;
                var fill = u.zeroFill;
                module.exports = function(Buffer) {
                    function Hash(blockSize, finalSize) {
                        this._block = new Buffer(blockSize);
                        this._finalSize = finalSize;
                        this._blockSize = blockSize;
                        this._len = 0;
                        this._s = 0
                    }
                    Hash.prototype.init = function() {
                        this._s = 0;
                        this._len = 0
                    };

                    function lengthOf(data, enc) {
                        if (enc == null) return data.byteLength || data.length;
                        if (enc == "ascii" || enc == "binary") return data.length;
                        if (enc == "hex") return data.length / 2;
                        if (enc == "base64") return data.length / 3
                    }
                    Hash.prototype.update = function(data, enc) {
                        var bl = this._blockSize;
                        var length;
                        if (!enc && "string" === typeof data) enc = "utf8";
                        if (enc) {
                            if (enc === "utf-8") enc = "utf8";
                            if (enc === "base64" || enc === "utf8") data = new Buffer(data, enc), enc = null;
                            length = lengthOf(data, enc)
                        } else length = data.byteLength || data.length;
                        var l = this._len += length;
                        var s = this._s = this._s || 0;
                        var f = 0;
                        var buffer = this._block;
                        while (s < l) {
                            var t = Math.min(length, f + bl);
                            write(buffer, data, enc, s % bl, f, t);
                            var ch = t - f;
                            s += ch;
                            f += ch;
                            if (!(s % bl)) this._update(buffer)
                        }
                        this._s = s;
                        return this
                    };
                    Hash.prototype.digest = function(enc) {
                        var bl = this._blockSize;
                        var fl = this._finalSize;
                        var len = this._len * 8;
                        var x = this._block;
                        var bits = len % (bl * 8);
                        x[this._len % bl] = 128;
                        fill(this._block, this._len % bl + 1);
                        if (bits >= fl * 8) {
                            this._update(this._block);
                            u.zeroFill(this._block, 0)
                        }
                        x.writeInt32BE(len, fl + 4);
                        var hash = this._update(this._block) || this._hash();
                        if (enc == null) return hash;
                        return hash.toString(enc)
                    };
                    Hash.prototype._update = function() {
                        throw new Error("_update must be implemented by subclass")
                    };
                    return Hash
                }
            }, {
                "./util": 16
            }
        ],
        13: [
            function(require, module, exports) {
                var exports = module.exports = function(alg) {
                    var Alg = exports[alg];
                    if (!Alg) throw new Error(alg + " is not supported (we accept pull requests)");
                    return new Alg
                };
                var Buffer = require("buffer").Buffer;
                var Hash = require("./hash")(Buffer);
                exports.sha = exports.sha1 = require("./sha1")(Buffer, Hash);
                exports.sha256 = require("./sha256")(Buffer, Hash)
            }, {
                "./hash": 12,
                "./sha1": 14,
                "./sha256": 15,
                buffer: 78
            }
        ],
        14: [
            function(require, module, exports) {
                module.exports = function(Buffer, Hash) {
                    var inherits = require("util").inherits;
                    inherits(Sha1, Hash);
                    var A = 0 | 0;
                    var B = 4 | 0;
                    var C = 8 | 0;
                    var D = 12 | 0;
                    var E = 16 | 0;
                    var BE = false;
                    var LE = true;
                    var W = new Int32Array(80);
                    var POOL = [];

                    function Sha1() {
                        if (POOL.length) return POOL.pop().init();
                        if (!(this instanceof Sha1)) return new Sha1;
                        this._w = W;
                        Hash.call(this, 16 * 4, 14 * 4);
                        this._h = null;
                        this.init()
                    }
                    Sha1.prototype.init = function() {
                        this._a = 1732584193;
                        this._b = 4023233417;
                        this._c = 2562383102;
                        this._d = 271733878;
                        this._e = 3285377520;
                        Hash.prototype.init.call(this);
                        return this
                    };
                    Sha1.prototype._POOL = POOL;
                    var isDV = new Buffer(1) instanceof DataView;

                    function readInt32BE(X, i) {
                        return isDV ? X.getInt32(i, false) : X.readInt32BE(i)
                    }
                    Sha1.prototype._update = function(array) {
                        var X = this._block;
                        var h = this._h;
                        var a, b, c, d, e, _a, _b, _c, _d, _e;
                        a = _a = this._a;
                        b = _b = this._b;
                        c = _c = this._c;
                        d = _d = this._d;
                        e = _e = this._e;
                        var w = this._w;
                        for (var j = 0; j < 80; j++) {
                            var W = w[j] = j < 16 ? X.readInt32BE(j * 4) : rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                            var t = add(add(rol(a, 5), sha1_ft(j, b, c, d)), add(add(e, W), sha1_kt(j)));
                            e = d;
                            d = c;
                            c = rol(b, 30);
                            b = a;
                            a = t
                        }
                        this._a = add(a, _a);
                        this._b = add(b, _b);
                        this._c = add(c, _c);
                        this._d = add(d, _d);
                        this._e = add(e, _e)
                    };
                    Sha1.prototype._hash = function() {
                        if (POOL.length < 100) POOL.push(this);
                        var H = new Buffer(20);
                        H.writeInt32BE(this._a | 0, A);
                        H.writeInt32BE(this._b | 0, B);
                        H.writeInt32BE(this._c | 0, C);
                        H.writeInt32BE(this._d | 0, D);
                        H.writeInt32BE(this._e | 0, E);
                        return H
                    };

                    function sha1_ft(t, b, c, d) {
                        if (t < 20) return b & c | ~b & d;
                        if (t < 40) return b ^ c ^ d;
                        if (t < 60) return b & c | b & d | c & d;
                        return b ^ c ^ d
                    }

                    function sha1_kt(t) {
                        return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514
                    }

                    function add(x, y) {
                        return x + y | 0
                    }

                    function rol(num, cnt) {
                        return num << cnt | num >>> 32 - cnt
                    }
                    return Sha1
                }
            }, {
                util: 97
            }
        ],
        15: [
            function(require, module, exports) {
                var inherits = require("util").inherits;
                var BE = false;
                var LE = true;
                var u = require("./util");
                module.exports = function(Buffer, Hash) {
                    var K = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];
                    inherits(Sha256, Hash);
                    var W = new Array(64);
                    var POOL = [];

                    function Sha256() {
                        if (POOL.length) {}
                        this.init();
                        this._w = W;
                        Hash.call(this, 16 * 4, 14 * 4)
                    }
                    Sha256.prototype.init = function() {
                        this._a = 1779033703 | 0;
                        this._b = 3144134277 | 0;
                        this._c = 1013904242 | 0;
                        this._d = 2773480762 | 0;
                        this._e = 1359893119 | 0;
                        this._f = 2600822924 | 0;
                        this._g = 528734635 | 0;
                        this._h = 1541459225 | 0;
                        this._len = this._s = 0;
                        return this
                    };
                    var safe_add = function(x, y) {
                        var lsw = (x & 65535) + (y & 65535);
                        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                        return msw << 16 | lsw & 65535
                    };

                    function S(X, n) {
                        return X >>> n | X << 32 - n
                    }

                    function R(X, n) {
                        return X >>> n
                    }

                    function Ch(x, y, z) {
                        return x & y ^ ~x & z
                    }

                    function Maj(x, y, z) {
                        return x & y ^ x & z ^ y & z
                    }

                    function Sigma0256(x) {
                        return S(x, 2) ^ S(x, 13) ^ S(x, 22)
                    }

                    function Sigma1256(x) {
                        return S(x, 6) ^ S(x, 11) ^ S(x, 25)
                    }

                    function Gamma0256(x) {
                        return S(x, 7) ^ S(x, 18) ^ R(x, 3)
                    }

                    function Gamma1256(x) {
                        return S(x, 17) ^ S(x, 19) ^ R(x, 10)
                    }
                    Sha256.prototype._update = function(m) {
                        var M = this._block;
                        var W = this._w;
                        var a, b, c, d, e, f, g, h;
                        var T1, T2;
                        a = this._a | 0;
                        b = this._b | 0;
                        c = this._c | 0;
                        d = this._d | 0;
                        e = this._e | 0;
                        f = this._f | 0;
                        g = this._g | 0;
                        h = this._h | 0;
                        for (var j = 0; j < 64; j++) {
                            var w = W[j] = j < 16 ? M.readInt32BE(j * 4) : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16];
                            T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w;
                            T2 = Sigma0256(a) + Maj(a, b, c);
                            h = g;
                            g = f;
                            f = e;
                            e = d + T1;
                            d = c;
                            c = b;
                            b = a;
                            a = T1 + T2
                        }
                        this._a = a + this._a | 0;
                        this._b = b + this._b | 0;
                        this._c = c + this._c | 0;
                        this._d = d + this._d | 0;
                        this._e = e + this._e | 0;
                        this._f = f + this._f | 0;
                        this._g = g + this._g | 0;
                        this._h = h + this._h | 0
                    };
                    Sha256.prototype._hash = function() {
                        if (POOL.length < 10) POOL.push(this);
                        var H = new Buffer(32);
                        H.writeInt32BE(this._a, 0);
                        H.writeInt32BE(this._b, 4);
                        H.writeInt32BE(this._c, 8);
                        H.writeInt32BE(this._d, 12);
                        H.writeInt32BE(this._e, 16);
                        H.writeInt32BE(this._f, 20);
                        H.writeInt32BE(this._g, 24);
                        H.writeInt32BE(this._h, 28);
                        return H
                    };
                    return Sha256
                }
            }, {
                "./util": 16,
                util: 97
            }
        ],
        16: [
            function(require, module, exports) {
                exports.write = write;
                exports.zeroFill = zeroFill;
                exports.toString = toString;

                function write(buffer, string, enc, start, from, to, LE) {
                    var l = to - from;
                    if (enc === "ascii" || enc === "binary") {
                        for (var i = 0; i < l; i++) {
                            buffer[start + i] = string.charCodeAt(i + from)
                        }
                    } else if (enc == null) {
                        for (var i = 0; i < l; i++) {
                            buffer[start + i] = string[i + from]
                        }
                    } else if (enc === "hex") {
                        for (var i = 0; i < l; i++) {
                            var j = from + i;
                            buffer[start + i] = parseInt(string[j * 2] + string[j * 2 + 1], 16)
                        }
                    } else if (enc === "base64") {
                        throw new Error("base64 encoding not yet supported")
                    } else throw new Error(enc + " encoding not yet supported")
                }

                function zeroFill(buf, from) {
                    for (var i = from; i < buf.length; i++) buf[i] = 0
                }
            }, {}
        ],
        17: [
            function(require, module, exports) {
                (function(Buffer) {
                    var blocksize = 64;
                    var zeroBuffer = new Buffer(blocksize);
                    zeroBuffer.fill(0);
                    module.exports = function(createHmac, exports) {
                        exports = exports || {};
                        exports.pbkdf2 = function(password, salt, iterations, keylen, cb) {
                            if ("function" !== typeof cb) throw new Error("No callback provided to pbkdf2");
                            setTimeout(function() {
                                cb(null, exports.pbkdf2Sync(password, salt, iterations, keylen))
                            })
                        };
                        exports.pbkdf2Sync = function(key, salt, iterations, keylen) {
                            if ("number" !== typeof iterations) throw new TypeError("Iterations not a number");
                            if (iterations < 0) throw new TypeError("Bad iterations");
                            if ("number" !== typeof keylen) throw new TypeError("Key length not a number");
                            if (keylen < 0) throw new TypeError("Bad key length");
                            var key = !Buffer.isBuffer(key) ? new Buffer(key) : key;
                            if (key.length > blocksize) {
                                key = createHash(alg).update(key).digest()
                            } else if (key.length < blocksize) {
                                key = Buffer.concat([key, zeroBuffer], blocksize)
                            }
                            var HMAC;
                            var cplen, p = 0,
                                i = 1,
                                itmp = new Buffer(4),
                                digtmp;
                            var out = new Buffer(keylen);
                            out.fill(0);
                            while (keylen) {
                                if (keylen > 20) cplen = 20;
                                else cplen = keylen;
                                itmp[0] = i >> 24 & 255;
                                itmp[1] = i >> 16 & 255;
                                itmp[2] = i >> 8 & 255;
                                itmp[3] = i & 255;
                                HMAC = createHmac("sha1", key);
                                HMAC.update(salt);
                                HMAC.update(itmp);
                                digtmp = HMAC.digest();
                                digtmp.copy(out, p, 0, cplen);
                                for (var j = 1; j < iterations; j++) {
                                    HMAC = createHmac("sha1", key);
                                    HMAC.update(digtmp);
                                    digtmp = HMAC.digest();
                                    for (var k = 0; k < cplen; k++) {
                                        out[k] ^= digtmp[k]
                                    }
                                }
                                keylen -= cplen;
                                i++;
                                p += cplen
                            }
                            return out
                        };
                        return exports
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                buffer: 78
            }
        ],
        18: [
            function(require, module, exports) {
                (function(Buffer) {
                    (function() {
                        module.exports = function(size) {
                            var bytes = new Buffer(size);
                            crypto.getRandomValues(bytes);
                            return bytes
                        }
                    })()
                }).call(this, require("buffer").Buffer)
            }, {
                buffer: 78
            }
        ],
        19: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./enc-base64"), require("./md5"), require("./evpkdf"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var BlockCipher = C_lib.BlockCipher;
                        var C_algo = C.algo;
                        var SBOX = [];
                        var INV_SBOX = [];
                        var SUB_MIX_0 = [];
                        var SUB_MIX_1 = [];
                        var SUB_MIX_2 = [];
                        var SUB_MIX_3 = [];
                        var INV_SUB_MIX_0 = [];
                        var INV_SUB_MIX_1 = [];
                        var INV_SUB_MIX_2 = [];
                        var INV_SUB_MIX_3 = [];
                        (function() {
                            var d = [];
                            for (var i = 0; i < 256; i++) {
                                if (i < 128) {
                                    d[i] = i << 1
                                } else {
                                    d[i] = i << 1 ^ 283
                                }
                            }
                            var x = 0;
                            var xi = 0;
                            for (var i = 0; i < 256; i++) {
                                var sx = xi ^ xi << 1 ^ xi << 2 ^ xi << 3 ^ xi << 4;
                                sx = sx >>> 8 ^ sx & 255 ^ 99;
                                SBOX[x] = sx;
                                INV_SBOX[sx] = x;
                                var x2 = d[x];
                                var x4 = d[x2];
                                var x8 = d[x4];
                                var t = d[sx] * 257 ^ sx * 16843008;
                                SUB_MIX_0[x] = t << 24 | t >>> 8;
                                SUB_MIX_1[x] = t << 16 | t >>> 16;
                                SUB_MIX_2[x] = t << 8 | t >>> 24;
                                SUB_MIX_3[x] = t;
                                var t = x8 * 16843009 ^ x4 * 65537 ^ x2 * 257 ^ x * 16843008;
                                INV_SUB_MIX_0[sx] = t << 24 | t >>> 8;
                                INV_SUB_MIX_1[sx] = t << 16 | t >>> 16;
                                INV_SUB_MIX_2[sx] = t << 8 | t >>> 24;
                                INV_SUB_MIX_3[sx] = t;
                                if (!x) {
                                    x = xi = 1
                                } else {
                                    x = x2 ^ d[d[d[x8 ^ x2]]];
                                    xi ^= d[d[xi]]
                                }
                            }
                        })();
                        var RCON = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
                        var AES = C_algo.AES = BlockCipher.extend({
                            _doReset: function() {
                                var key = this._key;
                                var keyWords = key.words;
                                var keySize = key.sigBytes / 4;
                                var nRounds = this._nRounds = keySize + 6;
                                var ksRows = (nRounds + 1) * 4;
                                var keySchedule = this._keySchedule = [];
                                for (var ksRow = 0; ksRow < ksRows; ksRow++) {
                                    if (ksRow < keySize) {
                                        keySchedule[ksRow] = keyWords[ksRow]
                                    } else {
                                        var t = keySchedule[ksRow - 1];
                                        if (!(ksRow % keySize)) {
                                            t = t << 8 | t >>> 24;
                                            t = SBOX[t >>> 24] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255];
                                            t ^= RCON[ksRow / keySize | 0] << 24
                                        } else if (keySize > 6 && ksRow % keySize == 4) {
                                            t = SBOX[t >>> 24] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255]
                                        }
                                        keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t
                                    }
                                }
                                var invKeySchedule = this._invKeySchedule = [];
                                for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
                                    var ksRow = ksRows - invKsRow;
                                    if (invKsRow % 4) {
                                        var t = keySchedule[ksRow]
                                    } else {
                                        var t = keySchedule[ksRow - 4]
                                    } if (invKsRow < 4 || ksRow <= 4) {
                                        invKeySchedule[invKsRow] = t
                                    } else {
                                        invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[t >>> 16 & 255]] ^ INV_SUB_MIX_2[SBOX[t >>> 8 & 255]] ^ INV_SUB_MIX_3[SBOX[t & 255]]
                                    }
                                }
                            },
                            encryptBlock: function(M, offset) {
                                this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX)
                            },
                            decryptBlock: function(M, offset) {
                                var t = M[offset + 1];
                                M[offset + 1] = M[offset + 3];
                                M[offset + 3] = t;
                                this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);
                                var t = M[offset + 1];
                                M[offset + 1] = M[offset + 3];
                                M[offset + 3] = t
                            },
                            _doCryptBlock: function(M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
                                var nRounds = this._nRounds;
                                var s0 = M[offset] ^ keySchedule[0];
                                var s1 = M[offset + 1] ^ keySchedule[1];
                                var s2 = M[offset + 2] ^ keySchedule[2];
                                var s3 = M[offset + 3] ^ keySchedule[3];
                                var ksRow = 4;
                                for (var round = 1; round < nRounds; round++) {
                                    var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[s1 >>> 16 & 255] ^ SUB_MIX_2[s2 >>> 8 & 255] ^ SUB_MIX_3[s3 & 255] ^ keySchedule[ksRow++];
                                    var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[s2 >>> 16 & 255] ^ SUB_MIX_2[s3 >>> 8 & 255] ^ SUB_MIX_3[s0 & 255] ^ keySchedule[ksRow++];
                                    var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[s3 >>> 16 & 255] ^ SUB_MIX_2[s0 >>> 8 & 255] ^ SUB_MIX_3[s1 & 255] ^ keySchedule[ksRow++];
                                    var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[s0 >>> 16 & 255] ^ SUB_MIX_2[s1 >>> 8 & 255] ^ SUB_MIX_3[s2 & 255] ^ keySchedule[ksRow++];
                                    s0 = t0;
                                    s1 = t1;
                                    s2 = t2;
                                    s3 = t3
                                }
                                var t0 = (SBOX[s0 >>> 24] << 24 | SBOX[s1 >>> 16 & 255] << 16 | SBOX[s2 >>> 8 & 255] << 8 | SBOX[s3 & 255]) ^ keySchedule[ksRow++];
                                var t1 = (SBOX[s1 >>> 24] << 24 | SBOX[s2 >>> 16 & 255] << 16 | SBOX[s3 >>> 8 & 255] << 8 | SBOX[s0 & 255]) ^ keySchedule[ksRow++];
                                var t2 = (SBOX[s2 >>> 24] << 24 | SBOX[s3 >>> 16 & 255] << 16 | SBOX[s0 >>> 8 & 255] << 8 | SBOX[s1 & 255]) ^ keySchedule[ksRow++];
                                var t3 = (SBOX[s3 >>> 24] << 24 | SBOX[s0 >>> 16 & 255] << 16 | SBOX[s1 >>> 8 & 255] << 8 | SBOX[s2 & 255]) ^ keySchedule[ksRow++];
                                M[offset] = t0;
                                M[offset + 1] = t1;
                                M[offset + 2] = t2;
                                M[offset + 3] = t3
                            },
                            keySize: 256 / 32
                        });
                        C.AES = BlockCipher._createHelper(AES)
                    })();
                    return CryptoJS.AES
                })
            }, {
                "./cipher-core": 20,
                "./core": 21,
                "./enc-base64": 22,
                "./evpkdf": 24,
                "./md5": 29
            }
        ],
        20: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.lib.Cipher || function(undefined) {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var Base = C_lib.Base;
                        var WordArray = C_lib.WordArray;
                        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
                        var C_enc = C.enc;
                        var Utf8 = C_enc.Utf8;
                        var Base64 = C_enc.Base64;
                        var C_algo = C.algo;
                        var EvpKDF = C_algo.EvpKDF;
                        var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
                            cfg: Base.extend(),
                            createEncryptor: function(key, cfg) {
                                return this.create(this._ENC_XFORM_MODE, key, cfg)
                            },
                            createDecryptor: function(key, cfg) {
                                return this.create(this._DEC_XFORM_MODE, key, cfg)
                            },
                            init: function(xformMode, key, cfg) {
                                this.cfg = this.cfg.extend(cfg);
                                this._xformMode = xformMode;
                                this._key = key;
                                this.reset()
                            },
                            reset: function() {
                                BufferedBlockAlgorithm.reset.call(this);
                                this._doReset()
                            },
                            process: function(dataUpdate) {
                                this._append(dataUpdate);
                                return this._process()
                            },
                            finalize: function(dataUpdate) {
                                if (dataUpdate) {
                                    this._append(dataUpdate)
                                }
                                var finalProcessedData = this._doFinalize();
                                return finalProcessedData
                            },
                            keySize: 128 / 32,
                            ivSize: 128 / 32,
                            _ENC_XFORM_MODE: 1,
                            _DEC_XFORM_MODE: 2,
                            _createHelper: function() {
                                function selectCipherStrategy(key) {
                                    if (typeof key == "string") {
                                        return PasswordBasedCipher
                                    } else {
                                        return SerializableCipher
                                    }
                                }
                                return function(cipher) {
                                    return {
                                        encrypt: function(message, key, cfg) {
                                            return selectCipherStrategy(key).encrypt(cipher, message, key, cfg)
                                        },
                                        decrypt: function(ciphertext, key, cfg) {
                                            return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg)
                                        }
                                    }
                                }
                            }()
                        });
                        var StreamCipher = C_lib.StreamCipher = Cipher.extend({
                            _doFinalize: function() {
                                var finalProcessedBlocks = this._process(!!"flush");
                                return finalProcessedBlocks
                            },
                            blockSize: 1
                        });
                        var C_mode = C.mode = {};
                        var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
                            createEncryptor: function(cipher, iv) {
                                return this.Encryptor.create(cipher, iv)
                            },
                            createDecryptor: function(cipher, iv) {
                                return this.Decryptor.create(cipher, iv)
                            },
                            init: function(cipher, iv) {
                                this._cipher = cipher;
                                this._iv = iv
                            }
                        });
                        var CBC = C_mode.CBC = function() {
                            var CBC = BlockCipherMode.extend();
                            CBC.Encryptor = CBC.extend({
                                processBlock: function(words, offset) {
                                    var cipher = this._cipher;
                                    var blockSize = cipher.blockSize;
                                    xorBlock.call(this, words, offset, blockSize);
                                    cipher.encryptBlock(words, offset);
                                    this._prevBlock = words.slice(offset, offset + blockSize)
                                }
                            });
                            CBC.Decryptor = CBC.extend({
                                processBlock: function(words, offset) {
                                    var cipher = this._cipher;
                                    var blockSize = cipher.blockSize;
                                    var thisBlock = words.slice(offset, offset + blockSize);
                                    cipher.decryptBlock(words, offset);
                                    xorBlock.call(this, words, offset, blockSize);
                                    this._prevBlock = thisBlock
                                }
                            });

                            function xorBlock(words, offset, blockSize) {
                                var iv = this._iv;
                                if (iv) {
                                    var block = iv;
                                    this._iv = undefined
                                } else {
                                    var block = this._prevBlock
                                }
                                for (var i = 0; i < blockSize; i++) {
                                    words[offset + i] ^= block[i]
                                }
                            }
                            return CBC
                        }();
                        var C_pad = C.pad = {};
                        var Pkcs7 = C_pad.Pkcs7 = {
                            pad: function(data, blockSize) {
                                var blockSizeBytes = blockSize * 4;
                                var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
                                var paddingWord = nPaddingBytes << 24 | nPaddingBytes << 16 | nPaddingBytes << 8 | nPaddingBytes;
                                var paddingWords = [];
                                for (var i = 0; i < nPaddingBytes; i += 4) {
                                    paddingWords.push(paddingWord)
                                }
                                var padding = WordArray.create(paddingWords, nPaddingBytes);
                                data.concat(padding)
                            },
                            unpad: function(data) {
                                var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
                                data.sigBytes -= nPaddingBytes
                            }
                        };
                        var BlockCipher = C_lib.BlockCipher = Cipher.extend({
                            cfg: Cipher.cfg.extend({
                                mode: CBC,
                                padding: Pkcs7
                            }),
                            reset: function() {
                                Cipher.reset.call(this);
                                var cfg = this.cfg;
                                var iv = cfg.iv;
                                var mode = cfg.mode;
                                if (this._xformMode == this._ENC_XFORM_MODE) {
                                    var modeCreator = mode.createEncryptor
                                } else {
                                    var modeCreator = mode.createDecryptor;
                                    this._minBufferSize = 1
                                }
                                this._mode = modeCreator.call(mode, this, iv && iv.words)
                            },
                            _doProcessBlock: function(words, offset) {
                                this._mode.processBlock(words, offset)
                            },
                            _doFinalize: function() {
                                var padding = this.cfg.padding;
                                if (this._xformMode == this._ENC_XFORM_MODE) {
                                    padding.pad(this._data, this.blockSize);
                                    var finalProcessedBlocks = this._process(!!"flush")
                                } else {
                                    var finalProcessedBlocks = this._process(!!"flush");
                                    padding.unpad(finalProcessedBlocks)
                                }
                                return finalProcessedBlocks
                            },
                            blockSize: 128 / 32
                        });
                        var CipherParams = C_lib.CipherParams = Base.extend({
                            init: function(cipherParams) {
                                this.mixIn(cipherParams)
                            },
                            toString: function(formatter) {
                                return (formatter || this.formatter).stringify(this)
                            }
                        });
                        var C_format = C.format = {};
                        var OpenSSLFormatter = C_format.OpenSSL = {
                            stringify: function(cipherParams) {
                                var ciphertext = cipherParams.ciphertext;
                                var salt = cipherParams.salt;
                                if (salt) {
                                    var wordArray = WordArray.create([1398893684, 1701076831]).concat(salt).concat(ciphertext)
                                } else {
                                    var wordArray = ciphertext
                                }
                                return wordArray.toString(Base64)
                            },
                            parse: function(openSSLStr) {
                                var ciphertext = Base64.parse(openSSLStr);
                                var ciphertextWords = ciphertext.words;
                                if (ciphertextWords[0] == 1398893684 && ciphertextWords[1] == 1701076831) {
                                    var salt = WordArray.create(ciphertextWords.slice(2, 4));
                                    ciphertextWords.splice(0, 4);
                                    ciphertext.sigBytes -= 16
                                }
                                return CipherParams.create({
                                    ciphertext: ciphertext,
                                    salt: salt
                                })
                            }
                        };
                        var SerializableCipher = C_lib.SerializableCipher = Base.extend({
                            cfg: Base.extend({
                                format: OpenSSLFormatter
                            }),
                            encrypt: function(cipher, message, key, cfg) {
                                cfg = this.cfg.extend(cfg);
                                var encryptor = cipher.createEncryptor(key, cfg);
                                var ciphertext = encryptor.finalize(message);
                                var cipherCfg = encryptor.cfg;
                                return CipherParams.create({
                                    ciphertext: ciphertext,
                                    key: key,
                                    iv: cipherCfg.iv,
                                    algorithm: cipher,
                                    mode: cipherCfg.mode,
                                    padding: cipherCfg.padding,
                                    blockSize: cipher.blockSize,
                                    formatter: cfg.format
                                })
                            },
                            decrypt: function(cipher, ciphertext, key, cfg) {
                                cfg = this.cfg.extend(cfg);
                                ciphertext = this._parse(ciphertext, cfg.format);
                                var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);
                                return plaintext
                            },
                            _parse: function(ciphertext, format) {
                                if (typeof ciphertext == "string") {
                                    return format.parse(ciphertext, this)
                                } else {
                                    return ciphertext
                                }
                            }
                        });
                        var C_kdf = C.kdf = {};
                        var OpenSSLKdf = C_kdf.OpenSSL = {
                            execute: function(password, keySize, ivSize, salt) {
                                if (!salt) {
                                    salt = WordArray.random(64 / 8)
                                }
                                var key = EvpKDF.create({
                                    keySize: keySize + ivSize
                                }).compute(password, salt);
                                var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
                                key.sigBytes = keySize * 4;
                                return CipherParams.create({
                                    key: key,
                                    iv: iv,
                                    salt: salt
                                })
                            }
                        };
                        var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
                            cfg: SerializableCipher.cfg.extend({
                                kdf: OpenSSLKdf
                            }),
                            encrypt: function(cipher, message, password, cfg) {
                                cfg = this.cfg.extend(cfg);
                                var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize);
                                cfg.iv = derivedParams.iv;
                                var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);
                                ciphertext.mixIn(derivedParams);
                                return ciphertext
                            },
                            decrypt: function(cipher, ciphertext, password, cfg) {
                                cfg = this.cfg.extend(cfg);
                                ciphertext = this._parse(ciphertext, cfg.format);
                                var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt);
                                cfg.iv = derivedParams.iv;
                                var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);
                                return plaintext
                            }
                        })
                    }()
                })
            }, {
                "./core": 21
            }
        ],
        21: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory()
                    } else if (typeof define === "function" && define.amd) {
                        define([], factory)
                    } else {
                        root.CryptoJS = factory()
                    }
                })(this, function() {
                    var CryptoJS = CryptoJS || function(Math, undefined) {
                        var C = {};
                        var C_lib = C.lib = {};
                        var Base = C_lib.Base = function() {
                            function F() {}
                            return {
                                extend: function(overrides) {
                                    F.prototype = this;
                                    var subtype = new F;
                                    if (overrides) {
                                        subtype.mixIn(overrides)
                                    }
                                    if (!subtype.hasOwnProperty("init")) {
                                        subtype.init = function() {
                                            subtype.$super.init.apply(this, arguments)
                                        }
                                    }
                                    subtype.init.prototype = subtype;
                                    subtype.$super = this;
                                    return subtype
                                },
                                create: function() {
                                    var instance = this.extend();
                                    instance.init.apply(instance, arguments);
                                    return instance
                                },
                                init: function() {},
                                mixIn: function(properties) {
                                    for (var propertyName in properties) {
                                        if (properties.hasOwnProperty(propertyName)) {
                                            this[propertyName] = properties[propertyName]
                                        }
                                    }
                                    if (properties.hasOwnProperty("toString")) {
                                        this.toString = properties.toString
                                    }
                                },
                                clone: function() {
                                    return this.init.prototype.extend(this)
                                }
                            }
                        }();
                        var WordArray = C_lib.WordArray = Base.extend({
                            init: function(words, sigBytes) {
                                words = this.words = words || [];
                                if (sigBytes != undefined) {
                                    this.sigBytes = sigBytes
                                } else {
                                    this.sigBytes = words.length * 4
                                }
                            },
                            toString: function(encoder) {
                                return (encoder || Hex).stringify(this)
                            },
                            concat: function(wordArray) {
                                var thisWords = this.words;
                                var thatWords = wordArray.words;
                                var thisSigBytes = this.sigBytes;
                                var thatSigBytes = wordArray.sigBytes;
                                this.clamp();
                                if (thisSigBytes % 4) {
                                    for (var i = 0; i < thatSigBytes; i++) {
                                        var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                                        thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8
                                    }
                                } else if (thatWords.length > 65535) {
                                    for (var i = 0; i < thatSigBytes; i += 4) {
                                        thisWords[thisSigBytes + i >>> 2] = thatWords[i >>> 2]
                                    }
                                } else {
                                    thisWords.push.apply(thisWords, thatWords)
                                }
                                this.sigBytes += thatSigBytes;
                                return this
                            },
                            clamp: function() {
                                var words = this.words;
                                var sigBytes = this.sigBytes;
                                words[sigBytes >>> 2] &= 4294967295 << 32 - sigBytes % 4 * 8;
                                words.length = Math.ceil(sigBytes / 4)
                            },
                            clone: function() {
                                var clone = Base.clone.call(this);
                                clone.words = this.words.slice(0);
                                return clone
                            },
                            random: function(nBytes) {
                                var words = [];
                                for (var i = 0; i < nBytes; i += 4) {
                                    words.push(Math.random() * 4294967296 | 0)
                                }
                                return new WordArray.init(words, nBytes)
                            }
                        });
                        var C_enc = C.enc = {};
                        var Hex = C_enc.Hex = {
                            stringify: function(wordArray) {
                                var words = wordArray.words;
                                var sigBytes = wordArray.sigBytes;
                                var hexChars = [];
                                for (var i = 0; i < sigBytes; i++) {
                                    var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                                    hexChars.push((bite >>> 4).toString(16));
                                    hexChars.push((bite & 15).toString(16))
                                }
                                return hexChars.join("")
                            },
                            parse: function(hexStr) {
                                var hexStrLength = hexStr.length;
                                var words = [];
                                for (var i = 0; i < hexStrLength; i += 2) {
                                    words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4
                                }
                                return new WordArray.init(words, hexStrLength / 2)
                            }
                        };
                        var Latin1 = C_enc.Latin1 = {
                            stringify: function(wordArray) {
                                var words = wordArray.words;
                                var sigBytes = wordArray.sigBytes;
                                var latin1Chars = [];
                                for (var i = 0; i < sigBytes; i++) {
                                    var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                                    latin1Chars.push(String.fromCharCode(bite))
                                }
                                return latin1Chars.join("")
                            },
                            parse: function(latin1Str) {
                                var latin1StrLength = latin1Str.length;
                                var words = [];
                                for (var i = 0; i < latin1StrLength; i++) {
                                    words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8
                                }
                                return new WordArray.init(words, latin1StrLength)
                            }
                        };
                        var Utf8 = C_enc.Utf8 = {
                            stringify: function(wordArray) {
                                try {
                                    return decodeURIComponent(escape(Latin1.stringify(wordArray)))
                                } catch (e) {
                                    throw new Error("Malformed UTF-8 data")
                                }
                            },
                            parse: function(utf8Str) {
                                return Latin1.parse(unescape(encodeURIComponent(utf8Str)))
                            }
                        };
                        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
                            reset: function() {
                                this._data = new WordArray.init;
                                this._nDataBytes = 0
                            },
                            _append: function(data) {
                                if (typeof data == "string") {
                                    data = Utf8.parse(data)
                                }
                                this._data.concat(data);
                                this._nDataBytes += data.sigBytes
                            },
                            _process: function(doFlush) {
                                var data = this._data;
                                var dataWords = data.words;
                                var dataSigBytes = data.sigBytes;
                                var blockSize = this.blockSize;
                                var blockSizeBytes = blockSize * 4;
                                var nBlocksReady = dataSigBytes / blockSizeBytes;
                                if (doFlush) {
                                    nBlocksReady = Math.ceil(nBlocksReady)
                                } else {
                                    nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0)
                                }
                                var nWordsReady = nBlocksReady * blockSize;
                                var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);
                                if (nWordsReady) {
                                    for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                                        this._doProcessBlock(dataWords, offset)
                                    }
                                    var processedWords = dataWords.splice(0, nWordsReady);
                                    data.sigBytes -= nBytesReady
                                }
                                return new WordArray.init(processedWords, nBytesReady)
                            },
                            clone: function() {
                                var clone = Base.clone.call(this);
                                clone._data = this._data.clone();
                                return clone
                            },
                            _minBufferSize: 0
                        });
                        var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
                            cfg: Base.extend(),
                            init: function(cfg) {
                                this.cfg = this.cfg.extend(cfg);
                                this.reset()
                            },
                            reset: function() {
                                BufferedBlockAlgorithm.reset.call(this);
                                this._doReset()
                            },
                            update: function(messageUpdate) {
                                this._append(messageUpdate);
                                this._process();
                                return this
                            },
                            finalize: function(messageUpdate) {
                                if (messageUpdate) {
                                    this._append(messageUpdate)
                                }
                                var hash = this._doFinalize();
                                return hash
                            },
                            blockSize: 512 / 32,
                            _createHelper: function(hasher) {
                                return function(message, cfg) {
                                    return new hasher.init(cfg).finalize(message)
                                }
                            },
                            _createHmacHelper: function(hasher) {
                                return function(message, key) {
                                    return new C_algo.HMAC.init(hasher, key).finalize(message)
                                }
                            }
                        });
                        var C_algo = C.algo = {};
                        return C
                    }(Math);
                    return CryptoJS
                })
            }, {}
        ],
        22: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var WordArray = C_lib.WordArray;
                        var C_enc = C.enc;
                        var Base64 = C_enc.Base64 = {
                            stringify: function(wordArray) {
                                var words = wordArray.words;
                                var sigBytes = wordArray.sigBytes;
                                var map = this._map;
                                wordArray.clamp();
                                var base64Chars = [];
                                for (var i = 0; i < sigBytes; i += 3) {
                                    var byte1 = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                                    var byte2 = words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
                                    var byte3 = words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
                                    var triplet = byte1 << 16 | byte2 << 8 | byte3;
                                    for (var j = 0; j < 4 && i + j * .75 < sigBytes; j++) {
                                        base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63))
                                    }
                                }
                                var paddingChar = map.charAt(64);
                                if (paddingChar) {
                                    while (base64Chars.length % 4) {
                                        base64Chars.push(paddingChar)
                                    }
                                }
                                return base64Chars.join("")
                            },
                            parse: function(base64Str) {
                                var base64StrLength = base64Str.length;
                                var map = this._map;
                                var paddingChar = map.charAt(64);
                                if (paddingChar) {
                                    var paddingIndex = base64Str.indexOf(paddingChar);
                                    if (paddingIndex != -1) {
                                        base64StrLength = paddingIndex
                                    }
                                }
                                var words = [];
                                var nBytes = 0;
                                for (var i = 0; i < base64StrLength; i++) {
                                    if (i % 4) {
                                        var bits1 = map.indexOf(base64Str.charAt(i - 1)) << i % 4 * 2;
                                        var bits2 = map.indexOf(base64Str.charAt(i)) >>> 6 - i % 4 * 2;
                                        words[nBytes >>> 2] |= (bits1 | bits2) << 24 - nBytes % 4 * 8;
                                        nBytes++
                                    }
                                }
                                return WordArray.create(words, nBytes)
                            },
                            _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
                        }
                    })();
                    return CryptoJS.enc.Base64
                })
            }, {
                "./core": 21
            }
        ],
        23: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var WordArray = C_lib.WordArray;
                        var C_enc = C.enc;
                        var Utf16BE = C_enc.Utf16 = C_enc.Utf16BE = {
                            stringify: function(wordArray) {
                                var words = wordArray.words;
                                var sigBytes = wordArray.sigBytes;
                                var utf16Chars = [];
                                for (var i = 0; i < sigBytes; i += 2) {
                                    var codePoint = words[i >>> 2] >>> 16 - i % 4 * 8 & 65535;
                                    utf16Chars.push(String.fromCharCode(codePoint))
                                }
                                return utf16Chars.join("")
                            },
                            parse: function(utf16Str) {
                                var utf16StrLength = utf16Str.length;
                                var words = [];
                                for (var i = 0; i < utf16StrLength; i++) {
                                    words[i >>> 1] |= utf16Str.charCodeAt(i) << 16 - i % 2 * 16
                                }
                                return WordArray.create(words, utf16StrLength * 2)
                            }
                        };
                        C_enc.Utf16LE = {
                            stringify: function(wordArray) {
                                var words = wordArray.words;
                                var sigBytes = wordArray.sigBytes;
                                var utf16Chars = [];
                                for (var i = 0; i < sigBytes; i += 2) {
                                    var codePoint = swapEndian(words[i >>> 2] >>> 16 - i % 4 * 8 & 65535);
                                    utf16Chars.push(String.fromCharCode(codePoint))
                                }
                                return utf16Chars.join("")
                            },
                            parse: function(utf16Str) {
                                var utf16StrLength = utf16Str.length;
                                var words = [];
                                for (var i = 0; i < utf16StrLength; i++) {
                                    words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << 16 - i % 2 * 16)
                                }
                                return WordArray.create(words, utf16StrLength * 2)
                            }
                        };

                        function swapEndian(word) {
                            return word << 8 & 4278255360 | word >>> 8 & 16711935
                        }
                    })();
                    return CryptoJS.enc.Utf16
                })
            }, {
                "./core": 21
            }
        ],
        24: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./sha1"), require("./hmac"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./sha1", "./hmac"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var Base = C_lib.Base;
                        var WordArray = C_lib.WordArray;
                        var C_algo = C.algo;
                        var MD5 = C_algo.MD5;
                        var EvpKDF = C_algo.EvpKDF = Base.extend({
                            cfg: Base.extend({
                                keySize: 128 / 32,
                                hasher: MD5,
                                iterations: 1
                            }),
                            init: function(cfg) {
                                this.cfg = this.cfg.extend(cfg)
                            },
                            compute: function(password, salt) {
                                var cfg = this.cfg;
                                var hasher = cfg.hasher.create();
                                var derivedKey = WordArray.create();
                                var derivedKeyWords = derivedKey.words;
                                var keySize = cfg.keySize;
                                var iterations = cfg.iterations;
                                while (derivedKeyWords.length < keySize) {
                                    if (block) {
                                        hasher.update(block)
                                    }
                                    var block = hasher.update(password).finalize(salt);
                                    hasher.reset();
                                    for (var i = 1; i < iterations; i++) {
                                        block = hasher.finalize(block);
                                        hasher.reset()
                                    }
                                    derivedKey.concat(block)
                                }
                                derivedKey.sigBytes = keySize * 4;
                                return derivedKey
                            }
                        });
                        C.EvpKDF = function(password, salt, cfg) {
                            return EvpKDF.create(cfg).compute(password, salt)
                        }
                    })();
                    return CryptoJS.EvpKDF
                })
            }, {
                "./core": 21,
                "./hmac": 26,
                "./sha1": 45
            }
        ],
        25: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function(undefined) {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var CipherParams = C_lib.CipherParams;
                        var C_enc = C.enc;
                        var Hex = C_enc.Hex;
                        var C_format = C.format;
                        var HexFormatter = C_format.Hex = {
                            stringify: function(cipherParams) {
                                return cipherParams.ciphertext.toString(Hex)
                            },
                            parse: function(input) {
                                var ciphertext = Hex.parse(input);
                                return CipherParams.create({
                                    ciphertext: ciphertext
                                })
                            }
                        }
                    })();
                    return CryptoJS.format.Hex
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        26: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var Base = C_lib.Base;
                        var C_enc = C.enc;
                        var Utf8 = C_enc.Utf8;
                        var C_algo = C.algo;
                        var HMAC = C_algo.HMAC = Base.extend({
                            init: function(hasher, key) {
                                hasher = this._hasher = new hasher.init;
                                if (typeof key == "string") {
                                    key = Utf8.parse(key)
                                }
                                var hasherBlockSize = hasher.blockSize;
                                var hasherBlockSizeBytes = hasherBlockSize * 4;
                                if (key.sigBytes > hasherBlockSizeBytes) {
                                    key = hasher.finalize(key)
                                }
                                key.clamp();
                                var oKey = this._oKey = key.clone();
                                var iKey = this._iKey = key.clone();
                                var oKeyWords = oKey.words;
                                var iKeyWords = iKey.words;
                                for (var i = 0; i < hasherBlockSize; i++) {
                                    oKeyWords[i] ^= 1549556828;
                                    iKeyWords[i] ^= 909522486
                                }
                                oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;
                                this.reset()
                            },
                            reset: function() {
                                var hasher = this._hasher;
                                hasher.reset();
                                hasher.update(this._iKey)
                            },
                            update: function(messageUpdate) {
                                this._hasher.update(messageUpdate);
                                return this
                            },
                            finalize: function(messageUpdate) {
                                var hasher = this._hasher;
                                var innerHash = hasher.finalize(messageUpdate);
                                hasher.reset();
                                var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));
                                return hmac
                            }
                        })
                    })()
                })
            }, {
                "./core": 21
            }
        ],
        27: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./x64-core"), require("./lib-typedarrays"), require("./enc-utf16"), require("./enc-base64"), require("./md5"), require("./sha1"), require("./sha256"), require("./sha224"), require("./sha512"), require("./sha384"), require("./sha3"), require("./ripemd160"), require("./hmac"), require("./pbkdf2"), require("./evpkdf"), require("./cipher-core"), require("./mode-cfb"), require("./mode-ctr"), require("./mode-ctr-gladman"), require("./mode-ofb"), require("./mode-ecb"), require("./pad-ansix923"), require("./pad-iso10126"), require("./pad-iso97971"), require("./pad-zeropadding"), require("./pad-nopadding"), require("./format-hex"), require("./aes"), require("./tripledes"), require("./rc4"), require("./rabbit"), require("./rabbit-legacy"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./x64-core", "./lib-typedarrays", "./enc-utf16", "./enc-base64", "./md5", "./sha1", "./sha256", "./sha224", "./sha512", "./sha384", "./sha3", "./ripemd160", "./hmac", "./pbkdf2", "./evpkdf", "./cipher-core", "./mode-cfb", "./mode-ctr", "./mode-ctr-gladman", "./mode-ofb", "./mode-ecb", "./pad-ansix923", "./pad-iso10126", "./pad-iso97971", "./pad-zeropadding", "./pad-nopadding", "./format-hex", "./aes", "./tripledes", "./rc4", "./rabbit", "./rabbit-legacy"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    return CryptoJS
                })
            }, {
                "./aes": 19,
                "./cipher-core": 20,
                "./core": 21,
                "./enc-base64": 22,
                "./enc-utf16": 23,
                "./evpkdf": 24,
                "./format-hex": 25,
                "./hmac": 26,
                "./lib-typedarrays": 28,
                "./md5": 29,
                "./mode-cfb": 30,
                "./mode-ctr": 32,
                "./mode-ctr-gladman": 31,
                "./mode-ecb": 33,
                "./mode-ofb": 34,
                "./pad-ansix923": 35,
                "./pad-iso10126": 36,
                "./pad-iso97971": 37,
                "./pad-nopadding": 38,
                "./pad-zeropadding": 39,
                "./pbkdf2": 40,
                "./rabbit": 42,
                "./rabbit-legacy": 41,
                "./rc4": 43,
                "./ripemd160": 44,
                "./sha1": 45,
                "./sha224": 46,
                "./sha256": 47,
                "./sha3": 48,
                "./sha384": 49,
                "./sha512": 50,
                "./tripledes": 51,
                "./x64-core": 52
            }
        ],
        28: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        if (typeof ArrayBuffer != "function") {
                            return
                        }
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var WordArray = C_lib.WordArray;
                        var superInit = WordArray.init;
                        var subInit = WordArray.init = function(typedArray) {
                            if (typedArray instanceof ArrayBuffer) {
                                typedArray = new Uint8Array(typedArray)
                            }
                            if (typedArray instanceof Int8Array || typedArray instanceof Uint8ClampedArray || typedArray instanceof Int16Array || typedArray instanceof Uint16Array || typedArray instanceof Int32Array || typedArray instanceof Uint32Array || typedArray instanceof Float32Array || typedArray instanceof Float64Array) {
                                typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength)
                            }
                            if (typedArray instanceof Uint8Array) {
                                var typedArrayByteLength = typedArray.byteLength;
                                var words = [];
                                for (var i = 0; i < typedArrayByteLength; i++) {
                                    words[i >>> 2] |= typedArray[i] << 24 - i % 4 * 8
                                }
                                superInit.call(this, words, typedArrayByteLength)
                            } else {
                                superInit.apply(this, arguments)
                            }
                        };
                        subInit.prototype = WordArray
                    })();
                    return CryptoJS.lib.WordArray
                })
            }, {
                "./core": 21
            }
        ],
        29: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function(Math) {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var WordArray = C_lib.WordArray;
                        var Hasher = C_lib.Hasher;
                        var C_algo = C.algo;
                        var T = [];
                        (function() {
                            for (var i = 0; i < 64; i++) {
                                T[i] = Math.abs(Math.sin(i + 1)) * 4294967296 | 0
                            }
                        })();
                        var MD5 = C_algo.MD5 = Hasher.extend({
                            _doReset: function() {
                                this._hash = new WordArray.init([1732584193, 4023233417, 2562383102, 271733878])
                            },
                            _doProcessBlock: function(M, offset) {
                                for (var i = 0; i < 16; i++) {
                                    var offset_i = offset + i;
                                    var M_offset_i = M[offset_i];
                                    M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360
                                }
                                var H = this._hash.words;
                                var M_offset_0 = M[offset + 0];
                                var M_offset_1 = M[offset + 1];
                                var M_offset_2 = M[offset + 2];
                                var M_offset_3 = M[offset + 3];
                                var M_offset_4 = M[offset + 4];
                                var M_offset_5 = M[offset + 5];
                                var M_offset_6 = M[offset + 6];
                                var M_offset_7 = M[offset + 7];
                                var M_offset_8 = M[offset + 8];
                                var M_offset_9 = M[offset + 9];
                                var M_offset_10 = M[offset + 10];
                                var M_offset_11 = M[offset + 11];
                                var M_offset_12 = M[offset + 12];
                                var M_offset_13 = M[offset + 13];
                                var M_offset_14 = M[offset + 14];
                                var M_offset_15 = M[offset + 15];
                                var a = H[0];
                                var b = H[1];
                                var c = H[2];
                                var d = H[3];
                                a = FF(a, b, c, d, M_offset_0, 7, T[0]);
                                d = FF(d, a, b, c, M_offset_1, 12, T[1]);
                                c = FF(c, d, a, b, M_offset_2, 17, T[2]);
                                b = FF(b, c, d, a, M_offset_3, 22, T[3]);
                                a = FF(a, b, c, d, M_offset_4, 7, T[4]);
                                d = FF(d, a, b, c, M_offset_5, 12, T[5]);
                                c = FF(c, d, a, b, M_offset_6, 17, T[6]);
                                b = FF(b, c, d, a, M_offset_7, 22, T[7]);
                                a = FF(a, b, c, d, M_offset_8, 7, T[8]);
                                d = FF(d, a, b, c, M_offset_9, 12, T[9]);
                                c = FF(c, d, a, b, M_offset_10, 17, T[10]);
                                b = FF(b, c, d, a, M_offset_11, 22, T[11]);
                                a = FF(a, b, c, d, M_offset_12, 7, T[12]);
                                d = FF(d, a, b, c, M_offset_13, 12, T[13]);
                                c = FF(c, d, a, b, M_offset_14, 17, T[14]);
                                b = FF(b, c, d, a, M_offset_15, 22, T[15]);
                                a = GG(a, b, c, d, M_offset_1, 5, T[16]);
                                d = GG(d, a, b, c, M_offset_6, 9, T[17]);
                                c = GG(c, d, a, b, M_offset_11, 14, T[18]);
                                b = GG(b, c, d, a, M_offset_0, 20, T[19]);
                                a = GG(a, b, c, d, M_offset_5, 5, T[20]);
                                d = GG(d, a, b, c, M_offset_10, 9, T[21]);
                                c = GG(c, d, a, b, M_offset_15, 14, T[22]);
                                b = GG(b, c, d, a, M_offset_4, 20, T[23]);
                                a = GG(a, b, c, d, M_offset_9, 5, T[24]);
                                d = GG(d, a, b, c, M_offset_14, 9, T[25]);
                                c = GG(c, d, a, b, M_offset_3, 14, T[26]);
                                b = GG(b, c, d, a, M_offset_8, 20, T[27]);
                                a = GG(a, b, c, d, M_offset_13, 5, T[28]);
                                d = GG(d, a, b, c, M_offset_2, 9, T[29]);
                                c = GG(c, d, a, b, M_offset_7, 14, T[30]);
                                b = GG(b, c, d, a, M_offset_12, 20, T[31]);
                                a = HH(a, b, c, d, M_offset_5, 4, T[32]);
                                d = HH(d, a, b, c, M_offset_8, 11, T[33]);
                                c = HH(c, d, a, b, M_offset_11, 16, T[34]);
                                b = HH(b, c, d, a, M_offset_14, 23, T[35]);
                                a = HH(a, b, c, d, M_offset_1, 4, T[36]);
                                d = HH(d, a, b, c, M_offset_4, 11, T[37]);
                                c = HH(c, d, a, b, M_offset_7, 16, T[38]);
                                b = HH(b, c, d, a, M_offset_10, 23, T[39]);
                                a = HH(a, b, c, d, M_offset_13, 4, T[40]);
                                d = HH(d, a, b, c, M_offset_0, 11, T[41]);
                                c = HH(c, d, a, b, M_offset_3, 16, T[42]);
                                b = HH(b, c, d, a, M_offset_6, 23, T[43]);
                                a = HH(a, b, c, d, M_offset_9, 4, T[44]);
                                d = HH(d, a, b, c, M_offset_12, 11, T[45]);
                                c = HH(c, d, a, b, M_offset_15, 16, T[46]);
                                b = HH(b, c, d, a, M_offset_2, 23, T[47]);
                                a = II(a, b, c, d, M_offset_0, 6, T[48]);
                                d = II(d, a, b, c, M_offset_7, 10, T[49]);
                                c = II(c, d, a, b, M_offset_14, 15, T[50]);
                                b = II(b, c, d, a, M_offset_5, 21, T[51]);
                                a = II(a, b, c, d, M_offset_12, 6, T[52]);
                                d = II(d, a, b, c, M_offset_3, 10, T[53]);
                                c = II(c, d, a, b, M_offset_10, 15, T[54]);
                                b = II(b, c, d, a, M_offset_1, 21, T[55]);
                                a = II(a, b, c, d, M_offset_8, 6, T[56]);
                                d = II(d, a, b, c, M_offset_15, 10, T[57]);
                                c = II(c, d, a, b, M_offset_6, 15, T[58]);
                                b = II(b, c, d, a, M_offset_13, 21, T[59]);
                                a = II(a, b, c, d, M_offset_4, 6, T[60]);
                                d = II(d, a, b, c, M_offset_11, 10, T[61]);
                                c = II(c, d, a, b, M_offset_2, 15, T[62]);
                                b = II(b, c, d, a, M_offset_9, 21, T[63]);
                                H[0] = H[0] + a | 0;
                                H[1] = H[1] + b | 0;
                                H[2] = H[2] + c | 0;
                                H[3] = H[3] + d | 0
                            },
                            _doFinalize: function() {
                                var data = this._data;
                                var dataWords = data.words;
                                var nBitsTotal = this._nDataBytes * 8;
                                var nBitsLeft = data.sigBytes * 8;
                                dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
                                var nBitsTotalH = Math.floor(nBitsTotal / 4294967296);
                                var nBitsTotalL = nBitsTotal;
                                dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = (nBitsTotalH << 8 | nBitsTotalH >>> 24) & 16711935 | (nBitsTotalH << 24 | nBitsTotalH >>> 8) & 4278255360;
                                dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotalL << 8 | nBitsTotalL >>> 24) & 16711935 | (nBitsTotalL << 24 | nBitsTotalL >>> 8) & 4278255360;
                                data.sigBytes = (dataWords.length + 1) * 4;
                                this._process();
                                var hash = this._hash;
                                var H = hash.words;
                                for (var i = 0; i < 4; i++) {
                                    var H_i = H[i];
                                    H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360
                                }
                                return hash
                            },
                            clone: function() {
                                var clone = Hasher.clone.call(this);
                                clone._hash = this._hash.clone();
                                return clone
                            }
                        });

                        function FF(a, b, c, d, x, s, t) {
                            var n = a + (b & c | ~b & d) + x + t;
                            return (n << s | n >>> 32 - s) + b
                        }

                        function GG(a, b, c, d, x, s, t) {
                            var n = a + (b & d | c & ~d) + x + t;
                            return (n << s | n >>> 32 - s) + b
                        }

                        function HH(a, b, c, d, x, s, t) {
                            var n = a + (b ^ c ^ d) + x + t;
                            return (n << s | n >>> 32 - s) + b
                        }

                        function II(a, b, c, d, x, s, t) {
                            var n = a + (c ^ (b | ~d)) + x + t;
                            return (n << s | n >>> 32 - s) + b
                        }
                        C.MD5 = Hasher._createHelper(MD5);
                        C.HmacMD5 = Hasher._createHmacHelper(MD5)
                    })(Math);
                    return CryptoJS.MD5
                })
            }, {
                "./core": 21
            }
        ],
        30: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.mode.CFB = function() {
                        var CFB = CryptoJS.lib.BlockCipherMode.extend();
                        CFB.Encryptor = CFB.extend({
                            processBlock: function(words, offset) {
                                var cipher = this._cipher;
                                var blockSize = cipher.blockSize;
                                generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);
                                this._prevBlock = words.slice(offset, offset + blockSize)
                            }
                        });
                        CFB.Decryptor = CFB.extend({
                            processBlock: function(words, offset) {
                                var cipher = this._cipher;
                                var blockSize = cipher.blockSize;
                                var thisBlock = words.slice(offset, offset + blockSize);
                                generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);
                                this._prevBlock = thisBlock
                            }
                        });

                        function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
                            var iv = this._iv;
                            if (iv) {
                                var keystream = iv.slice(0);
                                this._iv = undefined
                            } else {
                                var keystream = this._prevBlock
                            }
                            cipher.encryptBlock(keystream, 0);
                            for (var i = 0; i < blockSize; i++) {
                                words[offset + i] ^= keystream[i]
                            }
                        }
                        return CFB
                    }();
                    return CryptoJS.mode.CFB
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        31: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.mode.CTRGladman = function() {
                        var CTRGladman = CryptoJS.lib.BlockCipherMode.extend();

                        function incWord(word) {
                            if ((word >> 24 & 255) === 255) {
                                var b1 = word >> 16 & 255;
                                var b2 = word >> 8 & 255;
                                var b3 = word & 255;
                                if (b1 === 255) {
                                    b1 = 0;
                                    if (b2 === 255) {
                                        b2 = 0;
                                        if (b3 === 255) {
                                            b3 = 0
                                        } else {
                                            ++b3
                                        }
                                    } else {
                                        ++b2
                                    }
                                } else {
                                    ++b1
                                }
                                word = 0;
                                word += b1 << 16;
                                word += b2 << 8;
                                word += b3
                            } else {
                                word += 1 << 24
                            }
                            return word
                        }

                        function incCounter(counter) {
                            if ((counter[0] = incWord(counter[0])) === 0) {
                                counter[1] = incWord(counter[1])
                            }
                            return counter
                        }
                        var Encryptor = CTRGladman.Encryptor = CTRGladman.extend({
                            processBlock: function(words, offset) {
                                var cipher = this._cipher;
                                var blockSize = cipher.blockSize;
                                var iv = this._iv;
                                var counter = this._counter;
                                if (iv) {
                                    counter = this._counter = iv.slice(0);
                                    this._iv = undefined
                                }
                                incCounter(counter);
                                var keystream = counter.slice(0);
                                cipher.encryptBlock(keystream, 0);
                                for (var i = 0; i < blockSize; i++) {
                                    words[offset + i] ^= keystream[i]
                                }
                            }
                        });
                        CTRGladman.Decryptor = Encryptor;
                        return CTRGladman
                    }();
                    return CryptoJS.mode.CTRGladman
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        32: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.mode.CTR = function() {
                        var CTR = CryptoJS.lib.BlockCipherMode.extend();
                        var Encryptor = CTR.Encryptor = CTR.extend({
                            processBlock: function(words, offset) {
                                var cipher = this._cipher;
                                var blockSize = cipher.blockSize;
                                var iv = this._iv;
                                var counter = this._counter;
                                if (iv) {
                                    counter = this._counter = iv.slice(0);
                                    this._iv = undefined
                                }
                                var keystream = counter.slice(0);
                                cipher.encryptBlock(keystream, 0);
                                counter[blockSize - 1] = counter[blockSize - 1] + 1 | 0;
                                for (var i = 0; i < blockSize; i++) {
                                    words[offset + i] ^= keystream[i]
                                }
                            }
                        });
                        CTR.Decryptor = Encryptor;
                        return CTR
                    }();
                    return CryptoJS.mode.CTR
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        33: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.mode.ECB = function() {
                        var ECB = CryptoJS.lib.BlockCipherMode.extend();
                        ECB.Encryptor = ECB.extend({
                            processBlock: function(words, offset) {
                                this._cipher.encryptBlock(words, offset)
                            }
                        });
                        ECB.Decryptor = ECB.extend({
                            processBlock: function(words, offset) {
                                this._cipher.decryptBlock(words, offset)
                            }
                        });
                        return ECB
                    }();
                    return CryptoJS.mode.ECB
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        34: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.mode.OFB = function() {
                        var OFB = CryptoJS.lib.BlockCipherMode.extend();
                        var Encryptor = OFB.Encryptor = OFB.extend({
                            processBlock: function(words, offset) {
                                var cipher = this._cipher;
                                var blockSize = cipher.blockSize;
                                var iv = this._iv;
                                var keystream = this._keystream;
                                if (iv) {
                                    keystream = this._keystream = iv.slice(0);
                                    this._iv = undefined
                                }
                                cipher.encryptBlock(keystream, 0);
                                for (var i = 0; i < blockSize; i++) {
                                    words[offset + i] ^= keystream[i]
                                }
                            }
                        });
                        OFB.Decryptor = Encryptor;
                        return OFB
                    }();
                    return CryptoJS.mode.OFB
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        35: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.pad.AnsiX923 = {
                        pad: function(data, blockSize) {
                            var dataSigBytes = data.sigBytes;
                            var blockSizeBytes = blockSize * 4;
                            var nPaddingBytes = blockSizeBytes - dataSigBytes % blockSizeBytes;
                            var lastBytePos = dataSigBytes + nPaddingBytes - 1;
                            data.clamp();
                            data.words[lastBytePos >>> 2] |= nPaddingBytes << 24 - lastBytePos % 4 * 8;
                            data.sigBytes += nPaddingBytes
                        },
                        unpad: function(data) {
                            var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
                            data.sigBytes -= nPaddingBytes
                        }
                    };
                    return CryptoJS.pad.Ansix923
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        36: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.pad.Iso10126 = {
                        pad: function(data, blockSize) {
                            var blockSizeBytes = blockSize * 4;
                            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
                            data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).concat(CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1))
                        },
                        unpad: function(data) {
                            var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
                            data.sigBytes -= nPaddingBytes
                        }
                    };
                    return CryptoJS.pad.Iso10126
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        37: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.pad.Iso97971 = {
                        pad: function(data, blockSize) {
                            data.concat(CryptoJS.lib.WordArray.create([2147483648], 1));
                            CryptoJS.pad.ZeroPadding.pad(data, blockSize)
                        },
                        unpad: function(data) {
                            CryptoJS.pad.ZeroPadding.unpad(data);
                            data.sigBytes--
                        }
                    };
                    return CryptoJS.pad.Iso97971
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        38: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.pad.NoPadding = {
                        pad: function() {},
                        unpad: function() {}
                    };
                    return CryptoJS.pad.NoPadding
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        39: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    CryptoJS.pad.ZeroPadding = {
                        pad: function(data, blockSize) {
                            var blockSizeBytes = blockSize * 4;
                            data.clamp();
                            data.sigBytes += blockSizeBytes - (data.sigBytes % blockSizeBytes || blockSizeBytes)
                        },
                        unpad: function(data) {
                            var dataWords = data.words;
                            var i = data.sigBytes - 1;
                            while (!(dataWords[i >>> 2] >>> 24 - i % 4 * 8 & 255)) {
                                i--
                            }
                            data.sigBytes = i + 1
                        }
                    };
                    return CryptoJS.pad.ZeroPadding
                })
            }, {
                "./cipher-core": 20,
                "./core": 21
            }
        ],
        40: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./sha1"), require("./hmac"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./sha1", "./hmac"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var Base = C_lib.Base;
                        var WordArray = C_lib.WordArray;
                        var C_algo = C.algo;
                        var SHA1 = C_algo.SHA1;
                        var HMAC = C_algo.HMAC;
                        var PBKDF2 = C_algo.PBKDF2 = Base.extend({
                            cfg: Base.extend({
                                keySize: 128 / 32,
                                hasher: SHA1,
                                iterations: 1
                            }),
                            init: function(cfg) {
                                this.cfg = this.cfg.extend(cfg)
                            },
                            compute: function(password, salt) {
                                var cfg = this.cfg;
                                var hmac = HMAC.create(cfg.hasher, password);
                                var derivedKey = WordArray.create();
                                var blockIndex = WordArray.create([1]);
                                var derivedKeyWords = derivedKey.words;
                                var blockIndexWords = blockIndex.words;
                                var keySize = cfg.keySize;
                                var iterations = cfg.iterations;
                                while (derivedKeyWords.length < keySize) {
                                    var block = hmac.update(salt).finalize(blockIndex);
                                    hmac.reset();
                                    var blockWords = block.words;
                                    var blockWordsLength = blockWords.length;
                                    var intermediate = block;
                                    for (var i = 1; i < iterations; i++) {
                                        intermediate = hmac.finalize(intermediate);
                                        hmac.reset();
                                        var intermediateWords = intermediate.words;
                                        for (var j = 0; j < blockWordsLength; j++) {
                                            blockWords[j] ^= intermediateWords[j]
                                        }
                                    }
                                    derivedKey.concat(block);
                                    blockIndexWords[0] ++
                                }
                                derivedKey.sigBytes = keySize * 4;
                                return derivedKey
                            }
                        });
                        C.PBKDF2 = function(password, salt, cfg) {
                            return PBKDF2.create(cfg).compute(password, salt)
                        }
                    })();
                    return CryptoJS.PBKDF2
                })
            }, {
                "./core": 21,
                "./hmac": 26,
                "./sha1": 45
            }
        ],
        41: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./enc-base64"), require("./md5"), require("./evpkdf"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var StreamCipher = C_lib.StreamCipher;
                        var C_algo = C.algo;
                        var S = [];
                        var C_ = [];
                        var G = [];
                        var RabbitLegacy = C_algo.RabbitLegacy = StreamCipher.extend({
                            _doReset: function() {
                                var K = this._key.words;
                                var iv = this.cfg.iv;
                                var X = this._X = [K[0], K[3] << 16 | K[2] >>> 16, K[1], K[0] << 16 | K[3] >>> 16, K[2], K[1] << 16 | K[0] >>> 16, K[3], K[2] << 16 | K[1] >>> 16];
                                var C = this._C = [K[2] << 16 | K[2] >>> 16, K[0] & 4294901760 | K[1] & 65535, K[3] << 16 | K[3] >>> 16, K[1] & 4294901760 | K[2] & 65535, K[0] << 16 | K[0] >>> 16, K[2] & 4294901760 | K[3] & 65535, K[1] << 16 | K[1] >>> 16, K[3] & 4294901760 | K[0] & 65535];
                                this._b = 0;
                                for (var i = 0; i < 4; i++) {
                                    nextState.call(this)
                                }
                                for (var i = 0; i < 8; i++) {
                                    C[i] ^= X[i + 4 & 7]
                                }
                                if (iv) {
                                    var IV = iv.words;
                                    var IV_0 = IV[0];
                                    var IV_1 = IV[1];
                                    var i0 = (IV_0 << 8 | IV_0 >>> 24) & 16711935 | (IV_0 << 24 | IV_0 >>> 8) & 4278255360;
                                    var i2 = (IV_1 << 8 | IV_1 >>> 24) & 16711935 | (IV_1 << 24 | IV_1 >>> 8) & 4278255360;
                                    var i1 = i0 >>> 16 | i2 & 4294901760;
                                    var i3 = i2 << 16 | i0 & 65535;
                                    C[0] ^= i0;
                                    C[1] ^= i1;
                                    C[2] ^= i2;
                                    C[3] ^= i3;
                                    C[4] ^= i0;
                                    C[5] ^= i1;
                                    C[6] ^= i2;
                                    C[7] ^= i3;
                                    for (var i = 0; i < 4; i++) {
                                        nextState.call(this)
                                    }
                                }
                            },
                            _doProcessBlock: function(M, offset) {
                                var X = this._X;
                                nextState.call(this);
                                S[0] = X[0] ^ X[5] >>> 16 ^ X[3] << 16;
                                S[1] = X[2] ^ X[7] >>> 16 ^ X[5] << 16;
                                S[2] = X[4] ^ X[1] >>> 16 ^ X[7] << 16;
                                S[3] = X[6] ^ X[3] >>> 16 ^ X[1] << 16;
                                for (var i = 0; i < 4; i++) {
                                    S[i] = (S[i] << 8 | S[i] >>> 24) & 16711935 | (S[i] << 24 | S[i] >>> 8) & 4278255360;
                                    M[offset + i] ^= S[i]
                                }
                            },
                            blockSize: 128 / 32,
                            ivSize: 64 / 32
                        });

                        function nextState() {
                            var X = this._X;
                            var C = this._C;
                            for (var i = 0; i < 8; i++) {
                                C_[i] = C[i]
                            }
                            C[0] = C[0] + 1295307597 + this._b | 0;
                            C[1] = C[1] + 3545052371 + (C[0] >>> 0 < C_[0] >>> 0 ? 1 : 0) | 0;
                            C[2] = C[2] + 886263092 + (C[1] >>> 0 < C_[1] >>> 0 ? 1 : 0) | 0;
                            C[3] = C[3] + 1295307597 + (C[2] >>> 0 < C_[2] >>> 0 ? 1 : 0) | 0;
                            C[4] = C[4] + 3545052371 + (C[3] >>> 0 < C_[3] >>> 0 ? 1 : 0) | 0;
                            C[5] = C[5] + 886263092 + (C[4] >>> 0 < C_[4] >>> 0 ? 1 : 0) | 0;
                            C[6] = C[6] + 1295307597 + (C[5] >>> 0 < C_[5] >>> 0 ? 1 : 0) | 0;
                            C[7] = C[7] + 3545052371 + (C[6] >>> 0 < C_[6] >>> 0 ? 1 : 0) | 0;
                            this._b = C[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
                            for (var i = 0; i < 8; i++) {
                                var gx = X[i] + C[i];
                                var ga = gx & 65535;
                                var gb = gx >>> 16;
                                var gh = ((ga * ga >>> 17) + ga * gb >>> 15) + gb * gb;
                                var gl = ((gx & 4294901760) * gx | 0) + ((gx & 65535) * gx | 0);
                                G[i] = gh ^ gl
                            }
                            X[0] = G[0] + (G[7] << 16 | G[7] >>> 16) + (G[6] << 16 | G[6] >>> 16) | 0;
                            X[1] = G[1] + (G[0] << 8 | G[0] >>> 24) + G[7] | 0;
                            X[2] = G[2] + (G[1] << 16 | G[1] >>> 16) + (G[0] << 16 | G[0] >>> 16) | 0;
                            X[3] = G[3] + (G[2] << 8 | G[2] >>> 24) + G[1] | 0;
                            X[4] = G[4] + (G[3] << 16 | G[3] >>> 16) + (G[2] << 16 | G[2] >>> 16) | 0;
                            X[5] = G[5] + (G[4] << 8 | G[4] >>> 24) + G[3] | 0;
                            X[6] = G[6] + (G[5] << 16 | G[5] >>> 16) + (G[4] << 16 | G[4] >>> 16) | 0;
                            X[7] = G[7] + (G[6] << 8 | G[6] >>> 24) + G[5] | 0
                        }
                        C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy)
                    })();
                    return CryptoJS.RabbitLegacy
                })
            }, {
                "./cipher-core": 20,
                "./core": 21,
                "./enc-base64": 22,
                "./evpkdf": 24,
                "./md5": 29
            }
        ],
        42: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./enc-base64"), require("./md5"), require("./evpkdf"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var StreamCipher = C_lib.StreamCipher;
                        var C_algo = C.algo;
                        var S = [];
                        var C_ = [];
                        var G = [];
                        var Rabbit = C_algo.Rabbit = StreamCipher.extend({
                            _doReset: function() {
                                var K = this._key.words;
                                var iv = this.cfg.iv;
                                for (var i = 0; i < 4; i++) {
                                    K[i] = (K[i] << 8 | K[i] >>> 24) & 16711935 | (K[i] << 24 | K[i] >>> 8) & 4278255360
                                }
                                var X = this._X = [K[0], K[3] << 16 | K[2] >>> 16, K[1], K[0] << 16 | K[3] >>> 16, K[2], K[1] << 16 | K[0] >>> 16, K[3], K[2] << 16 | K[1] >>> 16];
                                var C = this._C = [K[2] << 16 | K[2] >>> 16, K[0] & 4294901760 | K[1] & 65535, K[3] << 16 | K[3] >>> 16, K[1] & 4294901760 | K[2] & 65535, K[0] << 16 | K[0] >>> 16, K[2] & 4294901760 | K[3] & 65535, K[1] << 16 | K[1] >>> 16, K[3] & 4294901760 | K[0] & 65535];
                                this._b = 0;
                                for (var i = 0; i < 4; i++) {
                                    nextState.call(this)
                                }
                                for (var i = 0; i < 8; i++) {
                                    C[i] ^= X[i + 4 & 7]
                                }
                                if (iv) {
                                    var IV = iv.words;
                                    var IV_0 = IV[0];
                                    var IV_1 = IV[1];
                                    var i0 = (IV_0 << 8 | IV_0 >>> 24) & 16711935 | (IV_0 << 24 | IV_0 >>> 8) & 4278255360;
                                    var i2 = (IV_1 << 8 | IV_1 >>> 24) & 16711935 | (IV_1 << 24 | IV_1 >>> 8) & 4278255360;
                                    var i1 = i0 >>> 16 | i2 & 4294901760;
                                    var i3 = i2 << 16 | i0 & 65535;
                                    C[0] ^= i0;
                                    C[1] ^= i1;
                                    C[2] ^= i2;
                                    C[3] ^= i3;
                                    C[4] ^= i0;
                                    C[5] ^= i1;
                                    C[6] ^= i2;
                                    C[7] ^= i3;
                                    for (var i = 0; i < 4; i++) {
                                        nextState.call(this)
                                    }
                                }
                            },
                            _doProcessBlock: function(M, offset) {
                                var X = this._X;
                                nextState.call(this);
                                S[0] = X[0] ^ X[5] >>> 16 ^ X[3] << 16;
                                S[1] = X[2] ^ X[7] >>> 16 ^ X[5] << 16;
                                S[2] = X[4] ^ X[1] >>> 16 ^ X[7] << 16;
                                S[3] = X[6] ^ X[3] >>> 16 ^ X[1] << 16;
                                for (var i = 0; i < 4; i++) {
                                    S[i] = (S[i] << 8 | S[i] >>> 24) & 16711935 | (S[i] << 24 | S[i] >>> 8) & 4278255360;
                                    M[offset + i] ^= S[i]
                                }
                            },
                            blockSize: 128 / 32,
                            ivSize: 64 / 32
                        });

                        function nextState() {
                            var X = this._X;
                            var C = this._C;
                            for (var i = 0; i < 8; i++) {
                                C_[i] = C[i]
                            }
                            C[0] = C[0] + 1295307597 + this._b | 0;
                            C[1] = C[1] + 3545052371 + (C[0] >>> 0 < C_[0] >>> 0 ? 1 : 0) | 0;
                            C[2] = C[2] + 886263092 + (C[1] >>> 0 < C_[1] >>> 0 ? 1 : 0) | 0;
                            C[3] = C[3] + 1295307597 + (C[2] >>> 0 < C_[2] >>> 0 ? 1 : 0) | 0;
                            C[4] = C[4] + 3545052371 + (C[3] >>> 0 < C_[3] >>> 0 ? 1 : 0) | 0;
                            C[5] = C[5] + 886263092 + (C[4] >>> 0 < C_[4] >>> 0 ? 1 : 0) | 0;
                            C[6] = C[6] + 1295307597 + (C[5] >>> 0 < C_[5] >>> 0 ? 1 : 0) | 0;
                            C[7] = C[7] + 3545052371 + (C[6] >>> 0 < C_[6] >>> 0 ? 1 : 0) | 0;
                            this._b = C[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
                            for (var i = 0; i < 8; i++) {
                                var gx = X[i] + C[i];
                                var ga = gx & 65535;
                                var gb = gx >>> 16;
                                var gh = ((ga * ga >>> 17) + ga * gb >>> 15) + gb * gb;
                                var gl = ((gx & 4294901760) * gx | 0) + ((gx & 65535) * gx | 0);
                                G[i] = gh ^ gl
                            }
                            X[0] = G[0] + (G[7] << 16 | G[7] >>> 16) + (G[6] << 16 | G[6] >>> 16) | 0;
                            X[1] = G[1] + (G[0] << 8 | G[0] >>> 24) + G[7] | 0;
                            X[2] = G[2] + (G[1] << 16 | G[1] >>> 16) + (G[0] << 16 | G[0] >>> 16) | 0;
                            X[3] = G[3] + (G[2] << 8 | G[2] >>> 24) + G[1] | 0;
                            X[4] = G[4] + (G[3] << 16 | G[3] >>> 16) + (G[2] << 16 | G[2] >>> 16) | 0;
                            X[5] = G[5] + (G[4] << 8 | G[4] >>> 24) + G[3] | 0;
                            X[6] = G[6] + (G[5] << 16 | G[5] >>> 16) + (G[4] << 16 | G[4] >>> 16) | 0;
                            X[7] = G[7] + (G[6] << 8 | G[6] >>> 24) + G[5] | 0
                        }
                        C.Rabbit = StreamCipher._createHelper(Rabbit)
                    })();
                    return CryptoJS.Rabbit
                })
            }, {
                "./cipher-core": 20,
                "./core": 21,
                "./enc-base64": 22,
                "./evpkdf": 24,
                "./md5": 29
            }
        ],
        43: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./enc-base64"), require("./md5"), require("./evpkdf"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var StreamCipher = C_lib.StreamCipher;
                        var C_algo = C.algo;
                        var RC4 = C_algo.RC4 = StreamCipher.extend({
                            _doReset: function() {
                                var key = this._key;
                                var keyWords = key.words;
                                var keySigBytes = key.sigBytes;
                                var S = this._S = [];
                                for (var i = 0; i < 256; i++) {
                                    S[i] = i
                                }
                                for (var i = 0, j = 0; i < 256; i++) {
                                    var keyByteIndex = i % keySigBytes;
                                    var keyByte = keyWords[keyByteIndex >>> 2] >>> 24 - keyByteIndex % 4 * 8 & 255;
                                    j = (j + S[i] + keyByte) % 256;
                                    var t = S[i];
                                    S[i] = S[j];
                                    S[j] = t
                                }
                                this._i = this._j = 0
                            },
                            _doProcessBlock: function(M, offset) {
                                M[offset] ^= generateKeystreamWord.call(this)
                            },
                            keySize: 256 / 32,
                            ivSize: 0
                        });

                        function generateKeystreamWord() {
                            var S = this._S;
                            var i = this._i;
                            var j = this._j;
                            var keystreamWord = 0;
                            for (var n = 0; n < 4; n++) {
                                i = (i + 1) % 256;
                                j = (j + S[i]) % 256;
                                var t = S[i];
                                S[i] = S[j];
                                S[j] = t;
                                keystreamWord |= S[(S[i] + S[j]) % 256] << 24 - n * 8
                            }
                            this._i = i;
                            this._j = j;
                            return keystreamWord
                        }
                        C.RC4 = StreamCipher._createHelper(RC4);
                        var RC4Drop = C_algo.RC4Drop = RC4.extend({
                            cfg: RC4.cfg.extend({
                                drop: 192
                            }),
                            _doReset: function() {
                                RC4._doReset.call(this);
                                for (var i = this.cfg.drop; i > 0; i--) {
                                    generateKeystreamWord.call(this)
                                }
                            }
                        });
                        C.RC4Drop = StreamCipher._createHelper(RC4Drop)
                    })();
                    return CryptoJS.RC4
                })
            }, {
                "./cipher-core": 20,
                "./core": 21,
                "./enc-base64": 22,
                "./evpkdf": 24,
                "./md5": 29
            }
        ],
        44: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function(Math) {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var WordArray = C_lib.WordArray;
                        var Hasher = C_lib.Hasher;
                        var C_algo = C.algo;
                        var _zl = WordArray.create([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13]);
                        var _zr = WordArray.create([5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11]);
                        var _sl = WordArray.create([11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6]);
                        var _sr = WordArray.create([8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11]);
                        var _hl = WordArray.create([0, 1518500249, 1859775393, 2400959708, 2840853838]);
                        var _hr = WordArray.create([1352829926, 1548603684, 1836072691, 2053994217, 0]);
                        var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
                            _doReset: function() {
                                this._hash = WordArray.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
                            },
                            _doProcessBlock: function(M, offset) {
                                for (var i = 0; i < 16; i++) {
                                    var offset_i = offset + i;
                                    var M_offset_i = M[offset_i];
                                    M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360
                                }
                                var H = this._hash.words;
                                var hl = _hl.words;
                                var hr = _hr.words;
                                var zl = _zl.words;
                                var zr = _zr.words;
                                var sl = _sl.words;
                                var sr = _sr.words;
                                var al, bl, cl, dl, el;
                                var ar, br, cr, dr, er;
                                ar = al = H[0];
                                br = bl = H[1];
                                cr = cl = H[2];
                                dr = dl = H[3];
                                er = el = H[4];
                                var t;
                                for (var i = 0; i < 80; i += 1) {
                                    t = al + M[offset + zl[i]] | 0;
                                    if (i < 16) {
                                        t += f1(bl, cl, dl) + hl[0]
                                    } else if (i < 32) {
                                        t += f2(bl, cl, dl) + hl[1]
                                    } else if (i < 48) {
                                        t += f3(bl, cl, dl) + hl[2]
                                    } else if (i < 64) {
                                        t += f4(bl, cl, dl) + hl[3]
                                    } else {
                                        t += f5(bl, cl, dl) + hl[4]
                                    }
                                    t = t | 0;
                                    t = rotl(t, sl[i]);
                                    t = t + el | 0;
                                    al = el;
                                    el = dl;
                                    dl = rotl(cl, 10);
                                    cl = bl;
                                    bl = t;
                                    t = ar + M[offset + zr[i]] | 0;
                                    if (i < 16) {
                                        t += f5(br, cr, dr) + hr[0]
                                    } else if (i < 32) {
                                        t += f4(br, cr, dr) + hr[1]
                                    } else if (i < 48) {
                                        t += f3(br, cr, dr) + hr[2]
                                    } else if (i < 64) {
                                        t += f2(br, cr, dr) + hr[3]
                                    } else {
                                        t += f1(br, cr, dr) + hr[4]
                                    }
                                    t = t | 0;
                                    t = rotl(t, sr[i]);
                                    t = t + er | 0;
                                    ar = er;
                                    er = dr;
                                    dr = rotl(cr, 10);
                                    cr = br;
                                    br = t
                                }
                                t = H[1] + cl + dr | 0;
                                H[1] = H[2] + dl + er | 0;
                                H[2] = H[3] + el + ar | 0;
                                H[3] = H[4] + al + br | 0;
                                H[4] = H[0] + bl + cr | 0;
                                H[0] = t
                            },
                            _doFinalize: function() {
                                var data = this._data;
                                var dataWords = data.words;
                                var nBitsTotal = this._nDataBytes * 8;
                                var nBitsLeft = data.sigBytes * 8;
                                dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
                                dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotal << 8 | nBitsTotal >>> 24) & 16711935 | (nBitsTotal << 24 | nBitsTotal >>> 8) & 4278255360;
                                data.sigBytes = (dataWords.length + 1) * 4;
                                this._process();
                                var hash = this._hash;
                                var H = hash.words;
                                for (var i = 0; i < 5; i++) {
                                    var H_i = H[i];
                                    H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360
                                }
                                return hash
                            },
                            clone: function() {
                                var clone = Hasher.clone.call(this);
                                clone._hash = this._hash.clone();
                                return clone
                            }
                        });

                        function f1(x, y, z) {
                            return x ^ y ^ z
                        }

                        function f2(x, y, z) {
                            return x & y | ~x & z
                        }

                        function f3(x, y, z) {
                            return (x | ~y) ^ z
                        }

                        function f4(x, y, z) {
                            return x & z | y & ~z
                        }

                        function f5(x, y, z) {
                            return x ^ (y | ~z)
                        }

                        function rotl(x, n) {
                            return x << n | x >>> 32 - n
                        }
                        C.RIPEMD160 = Hasher._createHelper(RIPEMD160);
                        C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160)
                    })(Math);
                    return CryptoJS.RIPEMD160
                })
            }, {
                "./core": 21
            }
        ],
        45: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var WordArray = C_lib.WordArray;
                        var Hasher = C_lib.Hasher;
                        var C_algo = C.algo;
                        var W = [];
                        var SHA1 = C_algo.SHA1 = Hasher.extend({
                            _doReset: function() {
                                this._hash = new WordArray.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
                            },
                            _doProcessBlock: function(M, offset) {
                                var H = this._hash.words;
                                var a = H[0];
                                var b = H[1];
                                var c = H[2];
                                var d = H[3];
                                var e = H[4];
                                for (var i = 0; i < 80; i++) {
                                    if (i < 16) {
                                        W[i] = M[offset + i] | 0
                                    } else {
                                        var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                                        W[i] = n << 1 | n >>> 31
                                    }
                                    var t = (a << 5 | a >>> 27) + e + W[i];
                                    if (i < 20) {
                                        t += (b & c | ~b & d) + 1518500249
                                    } else if (i < 40) {
                                        t += (b ^ c ^ d) + 1859775393
                                    } else if (i < 60) {
                                        t += (b & c | b & d | c & d) - 1894007588
                                    } else {
                                        t += (b ^ c ^ d) - 899497514
                                    }
                                    e = d;
                                    d = c;
                                    c = b << 30 | b >>> 2;
                                    b = a;
                                    a = t
                                }
                                H[0] = H[0] + a | 0;
                                H[1] = H[1] + b | 0;
                                H[2] = H[2] + c | 0;
                                H[3] = H[3] + d | 0;
                                H[4] = H[4] + e | 0
                            },
                            _doFinalize: function() {
                                var data = this._data;
                                var dataWords = data.words;
                                var nBitsTotal = this._nDataBytes * 8;
                                var nBitsLeft = data.sigBytes * 8;
                                dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
                                dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
                                dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
                                data.sigBytes = dataWords.length * 4;
                                this._process();
                                return this._hash
                            },
                            clone: function() {
                                var clone = Hasher.clone.call(this);
                                clone._hash = this._hash.clone();
                                return clone
                            }
                        });
                        C.SHA1 = Hasher._createHelper(SHA1);
                        C.HmacSHA1 = Hasher._createHmacHelper(SHA1)
                    })();
                    return CryptoJS.SHA1
                })
            }, {
                "./core": 21
            }
        ],
        46: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./sha256"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./sha256"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var WordArray = C_lib.WordArray;
                        var C_algo = C.algo;
                        var SHA256 = C_algo.SHA256;
                        var SHA224 = C_algo.SHA224 = SHA256.extend({
                            _doReset: function() {
                                this._hash = new WordArray.init([3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428])
                            },
                            _doFinalize: function() {
                                var hash = SHA256._doFinalize.call(this);
                                hash.sigBytes -= 4;
                                return hash
                            }
                        });
                        C.SHA224 = SHA256._createHelper(SHA224);
                        C.HmacSHA224 = SHA256._createHmacHelper(SHA224)
                    })();
                    return CryptoJS.SHA224
                })
            }, {
                "./core": 21,
                "./sha256": 47
            }
        ],
        47: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function(Math) {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var WordArray = C_lib.WordArray;
                        var Hasher = C_lib.Hasher;
                        var C_algo = C.algo;
                        var H = [];
                        var K = [];
                        (function() {
                            function isPrime(n) {
                                var sqrtN = Math.sqrt(n);
                                for (var factor = 2; factor <= sqrtN; factor++) {
                                    if (!(n % factor)) {
                                        return false
                                    }
                                }
                                return true
                            }

                            function getFractionalBits(n) {
                                return (n - (n | 0)) * 4294967296 | 0
                            }
                            var n = 2;
                            var nPrime = 0;
                            while (nPrime < 64) {
                                if (isPrime(n)) {
                                    if (nPrime < 8) {
                                        H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2))
                                    }
                                    K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));
                                    nPrime++
                                }
                                n++
                            }
                        })();
                        var W = [];
                        var SHA256 = C_algo.SHA256 = Hasher.extend({
                            _doReset: function() {
                                this._hash = new WordArray.init(H.slice(0))
                            },
                            _doProcessBlock: function(M, offset) {
                                var H = this._hash.words;
                                var a = H[0];
                                var b = H[1];
                                var c = H[2];
                                var d = H[3];
                                var e = H[4];
                                var f = H[5];
                                var g = H[6];
                                var h = H[7];
                                for (var i = 0; i < 64; i++) {
                                    if (i < 16) {
                                        W[i] = M[offset + i] | 0
                                    } else {
                                        var gamma0x = W[i - 15];
                                        var gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
                                        var gamma1x = W[i - 2];
                                        var gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
                                        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
                                    }
                                    var ch = e & f ^ ~e & g;
                                    var maj = a & b ^ a & c ^ b & c;
                                    var sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
                                    var sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
                                    var t1 = h + sigma1 + ch + K[i] + W[i];
                                    var t2 = sigma0 + maj;
                                    h = g;
                                    g = f;
                                    f = e;
                                    e = d + t1 | 0;
                                    d = c;
                                    c = b;
                                    b = a;
                                    a = t1 + t2 | 0
                                }
                                H[0] = H[0] + a | 0;
                                H[1] = H[1] + b | 0;
                                H[2] = H[2] + c | 0;
                                H[3] = H[3] + d | 0;
                                H[4] = H[4] + e | 0;
                                H[5] = H[5] + f | 0;
                                H[6] = H[6] + g | 0;
                                H[7] = H[7] + h | 0
                            },
                            _doFinalize: function() {
                                var data = this._data;
                                var dataWords = data.words;
                                var nBitsTotal = this._nDataBytes * 8;
                                var nBitsLeft = data.sigBytes * 8;
                                dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
                                dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
                                dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
                                data.sigBytes = dataWords.length * 4;
                                this._process();
                                return this._hash
                            },
                            clone: function() {
                                var clone = Hasher.clone.call(this);
                                clone._hash = this._hash.clone();
                                return clone
                            }
                        });
                        C.SHA256 = Hasher._createHelper(SHA256);
                        C.HmacSHA256 = Hasher._createHmacHelper(SHA256)
                    })(Math);
                    return CryptoJS.SHA256
                })
            }, {
                "./core": 21
            }
        ],
        48: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./x64-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./x64-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function(Math) {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var WordArray = C_lib.WordArray;
                        var Hasher = C_lib.Hasher;
                        var C_x64 = C.x64;
                        var X64Word = C_x64.Word;
                        var C_algo = C.algo;
                        var RHO_OFFSETS = [];
                        var PI_INDEXES = [];
                        var ROUND_CONSTANTS = [];
                        (function() {
                            var x = 1,
                                y = 0;
                            for (var t = 0; t < 24; t++) {
                                RHO_OFFSETS[x + 5 * y] = (t + 1) * (t + 2) / 2 % 64;
                                var newX = y % 5;
                                var newY = (2 * x + 3 * y) % 5;
                                x = newX;
                                y = newY
                            }
                            for (var x = 0; x < 5; x++) {
                                for (var y = 0; y < 5; y++) {
                                    PI_INDEXES[x + 5 * y] = y + (2 * x + 3 * y) % 5 * 5
                                }
                            }
                            var LFSR = 1;
                            for (var i = 0; i < 24; i++) {
                                var roundConstantMsw = 0;
                                var roundConstantLsw = 0;
                                for (var j = 0; j < 7; j++) {
                                    if (LFSR & 1) {
                                        var bitPosition = (1 << j) - 1;
                                        if (bitPosition < 32) {
                                            roundConstantLsw ^= 1 << bitPosition
                                        } else {
                                            roundConstantMsw ^= 1 << bitPosition - 32
                                        }
                                    }
                                    if (LFSR & 128) {
                                        LFSR = LFSR << 1 ^ 113
                                    } else {
                                        LFSR <<= 1
                                    }
                                }
                                ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw)
                            }
                        })();
                        var T = [];
                        (function() {
                            for (var i = 0; i < 25; i++) {
                                T[i] = X64Word.create()
                            }
                        })();
                        var SHA3 = C_algo.SHA3 = Hasher.extend({
                            cfg: Hasher.cfg.extend({
                                outputLength: 512
                            }),
                            _doReset: function() {
                                var state = this._state = [];
                                for (var i = 0; i < 25; i++) {
                                    state[i] = new X64Word.init
                                }
                                this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32
                            },
                            _doProcessBlock: function(M, offset) {
                                var state = this._state;
                                var nBlockSizeLanes = this.blockSize / 2;
                                for (var i = 0; i < nBlockSizeLanes; i++) {
                                    var M2i = M[offset + 2 * i];
                                    var M2i1 = M[offset + 2 * i + 1];
                                    M2i = (M2i << 8 | M2i >>> 24) & 16711935 | (M2i << 24 | M2i >>> 8) & 4278255360;
                                    M2i1 = (M2i1 << 8 | M2i1 >>> 24) & 16711935 | (M2i1 << 24 | M2i1 >>> 8) & 4278255360;
                                    var lane = state[i];
                                    lane.high ^= M2i1;
                                    lane.low ^= M2i
                                }
                                for (var round = 0; round < 24; round++) {
                                    for (var x = 0; x < 5; x++) {
                                        var tMsw = 0,
                                            tLsw = 0;
                                        for (var y = 0; y < 5; y++) {
                                            var lane = state[x + 5 * y];
                                            tMsw ^= lane.high;
                                            tLsw ^= lane.low
                                        }
                                        var Tx = T[x];
                                        Tx.high = tMsw;
                                        Tx.low = tLsw
                                    }
                                    for (var x = 0; x < 5; x++) {
                                        var Tx4 = T[(x + 4) % 5];
                                        var Tx1 = T[(x + 1) % 5];
                                        var Tx1Msw = Tx1.high;
                                        var Tx1Lsw = Tx1.low;
                                        var tMsw = Tx4.high ^ (Tx1Msw << 1 | Tx1Lsw >>> 31);
                                        var tLsw = Tx4.low ^ (Tx1Lsw << 1 | Tx1Msw >>> 31);
                                        for (var y = 0; y < 5; y++) {
                                            var lane = state[x + 5 * y];
                                            lane.high ^= tMsw;
                                            lane.low ^= tLsw
                                        }
                                    }
                                    for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
                                        var lane = state[laneIndex];
                                        var laneMsw = lane.high;
                                        var laneLsw = lane.low;
                                        var rhoOffset = RHO_OFFSETS[laneIndex];
                                        if (rhoOffset < 32) {
                                            var tMsw = laneMsw << rhoOffset | laneLsw >>> 32 - rhoOffset;
                                            var tLsw = laneLsw << rhoOffset | laneMsw >>> 32 - rhoOffset
                                        } else {
                                            var tMsw = laneLsw << rhoOffset - 32 | laneMsw >>> 64 - rhoOffset;
                                            var tLsw = laneMsw << rhoOffset - 32 | laneLsw >>> 64 - rhoOffset
                                        }
                                        var TPiLane = T[PI_INDEXES[laneIndex]];
                                        TPiLane.high = tMsw;
                                        TPiLane.low = tLsw
                                    }
                                    var T0 = T[0];
                                    var state0 = state[0];
                                    T0.high = state0.high;
                                    T0.low = state0.low;
                                    for (var x = 0; x < 5; x++) {
                                        for (var y = 0; y < 5; y++) {
                                            var laneIndex = x + 5 * y;
                                            var lane = state[laneIndex];
                                            var TLane = T[laneIndex];
                                            var Tx1Lane = T[(x + 1) % 5 + 5 * y];
                                            var Tx2Lane = T[(x + 2) % 5 + 5 * y];
                                            lane.high = TLane.high ^ ~Tx1Lane.high & Tx2Lane.high;
                                            lane.low = TLane.low ^ ~Tx1Lane.low & Tx2Lane.low
                                        }
                                    }
                                    var lane = state[0];
                                    var roundConstant = ROUND_CONSTANTS[round];
                                    lane.high ^= roundConstant.high;
                                    lane.low ^= roundConstant.low
                                }
                            },
                            _doFinalize: function() {
                                var data = this._data;
                                var dataWords = data.words;
                                var nBitsTotal = this._nDataBytes * 8;
                                var nBitsLeft = data.sigBytes * 8;
                                var blockSizeBits = this.blockSize * 32;
                                dataWords[nBitsLeft >>> 5] |= 1 << 24 - nBitsLeft % 32;
                                dataWords[(Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits >>> 5) - 1] |= 128;
                                data.sigBytes = dataWords.length * 4;
                                this._process();
                                var state = this._state;
                                var outputLengthBytes = this.cfg.outputLength / 8;
                                var outputLengthLanes = outputLengthBytes / 8;
                                var hashWords = [];
                                for (var i = 0; i < outputLengthLanes; i++) {
                                    var lane = state[i];
                                    var laneMsw = lane.high;
                                    var laneLsw = lane.low;
                                    laneMsw = (laneMsw << 8 | laneMsw >>> 24) & 16711935 | (laneMsw << 24 | laneMsw >>> 8) & 4278255360;
                                    laneLsw = (laneLsw << 8 | laneLsw >>> 24) & 16711935 | (laneLsw << 24 | laneLsw >>> 8) & 4278255360;
                                    hashWords.push(laneLsw);
                                    hashWords.push(laneMsw)
                                }
                                return new WordArray.init(hashWords, outputLengthBytes)
                            },
                            clone: function() {
                                var clone = Hasher.clone.call(this);
                                var state = clone._state = this._state.slice(0);
                                for (var i = 0; i < 25; i++) {
                                    state[i] = state[i].clone()
                                }
                                return clone
                            }
                        });
                        C.SHA3 = Hasher._createHelper(SHA3);
                        C.HmacSHA3 = Hasher._createHmacHelper(SHA3)
                    })(Math);
                    return CryptoJS.SHA3
                })
            }, {
                "./core": 21,
                "./x64-core": 52
            }
        ],
        49: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./x64-core"), require("./sha512"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./x64-core", "./sha512"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_x64 = C.x64;
                        var X64Word = C_x64.Word;
                        var X64WordArray = C_x64.WordArray;
                        var C_algo = C.algo;
                        var SHA512 = C_algo.SHA512;
                        var SHA384 = C_algo.SHA384 = SHA512.extend({
                            _doReset: function() {
                                this._hash = new X64WordArray.init([new X64Word.init(3418070365, 3238371032), new X64Word.init(1654270250, 914150663), new X64Word.init(2438529370, 812702999), new X64Word.init(355462360, 4144912697), new X64Word.init(1731405415, 4290775857), new X64Word.init(2394180231, 1750603025), new X64Word.init(3675008525, 1694076839), new X64Word.init(1203062813, 3204075428)])
                            },
                            _doFinalize: function() {
                                var hash = SHA512._doFinalize.call(this);
                                hash.sigBytes -= 16;
                                return hash
                            }
                        });
                        C.SHA384 = SHA512._createHelper(SHA384);
                        C.HmacSHA384 = SHA512._createHmacHelper(SHA384)
                    })();
                    return CryptoJS.SHA384
                })
            }, {
                "./core": 21,
                "./sha512": 50,
                "./x64-core": 52
            }
        ],
        50: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./x64-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./x64-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var Hasher = C_lib.Hasher;
                        var C_x64 = C.x64;
                        var X64Word = C_x64.Word;
                        var X64WordArray = C_x64.WordArray;
                        var C_algo = C.algo;

                        function X64Word_create() {
                            return X64Word.create.apply(X64Word, arguments)
                        }
                        var K = [X64Word_create(1116352408, 3609767458), X64Word_create(1899447441, 602891725), X64Word_create(3049323471, 3964484399), X64Word_create(3921009573, 2173295548), X64Word_create(961987163, 4081628472), X64Word_create(1508970993, 3053834265), X64Word_create(2453635748, 2937671579), X64Word_create(2870763221, 3664609560), X64Word_create(3624381080, 2734883394), X64Word_create(310598401, 1164996542), X64Word_create(607225278, 1323610764), X64Word_create(1426881987, 3590304994), X64Word_create(1925078388, 4068182383), X64Word_create(2162078206, 991336113), X64Word_create(2614888103, 633803317), X64Word_create(3248222580, 3479774868), X64Word_create(3835390401, 2666613458), X64Word_create(4022224774, 944711139), X64Word_create(264347078, 2341262773), X64Word_create(604807628, 2007800933), X64Word_create(770255983, 1495990901), X64Word_create(1249150122, 1856431235), X64Word_create(1555081692, 3175218132), X64Word_create(1996064986, 2198950837), X64Word_create(2554220882, 3999719339), X64Word_create(2821834349, 766784016), X64Word_create(2952996808, 2566594879), X64Word_create(3210313671, 3203337956), X64Word_create(3336571891, 1034457026), X64Word_create(3584528711, 2466948901), X64Word_create(113926993, 3758326383), X64Word_create(338241895, 168717936), X64Word_create(666307205, 1188179964), X64Word_create(773529912, 1546045734), X64Word_create(1294757372, 1522805485), X64Word_create(1396182291, 2643833823), X64Word_create(1695183700, 2343527390), X64Word_create(1986661051, 1014477480), X64Word_create(2177026350, 1206759142), X64Word_create(2456956037, 344077627), X64Word_create(2730485921, 1290863460), X64Word_create(2820302411, 3158454273), X64Word_create(3259730800, 3505952657), X64Word_create(3345764771, 106217008), X64Word_create(3516065817, 3606008344), X64Word_create(3600352804, 1432725776), X64Word_create(4094571909, 1467031594), X64Word_create(275423344, 851169720), X64Word_create(430227734, 3100823752), X64Word_create(506948616, 1363258195), X64Word_create(659060556, 3750685593), X64Word_create(883997877, 3785050280), X64Word_create(958139571, 3318307427), X64Word_create(1322822218, 3812723403), X64Word_create(1537002063, 2003034995), X64Word_create(1747873779, 3602036899), X64Word_create(1955562222, 1575990012), X64Word_create(2024104815, 1125592928), X64Word_create(2227730452, 2716904306), X64Word_create(2361852424, 442776044), X64Word_create(2428436474, 593698344), X64Word_create(2756734187, 3733110249), X64Word_create(3204031479, 2999351573), X64Word_create(3329325298, 3815920427), X64Word_create(3391569614, 3928383900), X64Word_create(3515267271, 566280711), X64Word_create(3940187606, 3454069534), X64Word_create(4118630271, 4000239992), X64Word_create(116418474, 1914138554), X64Word_create(174292421, 2731055270), X64Word_create(289380356, 3203993006), X64Word_create(460393269, 320620315), X64Word_create(685471733, 587496836), X64Word_create(852142971, 1086792851), X64Word_create(1017036298, 365543100), X64Word_create(1126000580, 2618297676), X64Word_create(1288033470, 3409855158), X64Word_create(1501505948, 4234509866), X64Word_create(1607167915, 987167468), X64Word_create(1816402316, 1246189591)];
                        var W = [];
                        (function() {
                            for (var i = 0; i < 80; i++) {
                                W[i] = X64Word_create()
                            }
                        })();
                        var SHA512 = C_algo.SHA512 = Hasher.extend({
                            _doReset: function() {
                                this._hash = new X64WordArray.init([new X64Word.init(1779033703, 4089235720), new X64Word.init(3144134277, 2227873595), new X64Word.init(1013904242, 4271175723), new X64Word.init(2773480762, 1595750129), new X64Word.init(1359893119, 2917565137), new X64Word.init(2600822924, 725511199), new X64Word.init(528734635, 4215389547), new X64Word.init(1541459225, 327033209)])
                            },
                            _doProcessBlock: function(M, offset) {
                                var H = this._hash.words;
                                var H0 = H[0];
                                var H1 = H[1];
                                var H2 = H[2];
                                var H3 = H[3];
                                var H4 = H[4];
                                var H5 = H[5];
                                var H6 = H[6];
                                var H7 = H[7];
                                var H0h = H0.high;
                                var H0l = H0.low;
                                var H1h = H1.high;
                                var H1l = H1.low;
                                var H2h = H2.high;
                                var H2l = H2.low;
                                var H3h = H3.high;
                                var H3l = H3.low;
                                var H4h = H4.high;
                                var H4l = H4.low;
                                var H5h = H5.high;
                                var H5l = H5.low;
                                var H6h = H6.high;
                                var H6l = H6.low;
                                var H7h = H7.high;
                                var H7l = H7.low;
                                var ah = H0h;
                                var al = H0l;
                                var bh = H1h;
                                var bl = H1l;
                                var ch = H2h;
                                var cl = H2l;
                                var dh = H3h;
                                var dl = H3l;
                                var eh = H4h;
                                var el = H4l;
                                var fh = H5h;
                                var fl = H5l;
                                var gh = H6h;
                                var gl = H6l;
                                var hh = H7h;
                                var hl = H7l;
                                for (var i = 0; i < 80; i++) {
                                    var Wi = W[i];
                                    if (i < 16) {
                                        var Wih = Wi.high = M[offset + i * 2] | 0;
                                        var Wil = Wi.low = M[offset + i * 2 + 1] | 0
                                    } else {
                                        var gamma0x = W[i - 15];
                                        var gamma0xh = gamma0x.high;
                                        var gamma0xl = gamma0x.low;
                                        var gamma0h = (gamma0xh >>> 1 | gamma0xl << 31) ^ (gamma0xh >>> 8 | gamma0xl << 24) ^ gamma0xh >>> 7;
                                        var gamma0l = (gamma0xl >>> 1 | gamma0xh << 31) ^ (gamma0xl >>> 8 | gamma0xh << 24) ^ (gamma0xl >>> 7 | gamma0xh << 25);
                                        var gamma1x = W[i - 2];
                                        var gamma1xh = gamma1x.high;
                                        var gamma1xl = gamma1x.low;
                                        var gamma1h = (gamma1xh >>> 19 | gamma1xl << 13) ^ (gamma1xh << 3 | gamma1xl >>> 29) ^ gamma1xh >>> 6;
                                        var gamma1l = (gamma1xl >>> 19 | gamma1xh << 13) ^ (gamma1xl << 3 | gamma1xh >>> 29) ^ (gamma1xl >>> 6 | gamma1xh << 26);
                                        var Wi7 = W[i - 7];
                                        var Wi7h = Wi7.high;
                                        var Wi7l = Wi7.low;
                                        var Wi16 = W[i - 16];
                                        var Wi16h = Wi16.high;
                                        var Wi16l = Wi16.low;
                                        var Wil = gamma0l + Wi7l;
                                        var Wih = gamma0h + Wi7h + (Wil >>> 0 < gamma0l >>> 0 ? 1 : 0);
                                        var Wil = Wil + gamma1l;
                                        var Wih = Wih + gamma1h + (Wil >>> 0 < gamma1l >>> 0 ? 1 : 0);
                                        var Wil = Wil + Wi16l;
                                        var Wih = Wih + Wi16h + (Wil >>> 0 < Wi16l >>> 0 ? 1 : 0);
                                        Wi.high = Wih;
                                        Wi.low = Wil
                                    }
                                    var chh = eh & fh ^ ~eh & gh;
                                    var chl = el & fl ^ ~el & gl;
                                    var majh = ah & bh ^ ah & ch ^ bh & ch;
                                    var majl = al & bl ^ al & cl ^ bl & cl;
                                    var sigma0h = (ah >>> 28 | al << 4) ^ (ah << 30 | al >>> 2) ^ (ah << 25 | al >>> 7);
                                    var sigma0l = (al >>> 28 | ah << 4) ^ (al << 30 | ah >>> 2) ^ (al << 25 | ah >>> 7);
                                    var sigma1h = (eh >>> 14 | el << 18) ^ (eh >>> 18 | el << 14) ^ (eh << 23 | el >>> 9);
                                    var sigma1l = (el >>> 14 | eh << 18) ^ (el >>> 18 | eh << 14) ^ (el << 23 | eh >>> 9);
                                    var Ki = K[i];
                                    var Kih = Ki.high;
                                    var Kil = Ki.low;
                                    var t1l = hl + sigma1l;
                                    var t1h = hh + sigma1h + (t1l >>> 0 < hl >>> 0 ? 1 : 0);
                                    var t1l = t1l + chl;
                                    var t1h = t1h + chh + (t1l >>> 0 < chl >>> 0 ? 1 : 0);
                                    var t1l = t1l + Kil;
                                    var t1h = t1h + Kih + (t1l >>> 0 < Kil >>> 0 ? 1 : 0);
                                    var t1l = t1l + Wil;
                                    var t1h = t1h + Wih + (t1l >>> 0 < Wil >>> 0 ? 1 : 0);
                                    var t2l = sigma0l + majl;
                                    var t2h = sigma0h + majh + (t2l >>> 0 < sigma0l >>> 0 ? 1 : 0);
                                    hh = gh;
                                    hl = gl;
                                    gh = fh;
                                    gl = fl;
                                    fh = eh;
                                    fl = el;
                                    el = dl + t1l | 0;
                                    eh = dh + t1h + (el >>> 0 < dl >>> 0 ? 1 : 0) | 0;
                                    dh = ch;
                                    dl = cl;
                                    ch = bh;
                                    cl = bl;
                                    bh = ah;
                                    bl = al;
                                    al = t1l + t2l | 0;
                                    ah = t1h + t2h + (al >>> 0 < t1l >>> 0 ? 1 : 0) | 0
                                }
                                H0l = H0.low = H0l + al;
                                H0.high = H0h + ah + (H0l >>> 0 < al >>> 0 ? 1 : 0);
                                H1l = H1.low = H1l + bl;
                                H1.high = H1h + bh + (H1l >>> 0 < bl >>> 0 ? 1 : 0);
                                H2l = H2.low = H2l + cl;
                                H2.high = H2h + ch + (H2l >>> 0 < cl >>> 0 ? 1 : 0);
                                H3l = H3.low = H3l + dl;
                                H3.high = H3h + dh + (H3l >>> 0 < dl >>> 0 ? 1 : 0);
                                H4l = H4.low = H4l + el;
                                H4.high = H4h + eh + (H4l >>> 0 < el >>> 0 ? 1 : 0);
                                H5l = H5.low = H5l + fl;
                                H5.high = H5h + fh + (H5l >>> 0 < fl >>> 0 ? 1 : 0);
                                H6l = H6.low = H6l + gl;
                                H6.high = H6h + gh + (H6l >>> 0 < gl >>> 0 ? 1 : 0);
                                H7l = H7.low = H7l + hl;
                                H7.high = H7h + hh + (H7l >>> 0 < hl >>> 0 ? 1 : 0)
                            },
                            _doFinalize: function() {
                                var data = this._data;
                                var dataWords = data.words;
                                var nBitsTotal = this._nDataBytes * 8;
                                var nBitsLeft = data.sigBytes * 8;
                                dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
                                dataWords[(nBitsLeft + 128 >>> 10 << 5) + 30] = Math.floor(nBitsTotal / 4294967296);
                                dataWords[(nBitsLeft + 128 >>> 10 << 5) + 31] = nBitsTotal;
                                data.sigBytes = dataWords.length * 4;
                                this._process();
                                var hash = this._hash.toX32();
                                return hash
                            },
                            clone: function() {
                                var clone = Hasher.clone.call(this);
                                clone._hash = this._hash.clone();
                                return clone
                            },
                            blockSize: 1024 / 32
                        });
                        C.SHA512 = Hasher._createHelper(SHA512);
                        C.HmacSHA512 = Hasher._createHmacHelper(SHA512)
                    })();
                    return CryptoJS.SHA512
                })
            }, {
                "./core": 21,
                "./x64-core": 52
            }
        ],
        51: [
            function(require, module, exports) {
                (function(root, factory, undef) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"), require("./enc-base64"), require("./md5"), require("./evpkdf"), require("./cipher-core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function() {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var WordArray = C_lib.WordArray;
                        var BlockCipher = C_lib.BlockCipher;
                        var C_algo = C.algo;
                        var PC1 = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4];
                        var PC2 = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32];
                        var BIT_SHIFTS = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];
                        var SBOX_P = [{
                            0: 8421888,
                            268435456: 32768,
                            536870912: 8421378,
                            805306368: 2,
                            1073741824: 512,
                            1342177280: 8421890,
                            1610612736: 8389122,
                            1879048192: 8388608,
                            2147483648: 514,
                            2415919104: 8389120,
                            2684354560: 33280,
                            2952790016: 8421376,
                            3221225472: 32770,
                            3489660928: 8388610,
                            3758096384: 0,
                            4026531840: 33282,
                            134217728: 0,
                            402653184: 8421890,
                            671088640: 33282,
                            939524096: 32768,
                            1207959552: 8421888,
                            1476395008: 512,
                            1744830464: 8421378,
                            2013265920: 2,
                            2281701376: 8389120,
                            2550136832: 33280,
                            2818572288: 8421376,
                            3087007744: 8389122,
                            3355443200: 8388610,
                            3623878656: 32770,
                            3892314112: 514,
                            4160749568: 8388608,
                            1: 32768,
                            268435457: 2,
                            536870913: 8421888,
                            805306369: 8388608,
                            1073741825: 8421378,
                            1342177281: 33280,
                            1610612737: 512,
                            1879048193: 8389122,
                            2147483649: 8421890,
                            2415919105: 8421376,
                            2684354561: 8388610,
                            2952790017: 33282,
                            3221225473: 514,
                            3489660929: 8389120,
                            3758096385: 32770,
                            4026531841: 0,
                            134217729: 8421890,
                            402653185: 8421376,
                            671088641: 8388608,
                            939524097: 512,
                            1207959553: 32768,
                            1476395009: 8388610,
                            1744830465: 2,
                            2013265921: 33282,
                            2281701377: 32770,
                            2550136833: 8389122,
                            2818572289: 514,
                            3087007745: 8421888,
                            3355443201: 8389120,
                            3623878657: 0,
                            3892314113: 33280,
                            4160749569: 8421378
                        }, {
                            0: 1074282512,
                            16777216: 16384,
                            33554432: 524288,
                            50331648: 1074266128,
                            67108864: 1073741840,
                            83886080: 1074282496,
                            100663296: 1073758208,
                            117440512: 16,
                            134217728: 540672,
                            150994944: 1073758224,
                            167772160: 1073741824,
                            184549376: 540688,
                            201326592: 524304,
                            218103808: 0,
                            234881024: 16400,
                            251658240: 1074266112,
                            8388608: 1073758208,
                            25165824: 540688,
                            41943040: 16,
                            58720256: 1073758224,
                            75497472: 1074282512,
                            92274688: 1073741824,
                            109051904: 524288,
                            125829120: 1074266128,
                            142606336: 524304,
                            159383552: 0,
                            176160768: 16384,
                            192937984: 1074266112,
                            209715200: 1073741840,
                            226492416: 540672,
                            243269632: 1074282496,
                            260046848: 16400,
                            268435456: 0,
                            285212672: 1074266128,
                            301989888: 1073758224,
                            318767104: 1074282496,
                            335544320: 1074266112,
                            352321536: 16,
                            369098752: 540688,
                            385875968: 16384,
                            402653184: 16400,
                            419430400: 524288,
                            436207616: 524304,
                            452984832: 1073741840,
                            469762048: 540672,
                            486539264: 1073758208,
                            503316480: 1073741824,
                            520093696: 1074282512,
                            276824064: 540688,
                            293601280: 524288,
                            310378496: 1074266112,
                            327155712: 16384,
                            343932928: 1073758208,
                            360710144: 1074282512,
                            377487360: 16,
                            394264576: 1073741824,
                            411041792: 1074282496,
                            427819008: 1073741840,
                            444596224: 1073758224,
                            461373440: 524304,
                            478150656: 0,
                            494927872: 16400,
                            511705088: 1074266128,
                            528482304: 540672
                        }, {
                            0: 260,
                            1048576: 0,
                            2097152: 67109120,
                            3145728: 65796,
                            4194304: 65540,
                            5242880: 67108868,
                            6291456: 67174660,
                            7340032: 67174400,
                            8388608: 67108864,
                            9437184: 67174656,
                            10485760: 65792,
                            11534336: 67174404,
                            12582912: 67109124,
                            13631488: 65536,
                            14680064: 4,
                            15728640: 256,
                            524288: 67174656,
                            1572864: 67174404,
                            2621440: 0,
                            3670016: 67109120,
                            4718592: 67108868,
                            5767168: 65536,
                            6815744: 65540,
                            7864320: 260,
                            8912896: 4,
                            9961472: 256,
                            11010048: 67174400,
                            12058624: 65796,
                            13107200: 65792,
                            14155776: 67109124,
                            15204352: 67174660,
                            16252928: 67108864,
                            16777216: 67174656,
                            17825792: 65540,
                            18874368: 65536,
                            19922944: 67109120,
                            20971520: 256,
                            22020096: 67174660,
                            23068672: 67108868,
                            24117248: 0,
                            25165824: 67109124,
                            26214400: 67108864,
                            27262976: 4,
                            28311552: 65792,
                            29360128: 67174400,
                            30408704: 260,
                            31457280: 65796,
                            32505856: 67174404,
                            17301504: 67108864,
                            18350080: 260,
                            19398656: 67174656,
                            20447232: 0,
                            21495808: 65540,
                            22544384: 67109120,
                            23592960: 256,
                            24641536: 67174404,
                            25690112: 65536,
                            26738688: 67174660,
                            27787264: 65796,
                            28835840: 67108868,
                            29884416: 67109124,
                            30932992: 67174400,
                            31981568: 4,
                            33030144: 65792
                        }, {
                            0: 2151682048,
                            65536: 2147487808,
                            131072: 4198464,
                            196608: 2151677952,
                            262144: 0,
                            327680: 4198400,
                            393216: 2147483712,
                            458752: 4194368,
                            524288: 2147483648,
                            589824: 4194304,
                            655360: 64,
                            720896: 2147487744,
                            786432: 2151678016,
                            851968: 4160,
                            917504: 4096,
                            983040: 2151682112,
                            32768: 2147487808,
                            98304: 64,
                            163840: 2151678016,
                            229376: 2147487744,
                            294912: 4198400,
                            360448: 2151682112,
                            425984: 0,
                            491520: 2151677952,
                            557056: 4096,
                            622592: 2151682048,
                            688128: 4194304,
                            753664: 4160,
                            819200: 2147483648,
                            884736: 4194368,
                            950272: 4198464,
                            1015808: 2147483712,
                            1048576: 4194368,
                            1114112: 4198400,
                            1179648: 2147483712,
                            1245184: 0,
                            1310720: 4160,
                            1376256: 2151678016,
                            1441792: 2151682048,
                            1507328: 2147487808,
                            1572864: 2151682112,
                            1638400: 2147483648,
                            1703936: 2151677952,
                            1769472: 4198464,
                            1835008: 2147487744,
                            1900544: 4194304,
                            1966080: 64,
                            2031616: 4096,
                            1081344: 2151677952,
                            1146880: 2151682112,
                            1212416: 0,
                            1277952: 4198400,
                            1343488: 4194368,
                            1409024: 2147483648,
                            1474560: 2147487808,
                            1540096: 64,
                            1605632: 2147483712,
                            1671168: 4096,
                            1736704: 2147487744,
                            1802240: 2151678016,
                            1867776: 4160,
                            1933312: 2151682048,
                            1998848: 4194304,
                            2064384: 4198464
                        }, {
                            0: 128,
                            4096: 17039360,
                            8192: 262144,
                            12288: 536870912,
                            16384: 537133184,
                            20480: 16777344,
                            24576: 553648256,
                            28672: 262272,
                            32768: 16777216,
                            36864: 537133056,
                            40960: 536871040,
                            45056: 553910400,
                            49152: 553910272,
                            53248: 0,
                            57344: 17039488,
                            61440: 553648128,
                            2048: 17039488,
                            6144: 553648256,
                            10240: 128,
                            14336: 17039360,
                            18432: 262144,
                            22528: 537133184,
                            26624: 553910272,
                            30720: 536870912,
                            34816: 537133056,
                            38912: 0,
                            43008: 553910400,
                            47104: 16777344,
                            51200: 536871040,
                            55296: 553648128,
                            59392: 16777216,
                            63488: 262272,
                            65536: 262144,
                            69632: 128,
                            73728: 536870912,
                            77824: 553648256,
                            81920: 16777344,
                            86016: 553910272,
                            90112: 537133184,
                            94208: 16777216,
                            98304: 553910400,
                            102400: 553648128,
                            106496: 17039360,
                            110592: 537133056,
                            114688: 262272,
                            118784: 536871040,
                            122880: 0,
                            126976: 17039488,
                            67584: 553648256,
                            71680: 16777216,
                            75776: 17039360,
                            79872: 537133184,
                            83968: 536870912,
                            88064: 17039488,
                            92160: 128,
                            96256: 553910272,
                            100352: 262272,
                            104448: 553910400,
                            108544: 0,
                            112640: 553648128,
                            116736: 16777344,
                            120832: 262144,
                            124928: 537133056,
                            129024: 536871040
                        }, {
                            0: 268435464,
                            256: 8192,
                            512: 270532608,
                            768: 270540808,
                            1024: 268443648,
                            1280: 2097152,
                            1536: 2097160,
                            1792: 268435456,
                            2048: 0,
                            2304: 268443656,
                            2560: 2105344,
                            2816: 8,
                            3072: 270532616,
                            3328: 2105352,
                            3584: 8200,
                            3840: 270540800,
                            128: 270532608,
                            384: 270540808,
                            640: 8,
                            896: 2097152,
                            1152: 2105352,
                            1408: 268435464,
                            1664: 268443648,
                            1920: 8200,
                            2176: 2097160,
                            2432: 8192,
                            2688: 268443656,
                            2944: 270532616,
                            3200: 0,
                            3456: 270540800,
                            3712: 2105344,
                            3968: 268435456,
                            4096: 268443648,
                            4352: 270532616,
                            4608: 270540808,
                            4864: 8200,
                            5120: 2097152,
                            5376: 268435456,
                            5632: 268435464,
                            5888: 2105344,
                            6144: 2105352,
                            6400: 0,
                            6656: 8,
                            6912: 270532608,
                            7168: 8192,
                            7424: 268443656,
                            7680: 270540800,
                            7936: 2097160,
                            4224: 8,
                            4480: 2105344,
                            4736: 2097152,
                            4992: 268435464,
                            5248: 268443648,
                            5504: 8200,
                            5760: 270540808,
                            6016: 270532608,
                            6272: 270540800,
                            6528: 270532616,
                            6784: 8192,
                            7040: 2105352,
                            7296: 2097160,
                            7552: 0,
                            7808: 268435456,
                            8064: 268443656
                        }, {
                            0: 1048576,
                            16: 33555457,
                            32: 1024,
                            48: 1049601,
                            64: 34604033,
                            80: 0,
                            96: 1,
                            112: 34603009,
                            128: 33555456,
                            144: 1048577,
                            160: 33554433,
                            176: 34604032,
                            192: 34603008,
                            208: 1025,
                            224: 1049600,
                            240: 33554432,
                            8: 34603009,
                            24: 0,
                            40: 33555457,
                            56: 34604032,
                            72: 1048576,
                            88: 33554433,
                            104: 33554432,
                            120: 1025,
                            136: 1049601,
                            152: 33555456,
                            168: 34603008,
                            184: 1048577,
                            200: 1024,
                            216: 34604033,
                            232: 1,
                            248: 1049600,
                            256: 33554432,
                            272: 1048576,
                            288: 33555457,
                            304: 34603009,
                            320: 1048577,
                            336: 33555456,
                            352: 34604032,
                            368: 1049601,
                            384: 1025,
                            400: 34604033,
                            416: 1049600,
                            432: 1,
                            448: 0,
                            464: 34603008,
                            480: 33554433,
                            496: 1024,
                            264: 1049600,
                            280: 33555457,
                            296: 34603009,
                            312: 1,
                            328: 33554432,
                            344: 1048576,
                            360: 1025,
                            376: 34604032,
                            392: 33554433,
                            408: 34603008,
                            424: 0,
                            440: 34604033,
                            456: 1049601,
                            472: 1024,
                            488: 33555456,
                            504: 1048577
                        }, {
                            0: 134219808,
                            1: 131072,
                            2: 134217728,
                            3: 32,
                            4: 131104,
                            5: 134350880,
                            6: 134350848,
                            7: 2048,
                            8: 134348800,
                            9: 134219776,
                            10: 133120,
                            11: 134348832,
                            12: 2080,
                            13: 0,
                            14: 134217760,
                            15: 133152,
                            2147483648: 2048,
                            2147483649: 134350880,
                            2147483650: 134219808,
                            2147483651: 134217728,
                            2147483652: 134348800,
                            2147483653: 133120,
                            2147483654: 133152,
                            2147483655: 32,
                            2147483656: 134217760,
                            2147483657: 2080,
                            2147483658: 131104,
                            2147483659: 134350848,
                            2147483660: 0,
                            2147483661: 134348832,
                            2147483662: 134219776,
                            2147483663: 131072,
                            16: 133152,
                            17: 134350848,
                            18: 32,
                            19: 2048,
                            20: 134219776,
                            21: 134217760,
                            22: 134348832,
                            23: 131072,
                            24: 0,
                            25: 131104,
                            26: 134348800,
                            27: 134219808,
                            28: 134350880,
                            29: 133120,
                            30: 2080,
                            31: 134217728,
                            2147483664: 131072,
                            2147483665: 2048,
                            2147483666: 134348832,
                            2147483667: 133152,
                            2147483668: 32,
                            2147483669: 134348800,
                            2147483670: 134217728,
                            2147483671: 134219808,
                            2147483672: 134350880,
                            2147483673: 134217760,
                            2147483674: 134219776,
                            2147483675: 0,
                            2147483676: 133120,
                            2147483677: 2080,
                            2147483678: 131104,
                            2147483679: 134350848
                        }];
                        var SBOX_MASK = [4160749569, 528482304, 33030144, 2064384, 129024, 8064, 504, 2147483679];
                        var DES = C_algo.DES = BlockCipher.extend({
                            _doReset: function() {
                                var key = this._key;
                                var keyWords = key.words;
                                var keyBits = [];
                                for (var i = 0; i < 56; i++) {
                                    var keyBitPos = PC1[i] - 1;
                                    keyBits[i] = keyWords[keyBitPos >>> 5] >>> 31 - keyBitPos % 32 & 1
                                }
                                var subKeys = this._subKeys = [];
                                for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
                                    var subKey = subKeys[nSubKey] = [];
                                    var bitShift = BIT_SHIFTS[nSubKey];
                                    for (var i = 0; i < 24; i++) {
                                        subKey[i / 6 | 0] |= keyBits[(PC2[i] - 1 + bitShift) % 28] << 31 - i % 6;
                                        subKey[4 + (i / 6 | 0)] |= keyBits[28 + (PC2[i + 24] - 1 + bitShift) % 28] << 31 - i % 6
                                    }
                                    subKey[0] = subKey[0] << 1 | subKey[0] >>> 31;
                                    for (var i = 1; i < 7; i++) {
                                        subKey[i] = subKey[i] >>> (i - 1) * 4 + 3
                                    }
                                    subKey[7] = subKey[7] << 5 | subKey[7] >>> 27
                                }
                                var invSubKeys = this._invSubKeys = [];
                                for (var i = 0; i < 16; i++) {
                                    invSubKeys[i] = subKeys[15 - i]
                                }
                            },
                            encryptBlock: function(M, offset) {
                                this._doCryptBlock(M, offset, this._subKeys)
                            },
                            decryptBlock: function(M, offset) {
                                this._doCryptBlock(M, offset, this._invSubKeys)
                            },
                            _doCryptBlock: function(M, offset, subKeys) {
                                this._lBlock = M[offset];
                                this._rBlock = M[offset + 1];
                                exchangeLR.call(this, 4, 252645135);
                                exchangeLR.call(this, 16, 65535);
                                exchangeRL.call(this, 2, 858993459);
                                exchangeRL.call(this, 8, 16711935);
                                exchangeLR.call(this, 1, 1431655765);
                                for (var round = 0; round < 16; round++) {
                                    var subKey = subKeys[round];
                                    var lBlock = this._lBlock;
                                    var rBlock = this._rBlock;
                                    var f = 0;
                                    for (var i = 0; i < 8; i++) {
                                        f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0]
                                    }
                                    this._lBlock = rBlock;
                                    this._rBlock = lBlock ^ f
                                }
                                var t = this._lBlock;
                                this._lBlock = this._rBlock;
                                this._rBlock = t;
                                exchangeLR.call(this, 1, 1431655765);
                                exchangeRL.call(this, 8, 16711935);
                                exchangeRL.call(this, 2, 858993459);
                                exchangeLR.call(this, 16, 65535);
                                exchangeLR.call(this, 4, 252645135);
                                M[offset] = this._lBlock;
                                M[offset + 1] = this._rBlock
                            },
                            keySize: 64 / 32,
                            ivSize: 64 / 32,
                            blockSize: 64 / 32
                        });

                        function exchangeLR(offset, mask) {
                            var t = (this._lBlock >>> offset ^ this._rBlock) & mask;
                            this._rBlock ^= t;
                            this._lBlock ^= t << offset
                        }

                        function exchangeRL(offset, mask) {
                            var t = (this._rBlock >>> offset ^ this._lBlock) & mask;
                            this._lBlock ^= t;
                            this._rBlock ^= t << offset
                        }
                        C.DES = BlockCipher._createHelper(DES);
                        var TripleDES = C_algo.TripleDES = BlockCipher.extend({
                            _doReset: function() {
                                var key = this._key;
                                var keyWords = key.words;
                                this._des1 = DES.createEncryptor(WordArray.create(keyWords.slice(0, 2)));
                                this._des2 = DES.createEncryptor(WordArray.create(keyWords.slice(2, 4)));
                                this._des3 = DES.createEncryptor(WordArray.create(keyWords.slice(4, 6)))
                            },
                            encryptBlock: function(M, offset) {
                                this._des1.encryptBlock(M, offset);
                                this._des2.decryptBlock(M, offset);
                                this._des3.encryptBlock(M, offset)
                            },
                            decryptBlock: function(M, offset) {
                                this._des3.decryptBlock(M, offset);
                                this._des2.encryptBlock(M, offset);
                                this._des1.decryptBlock(M, offset)
                            },
                            keySize: 192 / 32,
                            ivSize: 64 / 32,
                            blockSize: 64 / 32
                        });
                        C.TripleDES = BlockCipher._createHelper(TripleDES)
                    })();
                    return CryptoJS.TripleDES
                })
            }, {
                "./cipher-core": 20,
                "./core": 21,
                "./enc-base64": 22,
                "./evpkdf": 24,
                "./md5": 29
            }
        ],
        52: [
            function(require, module, exports) {
                (function(root, factory) {
                    if (typeof exports === "object") {
                        module.exports = exports = factory(require("./core"))
                    } else if (typeof define === "function" && define.amd) {
                        define(["./core"], factory)
                    } else {
                        factory(root.CryptoJS)
                    }
                })(this, function(CryptoJS) {
                    (function(undefined) {
                        var C = CryptoJS;
                        var C_lib = C.lib;
                        var Base = C_lib.Base;
                        var X32WordArray = C_lib.WordArray;
                        var C_x64 = C.x64 = {};
                        var X64Word = C_x64.Word = Base.extend({
                            init: function(high, low) {
                                this.high = high;
                                this.low = low
                            }
                        });
                        var X64WordArray = C_x64.WordArray = Base.extend({
                            init: function(words, sigBytes) {
                                words = this.words = words || [];
                                if (sigBytes != undefined) {
                                    this.sigBytes = sigBytes
                                } else {
                                    this.sigBytes = words.length * 8
                                }
                            },
                            toX32: function() {
                                var x64Words = this.words;
                                var x64WordsLength = x64Words.length;
                                var x32Words = [];
                                for (var i = 0; i < x64WordsLength; i++) {
                                    var x64Word = x64Words[i];
                                    x32Words.push(x64Word.high);
                                    x32Words.push(x64Word.low)
                                }
                                return X32WordArray.create(x32Words, this.sigBytes)
                            },
                            clone: function() {
                                var clone = Base.clone.call(this);
                                var words = clone.words = this.words.slice(0);
                                var wordsLength = words.length;
                                for (var i = 0; i < wordsLength; i++) {
                                    words[i] = words[i].clone()
                                }
                                return clone
                            }
                        })
                    })();
                    return CryptoJS
                })
            }, {
                "./core": 21
            }
        ],
        53: [
            function(require, module, exports) {
                var assert = require("assert");
                var BigInteger = require("bigi");
                var Point = require("./point");

                function Curve(p, a, b, Gx, Gy, n, h) {
                    this.p = p;
                    this.a = a;
                    this.b = b;
                    this.G = Point.fromAffine(this, Gx, Gy);
                    this.n = n;
                    this.h = h;
                    this.infinity = new Point(this, null, null, BigInteger.ZERO);
                    this.pOverFour = p.add(BigInteger.ONE).shiftRight(2)
                }
                Curve.prototype.pointFromX = function(isOdd, x) {
                    var alpha = x.pow(3).add(this.a.multiply(x)).add(this.b).mod(this.p);
                    var beta = alpha.modPow(this.pOverFour, this.p);
                    var y = beta;
                    if (beta.isEven() ^ !isOdd) {
                        y = this.p.subtract(y)
                    }
                    return Point.fromAffine(this, x, y)
                };
                Curve.prototype.isInfinity = function(Q) {
                    if (Q === this.infinity) return true;
                    return Q.z.signum() === 0 && Q.y.signum() !== 0
                };
                Curve.prototype.isOnCurve = function(Q) {
                    if (this.isInfinity(Q)) return true;
                    var x = Q.affineX;
                    var y = Q.affineY;
                    var a = this.a;
                    var b = this.b;
                    var p = this.p;
                    if (x.signum() < 0 || x.compareTo(p) >= 0) return false;
                    if (y.signum() < 0 || y.compareTo(p) >= 0) return false;
                    var lhs = y.square().mod(p);
                    var rhs = x.pow(3).add(a.multiply(x)).add(b).mod(p);
                    return lhs.equals(rhs)
                };
                Curve.prototype.validate = function(Q) {
                    assert(!this.isInfinity(Q), "Point is at infinity");
                    assert(this.isOnCurve(Q), "Point is not on the curve");
                    var nQ = Q.multiply(this.n);
                    assert(this.isInfinity(nQ), "Point is not a scalar multiple of G");
                    return true
                };
                module.exports = Curve
            }, {
                "./point": 57,
                assert: 75,
                bigi: 3
            }
        ],
        54: [
            function(require, module, exports) {
                module.exports = {
                    secp128r1: {
                        p: "fffffffdffffffffffffffffffffffff",
                        a: "fffffffdfffffffffffffffffffffffc",
                        b: "e87579c11079f43dd824993c2cee5ed3",
                        n: "fffffffe0000000075a30d1b9038a115",
                        h: "01",
                        Gx: "161ff7528b899b2d0c28607ca52c5b86",
                        Gy: "cf5ac8395bafeb13c02da292dded7a83"
                    },
                    secp160k1: {
                        p: "fffffffffffffffffffffffffffffffeffffac73",
                        a: "00",
                        b: "07",
                        n: "0100000000000000000001b8fa16dfab9aca16b6b3",
                        h: "01",
                        Gx: "3b4c382ce37aa192a4019e763036f4f5dd4d7ebb",
                        Gy: "938cf935318fdced6bc28286531733c3f03c4fee"
                    },
                    secp160r1: {
                        p: "ffffffffffffffffffffffffffffffff7fffffff",
                        a: "ffffffffffffffffffffffffffffffff7ffffffc",
                        b: "1c97befc54bd7a8b65acf89f81d4d4adc565fa45",
                        n: "0100000000000000000001f4c8f927aed3ca752257",
                        h: "01",
                        Gx: "4a96b5688ef573284664698968c38bb913cbfc82",
                        Gy: "23a628553168947d59dcc912042351377ac5fb32"
                    },
                    secp192k1: {
                        p: "fffffffffffffffffffffffffffffffffffffffeffffee37",
                        a: "00",
                        b: "03",
                        n: "fffffffffffffffffffffffe26f2fc170f69466a74defd8d",
                        h: "01",
                        Gx: "db4ff10ec057e9ae26b07d0280b7f4341da5d1b1eae06c7d",
                        Gy: "9b2f2f6d9c5628a7844163d015be86344082aa88d95e2f9d"
                    },
                    secp192r1: {
                        p: "fffffffffffffffffffffffffffffffeffffffffffffffff",
                        a: "fffffffffffffffffffffffffffffffefffffffffffffffc",
                        b: "64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1",
                        n: "ffffffffffffffffffffffff99def836146bc9b1b4d22831",
                        h: "01",
                        Gx: "188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012",
                        Gy: "07192b95ffc8da78631011ed6b24cdd573f977a11e794811"
                    },
                    secp256k1: {
                        p: "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
                        a: "00",
                        b: "07",
                        n: "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
                        h: "01",
                        Gx: "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                        Gy: "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
                    },
                    secp256r1: {
                        p: "ffffffff00000001000000000000000000000000ffffffffffffffffffffffff",
                        a: "ffffffff00000001000000000000000000000000fffffffffffffffffffffffc",
                        b: "5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b",
                        n: "ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551",
                        h: "01",
                        Gx: "6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296",
                        Gy: "4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"
                    }
                }
            }, {}
        ],
        55: [
            function(require, module, exports) {
                var Point = require("./point");
                var Curve = require("./curve");
                var getCurveByName = require("./names");
                module.exports = {
                    Curve: Curve,
                    Point: Point,
                    getCurveByName: getCurveByName
                }
            }, {
                "./curve": 53,
                "./names": 56,
                "./point": 57
            }
        ],
        56: [
            function(require, module, exports) {
                var BigInteger = require("bigi");
                var curves = require("./curves");
                var Curve = require("./curve");

                function getCurveByName(name) {
                    var curve = curves[name];
                    if (!curve) return null;
                    var p = new BigInteger(curve.p, 16);
                    var a = new BigInteger(curve.a, 16);
                    var b = new BigInteger(curve.b, 16);
                    var n = new BigInteger(curve.n, 16);
                    var h = new BigInteger(curve.h, 16);
                    var Gx = new BigInteger(curve.Gx, 16);
                    var Gy = new BigInteger(curve.Gy, 16);
                    return new Curve(p, a, b, Gx, Gy, n, h)
                }
                module.exports = getCurveByName
            }, {
                "./curve": 53,
                "./curves": 54,
                bigi: 3
            }
        ],
        57: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var BigInteger = require("bigi");
                    var THREE = BigInteger.valueOf(3);

                    function Point(curve, x, y, z) {
                        assert.notStrictEqual(z, undefined, "Missing Z coordinate");
                        this.curve = curve;
                        this.x = x;
                        this.y = y;
                        this.z = z;
                        this._zInv = null;
                        this.compressed = true
                    }
                    Object.defineProperty(Point.prototype, "zInv", {
                        get: function() {
                            if (this._zInv === null) {
                                this._zInv = this.z.modInverse(this.curve.p)
                            }
                            return this._zInv
                        }
                    });
                    Object.defineProperty(Point.prototype, "affineX", {
                        get: function() {
                            return this.x.multiply(this.zInv).mod(this.curve.p)
                        }
                    });
                    Object.defineProperty(Point.prototype, "affineY", {
                        get: function() {
                            return this.y.multiply(this.zInv).mod(this.curve.p)
                        }
                    });
                    Point.fromAffine = function(curve, x, y) {
                        return new Point(curve, x, y, BigInteger.ONE)
                    };
                    Point.prototype.equals = function(other) {
                        if (other === this) return true;
                        if (this.curve.isInfinity(this)) return this.curve.isInfinity(other);
                        if (this.curve.isInfinity(other)) return this.curve.isInfinity(this);
                        var u = other.y.multiply(this.z).subtract(this.y.multiply(other.z)).mod(this.curve.p);
                        if (u.signum() !== 0) return false;
                        var v = other.x.multiply(this.z).subtract(this.x.multiply(other.z)).mod(this.curve.p);
                        return v.signum() === 0
                    };
                    Point.prototype.negate = function() {
                        var y = this.curve.p.subtract(this.y);
                        return new Point(this.curve, this.x, y, this.z)
                    };
                    Point.prototype.add = function(b) {
                        if (this.curve.isInfinity(this)) return b;
                        if (this.curve.isInfinity(b)) return this;
                        var x1 = this.x;
                        var y1 = this.y;
                        var x2 = b.x;
                        var y2 = b.y;
                        var u = y2.multiply(this.z).subtract(y1.multiply(b.z)).mod(this.curve.p);
                        var v = x2.multiply(this.z).subtract(x1.multiply(b.z)).mod(this.curve.p);
                        if (v.signum() === 0) {
                            if (u.signum() === 0) {
                                return this.twice()
                            }
                            return this.curve.infinity
                        }
                        var v2 = v.square();
                        var v3 = v2.multiply(v);
                        var x1v2 = x1.multiply(v2);
                        var zu2 = u.square().multiply(this.z);
                        var x3 = zu2.subtract(x1v2.shiftLeft(1)).multiply(b.z).subtract(v3).multiply(v).mod(this.curve.p);
                        var y3 = x1v2.multiply(THREE).multiply(u).subtract(y1.multiply(v3)).subtract(zu2.multiply(u)).multiply(b.z).add(u.multiply(v3)).mod(this.curve.p);
                        var z3 = v3.multiply(this.z).multiply(b.z).mod(this.curve.p);
                        return new Point(this.curve, x3, y3, z3)
                    };
                    Point.prototype.twice = function() {
                        if (this.curve.isInfinity(this)) return this;
                        if (this.y.signum() === 0) return this.curve.infinity;
                        var x1 = this.x;
                        var y1 = this.y;
                        var y1z1 = y1.multiply(this.z);
                        var y1sqz1 = y1z1.multiply(y1).mod(this.curve.p);
                        var a = this.curve.a;
                        var w = x1.square().multiply(THREE);
                        if (a.signum() !== 0) {
                            w = w.add(this.z.square().multiply(a))
                        }
                        w = w.mod(this.curve.p);
                        var x3 = w.square().subtract(x1.shiftLeft(3).multiply(y1sqz1)).shiftLeft(1).multiply(y1z1).mod(this.curve.p);
                        var y3 = w.multiply(THREE).multiply(x1).subtract(y1sqz1.shiftLeft(1)).shiftLeft(2).multiply(y1sqz1).subtract(w.pow(3)).mod(this.curve.p);
                        var z3 = y1z1.pow(3).shiftLeft(3).mod(this.curve.p);
                        return new Point(this.curve, x3, y3, z3)
                    };
                    Point.prototype.multiply = function(k) {
                        if (this.curve.isInfinity(this)) return this;
                        if (k.signum() === 0) return this.curve.infinity;
                        var e = k;
                        var h = e.multiply(THREE);
                        var neg = this.negate();
                        var R = this;
                        for (var i = h.bitLength() - 2; i > 0; --i) {
                            R = R.twice();
                            var hBit = h.testBit(i);
                            var eBit = e.testBit(i);
                            if (hBit != eBit) {
                                R = R.add(hBit ? this : neg)
                            }
                        }
                        return R
                    };
                    Point.prototype.multiplyTwo = function(j, x, k) {
                        var i;
                        if (j.bitLength() > k.bitLength()) i = j.bitLength() - 1;
                        else i = k.bitLength() - 1;
                        var R = this.curve.infinity;
                        var both = this.add(x);
                        while (i >= 0) {
                            R = R.twice();
                            var jBit = j.testBit(i);
                            var kBit = k.testBit(i);
                            if (jBit) {
                                if (kBit) {
                                    R = R.add(both)
                                } else {
                                    R = R.add(this)
                                }
                            } else {
                                if (kBit) {
                                    R = R.add(x)
                                }
                            }--i
                        }
                        return R
                    };
                    Point.prototype.getEncoded = function(compressed) {
                        if (compressed == undefined) compressed = this.compressed;
                        if (this.curve.isInfinity(this)) return new Buffer("00", "hex");
                        var x = this.affineX;
                        var y = this.affineY;
                        var buffer;
                        var byteLength = Math.floor((this.curve.p.bitLength() + 7) / 8);
                        if (compressed) {
                            buffer = new Buffer(1 + byteLength);
                            buffer.writeUInt8(y.isEven() ? 2 : 3, 0)
                        } else {
                            buffer = new Buffer(1 + byteLength + byteLength);
                            buffer.writeUInt8(4, 0);
                            y.toBuffer(byteLength).copy(buffer, 1 + byteLength)
                        }
                        x.toBuffer(byteLength).copy(buffer, 1);
                        return buffer
                    };
                    Point.decodeFrom = function(curve, buffer) {
                        var type = buffer.readUInt8(0);
                        var compressed = type !== 4;
                        var x = BigInteger.fromBuffer(buffer.slice(1, 33));
                        var byteLength = Math.floor((curve.p.bitLength() + 7) / 8);
                        var Q;
                        if (compressed) {
                            assert.equal(buffer.length, byteLength + 1, "Invalid sequence length");
                            assert(type === 2 || type === 3, "Invalid sequence tag");
                            var isOdd = type === 3;
                            Q = curve.pointFromX(isOdd, x)
                        } else {
                            assert.equal(buffer.length, 1 + byteLength + byteLength, "Invalid sequence length");
                            var y = BigInteger.fromBuffer(buffer.slice(1 + byteLength));
                            Q = Point.fromAffine(curve, x, y)
                        }
                        Q.compressed = compressed;
                        return Q
                    };
                    Point.prototype.toString = function() {
                        if (this.curve.isInfinity(this)) return "(INFINITY)";
                        return "(" + this.affineX.toString() + "," + this.affineY.toString() + ")"
                    };
                    module.exports = Point
                }).call(this, require("buffer").Buffer)
            }, {
                assert: 75,
                bigi: 3,
                buffer: 78
            }
        ],
        58: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var base58check = require("bs58check");
                    var networks = require("./networks");
                    var scripts = require("./scripts");

                    function findScriptTypeByVersion(version) {
                        for (var networkName in networks) {
                            var network = networks[networkName];
                            if (version === network.pubKeyHash) return "pubkeyhash";
                            if (version === network.scriptHash) return "scripthash"
                        }
                    }

                    function Address(hash, version) {
                        assert(Buffer.isBuffer(hash), "Expected Buffer, got " + hash);
                        assert.strictEqual(hash.length, 20, "Invalid hash length");
                        assert.strictEqual(version & 255, version, "Invalid version byte");
                        this.hash = hash;
                        this.version = version
                    }
                    Address.fromBase58Check = function(string) {
                        var payload = base58check.decode(string);
                        var version = payload.readUInt8(0);
                        var hash = payload.slice(1);
                        return new Address(hash, version)
                    };
                    Address.fromOutputScript = function(script, network) {
                        network = network || networks.bitcoin;
                        var type = scripts.classifyOutput(script);
                        if (type === "pubkeyhash") return new Address(script.chunks[2], network.pubKeyHash);
                        if (type === "scripthash") return new Address(script.chunks[1], network.scriptHash);
                        assert(false, type + " has no matching Address")
                    };
                    Address.prototype.toBase58Check = function() {
                        var payload = new Buffer(21);
                        payload.writeUInt8(this.version, 0);
                        this.hash.copy(payload, 1);
                        return base58check.encode(payload)
                    };
                    Address.prototype.toOutputScript = function() {
                        var scriptType = findScriptTypeByVersion(this.version);
                        if (scriptType === "pubkeyhash") return scripts.pubKeyHashOutput(this.hash);
                        if (scriptType === "scripthash") return scripts.scriptHashOutput(this.hash);
                        assert(false, this.toString() + " has no matching Script")
                    };
                    Address.prototype.toString = Address.prototype.toBase58Check;
                    module.exports = Address
                }).call(this, require("buffer").Buffer)
            }, {
                "./networks": 68,
                "./scripts": 71,
                assert: 75,
                bs58check: 5,
                buffer: 78
            }
        ],
        59: [
            function(require, module, exports) {
                var assert = require("assert");
                var opcodes = require("./opcodes");

                function verifuint(value, max) {
                    assert(typeof value === "number", "cannot write a non-number as a number");
                    assert(value >= 0, "specified a negative value for writing an unsigned value");
                    assert(value <= max, "value is larger than maximum value for type");
                    assert(Math.floor(value) === value, "value has a fractional component")
                }

                function pushDataSize(i) {
                    return i < opcodes.OP_PUSHDATA1 ? 1 : i < 255 ? 2 : i < 65535 ? 3 : 5
                }

                function readPushDataInt(buffer, offset) {
                    var opcode = buffer.readUInt8(offset);
                    var number, size;
                    if (opcode < opcodes.OP_PUSHDATA1) {
                        number = opcode;
                        size = 1
                    } else if (opcode === opcodes.OP_PUSHDATA1) {
                        number = buffer.readUInt8(offset + 1);
                        size = 2
                    } else if (opcode === opcodes.OP_PUSHDATA2) {
                        number = buffer.readUInt16LE(offset + 1);
                        size = 3
                    } else {
                        assert.equal(opcode, opcodes.OP_PUSHDATA4, "Unexpected opcode");
                        number = buffer.readUInt32LE(offset + 1);
                        size = 5
                    }
                    return {
                        opcode: opcode,
                        number: number,
                        size: size
                    }
                }

                function readUInt64LE(buffer, offset) {
                    var a = buffer.readUInt32LE(offset);
                    var b = buffer.readUInt32LE(offset + 4);
                    b *= 4294967296;
                    verifuint(b + a, 9007199254740991);
                    return b + a
                }

                function readVarInt(buffer, offset) {
                    var t = buffer.readUInt8(offset);
                    var number, size;
                    if (t < 253) {
                        number = t;
                        size = 1
                    } else if (t < 254) {
                        number = buffer.readUInt16LE(offset + 1);
                        size = 3
                    } else if (t < 255) {
                        number = buffer.readUInt32LE(offset + 1);
                        size = 5
                    } else {
                        number = readUInt64LE(buffer, offset + 1);
                        size = 9
                    }
                    return {
                        number: number,
                        size: size
                    }
                }

                function writePushDataInt(buffer, number, offset) {
                    var size = pushDataSize(number);
                    if (size === 1) {
                        buffer.writeUInt8(number, offset)
                    } else if (size === 2) {
                        buffer.writeUInt8(opcodes.OP_PUSHDATA1, offset);
                        buffer.writeUInt8(number, offset + 1)
                    } else if (size === 3) {
                        buffer.writeUInt8(opcodes.OP_PUSHDATA2, offset);
                        buffer.writeUInt16LE(number, offset + 1)
                    } else {
                        buffer.writeUInt8(opcodes.OP_PUSHDATA4, offset);
                        buffer.writeUInt32LE(number, offset + 1)
                    }
                    return size
                }

                function writeUInt64LE(buffer, value, offset) {
                    verifuint(value, 9007199254740991);
                    buffer.writeInt32LE(value & -1, offset);
                    buffer.writeUInt32LE(Math.floor(value / 4294967296), offset + 4)
                }

                function varIntSize(i) {
                    return i < 253 ? 1 : i < 65536 ? 3 : i < 4294967296 ? 5 : 9
                }

                function writeVarInt(buffer, number, offset) {
                    var size = varIntSize(number);
                    if (size === 1) {
                        buffer.writeUInt8(number, offset)
                    } else if (size === 3) {
                        buffer.writeUInt8(253, offset);
                        buffer.writeUInt16LE(number, offset + 1)
                    } else if (size === 5) {
                        buffer.writeUInt8(254, offset);
                        buffer.writeUInt32LE(number, offset + 1)
                    } else {
                        buffer.writeUInt8(255, offset);
                        writeUInt64LE(buffer, number, offset + 1)
                    }
                    return size
                }
                module.exports = {
                    pushDataSize: pushDataSize,
                    readPushDataInt: readPushDataInt,
                    readUInt64LE: readUInt64LE,
                    readVarInt: readVarInt,
                    varIntSize: varIntSize,
                    writePushDataInt: writePushDataInt,
                    writeUInt64LE: writeUInt64LE,
                    writeVarInt: writeVarInt
                }
            }, {
                "./opcodes": 69,
                assert: 75
            }
        ],
        60: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var Crypto = require("crypto-js");
                    var WordArray = Crypto.lib.WordArray;

                    function bufferToWordArray(buffer) {
                        assert(Buffer.isBuffer(buffer), "Expected Buffer, got", buffer);
                        var words = [];
                        for (var i = 0, b = 0; i < buffer.length; i++, b += 8) {
                            words[b >>> 5] |= buffer[i] << 24 - b % 32
                        }
                        return new WordArray.init(words, buffer.length)
                    }

                    function wordArrayToBuffer(wordArray) {
                        assert(Array.isArray(wordArray.words), "Expected WordArray, got" + wordArray);
                        var words = wordArray.words;
                        var buffer = new Buffer(words.length * 4);
                        words.forEach(function(value, i) {
                            buffer.writeInt32BE(value & -1, i * 4)
                        });
                        return buffer
                    }
                    module.exports = {
                        bufferToWordArray: bufferToWordArray,
                        wordArrayToBuffer: wordArrayToBuffer
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                assert: 75,
                buffer: 78,
                "crypto-js": 27
            }
        ],
        61: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var CryptoJS = require("crypto-js");
                    var crypto = require("crypto");
                    var convert = require("./convert");

                    function hash160(buffer) {
                        return ripemd160(sha256(buffer))
                    }

                    function hash256(buffer) {
                        return sha256(sha256(buffer))
                    }

                    function ripemd160(buffer) {
                        return crypto.createHash("rmd160").update(buffer).digest()
                    }

                    function sha1(buffer) {
                        return crypto.createHash("sha1").update(buffer).digest()
                    }

                    function sha256(buffer) {
                        return crypto.createHash("sha256").update(buffer).digest()
                    }

                    function HmacSHA256(buffer, secret) {
                        return crypto.createHmac("sha256", secret).update(buffer).digest()
                    }

                    function HmacSHA512(data, secret) {
                        assert(Buffer.isBuffer(data), "Expected Buffer for data, got " + data);
                        assert(Buffer.isBuffer(secret), "Expected Buffer for secret, got " + secret);
                        var dataWords = convert.bufferToWordArray(data);
                        var secretWords = convert.bufferToWordArray(secret);
                        var hash = CryptoJS.HmacSHA512(dataWords, secretWords);
                        return convert.wordArrayToBuffer(hash)
                    }
                    module.exports = {
                        ripemd160: ripemd160,
                        sha1: sha1,
                        sha256: sha256,
                        hash160: hash160,
                        hash256: hash256,
                        HmacSHA256: HmacSHA256,
                        HmacSHA512: HmacSHA512
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                "./convert": 60,
                assert: 75,
                buffer: 78,
                crypto: 9,
                "crypto-js": 27
            }
        ],
        62: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var crypto = require("./crypto");
                    var BigInteger = require("bigi");
                    var ECSignature = require("./ecsignature");

                    function deterministicGenerateK(curve, hash, d) {
                        assert(Buffer.isBuffer(hash), "Hash must be a Buffer, not " + hash);
                        assert.equal(hash.length, 32, "Hash must be 256 bit");
                        assert(d instanceof BigInteger, "Private key must be a BigInteger");
                        var x = d.toBuffer(32);
                        var k = new Buffer(32);
                        var v = new Buffer(32);
                        v.fill(1);
                        k.fill(0);
                        k = crypto.HmacSHA256(Buffer.concat([v, new Buffer([0]), x, hash]), k);
                        v = crypto.HmacSHA256(v, k);
                        k = crypto.HmacSHA256(Buffer.concat([v, new Buffer([1]), x, hash]), k);
                        v = crypto.HmacSHA256(v, k);
                        v = crypto.HmacSHA256(v, k);
                        var T = BigInteger.fromBuffer(v);
                        while (T.signum() <= 0 || T.compareTo(curve.n) >= 0) {
                            k = crypto.HmacSHA256(Buffer.concat([v, new Buffer([0])]), k);
                            v = crypto.HmacSHA256(v, k);
                            T = BigInteger.fromBuffer(v)
                        }
                        return T
                    }

                    function sign(curve, hash, d) {
                        var k = deterministicGenerateK(curve, hash, d);
                        var n = curve.n;
                        var G = curve.G;
                        var Q = G.multiply(k);
                        var e = BigInteger.fromBuffer(hash);
                        var r = Q.affineX.mod(n);
                        assert.notEqual(r.signum(), 0, "Invalid R value");
                        var s = k.modInverse(n).multiply(e.add(d.multiply(r))).mod(n);
                        assert.notEqual(s.signum(), 0, "Invalid S value");
                        var N_OVER_TWO = n.shiftRight(1);
                        if (s.compareTo(N_OVER_TWO) > 0) {
                            s = n.subtract(s)
                        }
                        return new ECSignature(r, s)
                    }

                    function verify(curve, hash, signature, Q) {
                        var e = BigInteger.fromBuffer(hash);
                        return verifyRaw(curve, e, signature, Q)
                    }

                    function verifyRaw(curve, e, signature, Q) {
                        var n = curve.n;
                        var G = curve.G;
                        var r = signature.r;
                        var s = signature.s;
                        if (r.signum() <= 0 || r.compareTo(n) >= 0) return false;
                        if (s.signum() <= 0 || s.compareTo(n) >= 0) return false;
                        var c = s.modInverse(n);
                        var u1 = e.multiply(c).mod(n);
                        var u2 = r.multiply(c).mod(n);
                        var R = G.multiplyTwo(u1, Q, u2);
                        var v = R.affineX.mod(n);
                        if (curve.isInfinity(R)) return false;
                        return v.equals(r)
                    }

                    function recoverPubKey(curve, e, signature, i) {
                        assert.strictEqual(i & 3, i, "Recovery param is more than two bits");
                        var n = curve.n;
                        var G = curve.G;
                        var r = signature.r;
                        var s = signature.s;
                        assert(r.signum() > 0 && r.compareTo(n) < 0, "Invalid r value");
                        assert(s.signum() > 0 && s.compareTo(n) < 0, "Invalid s value");
                        var isYOdd = i & 1;
                        var isSecondKey = i >> 1;
                        var x = isSecondKey ? r.add(n) : r;
                        var R = curve.pointFromX(isYOdd, x);
                        var nR = R.multiply(n);
                        assert(curve.isInfinity(nR), "nR is not a valid curve point");
                        var eNeg = e.negate().mod(n);
                        var rInv = r.modInverse(n);
                        var Q = R.multiplyTwo(s, G, eNeg).multiply(rInv);
                        curve.validate(Q);
                        return Q
                    }

                    function calcPubKeyRecoveryParam(curve, e, signature, Q) {
                        for (var i = 0; i < 4; i++) {
                            var Qprime = recoverPubKey(curve, e, signature, i);
                            if (Qprime.equals(Q)) {
                                return i
                            }
                        }
                        throw new Error("Unable to find valid recovery factor")
                    }
                    module.exports = {
                        calcPubKeyRecoveryParam: calcPubKeyRecoveryParam,
                        deterministicGenerateK: deterministicGenerateK,
                        recoverPubKey: recoverPubKey,
                        sign: sign,
                        verify: verify,
                        verifyRaw: verifyRaw
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                "./crypto": 61,
                "./ecsignature": 65,
                assert: 75,
                bigi: 3,
                buffer: 78
            }
        ],
        63: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var base58check = require("bs58check");
                    var crypto = require("crypto");
                    var ecdsa = require("./ecdsa");
                    var networks = require("./networks");
                    var BigInteger = require("bigi");
                    var ECPubKey = require("./ecpubkey");
                    var ecurve = require("ecurve");
                    var curve = ecurve.getCurveByName("secp256k1");

                    function ECKey(d, compressed) {
                        assert(d.signum() > 0, "Private key must be greater than 0");
                        assert(d.compareTo(curve.n) < 0, "Private key must be less than the curve order");
                        var Q = curve.G.multiply(d);
                        this.d = d;
                        this.pub = new ECPubKey(Q, compressed)
                    }
                    ECKey.fromWIF = function(string) {
                        var payload = base58check.decode(string);
                        var compressed = false;
                        payload = payload.slice(1);
                        if (payload.length === 33) {
                            assert.strictEqual(payload[32], 1, "Invalid compression flag");
                            payload = payload.slice(0, -1);
                            compressed = true
                        }
                        assert.equal(payload.length, 32, "Invalid WIF payload length");
                        var d = BigInteger.fromBuffer(payload);
                        return new ECKey(d, compressed)
                    };
                    ECKey.makeRandom = function(compressed, rng) {
                        rng = rng || crypto.randomBytes;
                        var buffer = rng(32);
                        assert(Buffer.isBuffer(buffer), "Expected Buffer, got " + buffer);
                        var d = BigInteger.fromBuffer(buffer);
                        d = d.mod(curve.n);
                        return new ECKey(d, compressed)
                    };
                    ECKey.prototype.toWIF = function(network) {
                        network = network || networks.bitcoin;
                        var bufferLen = this.pub.compressed ? 34 : 33;
                        var buffer = new Buffer(bufferLen);
                        buffer.writeUInt8(network.wif, 0);
                        this.d.toBuffer(32).copy(buffer, 1);
                        if (this.pub.compressed) {
                            buffer.writeUInt8(1, 33)
                        }
                        return base58check.encode(buffer)
                    };
                    ECKey.prototype.sign = function(hash) {
                        return ecdsa.sign(curve, hash, this.d)
                    };
                    module.exports = ECKey
                }).call(this, require("buffer").Buffer)
            }, {
                "./ecdsa": 62,
                "./ecpubkey": 64,
                "./networks": 68,
                assert: 75,
                bigi: 3,
                bs58check: 5,
                buffer: 78,
                crypto: 9,
                ecurve: 55
            }
        ],
        64: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var crypto = require("./crypto");
                    var ecdsa = require("./ecdsa");
                    var networks = require("./networks");
                    var Address = require("./address");
                    var ecurve = require("ecurve");
                    var curve = ecurve.getCurveByName("secp256k1");

                    function ECPubKey(Q, compressed) {
                        assert(Q instanceof ecurve.Point, "Expected Point, got " + Q);
                        if (compressed == undefined) compressed = true;
                        assert.strictEqual(typeof compressed, "boolean", "Expected boolean, got " + compressed);
                        this.compressed = compressed;
                        this.Q = Q
                    }
                    ECPubKey.fromBuffer = function(buffer) {
                        var Q = ecurve.Point.decodeFrom(curve, buffer);
                        return new ECPubKey(Q, Q.compressed)
                    };
                    ECPubKey.fromHex = function(hex) {
                        return ECPubKey.fromBuffer(new Buffer(hex, "hex"))
                    };
                    ECPubKey.prototype.getAddress = function(network) {
                        network = network || networks.bitcoin;
                        return new Address(crypto.hash160(this.toBuffer()), network.pubKeyHash)
                    };
                    ECPubKey.prototype.verify = function(hash, signature) {
                        return ecdsa.verify(curve, hash, signature, this.Q)
                    };
                    ECPubKey.prototype.toBuffer = function() {
                        return this.Q.getEncoded(this.compressed)
                    };
                    ECPubKey.prototype.toHex = function() {
                        return this.toBuffer().toString("hex")
                    };
                    module.exports = ECPubKey
                }).call(this, require("buffer").Buffer)
            }, {
                "./address": 58,
                "./crypto": 61,
                "./ecdsa": 62,
                "./networks": 68,
                assert: 75,
                buffer: 78,
                ecurve: 55
            }
        ],
        65: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var BigInteger = require("bigi");

                    function ECSignature(r, s) {
                        assert(r instanceof BigInteger, "Expected BigInteger, got " + r);
                        assert(s instanceof BigInteger, "Expected BigInteger, got " + s);
                        this.r = r;
                        this.s = s
                    }
                    ECSignature.parseCompact = function(buffer) {
                        assert.equal(buffer.length, 65, "Invalid signature length");
                        var i = buffer.readUInt8(0) - 27;
                        assert.equal(i, i & 7, "Invalid signature parameter");
                        var compressed = !!(i & 4);
                        i = i & 3;
                        var r = BigInteger.fromBuffer(buffer.slice(1, 33));
                        var s = BigInteger.fromBuffer(buffer.slice(33));
                        return {
                            compressed: compressed,
                            i: i,
                            signature: new ECSignature(r, s)
                        }
                    };
                    ECSignature.fromDER = function(buffer) {
                        assert.equal(buffer.readUInt8(0), 48, "Not a DER sequence");
                        assert.equal(buffer.readUInt8(1), buffer.length - 2, "Invalid sequence length");
                        assert.equal(buffer.readUInt8(2), 2, "Expected a DER integer");
                        var rLen = buffer.readUInt8(3);
                        assert(rLen > 0, "R length is zero");
                        var offset = 4 + rLen;
                        assert.equal(buffer.readUInt8(offset), 2, "Expected a DER integer (2)");
                        var sLen = buffer.readUInt8(offset + 1);
                        assert(sLen > 0, "S length is zero");
                        var rB = buffer.slice(4, offset);
                        var sB = buffer.slice(offset + 2);
                        offset += 2 + sLen;
                        if (rLen > 1 && rB.readUInt8(0) === 0) {
                            assert(rB.readUInt8(1) & 128, "R value excessively padded")
                        }
                        if (sLen > 1 && sB.readUInt8(0) === 0) {
                            assert(sB.readUInt8(1) & 128, "S value excessively padded")
                        }
                        assert.equal(offset, buffer.length, "Invalid DER encoding");
                        var r = BigInteger.fromDERInteger(rB);
                        var s = BigInteger.fromDERInteger(sB);
                        assert(r.signum() >= 0, "R value is negative");
                        assert(s.signum() >= 0, "S value is negative");
                        return new ECSignature(r, s)
                    };
                    ECSignature.parseScriptSignature = function(buffer) {
                        var hashType = buffer.readUInt8(buffer.length - 1);
                        var hashTypeMod = hashType & ~128;
                        assert(hashTypeMod > 0 && hashTypeMod < 4, "Invalid hashType");
                        return {
                            signature: ECSignature.fromDER(buffer.slice(0, -1)),
                            hashType: hashType
                        }
                    };
                    ECSignature.prototype.toCompact = function(i, compressed) {
                        if (compressed) i += 4;
                        i += 27;
                        var buffer = new Buffer(65);
                        buffer.writeUInt8(i, 0);
                        this.r.toBuffer(32).copy(buffer, 1);
                        this.s.toBuffer(32).copy(buffer, 33);
                        return buffer
                    };
                    ECSignature.prototype.toDER = function() {
                        var rBa = this.r.toDERInteger();
                        var sBa = this.s.toDERInteger();
                        var sequence = [];
                        sequence.push(2, rBa.length);
                        sequence = sequence.concat(rBa);
                        sequence.push(2, sBa.length);
                        sequence = sequence.concat(sBa);
                        sequence.unshift(48, sequence.length);
                        return new Buffer(sequence)
                    };
                    ECSignature.prototype.toScriptSignature = function(hashType) {
                        var hashTypeBuffer = new Buffer(1);
                        hashTypeBuffer.writeUInt8(hashType, 0);
                        return Buffer.concat([this.toDER(), hashTypeBuffer])
                    };
                    module.exports = ECSignature
                }).call(this, require("buffer").Buffer)
            }, {
                assert: 75,
                bigi: 3,
                buffer: 78
            }
        ],
        66: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var base58check = require("bs58check");
                    var crypto = require("./crypto");
                    var networks = require("./networks");
                    var BigInteger = require("bigi");
                    var ECKey = require("./eckey");
                    var ECPubKey = require("./ecpubkey");
                    var ecurve = require("ecurve");
                    var curve = ecurve.getCurveByName("secp256k1");

                    function findBIP32ParamsByVersion(version) {
                        for (var name in networks) {
                            var network = networks[name];
                            for (var type in network.bip32) {
                                if (version != network.bip32[type]) continue;
                                return {
                                    isPrivate: type === "private",
                                    network: network
                                }
                            }
                        }
                        assert(false, "Could not find version " + version.toString(16))
                    }

                    function HDNode(K, chainCode, network) {
                        network = network || networks.bitcoin;
                        assert(Buffer.isBuffer(chainCode), "Expected Buffer, got " + chainCode);
                        assert.equal(chainCode.length, 32, "Expected chainCode length of 32, got " + chainCode.length);
                        assert(network.bip32, "Unknown BIP32 constants for network");
                        this.chainCode = chainCode;
                        this.depth = 0;
                        this.index = 0;
                        this.network = network;
                        if (K instanceof BigInteger) {
                            this.privKey = new ECKey(K, true);
                            this.pubKey = this.privKey.pub
                        } else {
                            this.pubKey = new ECPubKey(K, true)
                        }
                    }
                    HDNode.MASTER_SECRET = new Buffer("Bitcoin seed");
                    HDNode.HIGHEST_BIT = 2147483648;
                    HDNode.LENGTH = 78;
                    HDNode.fromSeedBuffer = function(seed, network) {
                        assert(Buffer.isBuffer(seed), "Expected Buffer, got " + seed);
                        assert(seed.length >= 16, "Seed should be at least 128 bits");
                        assert(seed.length <= 64, "Seed should be at most 512 bits");
                        var I = crypto.HmacSHA512(seed, HDNode.MASTER_SECRET);
                        var IL = I.slice(0, 32);
                        var IR = I.slice(32);
                        var pIL = BigInteger.fromBuffer(IL);
                        return new HDNode(pIL, IR, network)
                    };
                    HDNode.fromSeedHex = function(hex, network) {
                        return HDNode.fromSeedBuffer(new Buffer(hex, "hex"), network)
                    };
                    HDNode.fromBase58 = function(string) {
                        return HDNode.fromBuffer(base58check.decode(string))
                    };
                    HDNode.fromBuffer = function(buffer) {
                        assert.strictEqual(buffer.length, HDNode.LENGTH, "Invalid buffer length");
                        var version = buffer.readUInt32BE(0);
                        var params = findBIP32ParamsByVersion(version);
                        var depth = buffer.readUInt8(4);
                        var parentFingerprint = buffer.readUInt32BE(5);
                        if (depth === 0) {
                            assert.strictEqual(parentFingerprint, 0, "Invalid parent fingerprint")
                        }
                        var index = buffer.readUInt32BE(9);
                        assert(depth > 0 || index === 0, "Invalid index");
                        var chainCode = buffer.slice(13, 45);
                        var hd;
                        if (params.isPrivate) {
                            assert.strictEqual(buffer.readUInt8(45), 0, "Invalid private key");
                            var data = buffer.slice(46, 78);
                            var d = BigInteger.fromBuffer(data);
                            hd = new HDNode(d, chainCode, params.network)
                        } else {
                            var data = buffer.slice(45, 78);
                            var Q = ecurve.Point.decodeFrom(curve, data);
                            assert.equal(Q.compressed, true, "Invalid public key");
                            curve.validate(Q);
                            hd = new HDNode(Q, chainCode, params.network)
                        }
                        hd.depth = depth;
                        hd.index = index;
                        hd.parentFingerprint = parentFingerprint;
                        return hd
                    };
                    HDNode.fromHex = function(hex) {
                        return HDNode.fromBuffer(new Buffer(hex, "hex"))
                    };
                    HDNode.prototype.getIdentifier = function() {
                        return crypto.hash160(this.pubKey.toBuffer())
                    };
                    HDNode.prototype.getFingerprint = function() {
                        return this.getIdentifier().slice(0, 4)
                    };
                    HDNode.prototype.getAddress = function() {
                        return this.pubKey.getAddress(this.network)
                    };
                    HDNode.prototype.neutered = function() {
                        var neutered = new HDNode(this.pubKey.Q, this.chainCode, this.network);
                        neutered.depth = this.depth;
                        neutered.index = this.index;
                        neutered.parentFingerprint = this.parentFingerprint;
                        return neutered
                    };
                    HDNode.prototype.toBase58 = function(isPrivate) {
                        return base58check.encode(this.toBuffer(isPrivate))
                    };
                    HDNode.prototype.toBuffer = function(isPrivate) {
                        if (isPrivate == undefined) {
                            isPrivate = !!this.privKey
                        } else {
                            console.warn("isPrivate flag is deprecated, please use the .neutered() method instead")
                        }
                        var version = isPrivate ? this.network.bip32.private : this.network.bip32.public;
                        var buffer = new Buffer(HDNode.LENGTH);
                        buffer.writeUInt32BE(version, 0);
                        buffer.writeUInt8(this.depth, 4);
                        var fingerprint = this.depth === 0 ? 0 : this.parentFingerprint;
                        buffer.writeUInt32BE(fingerprint, 5);
                        buffer.writeUInt32BE(this.index, 9);
                        this.chainCode.copy(buffer, 13);
                        if (isPrivate) {
                            assert(this.privKey, "Missing private key");
                            buffer.writeUInt8(0, 45);
                            this.privKey.d.toBuffer(32).copy(buffer, 46)
                        } else {
                            this.pubKey.toBuffer().copy(buffer, 45)
                        }
                        return buffer
                    };
                    HDNode.prototype.toHex = function(isPrivate) {
                        return this.toBuffer(isPrivate).toString("hex")
                    };
                    HDNode.prototype.derive = function(index) {
                        var isHardened = index >= HDNode.HIGHEST_BIT;
                        var indexBuffer = new Buffer(4);
                        indexBuffer.writeUInt32BE(index, 0);
                        var data;
                        if (isHardened) {
                            assert(this.privKey, "Could not derive hardened child key");
                            data = Buffer.concat([this.privKey.d.toBuffer(33), indexBuffer])
                        } else {
                            data = Buffer.concat([this.pubKey.toBuffer(), indexBuffer])
                        }
                        var I = crypto.HmacSHA512(data, this.chainCode);
                        var IL = I.slice(0, 32);
                        var IR = I.slice(32);
                        var pIL = BigInteger.fromBuffer(IL);
                        if (pIL.compareTo(curve.n) >= 0) {
                            return this.derive(index + 1)
                        }
                        var hd;
                        if (this.privKey) {
                            var ki = pIL.add(this.privKey.d).mod(curve.n);
                            if (ki.signum() === 0) {
                                return this.derive(index + 1)
                            }
                            hd = new HDNode(ki, IR, this.network)
                        } else {
                            var Ki = curve.G.multiply(pIL).add(this.pubKey.Q);
                            if (curve.isInfinity(Ki)) {
                                return this.derive(index + 1)
                            }
                            hd = new HDNode(Ki, IR, this.network)
                        }
                        hd.depth = this.depth + 1;
                        hd.index = index;
                        hd.parentFingerprint = this.getFingerprint().readUInt32BE(0);
                        return hd
                    };
                    HDNode.prototype.deriveHardened = function(index) {
                        return this.derive(index + HDNode.HIGHEST_BIT)
                    };
                    HDNode.prototype.toString = HDNode.prototype.toBase58;
                    module.exports = HDNode
                }).call(this, require("buffer").Buffer)
            }, {
                "./crypto": 61,
                "./eckey": 63,
                "./ecpubkey": 64,
                "./networks": 68,
                assert: 75,
                bigi: 3,
                bs58check: 5,
                buffer: 78,
                ecurve: 55
            }
        ],
        67: [
            function(require, module, exports) {
                (function(Buffer) {
                    var Address = require("./address");
                    var BigInteger = require("bigi");
                    var bufferutils = require("./bufferutils");
                    var crypto = require("./crypto");
                    var ecdsa = require("./ecdsa");
                    var networks = require("./networks");
                    var Address = require("./address");
                    var ECPubKey = require("./ecpubkey");
                    var ECSignature = require("./ecsignature");
                    var ecurve = require("ecurve");
                    var ecparams = ecurve.getCurveByName("secp256k1");

                    function magicHash(message, network) {
                        var magicPrefix = new Buffer(network.magicPrefix);
                        var messageBuffer = new Buffer(message);
                        var lengthBuffer = new Buffer(bufferutils.varIntSize(messageBuffer.length));
                        bufferutils.writeVarInt(lengthBuffer, messageBuffer.length, 0);
                        var buffer = Buffer.concat([magicPrefix, lengthBuffer, messageBuffer]);
                        return crypto.hash256(buffer)
                    }

                    function sign(privKey, message, network) {
                        network = network || networks.bitcoin;
                        var hash = magicHash(message, network);
                        var signature = privKey.sign(hash);
                        var e = BigInteger.fromBuffer(hash);
                        var i = ecdsa.calcPubKeyRecoveryParam(ecparams, e, signature, privKey.pub.Q);
                        return signature.toCompact(i, privKey.pub.compressed)
                    }

                    function verify(address, signature, message, network) {
                        if (!Buffer.isBuffer(signature)) {
                            signature = new Buffer(signature, "base64")
                        }
                        if (address instanceof Address) {
                            address = address.toString()
                        }
                        network = network || networks.bitcoin;
                        var hash = magicHash(message, network);
                        var parsed = ECSignature.parseCompact(signature);
                        var e = BigInteger.fromBuffer(hash);
                        var Q = ecdsa.recoverPubKey(ecparams, e, parsed.signature, parsed.i);
                        var pubKey = new ECPubKey(Q, parsed.compressed);
                        return pubKey.getAddress(network).toString() === address
                    }
                    module.exports = {
                        magicHash: magicHash,
                        sign: sign,
                        verify: verify
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                "./address": 58,
                "./bufferutils": 59,
                "./crypto": 61,
                "./ecdsa": 62,
                "./ecpubkey": 64,
                "./ecsignature": 65,
                "./networks": 68,
                bigi: 3,
                buffer: 78,
                ecurve: 55
            }
        ],
        68: [
            function(require, module, exports) {
                var networks = {
                    bitcoin: {
                        magicPrefix: "Bitcoin Signed Message:\n",
                        bip32: {
                            "public": 76067358,
                            "private": 76066276
                        },
                        pubKeyHash: 0,
                        scriptHash: 5,
                        wif: 128,
                        dustThreshold: 546,
                        feePerKb: 1e4,
                        estimateFee: estimateFee("bitcoin")
                    },
                    dogecoin: {
                        magicPrefix: "Dogecoin Signed Message:\n",
                        bip32: {
                            "public": 49990397,
                            "private": 49988504
                        },
                        pubKeyHash: 30,
                        scriptHash: 22,
                        wif: 158,
                        dustThreshold: 0,
                        dustSoftThreshold: 1e8,
                        feePerKb: 1e8,
                        estimateFee: estimateFee("dogecoin")
                    },
                    litecoin: {
                        magicPrefix: "Litecoin Signed Message:\n",
                        bip32: {
                            "public": 27108450,
                            "private": 27106558
                        },
                        pubKeyHash: 48,
                        scriptHash: 5,
                        wif: 176,
                        dustThreshold: 0,
                        dustSoftThreshold: 1e5,
                        feePerKb: 1e5,
                        estimateFee: estimateFee("litecoin")
                    },
                    testnet: {
                        magicPrefix: "Bitcoin Signed Message:\n",
                        bip32: {
                            "public": 70617039,
                            "private": 70615956
                        },
                        pubKeyHash: 111,
                        scriptHash: 196,
                        wif: 239,
                        dustThreshold: 546,
                        feePerKb: 1e4,
                        estimateFee: estimateFee("testnet")
                    }
                };

                function estimateFee(type) {
                    return function(tx) {
                        var network = networks[type];
                        var baseFee = network.feePerKb;
                        var byteSize = tx.toBuffer().length;
                        var fee = baseFee * Math.ceil(byteSize / 1e3);
                        if (network.dustSoftThreshold == undefined) return fee;
                        tx.outs.forEach(function(e) {
                            if (e.value < network.dustSoftThreshold) {
                                fee += baseFee
                            }
                        });
                        return fee
                    }
                }
                module.exports = networks
            }, {}
        ],
        69: [
            function(require, module, exports) {
                module.exports = {
                    OP_FALSE: 0,
                    OP_0: 0,
                    OP_PUSHDATA1: 76,
                    OP_PUSHDATA2: 77,
                    OP_PUSHDATA4: 78,
                    OP_1NEGATE: 79,
                    OP_RESERVED: 80,
                    OP_1: 81,
                    OP_TRUE: 81,
                    OP_2: 82,
                    OP_3: 83,
                    OP_4: 84,
                    OP_5: 85,
                    OP_6: 86,
                    OP_7: 87,
                    OP_8: 88,
                    OP_9: 89,
                    OP_10: 90,
                    OP_11: 91,
                    OP_12: 92,
                    OP_13: 93,
                    OP_14: 94,
                    OP_15: 95,
                    OP_16: 96,
                    OP_NOP: 97,
                    OP_VER: 98,
                    OP_IF: 99,
                    OP_NOTIF: 100,
                    OP_VERIF: 101,
                    OP_VERNOTIF: 102,
                    OP_ELSE: 103,
                    OP_ENDIF: 104,
                    OP_VERIFY: 105,
                    OP_RETURN: 106,
                    OP_TOALTSTACK: 107,
                    OP_FROMALTSTACK: 108,
                    OP_2DROP: 109,
                    OP_2DUP: 110,
                    OP_3DUP: 111,
                    OP_2OVER: 112,
                    OP_2ROT: 113,
                    OP_2SWAP: 114,
                    OP_IFDUP: 115,
                    OP_DEPTH: 116,
                    OP_DROP: 117,
                    OP_DUP: 118,
                    OP_NIP: 119,
                    OP_OVER: 120,
                    OP_PICK: 121,
                    OP_ROLL: 122,
                    OP_ROT: 123,
                    OP_SWAP: 124,
                    OP_TUCK: 125,
                    OP_CAT: 126,
                    OP_SUBSTR: 127,
                    OP_LEFT: 128,
                    OP_RIGHT: 129,
                    OP_SIZE: 130,
                    OP_INVERT: 131,
                    OP_AND: 132,
                    OP_OR: 133,
                    OP_XOR: 134,
                    OP_EQUAL: 135,
                    OP_EQUALVERIFY: 136,
                    OP_RESERVED1: 137,
                    OP_RESERVED2: 138,
                    OP_1ADD: 139,
                    OP_1SUB: 140,
                    OP_2MUL: 141,
                    OP_2DIV: 142,
                    OP_NEGATE: 143,
                    OP_ABS: 144,
                    OP_NOT: 145,
                    OP_0NOTEQUAL: 146,
                    OP_ADD: 147,
                    OP_SUB: 148,
                    OP_MUL: 149,
                    OP_DIV: 150,
                    OP_MOD: 151,
                    OP_LSHIFT: 152,
                    OP_RSHIFT: 153,
                    OP_BOOLAND: 154,
                    OP_BOOLOR: 155,
                    OP_NUMEQUAL: 156,
                    OP_NUMEQUALVERIFY: 157,
                    OP_NUMNOTEQUAL: 158,
                    OP_LESSTHAN: 159,
                    OP_GREATERTHAN: 160,
                    OP_LESSTHANOREQUAL: 161,
                    OP_GREATERTHANOREQUAL: 162,
                    OP_MIN: 163,
                    OP_MAX: 164,
                    OP_WITHIN: 165,
                    OP_RIPEMD160: 166,
                    OP_SHA1: 167,
                    OP_SHA256: 168,
                    OP_HASH160: 169,
                    OP_HASH256: 170,
                    OP_CODESEPARATOR: 171,
                    OP_CHECKSIG: 172,
                    OP_CHECKSIGVERIFY: 173,
                    OP_CHECKMULTISIG: 174,
                    OP_CHECKMULTISIGVERIFY: 175,
                    OP_NOP1: 176,
                    OP_NOP2: 177,
                    OP_NOP3: 178,
                    OP_NOP4: 179,
                    OP_NOP5: 180,
                    OP_NOP6: 181,
                    OP_NOP7: 182,
                    OP_NOP8: 183,
                    OP_NOP9: 184,
                    OP_NOP10: 185,
                    OP_PUBKEYHASH: 253,
                    OP_PUBKEY: 254,
                    OP_INVALIDOPCODE: 255
                }
            }, {}
        ],
        70: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var bufferutils = require("./bufferutils");
                    var crypto = require("./crypto");
                    var opcodes = require("./opcodes");

                    function Script(buffer, chunks) {
                        assert(Buffer.isBuffer(buffer), "Expected Buffer, got " + buffer);
                        assert(Array.isArray(chunks), "Expected Array, got " + chunks);
                        this.buffer = buffer;
                        this.chunks = chunks
                    }
                    Script.fromASM = function(asm) {
                        var strChunks = asm.split(" ");
                        var chunks = strChunks.map(function(strChunk) {
                            if (strChunk in opcodes) {
                                return opcodes[strChunk]
                            } else {
                                return new Buffer(strChunk, "hex")
                            }
                        });
                        return Script.fromChunks(chunks)
                    };
                    Script.fromBuffer = function(buffer) {
                        var chunks = [];
                        var i = 0;
                        while (i < buffer.length) {
                            var opcode = buffer.readUInt8(i);
                            if (opcode > opcodes.OP_0 && opcode <= opcodes.OP_PUSHDATA4) {
                                var d = bufferutils.readPushDataInt(buffer, i);
                                i += d.size;
                                var data = buffer.slice(i, i + d.number);
                                i += d.number;
                                chunks.push(data)
                            } else {
                                chunks.push(opcode);
                                i += 1
                            }
                        }
                        return new Script(buffer, chunks)
                    };
                    Script.fromChunks = function(chunks) {
                        assert(Array.isArray(chunks), "Expected Array, got " + chunks);
                        var bufferSize = chunks.reduce(function(accum, chunk) {
                            if (Buffer.isBuffer(chunk)) {
                                return accum + bufferutils.pushDataSize(chunk.length) + chunk.length
                            }
                            return accum + 1
                        }, 0);
                        var buffer = new Buffer(bufferSize);
                        var offset = 0;
                        chunks.forEach(function(chunk) {
                            if (Buffer.isBuffer(chunk)) {
                                offset += bufferutils.writePushDataInt(buffer, chunk.length, offset);
                                chunk.copy(buffer, offset);
                                offset += chunk.length
                            } else {
                                buffer.writeUInt8(chunk, offset);
                                offset += 1
                            }
                        });
                        assert.equal(offset, buffer.length, "Could not decode chunks");
                        return new Script(buffer, chunks)
                    };
                    Script.fromHex = function(hex) {
                        return Script.fromBuffer(new Buffer(hex, "hex"))
                    };
                    Script.EMPTY = Script.fromChunks([]);
                    Script.prototype.getHash = function() {
                        return crypto.hash160(this.buffer)
                    };
                    Script.prototype.without = function(needle) {
                        return Script.fromChunks(this.chunks.filter(function(op) {
                            return op !== needle
                        }))
                    };
                    var reverseOps = [];
                    for (var op in opcodes) {
                        var code = opcodes[op];
                        reverseOps[code] = op
                    }
                    Script.prototype.toASM = function() {
                        return this.chunks.map(function(chunk) {
                            if (Buffer.isBuffer(chunk)) {
                                return chunk.toString("hex")
                            } else {
                                return reverseOps[chunk]
                            }
                        }).join(" ")
                    };
                    Script.prototype.toBuffer = function() {
                        return this.buffer
                    };
                    Script.prototype.toHex = function() {
                        return this.toBuffer().toString("hex")
                    };
                    module.exports = Script
                }).call(this, require("buffer").Buffer)
            }, {
                "./bufferutils": 59,
                "./crypto": 61,
                "./opcodes": 69,
                assert: 75,
                buffer: 78
            }
        ],
        71: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var opcodes = require("./opcodes");
                    var ecurve = require("ecurve");
                    var curve = ecurve.getCurveByName("secp256k1");
                    var ECSignature = require("./ecsignature");
                    var Script = require("./script");

                    function classifyOutput(script) {
                        assert(script instanceof Script, "Expected Script, got ", script);
                        if (isPubKeyHashOutput.call(script)) {
                            return "pubkeyhash"
                        } else if (isScriptHashOutput.call(script)) {
                            return "scripthash"
                        } else if (isMultisigOutput.call(script)) {
                            return "multisig"
                        } else if (isPubKeyOutput.call(script)) {
                            return "pubkey"
                        } else if (isNulldataOutput.call(script)) {
                            return "nulldata"
                        } else {
                            return "nonstandard"
                        }
                    }

                    function classifyInput(script) {
                        assert(script instanceof Script, "Expected Script, got ", script);
                        if (isPubKeyHashInput.call(script)) {
                            return "pubkeyhash"
                        } else if (isScriptHashInput.call(script)) {
                            return "scripthash"
                        } else if (isMultisigInput.call(script)) {
                            return "multisig"
                        } else if (isPubKeyInput.call(script)) {
                            return "pubkey"
                        } else {
                            return "nonstandard"
                        }
                    }

                    function isCanonicalPubKey(buffer) {
                        if (!Buffer.isBuffer(buffer)) return false;
                        try {
                            ecurve.Point.decodeFrom(curve, buffer)
                        } catch (e) {
                            if (!e.message.match(/Invalid sequence (length|tag)/)) throw e;
                            return false
                        }
                        return true
                    }

                    function isCanonicalSignature(buffer) {
                        if (!Buffer.isBuffer(buffer)) return false;
                        try {
                            ECSignature.parseScriptSignature(buffer)
                        } catch (e) {
                            if (!e.message.match(/Not a DER sequence|Invalid sequence length|Expected a DER integer|R length is zero|S length is zero|R value excessively padded|S value excessively padded|R value is negative|S value is negative|Invalid hashType/)) throw e;
                            return false
                        }
                        return true
                    }

                    function isPubKeyHashInput() {
                        return this.chunks.length === 2 && isCanonicalSignature(this.chunks[0]) && isCanonicalPubKey(this.chunks[1])
                    }

                    function isPubKeyHashOutput() {
                        return this.chunks.length === 5 && this.chunks[0] === opcodes.OP_DUP && this.chunks[1] === opcodes.OP_HASH160 && Buffer.isBuffer(this.chunks[2]) && this.chunks[2].length === 20 && this.chunks[3] === opcodes.OP_EQUALVERIFY && this.chunks[4] === opcodes.OP_CHECKSIG
                    }

                    function isPubKeyInput() {
                        return this.chunks.length === 1 && isCanonicalSignature(this.chunks[0])
                    }

                    function isPubKeyOutput() {
                        return this.chunks.length === 2 && isCanonicalPubKey(this.chunks[0]) && this.chunks[1] === opcodes.OP_CHECKSIG
                    }

                    function isScriptHashInput() {
                        if (this.chunks.length < 2) return false;
                        var lastChunk = this.chunks[this.chunks.length - 1];
                        if (!Buffer.isBuffer(lastChunk)) return false;
                        var scriptSig = Script.fromChunks(this.chunks.slice(0, -1));
                        var scriptPubKey = Script.fromBuffer(lastChunk);
                        return classifyInput(scriptSig) === classifyOutput(scriptPubKey)
                    }

                    function isScriptHashOutput() {
                        return this.chunks.length === 3 && this.chunks[0] === opcodes.OP_HASH160 && Buffer.isBuffer(this.chunks[1]) && this.chunks[1].length === 20 && this.chunks[2] === opcodes.OP_EQUAL
                    }

                    function isMultisigInput() {
                        return this.chunks[0] === opcodes.OP_0 && this.chunks.slice(1).every(isCanonicalSignature)
                    }

                    function isMultisigOutput() {
                        if (this.chunks < 4) return false;
                        if (this.chunks[this.chunks.length - 1] !== opcodes.OP_CHECKMULTISIG) return false;
                        var mOp = this.chunks[0];
                        if (mOp === opcodes.OP_0) return false;
                        if (mOp < opcodes.OP_1) return false;
                        if (mOp > opcodes.OP_16) return false;
                        var nOp = this.chunks[this.chunks.length - 2];
                        if (nOp === opcodes.OP_0) return false;
                        if (nOp < opcodes.OP_1) return false;
                        if (nOp > opcodes.OP_16) return false;
                        var m = mOp - (opcodes.OP_1 - 1);
                        var n = nOp - (opcodes.OP_1 - 1);
                        if (n < m) return false;
                        var pubKeys = this.chunks.slice(1, -2);
                        if (n < pubKeys.length) return false;
                        return pubKeys.every(isCanonicalPubKey)
                    }

                    function isNulldataOutput() {
                        return this.chunks[0] === opcodes.OP_RETURN
                    }

                    function pubKeyOutput(pubKey) {
                        return Script.fromChunks([pubKey.toBuffer(), opcodes.OP_CHECKSIG])
                    }

                    function pubKeyHashOutput(hash) {
                        assert(Buffer.isBuffer(hash), "Expected Buffer, got " + hash);
                        return Script.fromChunks([opcodes.OP_DUP, opcodes.OP_HASH160, hash, opcodes.OP_EQUALVERIFY, opcodes.OP_CHECKSIG])
                    }

                    function scriptHashOutput(hash) {
                        assert(Buffer.isBuffer(hash), "Expected Buffer, got " + hash);
                        return Script.fromChunks([opcodes.OP_HASH160, hash, opcodes.OP_EQUAL])
                    }

                    function multisigOutput(m, pubKeys) {
                        assert(Array.isArray(pubKeys), "Expected Array, got " + pubKeys);
                        assert(pubKeys.length >= m, "Not enough pubKeys provided");
                        var pubKeyBuffers = pubKeys.map(function(pubKey) {
                            return pubKey.toBuffer()
                        });
                        var n = pubKeys.length;
                        return Script.fromChunks([].concat(opcodes.OP_1 - 1 + m, pubKeyBuffers, opcodes.OP_1 - 1 + n, opcodes.OP_CHECKMULTISIG))
                    }

                    function pubKeyInput(signature) {
                        assert(Buffer.isBuffer(signature), "Expected Buffer, got " + signature);
                        return Script.fromChunks([signature])
                    }

                    function pubKeyHashInput(signature, pubKey) {
                        assert(Buffer.isBuffer(signature), "Expected Buffer, got " + signature);
                        return Script.fromChunks([signature, pubKey.toBuffer()])
                    }

                    function scriptHashInput(scriptSig, scriptPubKey) {
                        return Script.fromChunks([].concat(scriptSig.chunks, scriptPubKey.toBuffer()))
                    }

                    function multisigInput(signatures, scriptPubKey) {
                        if (scriptPubKey) {
                            assert(isMultisigOutput.call(scriptPubKey));
                            var m = scriptPubKey.chunks[0];
                            var k = m - (opcodes.OP_1 - 1);
                            assert(k <= signatures.length, "Not enough signatures provided")
                        }
                        return Script.fromChunks([].concat(opcodes.OP_0, signatures))
                    }
                    module.exports = {
                        classifyInput: classifyInput,
                        classifyOutput: classifyOutput,
                        multisigInput: multisigInput,
                        multisigOutput: multisigOutput,
                        pubKeyHashInput: pubKeyHashInput,
                        pubKeyHashOutput: pubKeyHashOutput,
                        pubKeyInput: pubKeyInput,
                        pubKeyOutput: pubKeyOutput,
                        scriptHashInput: scriptHashInput,
                        scriptHashOutput: scriptHashOutput
                    }
                }).call(this, require("buffer").Buffer)
            }, {
                "./ecsignature": 65,
                "./opcodes": 69,
                "./script": 70,
                assert: 75,
                buffer: 78,
                ecurve: 55
            }
        ],
        72: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var bufferutils = require("./bufferutils");
                    var crypto = require("./crypto");
                    var opcodes = require("./opcodes");
                    var scripts = require("./scripts");
                    var Address = require("./address");
                    var ECSignature = require("./ecsignature");
                    var Script = require("./script");
                    Transaction.DEFAULT_SEQUENCE = 4294967295;
                    Transaction.SIGHASH_ALL = 1;
                    Transaction.SIGHASH_NONE = 2;
                    Transaction.SIGHASH_SINGLE = 3;
                    Transaction.SIGHASH_ANYONECANPAY = 128;

                    function Transaction() {
                        this.version = 1;
                        this.locktime = 0;
                        this.ins = [];
                        this.outs = []
                    }
                    Transaction.prototype.addInput = function(tx, index, sequence) {
                        if (sequence == undefined) sequence = Transaction.DEFAULT_SEQUENCE;
                        var hash;
                        if (typeof tx === "string") {
                            hash = new Buffer(tx, "hex");
                            Array.prototype.reverse.call(hash)
                        } else if (tx instanceof Transaction) {
                            hash = tx.getHash()
                        } else {
                            hash = tx
                        }
                        assert(Buffer.isBuffer(hash), "Expected Transaction, txId or txHash, got " + tx);
                        assert.equal(hash.length, 32, "Expected hash length of 32, got " + hash.length);
                        assert.equal(typeof index, "number", "Expected number index, got " + index);
                        return this.ins.push({
                            hash: hash,
                            index: index,
                            script: Script.EMPTY,
                            sequence: sequence
                        }) - 1
                    };
                    Transaction.prototype.addOutput = function(scriptPubKey, value) {
                        if (typeof scriptPubKey === "string") {
                            scriptPubKey = Address.fromBase58Check(scriptPubKey)
                        }
                        if (scriptPubKey instanceof Address) {
                            scriptPubKey = scriptPubKey.toOutputScript()
                        }
                        assert(scriptPubKey instanceof Script, "Expected Address or Script, got " + scriptPubKey);
                        assert.equal(typeof value, "number", "Expected number value, got " + value);
                        return this.outs.push({
                            script: scriptPubKey,
                            value: value
                        }) - 1
                    };
                    Transaction.prototype.toBuffer = function() {
                        var txInSize = this.ins.reduce(function(a, x) {
                            return a + (40 + bufferutils.varIntSize(x.script.buffer.length) + x.script.buffer.length)
                        }, 0);
                        var txOutSize = this.outs.reduce(function(a, x) {
                            return a + (8 + bufferutils.varIntSize(x.script.buffer.length) + x.script.buffer.length)
                        }, 0);
                        var buffer = new Buffer(8 + bufferutils.varIntSize(this.ins.length) + bufferutils.varIntSize(this.outs.length) + txInSize + txOutSize);
                        var offset = 0;

                        function writeSlice(slice) {
                            slice.copy(buffer, offset);
                            offset += slice.length
                        }

                        function writeUInt32(i) {
                            buffer.writeUInt32LE(i, offset);
                            offset += 4
                        }

                        function writeUInt64(i) {
                            bufferutils.writeUInt64LE(buffer, i, offset);
                            offset += 8
                        }

                        function writeVarInt(i) {
                            var n = bufferutils.writeVarInt(buffer, i, offset);
                            offset += n
                        }
                        writeUInt32(this.version);
                        writeVarInt(this.ins.length);
                        this.ins.forEach(function(txin) {
                            writeSlice(txin.hash);
                            writeUInt32(txin.index);
                            writeVarInt(txin.script.buffer.length);
                            writeSlice(txin.script.buffer);
                            writeUInt32(txin.sequence)
                        });
                        writeVarInt(this.outs.length);
                        this.outs.forEach(function(txout) {
                            writeUInt64(txout.value);
                            writeVarInt(txout.script.buffer.length);
                            writeSlice(txout.script.buffer)
                        });
                        writeUInt32(this.locktime);
                        return buffer
                    };
                    Transaction.prototype.toHex = function() {
                        return this.toBuffer().toString("hex")
                    };
                    Transaction.prototype.hashForSignature = function(inIndex, prevOutScript, hashType) {
                        if (arguments[0] instanceof Script) {
                            console.warn("hashForSignature(prevOutScript, inIndex, ...) has been deprecated. Use hashForSignature(inIndex, prevOutScript, ...)");
                            var tmp = arguments[0];
                            inIndex = arguments[1];
                            prevOutScript = tmp
                        }
                        assert(inIndex >= 0, "Invalid vin index");
                        assert(inIndex < this.ins.length, "Invalid vin index");
                        assert(prevOutScript instanceof Script, "Invalid Script object");
                        var txTmp = this.clone();
                        var hashScript = prevOutScript.without(opcodes.OP_CODESEPARATOR);
                        txTmp.ins.forEach(function(txin) {
                            txin.script = Script.EMPTY
                        });
                        txTmp.ins[inIndex].script = hashScript;
                        var hashTypeModifier = hashType & 31;
                        if (hashTypeModifier === Transaction.SIGHASH_NONE) {
                            assert(false, "SIGHASH_NONE not yet supported")
                        } else if (hashTypeModifier === Transaction.SIGHASH_SINGLE) {
                            assert(false, "SIGHASH_SINGLE not yet supported")
                        }
                        if (hashType & Transaction.SIGHASH_ANYONECANPAY) {
                            assert(false, "SIGHASH_ANYONECANPAY not yet supported")
                        }
                        var hashTypeBuffer = new Buffer(4);
                        hashTypeBuffer.writeInt32LE(hashType, 0);
                        var buffer = Buffer.concat([txTmp.toBuffer(), hashTypeBuffer]);
                        return crypto.hash256(buffer)
                    };
                    Transaction.prototype.getHash = function() {
                        return crypto.hash256(this.toBuffer())
                    };
                    Transaction.prototype.getId = function() {
                        var buffer = this.getHash();
                        Array.prototype.reverse.call(buffer);
                        return buffer.toString("hex")
                    };
                    Transaction.prototype.clone = function() {
                        var newTx = new Transaction;
                        newTx.version = this.version;
                        newTx.locktime = this.locktime;
                        newTx.ins = this.ins.map(function(txin) {
                            return {
                                hash: txin.hash,
                                index: txin.index,
                                script: txin.script,
                                sequence: txin.sequence
                            }
                        });
                        newTx.outs = this.outs.map(function(txout) {
                            return {
                                script: txout.script,
                                value: txout.value
                            }
                        });
                        return newTx
                    };
                    Transaction.fromBuffer = function(buffer) {
                        var offset = 0;

                        function readSlice(n) {
                            offset += n;
                            return buffer.slice(offset - n, offset)
                        }

                        function readUInt32() {
                            var i = buffer.readUInt32LE(offset);
                            offset += 4;
                            return i
                        }

                        function readUInt64() {
                            var i = bufferutils.readUInt64LE(buffer, offset);
                            offset += 8;
                            return i
                        }

                        function readVarInt() {
                            var vi = bufferutils.readVarInt(buffer, offset);
                            offset += vi.size;
                            return vi.number
                        }
                        var tx = new Transaction;
                        tx.version = readUInt32();
                        var vinLen = readVarInt();
                        for (var i = 0; i < vinLen; ++i) {
                            var hash = readSlice(32);
                            var vout = readUInt32();
                            var scriptLen = readVarInt();
                            var script = readSlice(scriptLen);
                            var sequence = readUInt32();
                            tx.ins.push({
                                hash: hash,
                                index: vout,
                                script: Script.fromBuffer(script),
                                sequence: sequence
                            })
                        }
                        var voutLen = readVarInt();
                        for (i = 0; i < voutLen; ++i) {
                            var value = readUInt64();
                            var scriptLen = readVarInt();
                            var script = readSlice(scriptLen);
                            tx.outs.push({
                                value: value,
                                script: Script.fromBuffer(script)
                            })
                        }
                        tx.locktime = readUInt32();
                        assert.equal(offset, buffer.length, "Transaction has unexpected data");
                        return tx
                    };
                    Transaction.fromHex = function(hex) {
                        return Transaction.fromBuffer(new Buffer(hex, "hex"))
                    };
                    Transaction.prototype.setInputScript = function(index, script) {
                        this.ins[index].script = script
                    };
                    Transaction.prototype.sign = function(index, privKey, hashType) {
                        console.warn("Transaction.prototype.sign is deprecated.  Use TransactionBuilder instead.");
                        var prevOutScript = privKey.pub.getAddress().toOutputScript();
                        var signature = this.signInput(index, prevOutScript, privKey, hashType);
                        var scriptSig = scripts.pubKeyHashInput(signature, privKey.pub);
                        this.setInputScript(index, scriptSig)
                    };
                    Transaction.prototype.signInput = function(index, prevOutScript, privKey, hashType) {
                        console.warn("Transaction.prototype.signInput is deprecated.  Use TransactionBuilder instead.");
                        hashType = hashType || Transaction.SIGHASH_ALL;
                        var hash = this.hashForSignature(index, prevOutScript, hashType);
                        var signature = privKey.sign(hash);
                        return signature.toScriptSignature(hashType)
                    };
                    Transaction.prototype.validateInput = function(index, prevOutScript, pubKey, buffer) {
                        console.warn("Transaction.prototype.validateInput is deprecated.  Use TransactionBuilder instead.");
                        var parsed = ECSignature.parseScriptSignature(buffer);
                        var hash = this.hashForSignature(index, prevOutScript, parsed.hashType);
                        return pubKey.verify(hash, parsed.signature)
                    };
                    module.exports = Transaction
                }).call(this, require("buffer").Buffer)
            }, {
                "./address": 58,
                "./bufferutils": 59,
                "./crypto": 61,
                "./ecsignature": 65,
                "./opcodes": 69,
                "./script": 70,
                "./scripts": 71,
                assert: 75,
                buffer: 78
            }
        ],
        73: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var scripts = require("./scripts");
                    var ECPubKey = require("./ecpubkey");
                    var ECSignature = require("./ecsignature");
                    var Script = require("./script");
                    var Transaction = require("./transaction");

                    function TransactionBuilder() {
                        this.prevOutMap = {};
                        this.prevOutScripts = {};
                        this.prevOutTypes = {};
                        this.signatures = [];
                        this.tx = new Transaction
                    }
                    TransactionBuilder.fromTransaction = function(transaction) {
                        var txb = new TransactionBuilder;
                        transaction.ins.forEach(function(txin) {
                            txb.addInput(txin.hash, txin.index, txin.sequence)
                        });
                        transaction.outs.forEach(function(txout) {
                            txb.addOutput(txout.script, txout.value)
                        });
                        transaction.ins.forEach(function(txin) {
                            if (txin.script.buffer.length === 0) return;
                            var redeemScript;
                            var scriptSig = txin.script;
                            var scriptType = scripts.classifyInput(scriptSig);
                            if (scriptType === "scripthash") {
                                redeemScript = Script.fromBuffer(scriptSig.chunks.slice(-1)[0]);
                                scriptSig = Script.fromChunks(scriptSig.chunks.slice(0, -1));
                                scriptType = scripts.classifyInput(scriptSig);
                                assert.equal(scripts.classifyOutput(redeemScript), scriptType, "Non-matching scriptSig and scriptPubKey in input")
                            }
                            var hashType, pubKeys, signatures;
                            switch (scriptType) {
                                case "pubkeyhash":
                                    var parsed = ECSignature.parseScriptSignature(scriptSig.chunks[0]);
                                    var pubKey = ECPubKey.fromBuffer(scriptSig.chunks[1]);
                                    hashType = parsed.hashType;
                                    pubKeys = [pubKey];
                                    signatures = [parsed.signature];
                                    break;
                                case "multisig":
                                    var scriptSigs = scriptSig.chunks.slice(1);
                                    var parsed = scriptSigs.map(function(scriptSig) {
                                        return ECSignature.parseScriptSignature(scriptSig)
                                    });
                                    hashType = parsed[0].hashType;
                                    pubKeys = [];
                                    signatures = parsed.map(function(p) {
                                        return p.signature
                                    });
                                    break;
                                case "pubkey":
                                    var parsed = ECSignature.parseScriptSignature(scriptSig.chunks[0]);
                                    hashType = parsed.hashType;
                                    pubKeys = [];
                                    signatures = [parsed.signature];
                                    break;
                                default:
                                    assert(false, scriptType + " not supported")
                            }
                            txb.signatures[txin.index] = {
                                hashType: hashType,
                                pubKeys: pubKeys,
                                redeemScript: redeemScript,
                                scriptType: scriptType,
                                signatures: signatures
                            }
                        });
                        return txb
                    };
                    TransactionBuilder.prototype.addInput = function(prevTx, index, sequence, prevOutScript) {
                        var prevOutHash;
                        if (typeof prevTx === "string") {
                            prevOutHash = new Buffer(prevTx, "hex");
                            Array.prototype.reverse.call(prevOutHash)
                        } else if (prevTx instanceof Transaction) {
                            prevOutHash = prevTx.getHash();
                            prevOutScript = prevTx.outs[index].script
                        } else {
                            prevOutHash = prevTx
                        }
                        var prevOutType;
                        if (prevOutScript !== undefined) {
                            prevOutType = scripts.classifyOutput(prevOutScript);
                            assert.notEqual(prevOutType, "nonstandard", "PrevOutScript not supported (nonstandard)")
                        }
                        assert(this.signatures.every(function(input) {
                            return input.hashType & Transaction.SIGHASH_ANYONECANPAY
                        }), "No, this would invalidate signatures");
                        var prevOut = prevOutHash.toString("hex") + ":" + index;
                        assert(!(prevOut in this.prevOutMap), "Transaction is already an input");
                        var vout = this.tx.addInput(prevOutHash, index, sequence);
                        this.prevOutMap[prevOut] = true;
                        this.prevOutScripts[vout] = prevOutScript;
                        this.prevOutTypes[vout] = prevOutType;
                        return vout
                    };
                    TransactionBuilder.prototype.addOutput = function(scriptPubKey, value) {
                        assert(this.signatures.every(function(signature) {
                            return (signature.hashType & 31) === Transaction.SIGHASH_SINGLE
                        }), "No, this would invalidate signatures");
                        return this.tx.addOutput(scriptPubKey, value)
                    };
                    TransactionBuilder.prototype.build = function() {
                        return this.__build(false)
                    };
                    TransactionBuilder.prototype.buildIncomplete = function() {
                        return this.__build(true)
                    };
                    TransactionBuilder.prototype.__build = function(allowIncomplete) {
                        if (!allowIncomplete) {
                            assert(this.tx.ins.length > 0, "Transaction has no inputs");
                            assert(this.tx.outs.length > 0, "Transaction has no outputs");
                            assert(this.signatures.length > 0, "Transaction has no signatures");
                            assert.equal(this.signatures.length, this.tx.ins.length, "Transaction is missing signatures")
                        }
                        var tx = this.tx.clone();
                        this.signatures.forEach(function(input, index) {
                            var scriptSig;
                            var scriptType = input.scriptType;
                            var signatures = input.signatures.map(function(signature) {
                                return signature.toScriptSignature(input.hashType)
                            });
                            switch (scriptType) {
                                case "pubkeyhash":
                                    var signature = signatures[0];
                                    var pubKey = input.pubKeys[0];
                                    scriptSig = scripts.pubKeyHashInput(signature, pubKey);
                                    break;
                                case "multisig":
                                    var redeemScript = allowIncomplete ? undefined : input.redeemScript;
                                    scriptSig = scripts.multisigInput(signatures, redeemScript);
                                    break;
                                case "pubkey":
                                    var signature = signatures[0];
                                    scriptSig = scripts.pubKeyInput(signature);
                                    break;
                                default:
                                    assert(false, scriptType + " not supported")
                            }
                            if (input.redeemScript) {
                                scriptSig = scripts.scriptHashInput(scriptSig, input.redeemScript)
                            }
                            tx.setInputScript(index, scriptSig)
                        });
                        return tx
                    };
                    TransactionBuilder.prototype.sign = function(index, privKey, redeemScript, hashType) {
                        assert(this.tx.ins.length >= index, "No input at index: " + index);
                        hashType = hashType || Transaction.SIGHASH_ALL;
                        var prevOutScript = this.prevOutScripts[index];
                        var prevOutType = this.prevOutTypes[index];
                        var scriptType, hash;
                        if (redeemScript) {
                            prevOutScript = prevOutScript || scripts.scriptHashOutput(redeemScript.getHash());
                            prevOutType = prevOutType || "scripthash";
                            assert.equal(prevOutType, "scripthash", "PrevOutScript must be P2SH");
                            scriptType = scripts.classifyOutput(redeemScript);
                            assert.notEqual(scriptType, "scripthash", "RedeemScript can't be P2SH");
                            assert.notEqual(scriptType, "nonstandard", "RedeemScript not supported (nonstandard)");
                            hash = this.tx.hashForSignature(index, redeemScript, hashType)
                        } else {
                            prevOutScript = prevOutScript || privKey.pub.getAddress().toOutputScript();
                            scriptType = prevOutType || "pubkeyhash";
                            assert.notEqual(scriptType, "scripthash", "PrevOutScript requires redeemScript");
                            hash = this.tx.hashForSignature(index, prevOutScript, hashType)
                        } if (!(index in this.signatures)) {
                            this.signatures[index] = {
                                hashType: hashType,
                                pubKeys: [],
                                redeemScript: redeemScript,
                                scriptType: scriptType,
                                signatures: []
                            }
                        }
                        var input = this.signatures[index];
                        assert.equal(input.hashType, hashType, "Inconsistent hashType");
                        assert.deepEqual(input.redeemScript, redeemScript, "Inconsistent redeemScript");
                        var signature = privKey.sign(hash);
                        input.pubKeys.push(privKey.pub);
                        input.signatures.push(signature)
                    };
                    module.exports = TransactionBuilder
                }).call(this, require("buffer").Buffer)
            }, {
                "./ecpubkey": 64,
                "./ecsignature": 65,
                "./script": 70,
                "./scripts": 71,
                "./transaction": 72,
                assert: 75,
                buffer: 78
            }
        ],
        74: [
            function(require, module, exports) {
                (function(Buffer) {
                    var assert = require("assert");
                    var crypto = require("crypto");
                    var networks = require("./networks");
                    var Address = require("./address");
                    var HDNode = require("./hdnode");
                    var TransactionBuilder = require("./transaction_builder");
                    var Script = require("./script");

                    function Wallet(seed, network, unspents) {
                        seed = seed || crypto.randomBytes(32);
                        network = network || networks.bitcoin;
                        var masterKey = HDNode.fromSeedBuffer(seed, network);
                        var accountZero = masterKey.deriveHardened(0);
                        var externalAccount = accountZero.derive(0);
                        var internalAccount = accountZero.derive(1);
                        this.addresses = [];
                        this.changeAddresses = [];
                        this.network = network;
                        this.outputs = unspents ? processUnspentOutputs(unspents) : {};
                        var me = this;
                        this.newMasterKey = function(seed) {
                            console.warn("newMasterKey is deprecated, please make a new Wallet instance instead");
                            seed = seed || crypto.randomBytes(32);
                            masterKey = HDNode.fromSeedBuffer(seed, network);
                            accountZero = masterKey.deriveHardened(0);
                            externalAccount = accountZero.derive(0);
                            internalAccount = accountZero.derive(1);
                            me.addresses = [];
                            me.changeAddresses = [];
                            me.outputs = {}
                        };
                        this.getMasterKey = function() {
                            return masterKey
                        };
                        this.getAccountZero = function() {
                            return accountZero
                        };
                        this.getExternalAccount = function() {
                            return externalAccount
                        };
                        this.getInternalAccount = function() {
                            return internalAccount
                        }
                    }
                    Wallet.prototype.createTx = function(to, value, fixedFee, changeAddress) {
                        assert(value > this.network.dustThreshold, value + " must be above dust threshold (" + this.network.dustThreshold + " Satoshis)");
                        var utxos = getCandidateOutputs(this.outputs, value);
                        var accum = 0;
                        var subTotal = value;
                        var addresses = [];
                        var txb = new TransactionBuilder;
                        txb.addOutput(to, value);
                        for (var i = 0; i < utxos.length; ++i) {
                            var utxo = utxos[i];
                            addresses.push(utxo.address);
                            var outpoint = utxo.from.split(":");
                            txb.addInput(outpoint[0], parseInt(outpoint[1]));
                            var fee = fixedFee === undefined ? estimatePaddedFee(txb.buildIncomplete(), this.network) : fixedFee;
                            accum += utxo.value;
                            subTotal = value + fee;
                            if (accum >= subTotal) {
                                var change = accum - subTotal;
                                if (change > this.network.dustThreshold) {
                                    txb.addOutput(changeAddress || this.getChangeAddress(), change)
                                }
                                break
                            }
                        }
                        assert(accum >= subTotal, "Not enough funds (incl. fee): " + accum + " < " + subTotal);
                        return this.signWith(txb, addresses).build()
                    };
                    Wallet.prototype.processPendingTx = function(tx) {
                        this.__processTx(tx, true)
                    };
                    Wallet.prototype.processConfirmedTx = function(tx) {
                        this.__processTx(tx, false)
                    };
                    Wallet.prototype.__processTx = function(tx, isPending) {
                        var txid = tx.getId();
                        tx.outs.forEach(function(txOut, i) {
                            var address;
                            try {
                                address = Address.fromOutputScript(txOut.script, this.network).toString()
                            } catch (e) {
                                if (!e.message.match(/has no matching Address/)) throw e
                            }
                            var myAddresses = this.addresses.concat(this.changeAddresses);
                            if (myAddresses.indexOf(address) > -1) {
                                var output = txid + ":" + i;
                                this.outputs[output] = {
                                    from: output,
                                    value: txOut.value,
                                    address: address,
                                    pending: isPending
                                }
                            }
                        }, this);
                        tx.ins.forEach(function(txIn, i) {
                            var txinId = new Buffer(txIn.hash);
                            Array.prototype.reverse.call(txinId);
                            txinId = txinId.toString("hex");
                            var output = txinId + ":" + txIn.index;
                            if (!(output in this.outputs)) return;
                            if (isPending) {
                                this.outputs[output].to = txid + ":" + i;
                                this.outputs[output].pending = true
                            } else {
                                delete this.outputs[output]
                            }
                        }, this)
                    };
                    Wallet.prototype.generateAddress = function() {
                        var k = this.addresses.length;
                        var address = this.getExternalAccount().derive(k).getAddress();
                        this.addresses.push(address.toString());
                        return this.getReceiveAddress()
                    };
                    Wallet.prototype.generateChangeAddress = function() {
                        var k = this.changeAddresses.length;
                        var address = this.getInternalAccount().derive(k).getAddress();
                        this.changeAddresses.push(address.toString());
                        return this.getChangeAddress()
                    };
                    Wallet.prototype.getBalance = function() {
                        return this.getUnspentOutputs().reduce(function(accum, output) {
                            return accum + output.value
                        }, 0)
                    };
                    Wallet.prototype.getChangeAddress = function() {
                        if (this.changeAddresses.length === 0) {
                            this.generateChangeAddress()
                        }
                        return this.changeAddresses[this.changeAddresses.length - 1]
                    };
                    Wallet.prototype.getInternalPrivateKey = function(index) {
                        return this.getInternalAccount().derive(index).privKey
                    };
                    Wallet.prototype.getPrivateKey = function(index) {
                        return this.getExternalAccount().derive(index).privKey
                    };
                    Wallet.prototype.getPrivateKeyForAddress = function(address) {
                        var index;
                        if ((index = this.addresses.indexOf(address)) > -1) {
                            return this.getPrivateKey(index)
                        }
                        if ((index = this.changeAddresses.indexOf(address)) > -1) {
                            return this.getInternalPrivateKey(index)
                        }
                        assert(false, "Unknown address. Make sure the address is from the keychain and has been generated")
                    };
                    Wallet.prototype.getReceiveAddress = function() {
                        if (this.addresses.length === 0) {
                            this.generateAddress()
                        }
                        return this.addresses[this.addresses.length - 1]
                    };
                    Wallet.prototype.getUnspentOutputs = function() {
                        var utxo = [];
                        for (var key in this.outputs) {
                            var output = this.outputs[key];
                            if (!output.to) utxo.push(outputToUnspentOutput(output))
                        }
                        return utxo
                    };
                    Wallet.prototype.setUnspentOutputs = function(utxo) {
                        console.warn("setUnspentOutputs is deprecated, please use the constructor option instead");
                        this.outputs = processUnspentOutputs(utxo)
                    };
                    Wallet.prototype.signWith = function(txb, addresses) {
                        addresses.forEach(function(address, i) {
                            var privKey = this.getPrivateKeyForAddress(address);
                            txb.sign(i, privKey)
                        }, this);
                        return txb
                    };

                    function outputToUnspentOutput(output) {
                        var hashAndIndex = output.from.split(":");
                        return {
                            hash: hashAndIndex[0],
                            index: parseInt(hashAndIndex[1]),
                            address: output.address,
                            value: output.value,
                            pending: output.pending
                        }
                    }

                    function estimatePaddedFee(tx, network) {
                        var tmpTx = tx.clone();
                        tmpTx.addOutput(Script.EMPTY, network.dustSoftThreshold || 0);
                        return network.estimateFee(tmpTx)
                    }

                    function processUnspentOutputs(utxos) {
                        var outputs = {};
                        utxos.forEach(function(utxo) {
                            var hash = new Buffer(utxo.hash, "hex");
                            var index = utxo.index;
                            var address = utxo.address;
                            var value = utxo.value;
                            if (index === undefined) index = utxo.outputIndex;
                            assert.equal(hash.length, 32, "Expected hash length of 32, got " + hash.length);
                            assert.equal(typeof index, "number", "Expected number index, got " + index);
                            assert.doesNotThrow(function() {
                                Address.fromBase58Check(address)
                            }, "Expected Base58 Address, got " + address);
                            assert.equal(typeof value, "number", "Expected number value, got " + value);
                            var key = utxo.hash + ":" + utxo.index;
                            outputs[key] = {
                                from: key,
                                address: address,
                                value: value,
                                pending: utxo.pending
                            }
                        });
                        return outputs
                    }

                    function getCandidateOutputs(outputs) {
                        var unspent = [];
                        for (var key in outputs) {
                            var output = outputs[key];
                            if (!output.pending) unspent.push(output)
                        }
                        var sortByValueDesc = unspent.sort(function(o1, o2) {
                            return o2.value - o1.value
                        });
                        return sortByValueDesc
                    }
                    module.exports = Wallet
                }).call(this, require("buffer").Buffer)
            }, {
                "./address": 58,
                "./hdnode": 66,
                "./networks": 68,
                "./script": 70,
                "./transaction_builder": 73,
                assert: 75,
                buffer: 78,
                crypto: 9
            }
        ],
        75: [
            function(require, module, exports) {
                var util = require("util/");
                var pSlice = Array.prototype.slice;
                var hasOwn = Object.prototype.hasOwnProperty;
                var assert = module.exports = ok;
                assert.AssertionError = function AssertionError(options) {
                    this.name = "AssertionError";
                    this.actual = options.actual;
                    this.expected = options.expected;
                    this.operator = options.operator;
                    if (options.message) {
                        this.message = options.message;
                        this.generatedMessage = false
                    } else {
                        this.message = getMessage(this);
                        this.generatedMessage = true
                    }
                    var stackStartFunction = options.stackStartFunction || fail;
                    if (Error.captureStackTrace) {
                        Error.captureStackTrace(this, stackStartFunction)
                    } else {
                        var err = new Error;
                        if (err.stack) {
                            var out = err.stack;
                            var fn_name = stackStartFunction.name;
                            var idx = out.indexOf("\n" + fn_name);
                            if (idx >= 0) {
                                var next_line = out.indexOf("\n", idx + 1);
                                out = out.substring(next_line + 1)
                            }
                            this.stack = out
                        }
                    }
                };
                util.inherits(assert.AssertionError, Error);

                function replacer(key, value) {
                    if (util.isUndefined(value)) {
                        return "" + value
                    }
                    if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
                        return value.toString()
                    }
                    if (util.isFunction(value) || util.isRegExp(value)) {
                        return value.toString()
                    }
                    return value
                }

                function truncate(s, n) {
                    if (util.isString(s)) {
                        return s.length < n ? s : s.slice(0, n)
                    } else {
                        return s
                    }
                }

                function getMessage(self) {
                    return truncate(JSON.stringify(self.actual, replacer), 128) + " " + self.operator + " " + truncate(JSON.stringify(self.expected, replacer), 128)
                }

                function fail(actual, expected, message, operator, stackStartFunction) {
                    throw new assert.AssertionError({
                        message: message,
                        actual: actual,
                        expected: expected,
                        operator: operator,
                        stackStartFunction: stackStartFunction
                    })
                }
                assert.fail = fail;

                function ok(value, message) {
                    if (!value) fail(value, true, message, "==", assert.ok)
                }
                assert.ok = ok;
                assert.equal = function equal(actual, expected, message) {
                    if (actual != expected) fail(actual, expected, message, "==", assert.equal)
                };
                assert.notEqual = function notEqual(actual, expected, message) {
                    if (actual == expected) {
                        fail(actual, expected, message, "!=", assert.notEqual)
                    }
                };
                assert.deepEqual = function deepEqual(actual, expected, message) {
                    if (!_deepEqual(actual, expected)) {
                        fail(actual, expected, message, "deepEqual", assert.deepEqual)
                    }
                };

                function _deepEqual(actual, expected) {
                    if (actual === expected) {
                        return true
                    } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
                        if (actual.length != expected.length) return false;
                        for (var i = 0; i < actual.length; i++) {
                            if (actual[i] !== expected[i]) return false
                        }
                        return true
                    } else if (util.isDate(actual) && util.isDate(expected)) {
                        return actual.getTime() === expected.getTime()
                    } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
                        return actual.source === expected.source && actual.global === expected.global && actual.multiline === expected.multiline && actual.lastIndex === expected.lastIndex && actual.ignoreCase === expected.ignoreCase
                    } else if (!util.isObject(actual) && !util.isObject(expected)) {
                        return actual == expected
                    } else {
                        return objEquiv(actual, expected)
                    }
                }

                function isArguments(object) {
                    return Object.prototype.toString.call(object) == "[object Arguments]"
                }

                function objEquiv(a, b) {
                    if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b)) return false;
                    if (a.prototype !== b.prototype) return false;
                    if (isArguments(a)) {
                        if (!isArguments(b)) {
                            return false
                        }
                        a = pSlice.call(a);
                        b = pSlice.call(b);
                        return _deepEqual(a, b)
                    }
                    try {
                        var ka = objectKeys(a),
                            kb = objectKeys(b),
                            key, i
                    } catch (e) {
                        return false
                    }
                    if (ka.length != kb.length) return false;
                    ka.sort();
                    kb.sort();
                    for (i = ka.length - 1; i >= 0; i--) {
                        if (ka[i] != kb[i]) return false
                    }
                    for (i = ka.length - 1; i >= 0; i--) {
                        key = ka[i];
                        if (!_deepEqual(a[key], b[key])) return false
                    }
                    return true
                }
                assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
                    if (_deepEqual(actual, expected)) {
                        fail(actual, expected, message, "notDeepEqual", assert.notDeepEqual)
                    }
                };
                assert.strictEqual = function strictEqual(actual, expected, message) {
                    if (actual !== expected) {
                        fail(actual, expected, message, "===", assert.strictEqual)
                    }
                };
                assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
                    if (actual === expected) {
                        fail(actual, expected, message, "!==", assert.notStrictEqual)
                    }
                };

                function expectedException(actual, expected) {
                    if (!actual || !expected) {
                        return false
                    }
                    if (Object.prototype.toString.call(expected) == "[object RegExp]") {
                        return expected.test(actual)
                    } else if (actual instanceof expected) {
                        return true
                    } else if (expected.call({}, actual) === true) {
                        return true
                    }
                    return false
                }

                function _throws(shouldThrow, block, expected, message) {
                    var actual;
                    if (util.isString(expected)) {
                        message = expected;
                        expected = null
                    }
                    try {
                        block()
                    } catch (e) {
                        actual = e
                    }
                    message = (expected && expected.name ? " (" + expected.name + ")." : ".") + (message ? " " + message : ".");
                    if (shouldThrow && !actual) {
                        fail(actual, expected, "Missing expected exception" + message)
                    }
                    if (!shouldThrow && expectedException(actual, expected)) {
                        fail(actual, expected, "Got unwanted exception" + message)
                    }
                    if (shouldThrow && actual && expected && !expectedException(actual, expected) || !shouldThrow && actual) {
                        throw actual
                    }
                }
                assert.throws = function(block, error, message) {
                    _throws.apply(this, [true].concat(pSlice.call(arguments)))
                };
                assert.doesNotThrow = function(block, message) {
                    _throws.apply(this, [false].concat(pSlice.call(arguments)))
                };
                assert.ifError = function(err) {
                    if (err) {
                        throw err
                    }
                };
                var objectKeys = Object.keys || function(obj) {
                    var keys = [];
                    for (var key in obj) {
                        if (hasOwn.call(obj, key)) keys.push(key)
                    }
                    return keys
                }
            }, {
                "util/": 77
            }
        ],
        76: [
            function(require, module, exports) {
                module.exports = function isBuffer(arg) {
                    return arg && typeof arg === "object" && typeof arg.copy === "function" && typeof arg.fill === "function" && typeof arg.readUInt8 === "function"
                }
            }, {}
        ],
        77: [
            function(require, module, exports) {
                (function(process, global) {
                    var formatRegExp = /%[sdj%]/g;
                    exports.format = function(f) {
                        if (!isString(f)) {
                            var objects = [];
                            for (var i = 0; i < arguments.length; i++) {
                                objects.push(inspect(arguments[i]))
                            }
                            return objects.join(" ")
                        }
                        var i = 1;
                        var args = arguments;
                        var len = args.length;
                        var str = String(f).replace(formatRegExp, function(x) {
                            if (x === "%%") return "%";
                            if (i >= len) return x;
                            switch (x) {
                                case "%s":
                                    return String(args[i++]);
                                case "%d":
                                    return Number(args[i++]);
                                case "%j":
                                    try {
                                        return JSON.stringify(args[i++])
                                    } catch (_) {
                                        return "[Circular]"
                                    }
                                default:
                                    return x
                            }
                        });
                        for (var x = args[i]; i < len; x = args[++i]) {
                            if (isNull(x) || !isObject(x)) {
                                str += " " + x
                            } else {
                                str += " " + inspect(x)
                            }
                        }
                        return str
                    };
                    exports.deprecate = function(fn, msg) {
                        if (isUndefined(global.process)) {
                            return function() {
                                return exports.deprecate(fn, msg).apply(this, arguments)
                            }
                        }
                        if (process.noDeprecation === true) {
                            return fn
                        }
                        var warned = false;

                        function deprecated() {
                            if (!warned) {
                                if (process.throwDeprecation) {
                                    throw new Error(msg)
                                } else if (process.traceDeprecation) {
                                    console.trace(msg)
                                } else {
                                    console.error(msg)
                                }
                                warned = true
                            }
                            return fn.apply(this, arguments)
                        }
                        return deprecated
                    };
                    var debugs = {};
                    var debugEnviron;
                    exports.debuglog = function(set) {
                        if (isUndefined(debugEnviron)) debugEnviron = process.env.NODE_DEBUG || "";
                        set = set.toUpperCase();
                        if (!debugs[set]) {
                            if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
                                var pid = process.pid;
                                debugs[set] = function() {
                                    var msg = exports.format.apply(exports, arguments);
                                    console.error("%s %d: %s", set, pid, msg)
                                }
                            } else {
                                debugs[set] = function() {}
                            }
                        }
                        return debugs[set]
                    };

                    function inspect(obj, opts) {
                        var ctx = {
                            seen: [],
                            stylize: stylizeNoColor
                        };
                        if (arguments.length >= 3) ctx.depth = arguments[2];
                        if (arguments.length >= 4) ctx.colors = arguments[3];
                        if (isBoolean(opts)) {
                            ctx.showHidden = opts
                        } else if (opts) {
                            exports._extend(ctx, opts)
                        }
                        if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
                        if (isUndefined(ctx.depth)) ctx.depth = 2;
                        if (isUndefined(ctx.colors)) ctx.colors = false;
                        if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
                        if (ctx.colors) ctx.stylize = stylizeWithColor;
                        return formatValue(ctx, obj, ctx.depth)
                    }
                    exports.inspect = inspect;
                    inspect.colors = {
                        bold: [1, 22],
                        italic: [3, 23],
                        underline: [4, 24],
                        inverse: [7, 27],
                        white: [37, 39],
                        grey: [90, 39],
                        black: [30, 39],
                        blue: [34, 39],
                        cyan: [36, 39],
                        green: [32, 39],
                        magenta: [35, 39],
                        red: [31, 39],
                        yellow: [33, 39]
                    };
                    inspect.styles = {
                        special: "cyan",
                        number: "yellow",
                        "boolean": "yellow",
                        undefined: "grey",
                        "null": "bold",
                        string: "green",
                        date: "magenta",
                        regexp: "red"
                    };

                    function stylizeWithColor(str, styleType) {
                        var style = inspect.styles[styleType];
                        if (style) {
                            return "[" + inspect.colors[style][0] + "m" + str + "[" + inspect.colors[style][1] + "m"
                        } else {
                            return str
                        }
                    }

                    function stylizeNoColor(str, styleType) {
                        return str
                    }

                    function arrayToHash(array) {
                        var hash = {};
                        array.forEach(function(val, idx) {
                            hash[val] = true
                        });
                        return hash
                    }

                    function formatValue(ctx, value, recurseTimes) {
                        if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== exports.inspect && !(value.constructor && value.constructor.prototype === value)) {
                            var ret = value.inspect(recurseTimes, ctx);
                            if (!isString(ret)) {
                                ret = formatValue(ctx, ret, recurseTimes)
                            }
                            return ret
                        }
                        var primitive = formatPrimitive(ctx, value);
                        if (primitive) {
                            return primitive
                        }
                        var keys = Object.keys(value);
                        var visibleKeys = arrayToHash(keys);
                        if (ctx.showHidden) {
                            keys = Object.getOwnPropertyNames(value)
                        }
                        if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
                            return formatError(value)
                        }
                        if (keys.length === 0) {
                            if (isFunction(value)) {
                                var name = value.name ? ": " + value.name : "";
                                return ctx.stylize("[Function" + name + "]", "special")
                            }
                            if (isRegExp(value)) {
                                return ctx.stylize(RegExp.prototype.toString.call(value), "regexp")
                            }
                            if (isDate(value)) {
                                return ctx.stylize(Date.prototype.toString.call(value), "date")
                            }
                            if (isError(value)) {
                                return formatError(value)
                            }
                        }
                        var base = "",
                            array = false,
                            braces = ["{", "}"];
                        if (isArray(value)) {
                            array = true;
                            braces = ["[", "]"]
                        }
                        if (isFunction(value)) {
                            var n = value.name ? ": " + value.name : "";
                            base = " [Function" + n + "]"
                        }
                        if (isRegExp(value)) {
                            base = " " + RegExp.prototype.toString.call(value)
                        }
                        if (isDate(value)) {
                            base = " " + Date.prototype.toUTCString.call(value)
                        }
                        if (isError(value)) {
                            base = " " + formatError(value)
                        }
                        if (keys.length === 0 && (!array || value.length == 0)) {
                            return braces[0] + base + braces[1]
                        }
                        if (recurseTimes < 0) {
                            if (isRegExp(value)) {
                                return ctx.stylize(RegExp.prototype.toString.call(value), "regexp")
                            } else {
                                return ctx.stylize("[Object]", "special")
                            }
                        }
                        ctx.seen.push(value);
                        var output;
                        if (array) {
                            output = formatArray(ctx, value, recurseTimes, visibleKeys, keys)
                        } else {
                            output = keys.map(function(key) {
                                return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array)
                            })
                        }
                        ctx.seen.pop();
                        return reduceToSingleString(output, base, braces)
                    }

                    function formatPrimitive(ctx, value) {
                        if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
                        if (isString(value)) {
                            var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                            return ctx.stylize(simple, "string")
                        }
                        if (isNumber(value)) return ctx.stylize("" + value, "number");
                        if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
                        if (isNull(value)) return ctx.stylize("null", "null")
                    }

                    function formatError(value) {
                        return "[" + Error.prototype.toString.call(value) + "]"
                    }

                    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                        var output = [];
                        for (var i = 0, l = value.length; i < l; ++i) {
                            if (hasOwnProperty(value, String(i))) {
                                output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true))
                            } else {
                                output.push("")
                            }
                        }
                        keys.forEach(function(key) {
                            if (!key.match(/^\d+$/)) {
                                output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true))
                            }
                        });
                        return output
                    }

                    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                        var name, str, desc;
                        desc = Object.getOwnPropertyDescriptor(value, key) || {
                            value: value[key]
                        };
                        if (desc.get) {
                            if (desc.set) {
                                str = ctx.stylize("[Getter/Setter]", "special")
                            } else {
                                str = ctx.stylize("[Getter]", "special")
                            }
                        } else {
                            if (desc.set) {
                                str = ctx.stylize("[Setter]", "special")
                            }
                        } if (!hasOwnProperty(visibleKeys, key)) {
                            name = "[" + key + "]"
                        }
                        if (!str) {
                            if (ctx.seen.indexOf(desc.value) < 0) {
                                if (isNull(recurseTimes)) {
                                    str = formatValue(ctx, desc.value, null)
                                } else {
                                    str = formatValue(ctx, desc.value, recurseTimes - 1)
                                } if (str.indexOf("\n") > -1) {
                                    if (array) {
                                        str = str.split("\n").map(function(line) {
                                            return "  " + line
                                        }).join("\n").substr(2)
                                    } else {
                                        str = "\n" + str.split("\n").map(function(line) {
                                            return "   " + line
                                        }).join("\n")
                                    }
                                }
                            } else {
                                str = ctx.stylize("[Circular]", "special")
                            }
                        }
                        if (isUndefined(name)) {
                            if (array && key.match(/^\d+$/)) {
                                return str
                            }
                            name = JSON.stringify("" + key);
                            if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                                name = name.substr(1, name.length - 2);
                                name = ctx.stylize(name, "name")
                            } else {
                                name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
                                name = ctx.stylize(name, "string")
                            }
                        }
                        return name + ": " + str
                    }

                    function reduceToSingleString(output, base, braces) {
                        var numLinesEst = 0;
                        var length = output.reduce(function(prev, cur) {
                            numLinesEst++;
                            if (cur.indexOf("\n") >= 0) numLinesEst++;
                            return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1
                        }, 0);
                        if (length > 60) {
                            return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1]
                        }
                        return braces[0] + base + " " + output.join(", ") + " " + braces[1]
                    }

                    function isArray(ar) {
                        return Array.isArray(ar)
                    }
                    exports.isArray = isArray;

                    function isBoolean(arg) {
                        return typeof arg === "boolean"
                    }
                    exports.isBoolean = isBoolean;

                    function isNull(arg) {
                        return arg === null
                    }
                    exports.isNull = isNull;

                    function isNullOrUndefined(arg) {
                        return arg == null
                    }
                    exports.isNullOrUndefined = isNullOrUndefined;

                    function isNumber(arg) {
                        return typeof arg === "number"
                    }
                    exports.isNumber = isNumber;

                    function isString(arg) {
                        return typeof arg === "string"
                    }
                    exports.isString = isString;

                    function isSymbol(arg) {
                        return typeof arg === "symbol"
                    }
                    exports.isSymbol = isSymbol;

                    function isUndefined(arg) {
                        return arg === void 0
                    }
                    exports.isUndefined = isUndefined;

                    function isRegExp(re) {
                        return isObject(re) && objectToString(re) === "[object RegExp]"
                    }
                    exports.isRegExp = isRegExp;

                    function isObject(arg) {
                        return typeof arg === "object" && arg !== null
                    }
                    exports.isObject = isObject;

                    function isDate(d) {
                        return isObject(d) && objectToString(d) === "[object Date]"
                    }
                    exports.isDate = isDate;

                    function isError(e) {
                        return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error)
                    }
                    exports.isError = isError;

                    function isFunction(arg) {
                        return typeof arg === "function"
                    }
                    exports.isFunction = isFunction;

                    function isPrimitive(arg) {
                        return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined"
                    }
                    exports.isPrimitive = isPrimitive;
                    exports.isBuffer = require("./support/isBuffer");

                    function objectToString(o) {
                        return Object.prototype.toString.call(o)
                    }

                    function pad(n) {
                        return n < 10 ? "0" + n.toString(10) : n.toString(10)
                    }
                    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                    function timestamp() {
                        var d = new Date;
                        var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");
                        return [d.getDate(), months[d.getMonth()], time].join(" ")
                    }
                    exports.log = function() {
                        console.log("%s - %s", timestamp(), exports.format.apply(exports, arguments))
                    };
                    exports.inherits = require("inherits");
                    exports._extend = function(origin, add) {
                        if (!add || !isObject(add)) return origin;
                        var keys = Object.keys(add);
                        var i = keys.length;
                        while (i--) {
                            origin[keys[i]] = add[keys[i]]
                        }
                        return origin
                    };

                    function hasOwnProperty(obj, prop) {
                        return Object.prototype.hasOwnProperty.call(obj, prop)
                    }
                }).call(this, require("_process"), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
            }, {
                "./support/isBuffer": 76,
                _process: 95,
                inherits: 94
            }
        ],
        78: [
            function(require, module, exports) {
                var base64 = require("base64-js");
                var ieee754 = require("ieee754");
                exports.Buffer = Buffer;
                exports.SlowBuffer = Buffer;
                exports.INSPECT_MAX_BYTES = 50;
                Buffer.poolSize = 8192;
                var TYPED_ARRAY_SUPPORT = function() {
                    try {
                        var buf = new ArrayBuffer(0);
                        var arr = new Uint8Array(buf);
                        arr.foo = function() {
                            return 42
                        };
                        return 42 === arr.foo() && typeof arr.subarray === "function" && new Uint8Array(1).subarray(1, 1).byteLength === 0
                    } catch (e) {
                        return false
                    }
                }();

                function Buffer(subject, encoding, noZero) {
                    if (!(this instanceof Buffer)) return new Buffer(subject, encoding, noZero);
                    var type = typeof subject;
                    var length;
                    if (type === "number") length = subject > 0 ? subject >>> 0 : 0;
                    else if (type === "string") {
                        if (encoding === "base64") subject = base64clean(subject);
                        length = Buffer.byteLength(subject, encoding)
                    } else if (type === "object" && subject !== null) {
                        if (subject.type === "Buffer" && isArray(subject.data)) subject = subject.data;
                        length = +subject.length > 0 ? Math.floor(+subject.length) : 0
                    } else throw new Error("First argument needs to be a number, array or string.");
                    var buf;
                    if (TYPED_ARRAY_SUPPORT) {
                        buf = Buffer._augment(new Uint8Array(length))
                    } else {
                        buf = this;
                        buf.length = length;
                        buf._isBuffer = true
                    }
                    var i;
                    if (TYPED_ARRAY_SUPPORT && typeof subject.byteLength === "number") {
                        buf._set(subject)
                    } else if (isArrayish(subject)) {
                        if (Buffer.isBuffer(subject)) {
                            for (i = 0; i < length; i++) buf[i] = subject.readUInt8(i)
                        } else {
                            for (i = 0; i < length; i++) buf[i] = (subject[i] % 256 + 256) % 256
                        }
                    } else if (type === "string") {
                        buf.write(subject, 0, encoding)
                    } else if (type === "number" && !TYPED_ARRAY_SUPPORT && !noZero) {
                        for (i = 0; i < length; i++) {
                            buf[i] = 0
                        }
                    }
                    return buf
                }
                Buffer.isEncoding = function(encoding) {
                    switch (String(encoding).toLowerCase()) {
                        case "hex":
                        case "utf8":
                        case "utf-8":
                        case "ascii":
                        case "binary":
                        case "base64":
                        case "raw":
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return true;
                        default:
                            return false
                    }
                };
                Buffer.isBuffer = function(b) {
                    return !!(b != null && b._isBuffer)
                };
                Buffer.byteLength = function(str, encoding) {
                    var ret;
                    str = str.toString();
                    switch (encoding || "utf8") {
                        case "hex":
                            ret = str.length / 2;
                            break;
                        case "utf8":
                        case "utf-8":
                            ret = utf8ToBytes(str).length;
                            break;
                        case "ascii":
                        case "binary":
                        case "raw":
                            ret = str.length;
                            break;
                        case "base64":
                            ret = base64ToBytes(str).length;
                            break;
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            ret = str.length * 2;
                            break;
                        default:
                            throw new Error("Unknown encoding")
                    }
                    return ret
                };
                Buffer.concat = function(list, totalLength) {
                    assert(isArray(list), "Usage: Buffer.concat(list[, length])");
                    if (list.length === 0) {
                        return new Buffer(0)
                    } else if (list.length === 1) {
                        return list[0]
                    }
                    var i;
                    if (totalLength === undefined) {
                        totalLength = 0;
                        for (i = 0; i < list.length; i++) {
                            totalLength += list[i].length
                        }
                    }
                    var buf = new Buffer(totalLength);
                    var pos = 0;
                    for (i = 0; i < list.length; i++) {
                        var item = list[i];
                        item.copy(buf, pos);
                        pos += item.length
                    }
                    return buf
                };
                Buffer.compare = function(a, b) {
                    assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), "Arguments must be Buffers");
                    var x = a.length;
                    var y = b.length;
                    for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
                    if (i !== len) {
                        x = a[i];
                        y = b[i]
                    }
                    if (x < y) {
                        return -1
                    }
                    if (y < x) {
                        return 1
                    }
                    return 0
                };

                function hexWrite(buf, string, offset, length) {
                    offset = Number(offset) || 0;
                    var remaining = buf.length - offset;
                    if (!length) {
                        length = remaining
                    } else {
                        length = Number(length);
                        if (length > remaining) {
                            length = remaining
                        }
                    }
                    var strLen = string.length;
                    assert(strLen % 2 === 0, "Invalid hex string");
                    if (length > strLen / 2) {
                        length = strLen / 2
                    }
                    for (var i = 0; i < length; i++) {
                        var byte = parseInt(string.substr(i * 2, 2), 16);
                        assert(!isNaN(byte), "Invalid hex string");
                        buf[offset + i] = byte
                    }
                    return i
                }

                function utf8Write(buf, string, offset, length) {
                    var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length);
                    return charsWritten
                }

                function asciiWrite(buf, string, offset, length) {
                    var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length);
                    return charsWritten
                }

                function binaryWrite(buf, string, offset, length) {
                    return asciiWrite(buf, string, offset, length)
                }

                function base64Write(buf, string, offset, length) {
                    var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length);
                    return charsWritten
                }

                function utf16leWrite(buf, string, offset, length) {
                    var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length);
                    return charsWritten
                }
                Buffer.prototype.write = function(string, offset, length, encoding) {
                    if (isFinite(offset)) {
                        if (!isFinite(length)) {
                            encoding = length;
                            length = undefined
                        }
                    } else {
                        var swap = encoding;
                        encoding = offset;
                        offset = length;
                        length = swap
                    }
                    offset = Number(offset) || 0;
                    var remaining = this.length - offset;
                    if (!length) {
                        length = remaining
                    } else {
                        length = Number(length);
                        if (length > remaining) {
                            length = remaining
                        }
                    }
                    encoding = String(encoding || "utf8").toLowerCase();
                    var ret;
                    switch (encoding) {
                        case "hex":
                            ret = hexWrite(this, string, offset, length);
                            break;
                        case "utf8":
                        case "utf-8":
                            ret = utf8Write(this, string, offset, length);
                            break;
                        case "ascii":
                            ret = asciiWrite(this, string, offset, length);
                            break;
                        case "binary":
                            ret = binaryWrite(this, string, offset, length);
                            break;
                        case "base64":
                            ret = base64Write(this, string, offset, length);
                            break;
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            ret = utf16leWrite(this, string, offset, length);
                            break;
                        default:
                            throw new Error("Unknown encoding")
                    }
                    return ret
                };
                Buffer.prototype.toString = function(encoding, start, end) {
                    var self = this;
                    encoding = String(encoding || "utf8").toLowerCase();
                    start = Number(start) || 0;
                    end = end === undefined ? self.length : Number(end);
                    if (end === start) return "";
                    var ret;
                    switch (encoding) {
                        case "hex":
                            ret = hexSlice(self, start, end);
                            break;
                        case "utf8":
                        case "utf-8":
                            ret = utf8Slice(self, start, end);
                            break;
                        case "ascii":
                            ret = asciiSlice(self, start, end);
                            break;
                        case "binary":
                            ret = binarySlice(self, start, end);
                            break;
                        case "base64":
                            ret = base64Slice(self, start, end);
                            break;
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            ret = utf16leSlice(self, start, end);
                            break;
                        default:
                            throw new Error("Unknown encoding")
                    }
                    return ret
                };
                Buffer.prototype.toJSON = function() {
                    return {
                        type: "Buffer",
                        data: Array.prototype.slice.call(this._arr || this, 0)
                    }
                };
                Buffer.prototype.equals = function(b) {
                    assert(Buffer.isBuffer(b), "Argument must be a Buffer");
                    return Buffer.compare(this, b) === 0
                };
                Buffer.prototype.compare = function(b) {
                    assert(Buffer.isBuffer(b), "Argument must be a Buffer");
                    return Buffer.compare(this, b)
                };
                Buffer.prototype.copy = function(target, target_start, start, end) {
                    var source = this;
                    if (!start) start = 0;
                    if (!end && end !== 0) end = this.length;
                    if (!target_start) target_start = 0;
                    if (end === start) return;
                    if (target.length === 0 || source.length === 0) return;
                    assert(end >= start, "sourceEnd < sourceStart");
                    assert(target_start >= 0 && target_start < target.length, "targetStart out of bounds");
                    assert(start >= 0 && start < source.length, "sourceStart out of bounds");
                    assert(end >= 0 && end <= source.length, "sourceEnd out of bounds");
                    if (end > this.length) end = this.length;
                    if (target.length - target_start < end - start) end = target.length - target_start + start;
                    var len = end - start;
                    if (len < 100 || !TYPED_ARRAY_SUPPORT) {
                        for (var i = 0; i < len; i++) {
                            target[i + target_start] = this[i + start]
                        }
                    } else {
                        target._set(this.subarray(start, start + len), target_start)
                    }
                };

                function base64Slice(buf, start, end) {
                    if (start === 0 && end === buf.length) {
                        return base64.fromByteArray(buf)
                    } else {
                        return base64.fromByteArray(buf.slice(start, end))
                    }
                }

                function utf8Slice(buf, start, end) {
                    var res = "";
                    var tmp = "";
                    end = Math.min(buf.length, end);
                    for (var i = start; i < end; i++) {
                        if (buf[i] <= 127) {
                            res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
                            tmp = ""
                        } else {
                            tmp += "%" + buf[i].toString(16)
                        }
                    }
                    return res + decodeUtf8Char(tmp)
                }

                function asciiSlice(buf, start, end) {
                    var ret = "";
                    end = Math.min(buf.length, end);
                    for (var i = start; i < end; i++) {
                        ret += String.fromCharCode(buf[i])
                    }
                    return ret
                }

                function binarySlice(buf, start, end) {
                    return asciiSlice(buf, start, end)
                }

                function hexSlice(buf, start, end) {
                    var len = buf.length;
                    if (!start || start < 0) start = 0;
                    if (!end || end < 0 || end > len) end = len;
                    var out = "";
                    for (var i = start; i < end; i++) {
                        out += toHex(buf[i])
                    }
                    return out
                }

                function utf16leSlice(buf, start, end) {
                    var bytes = buf.slice(start, end);
                    var res = "";
                    for (var i = 0; i < bytes.length; i += 2) {
                        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
                    }
                    return res
                }
                Buffer.prototype.slice = function(start, end) {
                    var len = this.length;
                    start = ~~start;
                    end = end === undefined ? len : ~~end;
                    if (start < 0) {
                        start += len;
                        if (start < 0) start = 0
                    } else if (start > len) {
                        start = len
                    }
                    if (end < 0) {
                        end += len;
                        if (end < 0) end = 0
                    } else if (end > len) {
                        end = len
                    }
                    if (end < start) end = start;
                    if (TYPED_ARRAY_SUPPORT) {
                        return Buffer._augment(this.subarray(start, end))
                    } else {
                        var sliceLen = end - start;
                        var newBuf = new Buffer(sliceLen, undefined, true);
                        for (var i = 0; i < sliceLen; i++) {
                            newBuf[i] = this[i + start]
                        }
                        return newBuf
                    }
                };
                Buffer.prototype.get = function(offset) {
                    console.log(".get() is deprecated. Access using array indexes instead.");
                    return this.readUInt8(offset)
                };
                Buffer.prototype.set = function(v, offset) {
                    console.log(".set() is deprecated. Access using array indexes instead.");
                    return this.writeUInt8(v, offset)
                };
                Buffer.prototype.readUInt8 = function(offset, noAssert) {
                    if (!noAssert) {
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset < this.length, "Trying to read beyond buffer length")
                    }
                    if (offset >= this.length) return;
                    return this[offset]
                };

                function readUInt16(buf, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset + 1 < buf.length, "Trying to read beyond buffer length")
                    }
                    var len = buf.length;
                    if (offset >= len) return;
                    var val;
                    if (littleEndian) {
                        val = buf[offset];
                        if (offset + 1 < len) val |= buf[offset + 1] << 8
                    } else {
                        val = buf[offset] << 8;
                        if (offset + 1 < len) val |= buf[offset + 1]
                    }
                    return val
                }
                Buffer.prototype.readUInt16LE = function(offset, noAssert) {
                    return readUInt16(this, offset, true, noAssert)
                };
                Buffer.prototype.readUInt16BE = function(offset, noAssert) {
                    return readUInt16(this, offset, false, noAssert)
                };

                function readUInt32(buf, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset + 3 < buf.length, "Trying to read beyond buffer length")
                    }
                    var len = buf.length;
                    if (offset >= len) return;
                    var val;
                    if (littleEndian) {
                        if (offset + 2 < len) val = buf[offset + 2] << 16;
                        if (offset + 1 < len) val |= buf[offset + 1] << 8;
                        val |= buf[offset];
                        if (offset + 3 < len) val = val + (buf[offset + 3] << 24 >>> 0)
                    } else {
                        if (offset + 1 < len) val = buf[offset + 1] << 16;
                        if (offset + 2 < len) val |= buf[offset + 2] << 8;
                        if (offset + 3 < len) val |= buf[offset + 3];
                        val = val + (buf[offset] << 24 >>> 0)
                    }
                    return val
                }
                Buffer.prototype.readUInt32LE = function(offset, noAssert) {
                    return readUInt32(this, offset, true, noAssert)
                };
                Buffer.prototype.readUInt32BE = function(offset, noAssert) {
                    return readUInt32(this, offset, false, noAssert)
                };
                Buffer.prototype.readInt8 = function(offset, noAssert) {
                    if (!noAssert) {
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset < this.length, "Trying to read beyond buffer length")
                    }
                    if (offset >= this.length) return;
                    var neg = this[offset] & 128;
                    if (neg) return (255 - this[offset] + 1) * -1;
                    else return this[offset]
                };

                function readInt16(buf, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset + 1 < buf.length, "Trying to read beyond buffer length")
                    }
                    var len = buf.length;
                    if (offset >= len) return;
                    var val = readUInt16(buf, offset, littleEndian, true);
                    var neg = val & 32768;
                    if (neg) return (65535 - val + 1) * -1;
                    else return val
                }
                Buffer.prototype.readInt16LE = function(offset, noAssert) {
                    return readInt16(this, offset, true, noAssert)
                };
                Buffer.prototype.readInt16BE = function(offset, noAssert) {
                    return readInt16(this, offset, false, noAssert)
                };

                function readInt32(buf, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset + 3 < buf.length, "Trying to read beyond buffer length")
                    }
                    var len = buf.length;
                    if (offset >= len) return;
                    var val = readUInt32(buf, offset, littleEndian, true);
                    var neg = val & 2147483648;
                    if (neg) return (4294967295 - val + 1) * -1;
                    else return val
                }
                Buffer.prototype.readInt32LE = function(offset, noAssert) {
                    return readInt32(this, offset, true, noAssert)
                };
                Buffer.prototype.readInt32BE = function(offset, noAssert) {
                    return readInt32(this, offset, false, noAssert)
                };

                function readFloat(buf, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset + 3 < buf.length, "Trying to read beyond buffer length")
                    }
                    return ieee754.read(buf, offset, littleEndian, 23, 4)
                }
                Buffer.prototype.readFloatLE = function(offset, noAssert) {
                    return readFloat(this, offset, true, noAssert)
                };
                Buffer.prototype.readFloatBE = function(offset, noAssert) {
                    return readFloat(this, offset, false, noAssert)
                };

                function readDouble(buf, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset + 7 < buf.length, "Trying to read beyond buffer length")
                    }
                    return ieee754.read(buf, offset, littleEndian, 52, 8)
                }
                Buffer.prototype.readDoubleLE = function(offset, noAssert) {
                    return readDouble(this, offset, true, noAssert)
                };
                Buffer.prototype.readDoubleBE = function(offset, noAssert) {
                    return readDouble(this, offset, false, noAssert)
                };
                Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
                    if (!noAssert) {
                        assert(value !== undefined && value !== null, "missing value");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset < this.length, "trying to write beyond buffer length");
                        verifuint(value, 255)
                    }
                    if (offset >= this.length) return;
                    this[offset] = value;
                    return offset + 1
                };

                function writeUInt16(buf, value, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(value !== undefined && value !== null, "missing value");
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset + 1 < buf.length, "trying to write beyond buffer length");
                        verifuint(value, 65535)
                    }
                    var len = buf.length;
                    if (offset >= len) return;
                    for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
                        buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8
                    }
                    return offset + 2
                }
                Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
                    return writeUInt16(this, value, offset, true, noAssert)
                };
                Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
                    return writeUInt16(this, value, offset, false, noAssert)
                };

                function writeUInt32(buf, value, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(value !== undefined && value !== null, "missing value");
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset + 3 < buf.length, "trying to write beyond buffer length");
                        verifuint(value, 4294967295)
                    }
                    var len = buf.length;
                    if (offset >= len) return;
                    for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
                        buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255
                    }
                    return offset + 4
                }
                Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
                    return writeUInt32(this, value, offset, true, noAssert)
                };
                Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
                    return writeUInt32(this, value, offset, false, noAssert)
                };
                Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
                    if (!noAssert) {
                        assert(value !== undefined && value !== null, "missing value");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset < this.length, "Trying to write beyond buffer length");
                        verifsint(value, 127, -128)
                    }
                    if (offset >= this.length) return;
                    if (value >= 0) this.writeUInt8(value, offset, noAssert);
                    else this.writeUInt8(255 + value + 1, offset, noAssert);
                    return offset + 1
                };

                function writeInt16(buf, value, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(value !== undefined && value !== null, "missing value");
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset + 1 < buf.length, "Trying to write beyond buffer length");
                        verifsint(value, 32767, -32768)
                    }
                    var len = buf.length;
                    if (offset >= len) return;
                    if (value >= 0) writeUInt16(buf, value, offset, littleEndian, noAssert);
                    else writeUInt16(buf, 65535 + value + 1, offset, littleEndian, noAssert);
                    return offset + 2
                }
                Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
                    return writeInt16(this, value, offset, true, noAssert)
                };
                Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
                    return writeInt16(this, value, offset, false, noAssert)
                };

                function writeInt32(buf, value, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(value !== undefined && value !== null, "missing value");
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset + 3 < buf.length, "Trying to write beyond buffer length");
                        verifsint(value, 2147483647, -2147483648)
                    }
                    var len = buf.length;
                    if (offset >= len) return;
                    if (value >= 0) writeUInt32(buf, value, offset, littleEndian, noAssert);
                    else writeUInt32(buf, 4294967295 + value + 1, offset, littleEndian, noAssert);
                    return offset + 4
                }
                Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
                    return writeInt32(this, value, offset, true, noAssert)
                };
                Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
                    return writeInt32(this, value, offset, false, noAssert)
                };

                function writeFloat(buf, value, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(value !== undefined && value !== null, "missing value");
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset + 3 < buf.length, "Trying to write beyond buffer length");
                        verifIEEE754(value, 3.4028234663852886e38, -3.4028234663852886e38)
                    }
                    var len = buf.length;
                    if (offset >= len) return;
                    ieee754.write(buf, value, offset, littleEndian, 23, 4);
                    return offset + 4
                }
                Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
                    return writeFloat(this, value, offset, true, noAssert)
                };
                Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
                    return writeFloat(this, value, offset, false, noAssert)
                };

                function writeDouble(buf, value, offset, littleEndian, noAssert) {
                    if (!noAssert) {
                        assert(value !== undefined && value !== null, "missing value");
                        assert(typeof littleEndian === "boolean", "missing or invalid endian");
                        assert(offset !== undefined && offset !== null, "missing offset");
                        assert(offset + 7 < buf.length, "Trying to write beyond buffer length");
                        verifIEEE754(value, 1.7976931348623157e308, -1.7976931348623157e308)
                    }
                    var len = buf.length;
                    if (offset >= len) return;
                    ieee754.write(buf, value, offset, littleEndian, 52, 8);
                    return offset + 8
                }
                Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
                    return writeDouble(this, value, offset, true, noAssert)
                };
                Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
                    return writeDouble(this, value, offset, false, noAssert)
                };
                Buffer.prototype.fill = function(value, start, end) {
                    if (!value) value = 0;
                    if (!start) start = 0;
                    if (!end) end = this.length;
                    assert(end >= start, "end < start");
                    if (end === start) return;
                    if (this.length === 0) return;
                    assert(start >= 0 && start < this.length, "start out of bounds");
                    assert(end >= 0 && end <= this.length, "end out of bounds");
                    var i;
                    if (typeof value === "number") {
                        for (i = start; i < end; i++) {
                            this[i] = value
                        }
                    } else {
                        var bytes = utf8ToBytes(value.toString());
                        var len = bytes.length;
                        for (i = start; i < end; i++) {
                            this[i] = bytes[i % len]
                        }
                    }
                    return this
                };
                Buffer.prototype.inspect = function() {
                    var out = [];
                    var len = this.length;
                    for (var i = 0; i < len; i++) {
                        out[i] = toHex(this[i]);
                        if (i === exports.INSPECT_MAX_BYTES) {
                            out[i + 1] = "...";
                            break
                        }
                    }
                    return "<Buffer " + out.join(" ") + ">"
                };
                Buffer.prototype.toArrayBuffer = function() {
                    if (typeof Uint8Array !== "undefined") {
                        if (TYPED_ARRAY_SUPPORT) {
                            return new Buffer(this).buffer
                        } else {
                            var buf = new Uint8Array(this.length);
                            for (var i = 0, len = buf.length; i < len; i += 1) {
                                buf[i] = this[i]
                            }
                            return buf.buffer
                        }
                    } else {
                        throw new Error("Buffer.toArrayBuffer not supported in this browser")
                    }
                };
                var BP = Buffer.prototype;
                Buffer._augment = function(arr) {
                    arr._isBuffer = true;
                    arr._get = arr.get;
                    arr._set = arr.set;
                    arr.get = BP.get;
                    arr.set = BP.set;
                    arr.write = BP.write;
                    arr.toString = BP.toString;
                    arr.toLocaleString = BP.toString;
                    arr.toJSON = BP.toJSON;
                    arr.equals = BP.equals;
                    arr.compare = BP.compare;
                    arr.copy = BP.copy;
                    arr.slice = BP.slice;
                    arr.readUInt8 = BP.readUInt8;
                    arr.readUInt16LE = BP.readUInt16LE;
                    arr.readUInt16BE = BP.readUInt16BE;
                    arr.readUInt32LE = BP.readUInt32LE;
                    arr.readUInt32BE = BP.readUInt32BE;
                    arr.readInt8 = BP.readInt8;
                    arr.readInt16LE = BP.readInt16LE;
                    arr.readInt16BE = BP.readInt16BE;
                    arr.readInt32LE = BP.readInt32LE;
                    arr.readInt32BE = BP.readInt32BE;
                    arr.readFloatLE = BP.readFloatLE;
                    arr.readFloatBE = BP.readFloatBE;
                    arr.readDoubleLE = BP.readDoubleLE;
                    arr.readDoubleBE = BP.readDoubleBE;
                    arr.writeUInt8 = BP.writeUInt8;
                    arr.writeUInt16LE = BP.writeUInt16LE;
                    arr.writeUInt16BE = BP.writeUInt16BE;
                    arr.writeUInt32LE = BP.writeUInt32LE;
                    arr.writeUInt32BE = BP.writeUInt32BE;
                    arr.writeInt8 = BP.writeInt8;
                    arr.writeInt16LE = BP.writeInt16LE;
                    arr.writeInt16BE = BP.writeInt16BE;
                    arr.writeInt32LE = BP.writeInt32LE;
                    arr.writeInt32BE = BP.writeInt32BE;
                    arr.writeFloatLE = BP.writeFloatLE;
                    arr.writeFloatBE = BP.writeFloatBE;
                    arr.writeDoubleLE = BP.writeDoubleLE;
                    arr.writeDoubleBE = BP.writeDoubleBE;
                    arr.fill = BP.fill;
                    arr.inspect = BP.inspect;
                    arr.toArrayBuffer = BP.toArrayBuffer;
                    return arr
                };
                var INVALID_BASE64_RE = /[^+\/0-9A-z]/g;

                function base64clean(str) {
                    str = stringtrim(str).replace(INVALID_BASE64_RE, "");
                    while (str.length % 4 !== 0) {
                        str = str + "="
                    }
                    return str
                }

                function stringtrim(str) {
                    if (str.trim) return str.trim();
                    return str.replace(/^\s+|\s+$/g, "")
                }

                function isArray(subject) {
                    return (Array.isArray || function(subject) {
                        return Object.prototype.toString.call(subject) === "[object Array]"
                    })(subject)
                }

                function isArrayish(subject) {
                    return isArray(subject) || Buffer.isBuffer(subject) || subject && typeof subject === "object" && typeof subject.length === "number"
                }

                function toHex(n) {
                    if (n < 16) return "0" + n.toString(16);
                    return n.toString(16)
                }

                function utf8ToBytes(str) {
                    var byteArray = [];
                    for (var i = 0; i < str.length; i++) {
                        var b = str.charCodeAt(i);
                        if (b <= 127) {
                            byteArray.push(b)
                        } else {
                            var start = i;
                            if (b >= 55296 && b <= 57343) i++;
                            var h = encodeURIComponent(str.slice(start, i + 1)).substr(1).split("%");
                            for (var j = 0; j < h.length; j++) {
                                byteArray.push(parseInt(h[j], 16))
                            }
                        }
                    }
                    return byteArray
                }

                function asciiToBytes(str) {
                    var byteArray = [];
                    for (var i = 0; i < str.length; i++) {
                        byteArray.push(str.charCodeAt(i) & 255)
                    }
                    return byteArray
                }

                function utf16leToBytes(str) {
                    var c, hi, lo;
                    var byteArray = [];
                    for (var i = 0; i < str.length; i++) {
                        c = str.charCodeAt(i);
                        hi = c >> 8;
                        lo = c % 256;
                        byteArray.push(lo);
                        byteArray.push(hi)
                    }
                    return byteArray
                }

                function base64ToBytes(str) {
                    return base64.toByteArray(str)
                }

                function blitBuffer(src, dst, offset, length) {
                    for (var i = 0; i < length; i++) {
                        if (i + offset >= dst.length || i >= src.length) break;
                        dst[i + offset] = src[i]
                    }
                    return i
                }

                function decodeUtf8Char(str) {
                    try {
                        return decodeURIComponent(str)
                    } catch (err) {
                        return String.fromCharCode(65533)
                    }
                }

                function verifuint(value, max) {
                    assert(typeof value === "number", "cannot write a non-number as a number");
                    assert(value >= 0, "specified a negative value for writing an unsigned value");
                    assert(value <= max, "value is larger than maximum value for type");
                    assert(Math.floor(value) === value, "value has a fractional component")
                }

                function verifsint(value, max, min) {
                    assert(typeof value === "number", "cannot write a non-number as a number");
                    assert(value <= max, "value larger than maximum allowed value");
                    assert(value >= min, "value smaller than minimum allowed value");
                    assert(Math.floor(value) === value, "value has a fractional component")
                }

                function verifIEEE754(value, max, min) {
                    assert(typeof value === "number", "cannot write a non-number as a number");
                    assert(value <= max, "value larger than maximum allowed value");
                    assert(value >= min, "value smaller than minimum allowed value")
                }

                function assert(test, message) {
                    if (!test) throw new Error(message || "Failed assertion")
                }
            }, {
                "base64-js": 79,
                ieee754: 80
            }
        ],
        79: [
            function(require, module, exports) {
                var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                (function(exports) {
                    "use strict";
                    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
                    var PLUS = "+".charCodeAt(0);
                    var SLASH = "/".charCodeAt(0);
                    var NUMBER = "0".charCodeAt(0);
                    var LOWER = "a".charCodeAt(0);
                    var UPPER = "A".charCodeAt(0);

                    function decode(elt) {
                        var code = elt.charCodeAt(0);
                        if (code === PLUS) return 62;
                        if (code === SLASH) return 63;
                        if (code < NUMBER) return -1;
                        if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
                        if (code < UPPER + 26) return code - UPPER;
                        if (code < LOWER + 26) return code - LOWER + 26
                    }

                    function b64ToByteArray(b64) {
                        var i, j, l, tmp, placeHolders, arr;
                        if (b64.length % 4 > 0) {
                            throw new Error("Invalid string. Length must be a multiple of 4")
                        }
                        var len = b64.length;
                        placeHolders = "=" === b64.charAt(len - 2) ? 2 : "=" === b64.charAt(len - 1) ? 1 : 0;
                        arr = new Arr(b64.length * 3 / 4 - placeHolders);
                        l = placeHolders > 0 ? b64.length - 4 : b64.length;
                        var L = 0;

                        function push(v) {
                            arr[L++] = v
                        }
                        for (i = 0, j = 0; i < l; i += 4, j += 3) {
                            tmp = decode(b64.charAt(i)) << 18 | decode(b64.charAt(i + 1)) << 12 | decode(b64.charAt(i + 2)) << 6 | decode(b64.charAt(i + 3));
                            push((tmp & 16711680) >> 16);
                            push((tmp & 65280) >> 8);
                            push(tmp & 255)
                        }
                        if (placeHolders === 2) {
                            tmp = decode(b64.charAt(i)) << 2 | decode(b64.charAt(i + 1)) >> 4;
                            push(tmp & 255)
                        } else if (placeHolders === 1) {
                            tmp = decode(b64.charAt(i)) << 10 | decode(b64.charAt(i + 1)) << 4 | decode(b64.charAt(i + 2)) >> 2;
                            push(tmp >> 8 & 255);
                            push(tmp & 255)
                        }
                        return arr
                    }

                    function uint8ToBase64(uint8) {
                        var i, extraBytes = uint8.length % 3,
                            output = "",
                            temp, length;

                        function encode(num) {
                            return lookup.charAt(num)
                        }

                        function tripletToBase64(num) {
                            return encode(num >> 18 & 63) + encode(num >> 12 & 63) + encode(num >> 6 & 63) + encode(num & 63)
                        }
                        for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
                            temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
                            output += tripletToBase64(temp)
                        }
                        switch (extraBytes) {
                            case 1:
                                temp = uint8[uint8.length - 1];
                                output += encode(temp >> 2);
                                output += encode(temp << 4 & 63);
                                output += "==";
                                break;
                            case 2:
                                temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
                                output += encode(temp >> 10);
                                output += encode(temp >> 4 & 63);
                                output += encode(temp << 2 & 63);
                                output += "=";
                                break
                        }
                        return output
                    }
                    exports.toByteArray = b64ToByteArray;
                    exports.fromByteArray = uint8ToBase64
                })(typeof exports === "undefined" ? this.base64js = {} : exports)
            }, {}
        ],
        80: [
            function(require, module, exports) {
                exports.read = function(buffer, offset, isLE, mLen, nBytes) {
                    var e, m, eLen = nBytes * 8 - mLen - 1,
                        eMax = (1 << eLen) - 1,
                        eBias = eMax >> 1,
                        nBits = -7,
                        i = isLE ? nBytes - 1 : 0,
                        d = isLE ? -1 : 1,
                        s = buffer[offset + i];
                    i += d;
                    e = s & (1 << -nBits) - 1;
                    s >>= -nBits;
                    nBits += eLen;
                    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);
                    m = e & (1 << -nBits) - 1;
                    e >>= -nBits;
                    nBits += mLen;
                    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);
                    if (e === 0) {
                        e = 1 - eBias
                    } else if (e === eMax) {
                        return m ? NaN : (s ? -1 : 1) * Infinity
                    } else {
                        m = m + Math.pow(2, mLen);
                        e = e - eBias
                    }
                    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
                };
                exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
                    var e, m, c, eLen = nBytes * 8 - mLen - 1,
                        eMax = (1 << eLen) - 1,
                        eBias = eMax >> 1,
                        rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                        i = isLE ? 0 : nBytes - 1,
                        d = isLE ? 1 : -1,
                        s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
                    value = Math.abs(value);
                    if (isNaN(value) || value === Infinity) {
                        m = isNaN(value) ? 1 : 0;
                        e = eMax
                    } else {
                        e = Math.floor(Math.log(value) / Math.LN2);
                        if (value * (c = Math.pow(2, -e)) < 1) {
                            e--;
                            c *= 2
                        }
                        if (e + eBias >= 1) {
                            value += rt / c
                        } else {
                            value += rt * Math.pow(2, 1 - eBias)
                        } if (value * c >= 2) {
                            e++;
                            c /= 2
                        }
                        if (e + eBias >= eMax) {
                            m = 0;
                            e = eMax
                        } else if (e + eBias >= 1) {
                            m = (value * c - 1) * Math.pow(2, mLen);
                            e = e + eBias
                        } else {
                            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                            e = 0
                        }
                    }
                    for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8);
                    e = e << mLen | m;
                    eLen += mLen;
                    for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8);
                    buffer[offset + i - d] |= s * 128
                }
            }, {}
        ],
        81: [
            function(require, module, exports) {
                arguments[4][6][0].apply(exports, arguments)
            }, {
                "./md5": 85,
                buffer: 78,
                ripemd160: 86,
                "sha.js": 88
            }
        ],
        82: [
            function(require, module, exports) {
                module.exports = require(7)
            }, {
                "./create-hash": 81,
                buffer: 78
            }
        ],
        83: [
            function(require, module, exports) {
                module.exports = require(8)
            }, {
                buffer: 78
            }
        ],
        84: [
            function(require, module, exports) {
                module.exports = require(9)
            }, {
                "./create-hash": 81,
                "./create-hmac": 82,
                "./pbkdf2": 92,
                "./rng": 93,
                buffer: 78
            }
        ],
        85: [
            function(require, module, exports) {
                module.exports = require(10)
            }, {
                "./helpers": 83
            }
        ],
        86: [
            function(require, module, exports) {
                module.exports = require(11)
            }, {
                buffer: 78
            }
        ],
        87: [
            function(require, module, exports) {
                var u = require("./util");
                var write = u.write;
                var fill = u.zeroFill;
                module.exports = function(Buffer) {
                    function Hash(blockSize, finalSize) {
                        this._block = new Buffer(blockSize);
                        this._finalSize = finalSize;
                        this._blockSize = blockSize;
                        this._len = 0;
                        this._s = 0
                    }
                    Hash.prototype.init = function() {
                        this._s = 0;
                        this._len = 0
                    };

                    function lengthOf(data, enc) {
                        if (enc == null) return data.byteLength || data.length;
                        if (enc == "ascii" || enc == "binary") return data.length;
                        if (enc == "hex") return data.length / 2;
                        if (enc == "base64") return data.length / 3
                    }
                    Hash.prototype.update = function(data, enc) {
                        var bl = this._blockSize;
                        var length;
                        if (!enc && "string" === typeof data) enc = "utf8";
                        if (enc) {
                            if (enc === "utf-8") enc = "utf8";
                            if (enc === "base64" || enc === "utf8") data = new Buffer(data, enc), enc = null;
                            length = lengthOf(data, enc)
                        } else length = data.byteLength || data.length;
                        var l = this._len += length;
                        var s = this._s = this._s || 0;
                        var f = 0;
                        var buffer = this._block;
                        while (s < l) {
                            var t = Math.min(length, f + bl - s % bl);
                            write(buffer, data, enc, s % bl, f, t);
                            var ch = t - f;
                            s += ch;
                            f += ch;
                            if (!(s % bl)) this._update(buffer)
                        }
                        this._s = s;
                        return this
                    };
                    Hash.prototype.digest = function(enc) {
                        var bl = this._blockSize;
                        var fl = this._finalSize;
                        var len = this._len * 8;
                        var x = this._block;
                        var bits = len % (bl * 8);
                        x[this._len % bl] = 128;
                        fill(this._block, this._len % bl + 1);
                        if (bits >= fl * 8) {
                            this._update(this._block);
                            u.zeroFill(this._block, 0)
                        }
                        x.writeInt32BE(len, fl + 4);
                        var hash = this._update(this._block) || this._hash();
                        if (enc == null) return hash;
                        return hash.toString(enc)
                    };
                    Hash.prototype._update = function() {
                        throw new Error("_update must be implemented by subclass")
                    };
                    return Hash
                }
            }, {
                "./util": 91
            }
        ],
        88: [
            function(require, module, exports) {
                arguments[4][13][0].apply(exports, arguments)
            }, {
                "./hash": 87,
                "./sha1": 89,
                "./sha256": 90,
                buffer: 78
            }
        ],
        89: [
            function(require, module, exports) {
                module.exports = require(14)
            }, {
                util: 97
            }
        ],
        90: [
            function(require, module, exports) {
                module.exports = require(15)
            }, {
                "./util": 91,
                util: 97
            }
        ],
        91: [
            function(require, module, exports) {
                module.exports = require(16)
            }, {}
        ],
        92: [
            function(require, module, exports) {
                module.exports = require(17)
            }, {
                buffer: 78
            }
        ],
        93: [
            function(require, module, exports) {
                module.exports = require(18)
            }, {
                buffer: 78
            }
        ],
        94: [
            function(require, module, exports) {
                if (typeof Object.create === "function") {
                    module.exports = function inherits(ctor, superCtor) {
                        ctor.super_ = superCtor;
                        ctor.prototype = Object.create(superCtor.prototype, {
                            constructor: {
                                value: ctor,
                                enumerable: false,
                                writable: true,
                                configurable: true
                            }
                        })
                    }
                } else {
                    module.exports = function inherits(ctor, superCtor) {
                        ctor.super_ = superCtor;
                        var TempCtor = function() {};
                        TempCtor.prototype = superCtor.prototype;
                        ctor.prototype = new TempCtor;
                        ctor.prototype.constructor = ctor
                    }
                }
            }, {}
        ],
        95: [
            function(require, module, exports) {
                var process = module.exports = {};
                process.nextTick = function() {
                    var canSetImmediate = typeof window !== "undefined" && window.setImmediate;
                    var canPost = typeof window !== "undefined" && window.postMessage && window.addEventListener;
                    if (canSetImmediate) {
                        return function(f) {
                            return window.setImmediate(f)
                        }
                    }
                    if (canPost) {
                        var queue = [];
                        window.addEventListener("message", function(ev) {
                            var source = ev.source;
                            if ((source === window || source === null) && ev.data === "process-tick") {
                                ev.stopPropagation();
                                if (queue.length > 0) {
                                    var fn = queue.shift();
                                    fn()
                                }
                            }
                        }, true);
                        return function nextTick(fn) {
                            queue.push(fn);
                            window.postMessage("process-tick", "*")
                        }
                    }
                    return function nextTick(fn) {
                        setTimeout(fn, 0)
                    }
                }();
                process.title = "browser";
                process.browser = true;
                process.env = {};
                process.argv = [];

                function noop() {}
                process.on = noop;
                process.addListener = noop;
                process.once = noop;
                process.off = noop;
                process.removeListener = noop;
                process.removeAllListeners = noop;
                process.emit = noop;
                process.binding = function(name) {
                    throw new Error("process.binding is not supported")
                };
                process.cwd = function() {
                    return "/"
                };
                process.chdir = function(dir) {
                    throw new Error("process.chdir is not supported")
                }
            }, {}
        ],
        96: [
            function(require, module, exports) {
                module.exports = require(76)
            }, {}
        ],
        97: [
            function(require, module, exports) {
                module.exports = require(77)
            }, {
                "./support/isBuffer": 96,
                _process: 95,
                inherits: 94
            }
        ],
        "bitcoinjs-lib": [
            function(require, module, exports) {
                module.exports = {
                    BigInteger: require("./bigi"),
                    base58: require("./bs58"),
                    base58check: require("./bs58check"),
                    Crypto: require("./crypto-js"),

                    Address: require("./address"),
                    bufferutils: require("./bufferutils"),
                    convert: require("./convert"),
                    crypto: require("./crypto"),
                    ecdsa: require("./ecdsa"),
                    ECKey: require("./eckey"),
                    ECPubKey: require("./ecpubkey"),
                    ECSignature: require("./ecsignature"),
                    Message: require("./message"),
                    opcodes: require("./opcodes"),
                    HDNode: require("./hdnode"),
                    Script: require("./script"),
                    scripts: require("./scripts"),
                    Transaction: require("./transaction"),
                    TransactionBuilder: require("./transaction_builder"),
                    networks: require("./networks"),
                    Wallet: require("./wallet")
                }
            }, {
                "./bigi": 3,
                "./bs58": 4,
                "./bs58check": 5,
                "./crypto-js": 27,

                "./address": 58,
                "./bufferutils": 59,
                "./convert": 60,
                "./crypto": 61,
                "./ecdsa": 62,
                "./eckey": 63,
                "./ecpubkey": 64,
                "./ecsignature": 65,
                "./hdnode": 66,
                "./message": 67,
                "./networks": 68,
                "./opcodes": 69,
                "./script": 70,
                "./scripts": 71,
                "./transaction": 72,
                "./transaction_builder": 73,
                "./wallet": 74
            }
        ]
    }, {}, [])("bitcoinjs-lib")
});