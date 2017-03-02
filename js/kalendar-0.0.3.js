(function($){
	$.fn.extend({
		/**
		 * [kalendar jquery日历插件]
		 * @param  {[type]} dirstDay     [自定义每周的第一天是星期几]
		 * @param  {[type]} disabledDays [禁用某一天:比如禁用1日、5日,写为[1,5]]
		 * @param  {[type]} disableWeek  [禁用周几:比如禁用周1、周5,写为[1,5]]
		 * @param  {[type]} shineDays    [标记某一天]
		 * @param  {[type]} shineWeek    [标记某一周]
		 * @param  {[type]} maxYear      [最大显示年份]
		 * @param  {[type]} minYear      [最小显示年份]
		 * @param  {[type]} maxDate      [最大有效日期 2016-08-10]
		 * @param  {[type]} minDate      [最小有效日期 2016-06-10]
		 * @param  {[type]} dateFormat   [日期格式]
		 * @param  {[type]} callback     [回调函数]
		 * @return {[type]}              [当前调用元素jQuery对象]
		 */
		kalendar: function(options){
			var defaults ={
				firstDay: 7,
				disabledDays: [],
				disableWeek: [],
				shineDays: [],
				shineWeek: [],
				maxYear: 2099,
				minYear: 1900,
				maxDate: "",
				minDate: "",
				dateFormat: "YYYY-MM-dd hh:mm:ss",
				callback: function(){}
			},
			settings = $.extend({}, defaults, options);
			return this.each(function(){
				// this指向匹配的dom元素
				var $this = $(this),_id = "_k"+$this.attr("id") || "_k"+(Math.ceil(Math.random()*10));
				// 大月1、3、5、7、8、10、12
				// 小月4、6、9、11
				// 特殊月：2月
				// 日期格式转换
				Date.prototype.dateFormatFn = function(format){
					// this指向实例
					// 获取实例的当前时间
					var Fmt = {
						Y: this.getFullYear(),
						M: this.getMonth(),
						d: this.getDate(),
						h: this.getHours(),
						m: this.getMinutes(),
						s: this.getSeconds()
					},
					regM = /(M|d|h|m|s)+/g,// 匹配除了年以外的参数
					regY = /(Y)+/gi;// 匹配年份
					format = format.replace(regM, function(context,group){
						var type = eval("(Fmt."+ group +")");
						var val = "0" + (group === "M" ? (type+1) : type);
						return val.slice(-2);
					});
					return format.replace(regY, function(context,group){
						return (eval("(Fmt."+ group +")")).toString().slice(-context.length);
					});
				}
				// var d = new Date("2010-12-11 12:12:12");
				// d.dateFormatFn(settings.dateFormat)// 调用方式
				// 判断数组是否包含元素
				Array.prototype.isInclude = function(arr){
					if(this.indexOf){
						return this.indexOf(arr);
					}
					//解决ie8以下数组不支持indexOf()方法
					for(var i=0,len=this.length;i<len;i++){
						if(this[i] == arr) return i;
					}
					return -1;
				};
				function _kalendar(){
					$this.isAppend = true;
					var _this = _kalendarObj.init();
					$this.on("click", function(e){
						_this.stopEvent(e);
						$("#"+_id).show().animate({"opacity":1},300)
						return _this;
					});
					$("html").on("click", function(){
						$("#"+_id).animate({"opacity":0},400,function(){
							$(this).hide();
						});
					});
				}
				var _kalendarObj = {
					// 大月31天
					solarMonth: new Array(0,2,4,6,7,9,11),
					// 日期范围
					limitRange: function(argsY,argsM,argsD,i){
						// console.log(1)
						var _limtY = parseInt($this.minDate.split("-")[0]), _limtM = parseInt($this.minDate.split("-")[1]) -1, _limtD = parseInt($this.minDate.split("-")[2]);
						var	limtY_ = parseInt($this.maxDate.split("-")[0]), limtM_ = parseInt($this.maxDate.split("-")[1]) -1, limtD_ = parseInt($this.maxDate.split("-")[2]);
						// 1. 如果不传参的话，不做日期限制，那么minDate == minYear.1.1, maxDate == maxYear.12.31
						$this.minDate||(_limtY = $this.minYear,_limtM = 0,_limtD = 1)
						$this.maxDate||(limtY_ = $this.maxYear,limtM_ = 12,limtD_ = 31)
						_limtM = _limtM||0;
						_limtD = _limtD||1;
						limtM_ = limtM_||11;
						limtD_ = limtD_||31;
						// 规则：
						// 2015-06-10____2016-08-10
						// 如果年份符合，两种情况，
						// 如果_limtY !== limtY_,
						// 如果_limtY == limtY_,则继续判断月，
						// 如果当前月符合，两种情况，等于最小月，则判断日，等于最大月判断日，在期间的不需要判断日直接返回false
						if(_limtY === limtY_ && argsY === _limtY){
							if(_limtM === limtM_){
								if(argsM === _limtM){
									if(i >= _limtD && i <= limtD_) return false;
								}
							}else{
								if(argsM === _limtM){
									if(i >= _limtD) return false;
								}else if(argsM > _limtM && argsM < limtM_){
									return false;
								}else if(argsM === limtM_){
									if(i <= limtD_) return false;
								}
							}
						}else{
							if(argsY === _limtY){
								if(argsM > _limtM) return false;
								if(argsM === _limtM){
									if(i >= _limtD) return false;
								}
							}else if(argsY > _limtY && argsY < limtY_){
								return false;
							}else if(argsY === limtY_){
								if(argsM < limtM_) return false;
								if(argsM === limtM_){
									if(i <= limtD_) return false;
								}
							}
						}
						return true;
					},
					zeroFill: function(n){//自动补零
						return ("0"+n).slice(-2);
					},
					setWeek: function(wIdx){// ->设置星期顺序
						// wIdx为第一天的星期的值,0-7; 而数组的索引是0-6; 所以wIdx = wIdx-1转换为和索引对应的值
						// 把数组weekAry的顺序按照wIdx为第一位的顺序重新组合
						var weekAry = ["一","二","三","四","五","六","日"], wIdx = wIdx -1, wHtml = "";
						var spliceWeekAry = weekAry.splice(wIdx),weekAry = weekAry.concat.apply(spliceWeekAry,weekAry);
						// 星期的显示顺序
						// for(w in weekAry){ // ->for in 循环通常用来循环遍历对象的属性而不是用来遍历数组
						// 	console.log(w);// ->在这里面执行了八次，而不是七次原因是：我们在Array原型上扩展了一个方法，这个方法是可以被遍历出来的
						// 	if(w === "isInclude") return;
						// 	wHtml += "<span>"+ weekAry[w] +"</span>";
						// }
						for(var w = 0, len = weekAry.length; w<len; w++){
							wHtml += "<span>"+ weekAry[w] +"</span>";
						}
						$("#"+_id).find(".dateWeek").html(wHtml);
					},
					checkWeek: function(argsY,argsM,argsD,ele){// 查询每一天都是周几以便于一一对应赋值
						var baseDate = new Date(argsY,argsM,ele), // 当前的日期
							baseW = baseDate.getDay()||7, // 当前日期是周几
							weekLen = 7;
						return {
							eleWeek: baseW,//ele是周几
							weekLen: weekLen//一周长度
						};
					},
					autoHasTime: function(){// 自动获取系统时间
						var d = new Date(),nowHH = d.getHours(), nowMM = d.getMinutes(), nowSS = d.getSeconds(),
							time = this.zeroFill(nowHH) + ":" + this.zeroFill(nowMM) + ":" + this.zeroFill(nowSS);
						return time;
					},
					shineFun: function(argsY,argsM,argsD,i){// ->对日期高亮
						console.log(2)
						if($this.shineDays.isInclude(i) >=0) return true;// 可以指定任意一天进行高亮
						if($this.shineWeek.isInclude(this.checkWeek(argsY,argsM,argsD,i).eleWeek) >=0) return true;// 对指定的日期高亮，参数值为1——7之间的整数
						return false;
					},
					disableFun: function(argsY,argsM,argsD,i){// ->对日期禁用
						if($this.disabledDays.isInclude(i) >= 0) return true;// 指定某一天禁用
						if($this.disableWeek.isInclude(this.checkWeek(argsY,argsM,argsD,i).eleWeek) >= 0) return true;// 指定某星期几进行禁用
						return false;
					},
					isLeapYear: function(argsY){// ->判断当前年是否是闰年
						if(argsY % 400 === 0|| argsY %4 === 0&& argsM % 100 !== 0) return true;
						return false;
					},
					hasDays: function(argsY,argsM){// ->判断当前月有多少天
						var len = 30, html = "",
							curD = (new Date).getDate();
						if(this.solarMonth.isInclude(argsM) !== -1) len = 31;
						if(argsM === 1){// 二月
							// 润29，平28
							len = this.isLeapYear(argsY) ? 29 : 28;
						}
						return len;
					},
					// 给回调函数返回一个接口
					callBack: function(argsY,argsM,argsD){
						if(typeof $this.callback === "function"){
							// console.log(this)
							// $this.callback();
							$this.callback.call($this);
							return {
								id: _id,
								Y: argsY,
								M: argsM,
								D: argsD
							}
						}
					},
					setDay: function(argsY,argsM,argsD){
						// 1.设置星期
						this.setWeek($this.firstDay);
						// 2.判断当前月有多少天
						var len = this.hasDays(argsY,argsM);
						// 3.在第一天前面填充多少个空格
						var checkWeek = this.checkWeek(argsY,argsM,argsD,1),
							nowDayWeek = checkWeek.eleWeek, weekLen = checkWeek.weekLen;

						// 原理：
						// 1 是周五，填充四个，默认第一天是周一checkWeek(1)
						// 7如果第一天是周日，需要填充5个 ，checkWeek(1)+1 =6
						// 6周六，填充6个，checkWeek(1)+2 = 7
						// 2周二,填充3个,checkWeek(1) -2
						// 3周三,填充2个,checkWeek(1) -3
						// 4周四,填充1个,checkWeek(1) -4
						// 5周五,填充0个,checkWeek(1)-5
						// 如果checkWeek(1) >= firstDay, checkWeek(1)-firstDay+1,
						// 如果小于,checkWeek(1) - firstDay = -2, -1 +weekLen
						var frontBlank = (nowDayWeek >= $this.firstDay) ? (nowDayWeek-$this.firstDay+1) : (nowDayWeek - $this.firstDay + weekLen + 1);
						// 
						// 1 2 3 4 5 6 7
						//     1
						//     ->f = 1, n = 3, x = 3
						// 7 1 2 3 4 5 6
						//       1
						//       ->f = 7, n=3, x = f-n = 4
						// 4 5 6 7 1 2 3
						//             1
						//             ->f = 4, n = 3, x = 7=f+n
						// 6 7 1 2 3 4 5
						//         1
						//         ->f=6, n = 3, x = 5
						// n>f?n:
						// var frontBlank = (weekLen - $this.firstDay)
						// 知识点：数组使用join方法拼接，两个数组元素使用一个join分隔符连接起来, 这里面就是利用了这个原理：
						// 1、把<span></span>作为拼接符 来使用
						// 2、如果frontBlank为1的时候，html为空，前面不需要填充空白分隔符
						var html = new Array(frontBlank).join("<span></span>"); // 日期开头填充空白区域
						// 对当前月日期进行高亮或者禁用或者不进行任何操作
						argsD = argsD > len ? len : argsD;// 判断当前日期是否符合当前月份的要求

						$this.selectD = $this.selectD || argsD;
						// 检测selectD是否超出范围，比如1月30号，当切换到2月的时候没有30号，选中2月的最后一天
						$this.selectD = $this.selectD > len ? len : $this.selectD;

						// 优化：减少limitRange和shineFun的方法调用
						// 当limitRange为true时，argsD在这个范围外就无需验证
						for (var i = 1;i <= len; i++) {
							if(this.limitRange(argsY,argsM,argsD,i) || this.disableFun(argsY,argsM,argsD,i)){
								html += '<a href="javascript:;" class="disable">'+ i +'</a>';
							}else if(i === $this.selectD){// 将当前的日期或选中的日期高亮
								html += '<a href="javascript:;" class="cur">'+ i +'</a>';
							}else if(this.shineFun(argsY,argsM,argsD,i)){
								html += '<a href="javascript:;" class="shineWeek">'+ i +'</a>';
							}else{
								html += '<a href="javascript:;">'+ i +'</a>';
							}
						}
						$("#"+_id).find(".dateCont").html(html);
						$("#"+_id).find(".datePage").children("span").text(argsY + '-' + this.zeroFill(argsM+1) + '-' + this.zeroFill(argsD));
						//加入回调函数
						return this.callBack(argsY,argsM,argsD);
						// return {
						// 	Y: argsY,
						// 	M: argsM,
						// 	D: argsD
						// };
					},
					// 日历弹出位置信息
					_kOffSet: function(id){
						// 获取匹配元素的位置信息
						var _left = $this.offset().left,
							_top = $this.offset().top,
							_width = $this.outerWidth(),
							_height = $this.outerHeight();
						// 赋值给日历弹出层
						$("#"+id).css({"left":_left,"top":_top+_height+1});
					},
					// 日历DOM结构
					_kHtml: function(){
						var _kHtml = '';
							_kHtml += '<div class="date" id="'+ _id +'">';//多个日历区分
							_kHtml += '<div class="datePage">';
							_kHtml += '<a href="javascript:;" class="prevMonth"><em></em></a>';
							_kHtml += '<a href="javascript:;" class="prevYear"><em></em></a>';
							_kHtml += '<span>2016-07-08</span>';
							_kHtml += '<a href="javascript:;" class="nextYear"><em></em></a>';
							_kHtml += '<a href="javascript:;" class="nextMonth"><em></em></a>';
							_kHtml += '</div>';
							_kHtml += '<div class="dateWeek">';
							_kHtml += '<span>一</span>';
							_kHtml += '<span>二</span>';
							_kHtml += '<span>三</span>';
							_kHtml += '<span>四</span>';
							_kHtml += '<span>五</span>';
							_kHtml += '<span>六</span>';
							_kHtml += '<span>日</span>';
							_kHtml += '</div>';
							_kHtml += '<div class="dateCont">';
							_kHtml += '<span></span>';
							_kHtml += '<a href="javascript:;">1</a>';
							_kHtml += '<a href="javascript:;">2</a>';
							_kHtml += '<a href="javascript:;">3</a>';
							_kHtml += '</div>';
							_kHtml += '<input type="button" value="清空" id="clearBtn" />';
							_kHtml += '<input type="button" value="今天" id="todayBtn" />';
							_kHtml += '<input type="button" value="确定" id="okBtn" />';
							_kHtml += '</div>';
						// 将html代码插入body底部
						if($this.isAppend){
							$this.isAppend = false;
							$("body").append(_kHtml);
						}
						this._kOffSet(_id);
						var now = new Date, argsY = now.getFullYear(), argsM = now.getMonth(), argsD = now.getDate();
						$this.nowDay = this.setDay(argsY,argsM,argsD);
						this.mouseEvent(argsY,argsM,argsD);
						return {
							Y: argsY,
							M: argsM,
							D: argsD
						};
					},
					stopEvent: function(e){
						e ? e : window.event;
						e.stopPropagation();
					},
					setValue: function(Y,M,d){// ->对输入框赋值
						var value = Y+"-"+this.zeroFill(M+1)+"-"+this.zeroFill(d)+" "+this.autoHasTime();
						return new Date(value).dateFormatFn(settings.dateFormat);
					},
					mouseEvent: function(argsY,argsM,argsD){
						var _this = this;
						$("#"+_id).find(".nextMonth").click(function(e){
							_this.stopEvent(e);
							if(argsY <= $this.maxYear){
								++argsM;
								if(argsM > 11){
									argsM = 0;
									if(argsY == $this.maxYear) argsM = 11;
									argsY++;
									if(argsY > $this.maxYear) argsY = $this.maxYear;
								}
							}else if(argsY > $this.maxYear){
								argsY = $this.maxYear;
								return false;
							}
							if($this.selectD === 0) $this.selectD = argsD;
							$this.nowDay = _this.setDay(argsY,argsM,$this.selectD);
						});
						$("#"+_id).find(".prevMonth").click(function(e){
							_this.stopEvent(e);
							if(argsY >= $this.minYear){
								--argsM;
								if(argsM < 0){
									argsM = 11;
									if(argsY == $this.minYear) argsM = 0;
									argsY--;
									if(argsY < $this.minYear) argsY = $this.minYear;
								}
							}else if(argsY < $this.minYear){
								argsY = $this.minYear;
								return false;
							}
							if($this.selectD === 0) $this.selectD = argsD;
							$this.nowDay = _this.setDay(argsY,argsM,$this.selectD);
						});
						$("#"+_id).find(".nextYear").click(function(e){
							_this.stopEvent(e);
							if(argsY < $this.maxYear){
								++argsY;
							}else{
								return false;
							}
							if($this.selectD === 0) $this.selectD = argsD;
							$this.nowDay = _this.setDay(argsY,argsM,$this.selectD);
						});
						$("#"+_id).find(".prevYear").click(function(e){
							_this.stopEvent(e);
							if(argsY > $this.minYear){
								--argsY;
							}else{
								return false;
							}
							if($this.selectD === 0) $this.selectD = argsD;
							$this.nowDay = _this.setDay(argsY,argsM,$this.selectD);
						});
						// ->对日期对象绑定点击事件: 用事件委托的方式进行绑定
						$("#"+_id).find(".dateCont").on("click", function(e){
							_this.stopEvent(e);
							if(e.target.localName === "a" && [].isInclude.call(e.target.classList,"disable") === -1){
								// 把当前点击的日期选中并赋值给输入框中
								$(e.target).addClass("cur").siblings("a").removeClass("cur");
								$this.selectD = e.target.innerText;
								// var value = argsY+"-"+_this.zeroFill(argsM+1)+"-"+_this.zeroFill($this.selectD)+" "+_this.autoHasTime();
								// value = new Date(value).dateFormatFn(settings.dateFormat);
								$this.val(_this.setValue(argsY,argsM,$this.selectD));
							}
						});
						// 按钮事件绑定
						$("#"+_id).off("click","#todayBtn").on("click","#todayBtn",function(e){
							_this.stopEvent(e);
							// $this.val($this.today.Y + '-' + _this.zeroFill($this.today.M+1) + '-' + _this.zeroFill($this.today.D));// 输入框赋值
							$this.val(_this.setValue($this.today.Y,$this.today.M,$this.today.D));// 输入框赋值
						});
						$("#"+_id).off("click","#clearBtn").on("click","#clearBtn",function(e){
							_this.stopEvent(e);
							$this.val("");// 清空重新赋值
						});
						$("#"+_id).off("click","#okBtn").on("click","#okBtn",function(e){
							_this.stopEvent(e);
							// 检测月份和日期是否能对应上，比如说，如果选中的是30号，月份为2月，则不能显示为2月30号，应显示为当前的2月最后一天，28或29
							// console.log(len)
							var eleD = $this.selectD, len = _this.hasDays(argsY,argsM);
							eleD = eleD > len ? len : eleD;
							$this.val(_this.setValue(argsY,argsM,eleD));// 输入框赋值
						});
					},
					// 初始化
					init: function(){
						$this.firstDay = settings.firstDay;
						$this.disabledDays = settings.disabledDays;
						$this.disableWeek = settings.disableWeek;
						$this.shineDays = settings.shineDays;
						$this.shineWeek = settings.shineWeek;
						$this.dateFormat = settings.dateFormat;
						$this.maxYear = settings.maxYear;
						$this.minYear = settings.minYear;
						$this.minDate = settings.minDate;
						$this.maxDate = settings.maxDate;
						$this.callback = settings.callback;
						$this.selectD = 0;
						$this.nowDay = $this.today;
						$this._id = _id;
						$this.today = this._kHtml();
						return this;
					}
				}
				_kalendar();
			});
		}
	})
})(jQuery);
// 先计算出星期的顺序赋值，然后计算当前月的天数和第一天是周几，按照顺序排列
// 这里面用到的知识点：
// 1、call,apply方法
// 2、事件委托（绑定点击事件）
// 3、eval将字符串转换为js代码执行
// 4、关键词this指向问题
// 5、prototype原型
// 6、正则
// 7、字符串join()方法拼接原理