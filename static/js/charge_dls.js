var vue = new Vue({
    el: '#app',
    data: {
        appName: '',
        balance: 0,
        money: 0,
        customMoney: '',
        minMoney: 10,
        maxMoney: 5000,
        channelIndex: 0,
        channelId: '',
        confId: 0,
        payType: '',
        exchangeId: 0,
        cardList: [],
        channelList: [],
        bindid: 0,
        version: '',
        qrcodeName: '',
        lock_pay: 0,
        token: '',
        isShowTip: false,
        thirdBrower: false,
        browser: null,
        chargeStatusIndex: 0, // 默认第一位为选中充值渠道
        chargeTj: 0, // 默认充值推荐为第一位
    },
    created: function () {
        this.exchangeId = ZB_Util.getParam('exchangeId');
        this.appName = ZB_Util.getParam('appName');
        this.version = ZB_Util.getParam('version');
        this.token = ZB_Util.getParam('token');
        this.browser = ZB_Util.getParam('browser');
        if (ZB_Util.getParam('thirdBrower')) {
            this.thirdBrower = true;
        }

        // 处理通过URL重新定义token
        if (this.token) {
            this.token = $.base64.decode(this.token);
            ZB_Util.setCookie('token', this.token);
        }

        this.getAccountInfo();
        this.getBankList();
        this.getPayChannelList();
    },
    mounted: function () {
        this.$nextTick(function () {
            $('#loader-main').hide();
        })
    },
    methods: {
        getAccountInfo: function () {
            var self = this;
            var url = SHOP_INTF + 'clientPort/exchangeAccountList';
            var param = {
                ts: new Date().getTime()
            }
            $.getJSON(url, param, function (res) {
                if (res.resultCode != 0) {
                    ZB_Util.msg(res.msg);
                    return;
                }
                $.each(res.accountInfoList, function (key, item) {
                    if (DLS_EXCHANGE_ID == item.exchangeId) {
                        self.balance = item.balance;
                        return false;
                    }
                })
            })
        },
        JumpAliAppFail: function (type) {
            if (type == 0) {
                layer.alert('支付失败，请重新支付！', function () {
                    layer.closeAll()
                });
                return;
            }
            if (type == 1 || type == 2) {
                $(".j_wx_qrcode").show();
                return
            }
        },
        selectMoney: function (money) {
            this.money = money;
            this.customMoney = '';
        },
        selectChannel: function (item, index) {
            this.confId = item.confId;
            this.chargeStatusIndex = index;
            // 充值最高限额页面提醒
            if (item.confId == 73) {
                this.isShowTip = true;
            } else {
                this.isShowTip = false;
            }
        },
        // 表单方式提交
        payForm: function (url, params, method) {
            var html = '';
            $.each(params, function (i, item) {
                html += '<input type="hidden" name="' + i + '" value="' + item + '"/>';
            });
            $('.j_frm_pay').append(html);
            $('.j_frm_pay').attr('action', url);
            if (method == 'get') {
                $('.j_frm_pay').attr('method', method);
            }
            $('.j_frm_pay').submit();
        },
        // 支付宝SDK方式提交
        payAliPay: function (params) {
            if (ZB_Util.isIOS()) {
                window.webkit.messageHandlers.jumpAppWithType.postMessage(params);
            } else if (ZB_Util.isAndroid()) {
                javaScriptAlipay.Alipay(params);
            }
        },
        // 微信SDK方式提交
        payWxPay: function (appid, token) {
            JSInterface.changeActivity(appid, token);
        },
        // 新版微信SDK支付
        payWxPayV2: function (params) {
            if (ZB_Util.isIOS()) {
                window.webkit.messageHandlers.jumpAppWithType.postMessage(params);
            } else if (ZB_Util.isAndroid()) {
                javaScriptWeiXin.WeiXin(params);
            }
        },
        // 二维码方式提交
        payQrcode: function (url, confId, isShow) {
            $("#scan-img").qrcode({
                'width': $('#scan-img').width(),
                'height': $('#scan-img').height(),
                'text': url
            });
            if (confId == 1) {
                this.qrcodeName = '微信';
            }
            if (confId == 2) {
                this.qrcodeName = '支付宝';
            }
            if (isShow) {
                $(".j_wx_qrcode").show();
            }
        },
        // URL跳转方式提交
        payJumpUrl: function (url) {
            location.href = url;
        },
        payChargeHtml: function (chargeHtml) {
            var html = chargeHtml;
            var script = '<script>document.forms[0].submit();</script>';
            if (chargeHtml) {
                var w = window.open('about:blank', '_self');
                html += script;
                w.document.write(html);
            }
        },
        getBankList: function () {
            var self = this;
            var url = SHOP_INTF + 'amount/cardList';
            var param = {
                type: 0,
                exchangeid: this.exchangeId,
                ts: new Date().getTime()
            }
            $.getJSON(url, param, function (data) {
                if (0 != data.resultCode) {
                    ZB_Util.throw(data);
                    return;
                }
                self.cardList = data.cardList;
                if (self.cardList.length > 0) {
                    self.bindid = self.cardList[0].bindid;
                }
            })
        },
        //获取渠道列表
        getPayChannelList: function () {
            var self = this;
            var url = SHOP_INTF + 'amount/payChannelList';
            var param = {
                exchangeId: this.exchangeId,
                version: '1.1v',
                ts: new Date().getTime(),
            }
            $.getJSON(url, param, function (data) {
                if (0 != data.resultCode) {
                    ZB_Util.throw(data);
                    return;
                }
                data.pclist.sort(self.sortPosition);
                self.channelList = data.pclist;
            })
        },
        sortPosition: function (obj1, obj2) {
            return obj1.position - obj2.position
        },
        /**
         * 随机选择支付渠道服务商
         * @param arr array
         */
        randPayBiz: function (arr) {
            var pays = [];
            $.each(arr, function (key, val) {
                for (var i = 0; i < val.rule; i++) {
                    pays.push(val);
                }
            });
            var r = Math.floor(Math.random() * pays.length);
            this.channelId = pays[r].chId;
            this.confId = pays[r].confId;
            this.payType = pays[r].type;
            return true;
        },
        // 充值
        charge: function () {
            var self = this;
            if (self.confId == 0) {
                ZB_Util.msg('请选择支付渠道');
                return;
            }
            $.each(self.channelList, function (key, val) {
                if (self.confId != val.confId)
                    return true;
                self.randPayBiz(val.payNewVo);
                $.each(val.payNewVo, function (index, item) {
                    if (item.chId != self.channelId)
                        return true;
                    if (0 == item.isCard && self.cardList.length == 0) {
                        layer.alert('请您先绑定银行卡', function () {
                            if (ZB_Util.isIOS()) {
                                window.webkit.messageHandlers.BindingCards.postMessage(null);
                            } else if (ZB_Util.isAndroid()) {
                                javaScriptRealName.RealName();
                            }
                            layer.closeAll();
                        });
                        return false;
                    }
                    if (0 == item.isCard && 0 == self.bindid) {
                        layer.alert('请选择银行卡', function () {
                            layer.closeAll();
                        });
                        return false;
                    }
                    self.chargeMoney();
                    return false;
                });
            });
            var time = (new Date()).getTime();
            if (self.lock_pay && (time - self.lock_pay < 5000)) {
                layer.msg("请不要重复点击");
                return;
            } else {
                self.lock_pay = time;
            }
        },
        // 点击充值按钮 充值显示
        chargeMoney: function () {
            var self = this;
            if (self.customMoney != '') {
                self.money = self.customMoney;
            }
            // 充值渠道73. 限制
            if (self.channelId == 73) {
                if (self.money >= 10 && self.money <= 5000) {
                    if (self.money % 2) {
                        layer.msg('金额必须为整数！');
                        return;
                    }
                } else if (self.money > 5000) {
                    layer.msg('该渠道充值最大金额5000元');
                    return;
                }
            }
            if (self.money < self.minMoney) {
                layer.msg('充值最小金额为' + self.minMoney + '元');
                return;
            }

            var chargeAmount = self.money;
            // 微信新支付
            if (40 == self.channelId) {
                var params = {
                    amount: chargeAmount,
                    type: self.channelId,
                    exchangeId: self.exchangeId,
                    token: ZB_Util.getCookie('token'),
                    ts: (new Date()).getTime()
                };
                $.getJSON('/gyxq_app/amount/chargeNewPay', params, function (data) {
                    if (data.resultCode != 0) {
                        layer.msg(data.msg);
                        return;
                    }
                    if (self.version == 1) {
                        self.payWxPayV2(data.gatePay.requestFrontUrl);
                    } else {
                        self.payQrcode(data.gatePay.requestFrontUrl, true);
                    }
                })
                return;
            }

            // 玖捌玖快捷大额支付 34
            if (34 == self.channelId) {
                var param = {
                    amount: chargeAmount,
                    type: self.channelId,
                    bindid: self.bindid,
                    exchangeId: self.exchangeId,
                    ts: (new Date()).getTime(),
                }
                $.getJSON('/gyxq_app/amount/charge', param, function (ret) {
                    if (0 != ret.resultCode) {
                        layer.msg(ret.msg);
                        return;
                    }
                    layer.msg('您成功充值' + chargeAmount + "元");
                });
                return;
            }

            // 杉德银联特殊处理渠道ID：74、75
            if ((self.channelId == 74 || self.channelId == 75) && self.browser === null) {
                if (self.thirdBrower == false) {
                    if (location.href.indexOf('?') == -1) {
                        var chargeUrl = location.href + '?thirdBrower=1';
                    } else {
                        var chargeUrl = location.href + '&thirdBrower=1';
                    }
                    if (!self.token) {
                        chargeUrl = chargeUrl + '&token=' + $.base64.encode(ZB_Util.getCookie('token'));
                    }
                    javaScriptWeiXin.WeiXin(chargeUrl);
                    return;
                }
            }

            var param = {
                amount: chargeAmount,
                type: self.channelId,
                bindid: self.bindid,
                source: 1,
                exchangeId: self.exchangeId,
                channel: 'dby',
                ts: (new Date()).getTime()
            };
            if (self.payType == 1) {
                param.appName = self.appName;
            }
            $.getJSON('/gyxq_app/amount/charge', param, function (ret) {
                if (ret.resultCode != 0) {
                    layer.msg(ret.msg);
                    return;
                }
                switch (self.payType) {
                    case 1: // 微信SDK
                        self.payWxPay(ret.wftGate.appId, ret.wftGate.token_id);
                        break;
                    case 2: // H5表单
                        self.payForm(ret.gatePay.requestFrontUrl, ret.gatePay.params, ret.gatePay.subMethod);
                        break;
                    case 3: // 支付宝SDK
                        self.payQrcode(ret.gatePay.requestFrontUrl, self.confId, false);
                        self.payAliPay(ret.gatePay.requestFrontUrl);
                        break;
                    case 4: // URL跳转GET
                        self.payJumpUrl(decodeURIComponent(ret.gatePay.requestFrontUrl));
                        break;
                    case 5: // 点卡支付
                        break;
                    case 6: // 扫码支付
                        self.payQrcode(ret.gatePay.requestFrontUrl, self.confId, true);
                        break;
                    case 7: // 微信公众号
                        self.payWxPayV2(ret.gatePay.requestFrontUrl);
                        break;
                    case 8: // 98快捷自带脚本
                        paymentjs.createPayment(ret.dbyGate.credential, function (result, err) { });
                        break;
                    case 9: // 银联返回HTML提交
                        self.payChargeHtml(ret.chargeHtml);
                        break;
                    default:
                        layer.msg('没有匹配到支付类型，请稍后重试！');
                        break;
                }
            });
        }
    }
});