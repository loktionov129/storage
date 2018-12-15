const a = (val) => {
  let _val = val;

  let t = (v) => {
    _val += v;
    return t;
  };
  t.valueOf = () => _val;

  return t;
};


a(1)(2)(3)(4)(5) * 6  // 90
10 + a(4)(5)(6)       // 25
Math.pow(a(8)(1), 3)  // 729
a(4)(6) - a(3)        // 7
