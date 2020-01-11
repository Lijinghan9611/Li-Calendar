<template>
	<view>
		<view class='calendar-Time-header under_line'>
			<text class='calendar-lastMonth' @tap="subMonth" v-bind:class="{'calendar-btn-disabled' : lastDisabled }">{{lastText}}</text>
			<text class='calendar-TimeH'>{{title_time}}</text>
			<text class='calendar-nextMonth' @tap="addMonth" v-bind:class="{'calendar-btn-disabled' : nextDisabled }">{{nextText}}</text>
			<text class='calendar-backToToday' @tap="backToToday">回到今天</text>
		</view>
		<view class='ClearBoth'></view>
		<view class="calendar-content">
			<view class="calendar-row calendar-header">
				<view class="calendar-col aligncanter">日</view>
				<view class="calendar-col aligncanter">一</view>
				<view class="calendar-col aligncanter">二</view>
				<view class="calendar-col aligncanter">三</view>
				<view class="calendar-col aligncanter">四</view>
				<view class="calendar-col aligncanter">五</view>
				<view class="calendar-col aligncanter">六</view>
			</view>
			<view class="calendar-row calendar-day" v-bind:style="{'transform':transformObj, 'transition-duration':transformTimeObj}" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend">
				<view class="calendar-col aligncanter calendar-col-lastMonth" v-for='item in beforeDateList' v-bind:key='item.key'
				 @tap="subMonth" v-bind:class="{'calendar-out-of-Date' : item.outOfDate }">{{item.dateIndex}}
					<text class='calendar-text'>{{item.markText}}</text>
				</view>

				<view class="calendar-col aligncanter currentDays" v-bind:class="{'calendar-active' : item.dateIndex == currentSelectTime
				, 'calendar-today' : item.isToday 
				, 'calendar-range' : item.isRanges
				, 'calendar-out-of-Date' : item.outOfDate }"
				 v-for='item in dateList' v-bind:key='item.key' @tap="selectedDateFun(item.dateIndex)">
					<view class='dayValue'>
						<text class='calendar-date calendar-day-6-7' v-if="item.isDaySunOrSat">{{item.dateIndex}}</text>
						<text v-else class='calendar-date'>{{item.dateIndex}}</text>
						<text class='calendar-point' v-bind:style="{'color':item.pointTextColor?item.pointTextColor:maskColor}">{{item.pointText}}</text>
						<text class='calendar-text' v-bind:style="{'color':item.markTextColor?item.markTextColor:maskColor}">{{item.markText}}</text>
					</view>
				</view>

				<view class="calendar-col aligncanter calendar-col-nextMonth" v-for='item in afterDateList' v-bind:key='item.key'
				 @tap="addMonth" v-bind:class="{'calendar-out-of-Date' : item.outOfDate }">{{item.dateIndex}}
					<text class='calendar-text'>{{item.markText}}</text>
				</view>
			</view>
			<view class="ClearBoth"></view>
		</view>
	</view>
</template>

<script>
	import lunarYearTool from './sloarToLunar.js'
	export default {
		name: 'Li-Calendar',
		props: {
			/**
			 * @description 当前时间 yyyy-MM-dd
			 */
			currentTime: {
				type: String,
				default: function() {
					let timeObj = new Date();
					return timeObj.getFullYear() + "-" + (timeObj.getMonth() + 1) + "-" + timeObj.getDate();
				}
			},
			/**
			 * @description 标记点列表
			 * time	标记时间	yyyy-MM-dd
			 * text	标记内容 
			 * markPoint 是否显示标记点 默认false
			 * markTextColor 标记内容颜色
			 * pointText 左上角标记点内容
			 * pointTextColor 标记点颜色
			 */
			mark: {
				type: Array,
				default: function() {
					return undefined;
				}
			},
			/**
			 * @description 上月文字
			 */
			lastText: {
				type: String,
				default: '〈'
			},
			/**
			 * @description 下月文字
			 */
			nextText: {
				type: String,
				default: '〉'
			},
			/**
			 * @description 全局标记点颜色，包括点和文字
			 */
			maskColor: {
				type: String,
				default: '#01AAED'
			},
			/**
			 * @description 是否显示农历，mask优先级高
			 */
			showLunar: {
				type: Boolean,
				default: true
			},
			/**
			 * @description 设置标记范围
			 */
			range: {
				type: Object,
				default: function() {
					return {
						rangeStart: undefined, //设置标记范围开始，yyyy-MM-dd
						rangeEnd: undefined //设置标记范围结束，yyyy-MM-dd
					}
				}
			},
			/**
			 * @description 是否开启范围选择模式
			 */
			rangeMode: {
				type: Boolean,
				default: false
			},
			/**
			 * @description 日历起始时间 yyyy-MM-dd
			 */
			dateStart: {
				type: String,
				default: '1970-01-01'
			},
			/**
			 * @description 日历结束时间 yyyy-MM-dd
			 */
			dateEnd: {
				type: String,
				default: '2100-12-31'
			},
			/**
			 * @description 是否可以滚动
			 */
			canDrag:{
				type: Boolean,
				default: true
			},
		},
		created() {
			this.render();
		},
		data() {
			return {
				nextDisabled: false,
				lastDisabled: false,
				currentSelectTime: undefined, //点击时保存的dateIndex
				title_time: '', //顶头文本
				year: undefined, //当前年
				month: undefined, //当前月
				beforeDateList: [], //上个月的日期列表
				dateList: [], //本月的日期列表
				afterDateList: [], //下个月的日期列表
				firstRangeSelected: false, // 范围开始时间是否已经选择
				rangeStart_: undefined, //标记范围开始，yyyyMM-dd
				rangeEnd_: undefined, //标记范围结束，yyyyMM-dd
				transform_x:0,
				transform_time:0,
			};
		},
		methods: {
			render(setTimeStr) { //初始化
				let that = this;
				let currentTimeStr = setTimeStr ? setTimeStr : that.currentTime;
				let timeObj = this.toDateByStr(currentTimeStr); //当前选定的时间
				//计算头部显示的年月
				let _tempTileMonth = (timeObj.getMonth() + 1);
				if (_tempTileMonth < 10)
					_tempTileMonth = '0' + _tempTileMonth;
				this.title_time = timeObj.getFullYear() + "年" + _tempTileMonth + "月";

				//获取当前时间月份1号
				let firstDayStr = timeObj.getFullYear() + "/" + (timeObj.getMonth() + 1) + "/01";
				let date = that.toDateByStr(firstDayStr);
				that.year = date.getFullYear();
				that.month = date.getMonth() + 1;
				let firstDayWeek = date.getDay(); //第一天是星期几
				let grid_sum = 0; //总格子数 ，用于后面填满格子
				//获取上一个月的天数
				let TempMonth;
				let TempYear;
				if (that.month == 1) { //跨年
					TempMonth = 12;
					TempYear = that.year - 1;
				} else {
					TempYear = that.year;
					TempMonth = that.month - 1;
				}
				let TempLastMonthStr = TempYear + "/" + TempMonth + "/01";
				let lastMonthTotalDay = that.getTotalDay(TempLastMonthStr);
				let lastMonthStartDay = lastMonthTotalDay - firstDayWeek;

				let _dateStart = that.toDateByStr1(that.dateStart);
				let _dateEnd = that.toDateByStr1(that.dateEnd);
				// 创建前面的日期
				that.beforeDateList = [];
				for (let i = 0; i < firstDayWeek; i++) {
					grid_sum++;
					lastMonthStartDay++;
					let tempObj = {
						dateIndex: lastMonthStartDay,
						key: 'before_' + i
					};

					//判断是否超出日期范围
					let _tempBeforeDate = new Date(TempYear + "/" + TempMonth + "/" + lastMonthStartDay);
					if (_dateStart > _tempBeforeDate || _tempBeforeDate > _dateEnd) {
						tempObj.outOfDate = true;
					}

					//获取农历
					if (that.showLunar) {
						let LunarDate = that.sloarToLunar(TempYear, TempMonth, lastMonthStartDay);
						let tempLunarDay = LunarDate.lunarDay == '初一' ? LunarDate.lunarMonth + '月' : LunarDate.lunarDay;
						tempObj.markText = tempLunarDay;
					}

					that.beforeDateList.push(tempObj);
				}

				//获取一个月的天数
				let totalDay = that.getTotalDay(currentTimeStr);
				 
				//生成本月日历
				let today = new Date();
				let today_year = today.getFullYear();
				let today_month = today.getMonth() + 1;
				let today_day = today.getDate();
				that.dateList = [];
				for (let i = 1; i <= totalDay; i++) { //循环日
					grid_sum++;

					let tempObj = {
						dateIndex: i,
						key: 'date_' + i,
						isRanges: false,
						isToday: false
					};
					//当前日期变量
					let tempDay = that.toDateByStr(that.year + "/" + that.month + "/" + i);

					//判断是否为当天
					if (today_year == that.year && today_month == that.month && today_day == i)
						tempObj.isToday = true;

					//周六和周日，特殊处理
					let tempCurrWeek = tempDay.getDay();
					if (tempCurrWeek == 0 || tempCurrWeek == 6)
						tempObj.isDaySunOrSat = true;

					//判断是否超出日期范围
					if (_dateStart > tempDay || tempDay > _dateEnd) {
						tempObj.outOfDate = true;
					}

					//获取农历
					if (that.showLunar) {
						let LunarDate = that.sloarToLunar(that.year, that.month, i);
						that.lunarMonth = LunarDate.lunarMonth;
						that.lunarYear = LunarDate.lunarYear;
						let tempLunarDay = LunarDate.lunarDay == '初一' ? LunarDate.lunarMonth + '月' : LunarDate.lunarDay;
						tempObj.lunarMonth = LunarDate.lunarMonth;
						tempObj.lunarYear = LunarDate.lunarYear;
						tempObj.lunarDay = LunarDate.lunarDay;
						tempObj.markText = tempLunarDay;
						tempObj.markTextColor = '#454545';
					}

					//设置了标记点
					if (that.mark) {
						for (let z = 0; z < that.mark.length; z++) { //判断是否为标记点
							let tempDayMark = that.toDateByStr1(that.mark[z].time.trim())
							if (tempDay.getTime() == tempDayMark.getTime()) {
								let tempTextStr = that.mark[z].text
								if (that.mark[z].markPoint != false) { // 是否显示点
									tempObj.pointText = that.mark[z].pointText ? that.mark[z].pointText : '●';
									tempObj.pointTextColor = that.mark[z].pointTextColor ? that.mark[z].pointTextColor : undefined;
								}
								if (tempTextStr != undefined && tempTextStr != "") { // 是否显示文字
									tempObj.markText = tempTextStr;
									tempObj.markTextColor = that.mark[z].markTextColor ? that.mark[z].markTextColor : undefined;
								}
								break;
							}
						}
					}

					that.dateList.push(tempObj);
				}

				that.setRange();

				// 创建后面的空白，补够五行
				that.afterDateList = [];
				if (grid_sum < 42) { // 创建后面的空白，补够五行
					let j = 0;

					//获取下一月
					let TempMonthNext;
					let TempYearNext;
					if (that.month == 12) { //跨年
						TempMonthNext = 1;
						TempYearNext = that.year + 1;
					} else {
						TempYearNext = that.year;
						TempMonthNext = that.month + 1;
					}

					for (let i = grid_sum; i < 42; i++) {
						j++;

						let tempObj = {
							dateIndex: j,
							key: 'after_' + j
						};
						//获取农历
						if (that.showLunar) {
							let LunarDate = that.sloarToLunar(TempYearNext, TempMonthNext, j);
							let tempLunarDay = LunarDate.lunarDay == '初一' ? LunarDate.lunarMonth + '月' : LunarDate.lunarDay;
							tempObj.markText = tempLunarDay;
						}

						//判断是否超出日期范围
						let _tempAfterDate = new Date(TempYearNext + "/" + TempMonthNext + "/" + j);
						if (_dateStart > _tempAfterDate || _tempAfterDate > _dateEnd) {
							tempObj.outOfDate = true;
						}

						that.afterDateList.push(tempObj);
					}
				}
			},
			sloarToLunar(year,month,day){
				// console.log('----')
				// console.log(year + "--" +month+ "--" + day)
				let result = lunarYearTool.sloarToLunar(year,month,day);
				//console.log(result)
				return result;
			},
			getTotalDay(time) { //获取月 日期总数
				time = time.replace(/-/g, "/");
				let selectedDate = new Date(time);
				if (selectedDate == "Invalid Date") {
					selectedDate = new Date(time + "/01");
				}
				
				let dayMany = new Date(selectedDate.getFullYear(),(selectedDate.getMonth() + 1), 0).getDate()
				return dayMany;
			},
			toDateByStr(timeStr) { //字符串转换时间，转换失败或者不传字符串则返回当前
				let timeObj;
				if (timeStr) {
					timeObj = new Date(timeStr.replace(/-/g, "/"));
				}
				if (!timeStr || timeObj == "Invalid Date")
					timeObj = new Date();
				return timeObj;
			},
			toDateByStr1(timeStr) { //字符串转换时间，转换失败或者不传字符串则null
				try {
					let timeObj;
					if (timeStr) {
						timeObj = new Date(timeStr.replace(/-/g, "/"));
					}
					if (!timeStr || timeObj == "Invalid Date")
						return null;
					return timeObj;
				} catch (e) {
					return null;
				}
			},
			getTimeStrFormat(timeStr) { //获取格式化的时间 yyyy-MM-dd
				let timeObj;
				if (timeStr) {
					timeObj = new Date(timeStr.replace(/-/g, "/"));
				}
				if (!timeStr || timeObj == "Invalid Date")
					timeObj = new Date();
				return timeObj.getFullYear() + "-" + (timeObj.getMonth() + 1) + "-" + timeObj.getDate();
			},
			selectedDateFun(index) { //点击日期
				let that = this;
				let selectObj = that.dateList[index - 1];
				selectObj.year = that.year;
				selectObj.month = that.month;
				selectObj.day = index;
				selectObj.time = that.year + "-" + that.month + "-" + index;
				that.$emit('dayChange', selectObj);

				//判断是否超出日期范围
				if (that.checkOutOfDate(selectObj.time)) {
					return;
				}

				that.currentSelectTime = index;

				//开启了范围选择模式
				if (that.rangeMode) {
					if (!that.firstRangeSelected) { //选择开始时间
						that.firstRangeSelected = !that.firstRangeSelected
						that.rangeStart_ = selectObj.time;
						that.rangeEnd_ = undefined;
						that.clearRange();
					} else { //选择了结束时间
						that.rangeEnd_ = selectObj.time;
						that.firstRangeSelected = !that.firstRangeSelected
						that.$emit('rangeChange', {
							start: that.rangeStart_,
							end: that.rangeEnd_,
						});
						that.setRange();
					}
				}
			},
			addMonth() { //加一个月
				let that = this;

				let _Month = that.month;
				let _Year = that.year;
				if (that.month == 12) { //跨年
					_Month = 1;
					_Year += 1;
				} else {
					_Month += 1;
				}

				let str = _Year + "/" + _Month + "/01";

				//判断是否超出日期范围
				if (that.checkOutOfDate(str)) {
					that.nextDisabled = true;
					return;
				}

				that.month = _Month;
				that.year = _Year;
				that.lastDisabled = false;

				//检查日期上限值是否在当月内，如果在则不能再切换下个月
				if (that.checkDateRange(that.year, that.month, 1)) {
					that.nextDisabled = true;
				}

				if (that.rangeMode) { //开启了范围模式
					that.currentSelectTime = undefined;
				}

				that.$emit('monthChange', {
					date: str
				});
				that.render(str);
			},
			subMonth() { //减一个月
				let that = this;

				let _Month = that.month;
				let _Year = that.year;
				if (that.month == 1) { //跨年
					_Month = 12;
					_Year -= 1;
				} else {
					_Month -= 1;
				}

				let str = _Year + "/" + _Month + "/01";

				//判断是否超出日期范围
				let _totalDay = that.getTotalDay(str);
				if (that.checkOutOfDate(_Year + "/" + _Month + "/" + _totalDay)) {
					that.lastDisabled = true;
					return;
				}

				that.month = _Month;
				that.year = _Year;
				that.nextDisabled = false;

				//检查日期下限值是否在当月内，如果在则不能再切换上个月
				if (that.checkDateRange(that.year, that.month)) {
					that.lastDisabled = true;
				}

				if (that.rangeMode) { //开启了范围模式
					that.currentSelectTime = undefined;
				}

				that.$emit('monthChange', {
					date: str
				});
				that.render(str);
			},
			backToToday() { //回到今天
				let currDate = new Date();
				let _year = currDate.getFullYear();
				let _month = currDate.getMonth() + 1;

				//如果已经是当月
				if (_year == this.year && _month == this.month) {
					return;
				}

				let value = _year + "/" + _month + "/" + currDate.getDate();
				this.$emit('monthChange', {
					date: value
				});
				this.render(value);
			},
			setRange() { //设置范围
				let that = this;
				let rangeStartDate = that.toDateByStr1(that.rangeStart_);
				let rangeEndDate = that.toDateByStr1(that.rangeEnd_);
				if (!rangeStartDate || !rangeEndDate)
					return;
				if (rangeStartDate > rangeEndDate) { //防止范围出错
					let tempD = rangeEndDate;
					rangeEndDate = rangeStartDate;
					rangeStartDate = tempD;
				}

				//循环判断范围
				for (let i = 0; i < that.dateList.length; i++) {
					let _TempDtStr = that.year + "/" + that.month + "/" + that.dateList[i].dateIndex;
					let _TempDt = that.toDateByStr1(_TempDtStr);
					that.dateList[i].isRanges = false;
					if (rangeStartDate <= _TempDt && _TempDt <= rangeEndDate) //时间在范围内
						that.dateList[i].isRanges = true;
				}
			},
			clearRange() { //关闭范围模式范围
				let that = this;
				//循环判断范围
				for (let i = 0; i < that.dateList.length; i++) {
					that.dateList[i].isRanges = false;
				}
			},
			checkOutOfDate(time) { //判断是否超出日期范围,yyyy-MM-dd
				let that = this;
				let _dateStart = that.toDateByStr1(that.dateStart);
				let _dateEnd = that.toDateByStr1(that.dateEnd);
				let _tempDate = that.toDateByStr1(time);
				if (_dateStart > _tempDate || _tempDate > _dateEnd) {
					return true;
				} else
					return false;
			},
			checkDateRange(year, month, type) { //判断范围界限值是否在当月内,yyyy-MM-dd,type；1 上限值,其他：下限值
				let that = this;

				let totalDay = that.getTotalDay(year + '/' + month + '/01');
				let firstD = that.toDateByStr1(year + '/' + month + '/01');
				let lastD = that.toDateByStr1(year + '/' + month + '/' + totalDay);

				if (type == 1) { //上限值
					let _dateEnd = that.toDateByStr1(that.dateEnd);
					if (firstD <= _dateEnd && _dateEnd <= lastD) {
						return true;
					} else
						return false;
				} else { //下限值
					let _dateStart = that.toDateByStr1(that.dateStart);
					if (firstD <= _dateStart && _dateStart <= lastD) {
						return true;
					} else
						return false;
				}
			},
			calendarTransform(x,time){  //日历滑动动画
				this.transform_x = x;
				this.transform_time = time;
			},
			touchstart(event) {
				if(!this.canDrag)
					return;
				this.startPageX = event.touches[0].pageX;
				this.startPageY = event.touches[0].pageY;
			},
			touchmove(event) {
				if(!this.canDrag)
					return;
				let touchmovePageX = event.touches[0].pageX;
				let result = touchmovePageX - this.startPageX;
				this.calendarTransform(result,0);
			},
			touchend(event) {
				if(!this.canDrag)
					return;
				let that = this;
				let endPageX = event.changedTouches[0].pageX;
				let endPageY = event.changedTouches[0].pageY;
				let x = Math.abs(that.startPageX - endPageX); //横坐标之差
				let y = Math.abs(that.startPageY - endPageY); //纵坐标之差
				
				let screenX = 0;
				try {
				    const res = uni.getSystemInfoSync();
				    screenX = res.windowWidth;
				} catch (e) {
					console.error(e)
					return;
				}
				if (that.startPageX > endPageX) { //左滑
					let a = Math.atan(y / x);
					let Rate = x / screenX;
					if (a < Math.PI / 6 && Rate > 0.3) {
						screenX = -screenX;
						that.calendarTransform(screenX,300);
						setTimeout(function(){
							that.addMonth();
							that.calendarTransform(0,0);
						},300);
					}
					else{
						that.calendarTransform(0,300);
					}
				} else {
					let a = Math.atan(y / x);
					let Rate = x / screenX;
					if (a < Math.PI / 6 && Rate > 0.3) {
						that.calendarTransform(screenX,300);
						setTimeout(function(){
							that.subMonth();
							that.calendarTransform(0,0);
						},300);
					}
					else{
						that.calendarTransform(0,300);
					}
				}
			}
		},
		watch: {
			currentTime: function(val, oldVal) { //时间改变
				let dateNew = this.toDateByStr1(val);
				if (dateNew.getFullYear() == this.year && (dateNew.getMonth() + 1) == this.month) {
					console.log('time is not change')
				} else {
					this.currentSelectTime = dateNew.getDate();
					this.render();
				}
			},
			range: function(val, oldVal) { //范围改变
				if (val.rangeStart != oldVal.rangeStart || val.rangeEnd != oldVal.rangeEnd) {
					this.rangeStart_ = val.rangeStart;
					this.rangeEnd_ = val.rangeEnd;
					this.setRange();
				}
			},
			mark: function(val, oldVal) { //标记改变
				this.render();
			},
			rangeMode: function(val, oldVal) { //范围改变
				if (!val) { //如果是关闭范围模式
					this.rangeStart_ = undefined; //标记范围开始，yyyyMM-dd
					this.rangeEnd_ = undefined; //标记范围结束，yyyyMM-dd
					this.firstRangeSelected = false;
					this.clearRange()
				}
			},
		},
		computed: {
			transformObj:function () { 
				return 'translate3d(' + this.transform_x + 'px, 0px, 0px) translateZ(0px)';
			},
			transformTimeObj:function () {
				return this.transform_time + 'ms';
			}
		},
	}
</script>

<style>
	@import url("./Li-Calendar.css");
</style>
