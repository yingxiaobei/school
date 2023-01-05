var template = {
  sealTpl:
    '<div class="kg-dialog kg-dialog-runSignature" id="sealTpl-dialog"><div class=" kg-switcher" id="kg-switcher" >' +
    '<a class="arrow-left arrow" href="#"><i class="kg-icon kg-icon-angle-left" /></a>' +
    '<a class="arrow-right arrow" href="#"><i class="kg-icon kg-icon-angle-right"/></a>' +
    '<div class="kg-pagin">' +
    '<div class="kg-guide"></div>	' +
    '</div>' +
    '<div class="kg-container" >' +
    '<div class="kg-wrapper">' +
    '<% var seals = this.seals; %>' +
    '<% for(var i=0;i<seals.length;i++) {%>' +
    '<div class="kg-slide" title="<%seals[i].signname%>">' +
    '<div class="kg-image">' +
    '<div class="title"><%seals[i].signname%></div>' +
    '<a class="kg-img" href="#" ><img src="data:image/<%seals[i].imgext.substring(1)%>;base64,<%seals[i].imgdata%>"></a>' +
    '</div>' +
    '<div class="kg-shade" style="z-index:100;">' +
    '<img width="100%" height="100%"  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNgAAIAAAUAAen63NgAAAAASUVORK5CYII=">' +
    '</div>' +
    '</div>' +
    '<%}%>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="kg-form">' +
    '<div class="form-item clearfix i-password">' +
    '<div class="kg-sm kg-sm-2"></div>' +
    '<label class="kg-sm kg-sm-2 kg-label">密码：</label>' +
    '<div class="kg-sm kg-sm-6">' +
    '<input type="password" name="kgpassword" autocomplete="new-password" id="kg-password" class="form-control22" autofocus>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>',
};

var Base64 = function (map) {
  this.map = map;
};
Base64.map = {};
Base64.of = function (map) {
  var m = map || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var b = Base64.map[m];
  if (!b) {
    b = new Base64(m);
  }
  return b;
};

Base64.prototype = {
  decodeByte: function (base64Str) {
    var base64StrLength = base64Str.length;
    var map = this.map;
    var paddingChar = map.charAt(64);
    if (paddingChar) {
      var paddingIndex = base64Str.indexOf(paddingChar);
      if (paddingIndex != -1) {
        base64StrLength = paddingIndex;
      }
    }
    var words = [];
    var nBytes = 0;
    for (var i = 0; i < base64StrLength; i++) {
      if (i % 4) {
        var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
        var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
        words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
        nBytes++;
      }
    }
    return new WordArray(words, nBytes);
  },
  encodeByte: function (wordArray) {
    var words = wordArray.words;
    var sigBytes = wordArray.sigBytes;
    var map = this.map;
    wordArray.clamp();
    var base64Chars = [];
    for (var i = 0; i < sigBytes; i += 3) {
      var byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
      var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

      var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

      for (var j = 0; j < 4 && i + j * 0.75 < sigBytes; j++) {
        base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
      }
    }
    var paddingChar = map.charAt(64);
    if (paddingChar) {
      while (base64Chars.length % 4) {
        base64Chars.push(paddingChar);
      }
    }
    return base64Chars.join('');
  },
};

//将 `arguments` 转成数组，效率比 `[].slice.call` 高很多
function slice(args, start) {
  var len = args.length,
    ret = Array(len);
  start = start || 0;
  while (len-- > start) ret[len - start] = args[len];
  return ret;
}

var Utils = {
  Base64: Base64,
  slice: slice,
  is: function (type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
  },
  template: function (html, target) {
    var re = /<%([^%>]+)?%>/g,
      reExp = /(^( )?(var|if|for|else|switch|case|break|{|}))(.*)?/g,
      code = 'var r=[];\n',
      cursor = 0;
    var add = function (line, js) {
      js
        ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n')
        : (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
      return add;
    };
    var match;
    while ((match = re.exec(html))) {
      add(html.slice(cursor, match.index))(match[1], true);
      cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(target, slice(arguments, 2));
  },
};

Utils.Switcher = Switcher;

var Switcher = function (target, options) {
  var that = this;
  that.target = $(target);

  if (options) {
    $.each(options, function (name, value) {
      if (typeof that[name] === 'function') {
        that[name](value);
      } else {
        that[name] = value;
      }
    });
  }
  that.init();
};

Switcher.prototype = {
  running: false,
  index: 0,
  animate: true,
  init: function () {
    var target = this.target;
    var wrapper = (this.wrapper = target.find('.kg-wrapper'));
    var pagen_guide = (this.guide = target.find('.kg-guide'));

    var slides = wrapper.children('.kg-slide');
    var height = parseInt(slides.css('height'));
    var width = slides.outerWidth(true);
    //console.log(height , width);
    wrapper.css({ height: height, width: slides.length * width });

    this.count = slides.length;

    var index = parseFloat(this.index, 10) || 0;
    slides.each(function (inx) {
      this.setAttribute('index', inx);
      pagen_guide.append('<span index="' + inx + '"></span>');
    });
    this._active(index);
  },

  _active: function (newIndex) {
    var that = this;
    var oldIndex = that.index;
    that.wrapper.children().eq(oldIndex).removeClass('active');
    that.guide.children().eq(oldIndex).removeClass('active');

    that.wrapper.children().eq(newIndex).addClass('active');
    that.guide.children().eq(newIndex).addClass('active');
    this.index = newIndex;
  },

  to: function (toIndex) {
    var that = this;
    if (that.running) {
      return;
    }
    var inx = toIndex % this.count;
    if (inx == that.index) {
      return;
    }
    that.running = true;
    var slide = that.wrapper.children().eq(inx);
    var left = -inx * slide.outerWidth(true);

    if (this.animate) {
      this.wrapper.animate(
        {
          left: left,
        },
        100,
        function () {
          that._active(inx);
          that.running = false;
        },
      );
    } else {
      this.wrapper.css({
        left: left,
      });
      that._active(inx);
      that.running = false;
    }
  },

  swipePrev: function () {
    var that = this;
    var oldIndex = that.index;
    var newIndex = oldIndex - 1;
    if (newIndex < 0) {
      newIndex = that.wrapper.children().length - 1;
    }
    that.to(newIndex);
  },

  swipeNext: function () {
    var that = this;
    var oldIndex = that.index;
    var newIndex = oldIndex + 1;
    var size = that.wrapper.children().length;
    if (newIndex + 1 > size) {
      newIndex = 0;
    }

    that.to(newIndex);
  },
};

var WordArray = function (words, sigBytes) {
  words = this.words = words || [];
  if (sigBytes != undefined) {
    this.sigBytes = sigBytes;
  } else {
    this.sigBytes = words.length * 4;
  }
};

WordArray.prototype = {
  clamp: function () {
    var words = this.words;
    var sigBytes = this.sigBytes;
    words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
    words.length = Math.ceil(sigBytes / 4);
  },
  toString: function (encoder) {
    return (encoder || Hex).stringify(this);
  },
};

var Signature = {
  /**
   * 解析签章对象成标准base64图片数据
   */
  toBase64Img: function (seal) {
    // 印章数据转换成标准base64图片数据
    var imgdata = seal.imgdata;
    var inx = imgdata.indexOf(seal.signsn);
    if (inx == -1) {
      return imgdata;
    } else {
      imgdata = seal.imgdata.substring(inx + 65);
      return Base64.of().encodeByte(Base64.of(seal.signsn).decodeByte(imgdata));
    }
  },
  showDialog: function (keyData, callback) {
    var capability = createCapability();
    if (keyData.result && keyData.seals && keyData.seals.length) {
      var oldSeals = $.extend(true, {}, keyData.seals);
      var seals = keyData.seals;
      for (var i = 0; i < keyData.seals.length; i++) {
        seals[i].imgdata = Signature.toBase64Img(keyData.seals[i]);
      }

      var options = {
        onShow: function () {
          var d = this;
          var $switcher = d._popup.find('.kg-switcher');
          if ($switcher.length) {
            var switcher = new Switcher($switcher[0], {});
            $('.arrow-right').click(function (e) {
              e.preventDefault();
              switcher.swipeNext();
            });

            $('.arrow-left').click(function (e) {
              e.preventDefault();
              switcher.swipePrev();
            });
            $('.kg-guide span').click(function (e) {
              e.preventDefault();
              switcher.to(+this.getAttribute('index'));
            });
          }
        },
      };

      var d = dialog({
        title: '电子签章',
        lock: true,
        modal: true,
        okValue: '确定',
        cancelValue: '关闭',
        backdropOpacity: 0.2,
        content: function () {
          var t = { seals: seals };
          var target = Utils.is('Array', t) ? t : [t];
          var x = [template.sealTpl].concat(target);
          return Utils.template.apply(null, x);
        },
        ok: function () {
          var d = this;
          var password = d._popup.find('#kg-password');
          pwdVal = password.val();
          if (!pwdVal) {
            alert('请输入密码！', function () {
              setTimeout(function () {
                password.focus();
              }, 100);
            });
            return false;
          }
          var $seals = d._popup.find('.kg-wrapper .active');
          var result = oldSeals[$seals.attr('index')];

          callback(JSON.stringify(result), keyData.keysn, keyData.orgname).then(
            function (ret) {
              capability.resolve(ret);
            },
            function (err) {
              capability.reject(err);
            },
          );
        },
        cancel: function () {
          return true;
        },
      });
      options.onShow.call(d);
      d.show();
    }
    return capability.promise;
  },
};
