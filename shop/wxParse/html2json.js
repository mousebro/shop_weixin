'use strict';

/**
 * html2Json 改造来自: https://github.com/Jxck/html2json
 *
 *
 * author: Di (微信小程序开发工程师)
 * organization: WeAppDev(微信小程序开发论坛)(http://weappdev.com)
 *               垂直微信小程序开发交流社区
 *
 * github地址: https://github.com/icindy/wxParse
 *
 * for: 微信小程序富文本解析
 * detail : http://weappdev.com/t/wxparse-alpha0-1-html-markdown/184
 */

var __placeImgeUrlHttps = "https";
var __emojisReg = '';
var __emojisBaseSrc = '';
var __emojis = {};
var wxDiscode = require('./wxDiscode.js');
var HTMLParser = require('./htmlparser.js');
// Empty Elements - HTML 5
var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr");
// Block Elements - HTML 5
var block = makeMap("br,a,code,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

// Inline Elements - HTML 5
var inline = makeMap("abbr,acronym,applet,b,basefont,bdo,big,button,cite,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

// Attributes that have their values filled in disabled="disabled"
var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

// Special Elements (can contain anything)
var special = makeMap("wxxxcode-style,script,style,view,scroll-view,block");
function makeMap(str) {
    var obj = {},
        items = str.split(",");
    for (var i = 0; i < items.length; i++) {
        obj[items[i]] = true;
    }return obj;
}

function q(v) {
    return '"' + v + '"';
}

function removeDOCTYPE(html) {
    return html.replace(/<\?xml.*\?>\n/, '').replace(/<.*!doctype.*\>\n/, '').replace(/<.*!DOCTYPE.*\>\n/, '');
}

function trimHtml(html) {
    return html.replace(/\r?\n+/g, '').replace(/<!--.*?-->/ig, '').replace(/\/\*.*?\*\//ig, '').replace(/[ ]+</ig, '<');
}

function html2json(html, bindName) {
    //处理字符串
    html = removeDOCTYPE(html);
    html = trimHtml(html);
    html = wxDiscode.strDiscode(html);
    //生成node节点
    var bufArray = [];
    var results = {
        node: bindName,
        nodes: [],
        images: [],
        imageUrls: []
    };
    var index = 0;
    HTMLParser(html, {
        start: function start(tag, attrs, unary) {
            //debug(tag, attrs, unary);
            // node for this element
            var node = {
                node: 'element',
                tag: tag
            };

            if (bufArray.length === 0) {
                node.index = index.toString();
                index += 1;
            } else {
                var parent = bufArray[0];
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                node.index = parent.index + '.' + parent.nodes.length;
            }

            if (block[tag]) {
                node.tagType = "block";
            } else if (inline[tag]) {
                node.tagType = "inline";
            } else if (closeSelf[tag]) {
                node.tagType = "closeSelf";
            }

            if (attrs.length !== 0) {
                node.attr = attrs.reduce(function (pre, attr) {
                    var name = attr.name;
                    var value = attr.value;
                    if (name == 'class') {
                        // console.dir(value);
                        //  value = value.join("")
                        node.classStr = value;
                    }
                    // has multi attibutes
                    // make it array of attribute
                    if (name == 'style') {
                        // console.dir(value);
                        //  value = value.join("")
                        node.styleStr = value;
                    }
                    if (value.match(/ /)) {
                        value = value.split(' ');
                    }

                    // if attr already exists
                    // merge it
                    if (pre[name]) {
                        if (Array.isArray(pre[name])) {
                            // already array, push to last
                            pre[name].push(value);
                        } else {
                            // single value, make it array
                            pre[name] = [pre[name], value];
                        }
                    } else {
                        // not exist, put it
                        pre[name] = value;
                    }

                    return pre;
                }, {});
            }

            //对img添加额外数据
            if (node.tag === 'img') {
                node.imgIndex = results.images.length;
                var imgUrl = node.attr.src;
                if (imgUrl[0] == '') {
                    imgUrl.splice(0, 1);
                }
                imgUrl = wxDiscode.urlToHttpUrl(imgUrl, __placeImgeUrlHttps);
                node.attr.src = imgUrl;
                node.from = bindName;
                results.images.push(node);
                results.imageUrls.push(imgUrl);
            }

            // 处理font标签样式属性
            if (node.tag === 'font') {
                var fontSize = ['x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', '-webkit-xxx-large'];
                var styleAttrs = {
                    'color': 'color',
                    'face': 'font-family',
                    'size': 'font-size'
                };
                if (!node.attr.style) node.attr.style = [];
                if (!node.styleStr) node.styleStr = '';
                for (var key in styleAttrs) {
                    if (node.attr[key]) {
                        var value = key === 'size' ? fontSize[node.attr[key] - 1] : node.attr[key];
                        node.attr.style.push(styleAttrs[key]);
                        node.attr.style.push(value);
                        node.styleStr += styleAttrs[key] + ': ' + value + ';';
                    }
                }
            }

            //临时记录source资源
            if (node.tag === 'source') {
                results.source = node.attr.src;
            }

            if (unary) {
                // if this tag doesn't have end tag
                // like <img src="hoge.png"/>
                // add to parents
                var parent = bufArray[0] || results;
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                parent.nodes.push(node);
            } else {
                bufArray.unshift(node);
            }
        },
        end: function end(tag) {
            //debug(tag);
            // merge into parent tag
            var node = bufArray.shift();
            if (node.tag !== tag) console.error('invalid state: mismatch end tag');

            //当有缓存source资源时于于video补上src资源
            if (node.tag === 'video' && results.source) {
                node.attr.src = results.source;
                delete results.source;
            }

            if (bufArray.length === 0) {
                results.nodes.push(node);
            } else {
                var parent = bufArray[0];
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                parent.nodes.push(node);
            }
        },
        chars: function chars(text) {
            //debug(text);
            var node = {
                node: 'text',
                text: text,
                textArray: transEmojiStr(text)
            };

            if (bufArray.length === 0) {
                node.index = index.toString();
                index += 1;
                results.nodes.push(node);
            } else {
                var parent = bufArray[0];
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                node.index = parent.index + '.' + parent.nodes.length;
                parent.nodes.push(node);
            }
        },
        comment: function comment(text) {
            //debug(text);
            // var node = {
            //     node: 'comment',
            //     text: text,
            // };
            // var parent = bufArray[0];
            // if (parent.nodes === undefined) {
            //     parent.nodes = [];
            // }
            // parent.nodes.push(node);
        }
    });
    return results;
};

function transEmojiStr(str) {
    // var eReg = new RegExp("["+__reg+' '+"]");
    //   str = str.replace(/\[([^\[\]]+)\]/g,':$1:')

    var emojiObjs = [];
    //如果正则表达式为空
    if (__emojisReg.length == 0 || !__emojis) {
        var emojiObj = {};
        emojiObj.node = "text";
        emojiObj.text = str;
        array = [emojiObj];
        return array;
    }
    //这个地方需要调整
    str = str.replace(/\[([^\[\]]+)\]/g, ':$1:');
    var eReg = new RegExp("[:]");
    var array = str.split(eReg);
    for (var i = 0; i < array.length; i++) {
        var ele = array[i];
        var emojiObj = {};
        if (__emojis[ele]) {
            emojiObj.node = "element";
            emojiObj.tag = "emoji";
            emojiObj.text = __emojis[ele];
            emojiObj.baseSrc = __emojisBaseSrc;
        } else {
            emojiObj.node = "text";
            emojiObj.text = ele;
        }
        emojiObjs.push(emojiObj);
    }

    return emojiObjs;
}

function emojisInit() {
    var reg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var baseSrc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "/wxParse/emojis/";
    var emojis = arguments[2];

    __emojisReg = reg;
    __emojisBaseSrc = baseSrc;
    __emojis = emojis;
}

module.exports = {
    html2json: html2json,
    emojisInit: emojisInit
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0bWwyanNvbi5qcyJdLCJuYW1lcyI6WyJfX3BsYWNlSW1nZVVybEh0dHBzIiwiX19lbW9qaXNSZWciLCJfX2Vtb2ppc0Jhc2VTcmMiLCJfX2Vtb2ppcyIsInd4RGlzY29kZSIsInJlcXVpcmUiLCJIVE1MUGFyc2VyIiwiZW1wdHkiLCJtYWtlTWFwIiwiYmxvY2siLCJpbmxpbmUiLCJjbG9zZVNlbGYiLCJmaWxsQXR0cnMiLCJzcGVjaWFsIiwic3RyIiwib2JqIiwiaXRlbXMiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJxIiwidiIsInJlbW92ZURPQ1RZUEUiLCJodG1sIiwicmVwbGFjZSIsInRyaW1IdG1sIiwiaHRtbDJqc29uIiwiYmluZE5hbWUiLCJzdHJEaXNjb2RlIiwiYnVmQXJyYXkiLCJyZXN1bHRzIiwibm9kZSIsIm5vZGVzIiwiaW1hZ2VzIiwiaW1hZ2VVcmxzIiwiaW5kZXgiLCJzdGFydCIsInRhZyIsImF0dHJzIiwidW5hcnkiLCJ0b1N0cmluZyIsInBhcmVudCIsInVuZGVmaW5lZCIsInRhZ1R5cGUiLCJhdHRyIiwicmVkdWNlIiwicHJlIiwibmFtZSIsInZhbHVlIiwiY2xhc3NTdHIiLCJzdHlsZVN0ciIsIm1hdGNoIiwiQXJyYXkiLCJpc0FycmF5IiwicHVzaCIsImltZ0luZGV4IiwiaW1nVXJsIiwic3JjIiwic3BsaWNlIiwidXJsVG9IdHRwVXJsIiwiZnJvbSIsImZvbnRTaXplIiwic3R5bGVBdHRycyIsInN0eWxlIiwia2V5Iiwic291cmNlIiwidW5zaGlmdCIsImVuZCIsInNoaWZ0IiwiY29uc29sZSIsImVycm9yIiwiY2hhcnMiLCJ0ZXh0IiwidGV4dEFycmF5IiwidHJhbnNFbW9qaVN0ciIsImNvbW1lbnQiLCJlbW9qaU9ianMiLCJlbW9qaU9iaiIsImFycmF5IiwiZVJlZyIsIlJlZ0V4cCIsImVsZSIsImJhc2VTcmMiLCJlbW9qaXNJbml0IiwicmVnIiwiZW1vamlzIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7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QVM4RSxHQUFULENBQWhCO0FBQ0FKLHFCQUFTSyxPQUFULEdBQWtCaEYsZUFBbEI7QUFDRCxTQUxELE1BS0s7QUFDSDJFLHFCQUFTOUMsSUFBVCxHQUFnQixNQUFoQjtBQUNBOEMscUJBQVNMLElBQVQsR0FBZ0JTLEdBQWhCO0FBQ0Q7QUFDREwsa0JBQVV0QixJQUFWLENBQWV1QixRQUFmO0FBQ0Q7O0FBRUQsV0FBT0QsU0FBUDtBQUNEOztBQUVELFNBQVNPLFVBQVQsR0FBNkQ7QUFBQSxRQUF6Q0MsR0FBeUMsdUVBQXJDLEVBQXFDO0FBQUEsUUFBbENGLE9BQWtDLHVFQUExQixrQkFBMEI7QUFBQSxRQUFQRyxNQUFPOztBQUN6RHBGLGtCQUFjbUYsR0FBZDtBQUNBbEYsc0JBQWdCZ0YsT0FBaEI7QUFDQS9FLGVBQVNrRixNQUFUO0FBQ0g7O0FBRURDLE9BQU9DLE9BQVAsR0FBaUI7QUFDYjdELGVBQVdBLFNBREU7QUFFYnlELGdCQUFXQTtBQUZFLENBQWpCIiwiZmlsZSI6Imh0bWwyanNvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogaHRtbDJKc29uIOaUuemAoOadpeiHqjogaHR0cHM6Ly9naXRodWIuY29tL0p4Y2svaHRtbDJqc29uXG4gKlxuICpcbiAqIGF1dGhvcjogRGkgKOW+ruS/oeWwj+eoi+W6j+W8gOWPkeW3peeoi+W4iClcbiAqIG9yZ2FuaXphdGlvbjogV2VBcHBEZXYo5b6u5L+h5bCP56iL5bqP5byA5Y+R6K665Z2bKShodHRwOi8vd2VhcHBkZXYuY29tKVxuICogICAgICAgICAgICAgICDlnoLnm7Tlvq7kv6HlsI/nqIvluo/lvIDlj5HkuqTmtYHnpL7ljLpcbiAqXG4gKiBnaXRodWLlnLDlnYA6IGh0dHBzOi8vZ2l0aHViLmNvbS9pY2luZHkvd3hQYXJzZVxuICpcbiAqIGZvcjog5b6u5L+h5bCP56iL5bqP5a+M5paH5pys6Kej5p6QXG4gKiBkZXRhaWwgOiBodHRwOi8vd2VhcHBkZXYuY29tL3Qvd3hwYXJzZS1hbHBoYTAtMS1odG1sLW1hcmtkb3duLzE4NFxuICovXG5cbnZhciBfX3BsYWNlSW1nZVVybEh0dHBzID0gXCJodHRwc1wiO1xudmFyIF9fZW1vamlzUmVnID0gJyc7XG52YXIgX19lbW9qaXNCYXNlU3JjID0gJyc7XG52YXIgX19lbW9qaXMgPSB7fTtcbnZhciB3eERpc2NvZGUgPSByZXF1aXJlKCcuL3d4RGlzY29kZS5qcycpO1xudmFyIEhUTUxQYXJzZXIgPSByZXF1aXJlKCcuL2h0bWxwYXJzZXIuanMnKTtcbi8vIEVtcHR5IEVsZW1lbnRzIC0gSFRNTCA1XG52YXIgZW1wdHkgPSBtYWtlTWFwKFwiYXJlYSxiYXNlLGJhc2Vmb250LGJyLGNvbCxmcmFtZSxocixpbWcsaW5wdXQsbGluayxtZXRhLHBhcmFtLGVtYmVkLGNvbW1hbmQsa2V5Z2VuLHNvdXJjZSx0cmFjayx3YnJcIik7XG4vLyBCbG9jayBFbGVtZW50cyAtIEhUTUwgNVxudmFyIGJsb2NrID0gbWFrZU1hcChcImJyLGEsY29kZSxhZGRyZXNzLGFydGljbGUsYXBwbGV0LGFzaWRlLGF1ZGlvLGJsb2NrcXVvdGUsYnV0dG9uLGNhbnZhcyxjZW50ZXIsZGQsZGVsLGRpcixkaXYsZGwsZHQsZmllbGRzZXQsZmlnY2FwdGlvbixmaWd1cmUsZm9vdGVyLGZvcm0sZnJhbWVzZXQsaDEsaDIsaDMsaDQsaDUsaDYsaGVhZGVyLGhncm91cCxocixpZnJhbWUsaW5zLGlzaW5kZXgsbGksbWFwLG1lbnUsbm9mcmFtZXMsbm9zY3JpcHQsb2JqZWN0LG9sLG91dHB1dCxwLHByZSxzZWN0aW9uLHNjcmlwdCx0YWJsZSx0Ym9keSx0ZCx0Zm9vdCx0aCx0aGVhZCx0cix1bCx2aWRlb1wiKTtcblxuLy8gSW5saW5lIEVsZW1lbnRzIC0gSFRNTCA1XG52YXIgaW5saW5lID0gbWFrZU1hcChcImFiYnIsYWNyb255bSxhcHBsZXQsYixiYXNlZm9udCxiZG8sYmlnLGJ1dHRvbixjaXRlLGRlbCxkZm4sZW0sZm9udCxpLGlmcmFtZSxpbWcsaW5wdXQsaW5zLGtiZCxsYWJlbCxtYXAsb2JqZWN0LHEscyxzYW1wLHNjcmlwdCxzZWxlY3Qsc21hbGwsc3BhbixzdHJpa2Usc3Ryb25nLHN1YixzdXAsdGV4dGFyZWEsdHQsdSx2YXJcIik7XG5cbi8vIEVsZW1lbnRzIHRoYXQgeW91IGNhbiwgaW50ZW50aW9uYWxseSwgbGVhdmUgb3BlblxuLy8gKGFuZCB3aGljaCBjbG9zZSB0aGVtc2VsdmVzKVxudmFyIGNsb3NlU2VsZiA9IG1ha2VNYXAoXCJjb2xncm91cCxkZCxkdCxsaSxvcHRpb25zLHAsdGQsdGZvb3QsdGgsdGhlYWQsdHJcIik7XG5cbi8vIEF0dHJpYnV0ZXMgdGhhdCBoYXZlIHRoZWlyIHZhbHVlcyBmaWxsZWQgaW4gZGlzYWJsZWQ9XCJkaXNhYmxlZFwiXG52YXIgZmlsbEF0dHJzID0gbWFrZU1hcChcImNoZWNrZWQsY29tcGFjdCxkZWNsYXJlLGRlZmVyLGRpc2FibGVkLGlzbWFwLG11bHRpcGxlLG5vaHJlZixub3Jlc2l6ZSxub3NoYWRlLG5vd3JhcCxyZWFkb25seSxzZWxlY3RlZFwiKTtcblxuLy8gU3BlY2lhbCBFbGVtZW50cyAoY2FuIGNvbnRhaW4gYW55dGhpbmcpXG52YXIgc3BlY2lhbCA9IG1ha2VNYXAoXCJ3eHh4Y29kZS1zdHlsZSxzY3JpcHQsc3R5bGUsdmlldyxzY3JvbGwtdmlldyxibG9ja1wiKTtcbmZ1bmN0aW9uIG1ha2VNYXAoc3RyKSB7XG4gICAgdmFyIG9iaiA9IHt9LCBpdGVtcyA9IHN0ci5zcGxpdChcIixcIik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKylcbiAgICAgICAgb2JqW2l0ZW1zW2ldXSA9IHRydWU7XG4gICAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcSh2KSB7XG4gICAgcmV0dXJuICdcIicgKyB2ICsgJ1wiJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRE9DVFlQRShodG1sKSB7XG4gICAgcmV0dXJuIGh0bWxcbiAgICAgICAgLnJlcGxhY2UoLzxcXD94bWwuKlxcPz5cXG4vLCAnJylcbiAgICAgICAgLnJlcGxhY2UoLzwuKiFkb2N0eXBlLipcXD5cXG4vLCAnJylcbiAgICAgICAgLnJlcGxhY2UoLzwuKiFET0NUWVBFLipcXD5cXG4vLCAnJyk7XG59XG5cbmZ1bmN0aW9uIHRyaW1IdG1sKGh0bWwpIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAgICAgLnJlcGxhY2UoL1xccj9cXG4rL2csICcnKVxuICAgICAgICAucmVwbGFjZSgvPCEtLS4qPy0tPi9pZywgJycpXG4gICAgICAgIC5yZXBsYWNlKC9cXC9cXCouKj9cXCpcXC8vaWcsICcnKVxuICAgICAgICAucmVwbGFjZSgvWyBdKzwvaWcsICc8Jylcbn1cblxuXG5mdW5jdGlvbiBodG1sMmpzb24oaHRtbCwgYmluZE5hbWUpIHtcbiAgICAvL+WkhOeQhuWtl+espuS4slxuICAgIGh0bWwgPSByZW1vdmVET0NUWVBFKGh0bWwpO1xuICAgIGh0bWwgPSB0cmltSHRtbChodG1sKTtcbiAgICBodG1sID0gd3hEaXNjb2RlLnN0ckRpc2NvZGUoaHRtbCk7XG4gICAgLy/nlJ/miJBub2Rl6IqC54K5XG4gICAgdmFyIGJ1ZkFycmF5ID0gW107XG4gICAgdmFyIHJlc3VsdHMgPSB7XG4gICAgICAgIG5vZGU6IGJpbmROYW1lLFxuICAgICAgICBub2RlczogW10sXG4gICAgICAgIGltYWdlczpbXSxcbiAgICAgICAgaW1hZ2VVcmxzOltdXG4gICAgfTtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIEhUTUxQYXJzZXIoaHRtbCwge1xuICAgICAgICBzdGFydDogZnVuY3Rpb24gKHRhZywgYXR0cnMsIHVuYXJ5KSB7XG4gICAgICAgICAgICAvL2RlYnVnKHRhZywgYXR0cnMsIHVuYXJ5KTtcbiAgICAgICAgICAgIC8vIG5vZGUgZm9yIHRoaXMgZWxlbWVudFxuICAgICAgICAgICAgdmFyIG5vZGUgPSB7XG4gICAgICAgICAgICAgICAgbm9kZTogJ2VsZW1lbnQnLFxuICAgICAgICAgICAgICAgIHRhZzogdGFnLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGJ1ZkFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIG5vZGUuaW5kZXggPSBpbmRleC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gYnVmQXJyYXlbMF07XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudC5ub2RlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5ub2RlcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBub2RlLmluZGV4ID0gcGFyZW50LmluZGV4ICsgJy4nICsgcGFyZW50Lm5vZGVzLmxlbmd0aFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYmxvY2tbdGFnXSkge1xuICAgICAgICAgICAgICAgIG5vZGUudGFnVHlwZSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5saW5lW3RhZ10pIHtcbiAgICAgICAgICAgICAgICBub2RlLnRhZ1R5cGUgPSBcImlubGluZVwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjbG9zZVNlbGZbdGFnXSkge1xuICAgICAgICAgICAgICAgIG5vZGUudGFnVHlwZSA9IFwiY2xvc2VTZWxmXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhdHRycy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICBub2RlLmF0dHIgPSBhdHRycy5yZWR1Y2UoZnVuY3Rpb24gKHByZSwgYXR0cikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IGF0dHIubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gYXR0ci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUgPT0gJ2NsYXNzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5kaXIodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIHZhbHVlID0gdmFsdWUuam9pbihcIlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jbGFzc1N0ciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGhhcyBtdWx0aSBhdHRpYnV0ZXNcbiAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSBpdCBhcnJheSBvZiBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUgPT0gJ3N0eWxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5kaXIodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIHZhbHVlID0gdmFsdWUuam9pbihcIlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zdHlsZVN0ciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5tYXRjaCgvIC8pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIGF0dHIgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgICAgICAgICAgLy8gbWVyZ2UgaXRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZVtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJlW25hbWVdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFscmVhZHkgYXJyYXksIHB1c2ggdG8gbGFzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZVtuYW1lXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luZ2xlIHZhbHVlLCBtYWtlIGl0IGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlW25hbWVdID0gW3ByZVtuYW1lXSwgdmFsdWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm90IGV4aXN0LCBwdXQgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZTtcbiAgICAgICAgICAgICAgICB9LCB7fSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v5a+5aW1n5re75Yqg6aKd5aSW5pWw5o2uXG4gICAgICAgICAgICBpZiAobm9kZS50YWcgPT09ICdpbWcnKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5pbWdJbmRleCA9IHJlc3VsdHMuaW1hZ2VzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB2YXIgaW1nVXJsID0gbm9kZS5hdHRyLnNyYztcbiAgICAgICAgICAgICAgICBpZiAoaW1nVXJsWzBdID09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGltZ1VybC5zcGxpY2UoMCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGltZ1VybCA9IHd4RGlzY29kZS51cmxUb0h0dHBVcmwoaW1nVXJsLCBfX3BsYWNlSW1nZVVybEh0dHBzKTtcbiAgICAgICAgICAgICAgICBub2RlLmF0dHIuc3JjID0gaW1nVXJsO1xuICAgICAgICAgICAgICAgIG5vZGUuZnJvbSA9IGJpbmROYW1lO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMuaW1hZ2VzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5pbWFnZVVybHMucHVzaChpbWdVcmwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlpITnkIZmb2505qCH562+5qC35byP5bGe5oCnXG4gICAgICAgICAgICBpZiAobm9kZS50YWcgPT09ICdmb250Jykge1xuICAgICAgICAgICAgICAgIHZhciBmb250U2l6ZSA9IFsneC1zbWFsbCcsICdzbWFsbCcsICdtZWRpdW0nLCAnbGFyZ2UnLCAneC1sYXJnZScsICd4eC1sYXJnZScsICctd2Via2l0LXh4eC1sYXJnZSddO1xuICAgICAgICAgICAgICAgIHZhciBzdHlsZUF0dHJzID0ge1xuICAgICAgICAgICAgICAgICAgICAnY29sb3InOiAnY29sb3InLFxuICAgICAgICAgICAgICAgICAgICAnZmFjZSc6ICdmb250LWZhbWlseScsXG4gICAgICAgICAgICAgICAgICAgICdzaXplJzogJ2ZvbnQtc2l6ZSdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmICghbm9kZS5hdHRyLnN0eWxlKSBub2RlLmF0dHIuc3R5bGUgPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGUuc3R5bGVTdHIpIG5vZGUuc3R5bGVTdHIgPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gc3R5bGVBdHRycykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5hdHRyW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGtleSA9PT0gJ3NpemUnID8gZm9udFNpemVbbm9kZS5hdHRyW2tleV0tMV0gOiBub2RlLmF0dHJba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuYXR0ci5zdHlsZS5wdXNoKHN0eWxlQXR0cnNba2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmF0dHIuc3R5bGUucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnN0eWxlU3RyICs9IHN0eWxlQXR0cnNba2V5XSArICc6ICcgKyB2YWx1ZSArICc7JztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/kuLTml7borrDlvZVzb3VyY2XotYTmupBcbiAgICAgICAgICAgIGlmKG5vZGUudGFnID09PSAnc291cmNlJyl7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5zb3VyY2UgPSBub2RlLmF0dHIuc3JjO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodW5hcnkpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGlzIHRhZyBkb2Vzbid0IGhhdmUgZW5kIHRhZ1xuICAgICAgICAgICAgICAgIC8vIGxpa2UgPGltZyBzcmM9XCJob2dlLnBuZ1wiLz5cbiAgICAgICAgICAgICAgICAvLyBhZGQgdG8gcGFyZW50c1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBidWZBcnJheVswXSB8fCByZXN1bHRzO1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQubm9kZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQubm9kZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFyZW50Lm5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJ1ZkFycmF5LnVuc2hpZnQobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVuZDogZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAgICAgLy9kZWJ1Zyh0YWcpO1xuICAgICAgICAgICAgLy8gbWVyZ2UgaW50byBwYXJlbnQgdGFnXG4gICAgICAgICAgICB2YXIgbm9kZSA9IGJ1ZkFycmF5LnNoaWZ0KCk7XG4gICAgICAgICAgICBpZiAobm9kZS50YWcgIT09IHRhZykgY29uc29sZS5lcnJvcignaW52YWxpZCBzdGF0ZTogbWlzbWF0Y2ggZW5kIHRhZycpO1xuXG4gICAgICAgICAgICAvL+W9k+aciee8k+WtmHNvdXJjZei1hOa6kOaXtuS6juS6jnZpZGVv6KGl5LiKc3Jj6LWE5rqQXG4gICAgICAgICAgICBpZihub2RlLnRhZyA9PT0gJ3ZpZGVvJyAmJiByZXN1bHRzLnNvdXJjZSl7XG4gICAgICAgICAgICAgICAgbm9kZS5hdHRyLnNyYyA9IHJlc3VsdHMuc291cmNlO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXN1bHRzLnNvdXJjZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJ1ZkFycmF5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMubm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IGJ1ZkFycmF5WzBdO1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQubm9kZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQubm9kZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFyZW50Lm5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNoYXJzOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgLy9kZWJ1Zyh0ZXh0KTtcbiAgICAgICAgICAgIHZhciBub2RlID0ge1xuICAgICAgICAgICAgICAgIG5vZGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICAgICAgICAgIHRleHRBcnJheTp0cmFuc0Vtb2ppU3RyKHRleHQpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoYnVmQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5pbmRleCA9IGluZGV4LnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5ub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gYnVmQXJyYXlbMF07XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudC5ub2RlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5ub2RlcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBub2RlLmluZGV4ID0gcGFyZW50LmluZGV4ICsgJy4nICsgcGFyZW50Lm5vZGVzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHBhcmVudC5ub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb21tZW50OiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgLy9kZWJ1Zyh0ZXh0KTtcbiAgICAgICAgICAgIC8vIHZhciBub2RlID0ge1xuICAgICAgICAgICAgLy8gICAgIG5vZGU6ICdjb21tZW50JyxcbiAgICAgICAgICAgIC8vICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICAgICAgLy8gfTtcbiAgICAgICAgICAgIC8vIHZhciBwYXJlbnQgPSBidWZBcnJheVswXTtcbiAgICAgICAgICAgIC8vIGlmIChwYXJlbnQubm9kZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gICAgIHBhcmVudC5ub2RlcyA9IFtdO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gcGFyZW50Lm5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG5mdW5jdGlvbiB0cmFuc0Vtb2ppU3RyKHN0cil7XG4gIC8vIHZhciBlUmVnID0gbmV3IFJlZ0V4cChcIltcIitfX3JlZysnICcrXCJdXCIpO1xuLy8gICBzdHIgPSBzdHIucmVwbGFjZSgvXFxbKFteXFxbXFxdXSspXFxdL2csJzokMTonKVxuXG4gIHZhciBlbW9qaU9ianMgPSBbXTtcbiAgLy/lpoLmnpzmraPliJnooajovr7lvI/kuLrnqbpcbiAgaWYoX19lbW9qaXNSZWcubGVuZ3RoID09IDAgfHwgIV9fZW1vamlzKXtcbiAgICAgIHZhciBlbW9qaU9iaiA9IHt9XG4gICAgICBlbW9qaU9iai5ub2RlID0gXCJ0ZXh0XCI7XG4gICAgICBlbW9qaU9iai50ZXh0ID0gc3RyO1xuICAgICAgYXJyYXkgPSBbZW1vamlPYmpdO1xuICAgICAgcmV0dXJuIGFycmF5O1xuICB9XG4gIC8v6L+Z5Liq5Zyw5pa56ZyA6KaB6LCD5pW0XG4gIHN0ciA9IHN0ci5yZXBsYWNlKC9cXFsoW15cXFtcXF1dKylcXF0vZywnOiQxOicpXG4gIHZhciBlUmVnID0gbmV3IFJlZ0V4cChcIls6XVwiKTtcbiAgdmFyIGFycmF5ID0gc3RyLnNwbGl0KGVSZWcpO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspe1xuICAgIHZhciBlbGUgPSBhcnJheVtpXTtcbiAgICB2YXIgZW1vamlPYmogPSB7fTtcbiAgICBpZihfX2Vtb2ppc1tlbGVdKXtcbiAgICAgIGVtb2ppT2JqLm5vZGUgPSBcImVsZW1lbnRcIjtcbiAgICAgIGVtb2ppT2JqLnRhZyA9IFwiZW1vamlcIjtcbiAgICAgIGVtb2ppT2JqLnRleHQgPSBfX2Vtb2ppc1tlbGVdO1xuICAgICAgZW1vamlPYmouYmFzZVNyYz0gX19lbW9qaXNCYXNlU3JjO1xuICAgIH1lbHNle1xuICAgICAgZW1vamlPYmoubm9kZSA9IFwidGV4dFwiO1xuICAgICAgZW1vamlPYmoudGV4dCA9IGVsZTtcbiAgICB9XG4gICAgZW1vamlPYmpzLnB1c2goZW1vamlPYmopO1xuICB9XG5cbiAgcmV0dXJuIGVtb2ppT2Jqcztcbn1cblxuZnVuY3Rpb24gZW1vamlzSW5pdChyZWc9JycsYmFzZVNyYz1cIi93eFBhcnNlL2Vtb2ppcy9cIixlbW9qaXMpe1xuICAgIF9fZW1vamlzUmVnID0gcmVnO1xuICAgIF9fZW1vamlzQmFzZVNyYz1iYXNlU3JjO1xuICAgIF9fZW1vamlzPWVtb2ppcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaHRtbDJqc29uOiBodG1sMmpzb24sXG4gICAgZW1vamlzSW5pdDplbW9qaXNJbml0XG59O1xuIl19