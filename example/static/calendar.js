/**
 * Name:calender.js
 * Author:Li
 * E-mail:1562321291@qq.com
 * Time: 2019-8-22 10:07:56
 * time：时间
 * text：文本
 * markPoint：true/false，是否显示点
 * pointText：右上角是否显示为文字
 * formatText：function，格式化底部文本
 */
var calendarWidget = {
	config: {},
	htmlStr: "",
	topSelecter: undefined,
	year: undefined,
	month: undefined,
	day: undefined,
	range:{  //标记范围
		start:undefined,
		end:undefined
	},
	/**
	 * 初始化
	 * @param {obj} data 以下为data的参数
	 * @param {string} currentTime  当前时间 yyyy-MM-dd
	 * @param {string} elem			绑定div的id  带#
	 * @param {array} mark			标记点列表
	 * @param {function} change		日期改变事件回调
	 * @param {function} mounted		渲染完成事件回调
	 * @param {function} dateclick	顶头的日期点击回调,可以通过此回调选择月份
	 * @param {function} formatText	格式化底部的文字
	 * @param {string} lastText		上月文字
	 * @param {string} nextText		下月文字
	 * */
	initCalculate: function(data) {  
		calendarWidget.config = data || {
			currentTime: "",  		//当前时间 yyyy-MM-dd
			elem: undefined,  		//绑定div的id  带#
			mark: [],         		//标记点列表
			change: undefined,      //日期改变事件回调
			mounted:undefined,      //渲染完成事件回调
			dateclick:undefined,	//顶头的日期点击回调,可以通过此回调选择月份
			formatText:undefined, 	//格式化底部的文字
			startDate:undefined,  	//选择的开始时间，此时间之前为灰色状态 yyyy-MM-dd		未实现
			endDate:undefined,    	//选择的结束时间，此时间之后为灰色状态 yyyy-MM-dd		未实现
			lastText:'〈',			//上月文字
			nextText:'〉',			//下月文字
		};
		calendarWidget.config.lastText = data.lastText?data.lastText:'〈';
		calendarWidget.config.nextText = data.nextText?data.nextText:'〉'
		
		if (!calendarWidget.config.elem) {
			console.error("element is not set");
			return;
		}
		if (calendarWidget.config.currentTime == "" || calendarWidget.config.currentTime == undefined) {
			calendarWidget.config.currentTime = new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/01";
		}
		calendarWidget.config.currentTime = calendarWidget.config.currentTime.replace(/-/g, "/");
		
		//设置开始时间
		if(calendarWidget.config.startDate){
			calendarWidget.config.startDate = new Date(calendarWidget.config.startDate.replace(/-/g, "/")); 
			if(calendarWidget.config.startDate == "Invalid Date"){
				console.error('startDate config error');
				calendarWidget.config.startDate = undefined;
			}
		}
		
		//设置结束时间
		if(calendarWidget.config.endDate){
			calendarWidget.config.endDate = new Date(calendarWidget.config.endDate.replace(/-/g, "/")); 
			if(calendarWidget.config.endDate == "Invalid Date"){
				console.error('endDate config error');
				calendarWidget.config.endDate = undefined;
			}
		}
		
		calendarWidget.renderCalendar();
	},
	renderCalendar: function() {  //生成日历
		calendarWidget.day = "";
		calendarWidget.config.currentTime = calendarWidget.config.currentTime.replace(/-/g, "/");
		var tempDateWidget = new Date(calendarWidget.config.currentTime);
		calendarWidget.config.currentTime = tempDateWidget.getFullYear() + "/" + (tempDateWidget.getMonth() + 1) + "/01"; //重置当前时间月份1号
		
		var totalDay = calendarWidget.getTotalDay(calendarWidget.config.currentTime); //获取一个月的天数
		var date = new Date(calendarWidget.config.currentTime);
		 
		calendarWidget.year = date.getFullYear();
		calendarWidget.month = date.getMonth() + 1;
		var firstDayWeek = date.getDay(); //第一天是星期几
		var textStr = calendarWidget.year + "年" + calendarWidget.month + '月';  //顶部显示的日期
		var sum = 0;
		var htmlStr = "";
		//获取上一个月的天数
		var TempMonth;
		var TempYear;
		if (calendarWidget.month == 1) { //跨年
			TempMonth = 12;
			TempYear = calendarWidget.year - 1;
		} else {
			TempYear = calendarWidget.year;
			TempMonth = calendarWidget.month - 1;
		}
		var TempLastMonthStr = TempYear + "/" + TempMonth + "/01";
		var lastMonthTotalDay = calendarWidget.getTotalDay(TempLastMonthStr);
		var lastMonthStartDay = lastMonthTotalDay - firstDayWeek;
		// 创建前面的日期
		for (var i = 0; i < firstDayWeek; i++) {
			sum++;
			lastMonthStartDay++;
			htmlStr += '<div class="calendar-col aligncanter calendar-col-lastMonth">' + lastMonthStartDay + '</div>';
		}
		var dayStr = calendarWidget.year + "-" + calendarWidget.month;
		//获取当前时间
		var currentDateTemp = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();

		//生成日历
		for (var i = 1; i <= totalDay; i++) { //循环日
			sum++;

			var tempDay = dayStr + "-" + i; //日期字符串
			var fontText = i;  //日期数字
			//当前日期变量
			var tempCurrTime = new Date(tempDay.replace('-','/').replace('-','/'));
			
			var tempCurrWeek = tempCurrTime.getDay();
			if(tempCurrWeek == 0 || tempCurrWeek == 6) //周六和周日，特殊处理
				fontText = "<span class='calendar-day-6-7'>" + fontText +"</span>";
			var textTemp = "<div class='dayValue'>" + fontText + "<span class='calendar-point'></span><span class='calendar-text'></span></div>";
			for (var z = 0; z < calendarWidget.config.mark.length; z++) { //判断是否为标记点
				if (tempDay == calendarWidget.config.mark[z].time.trim()) {
					var tempTextStr = calendarWidget.config.formatText == undefined? calendarWidget.config.mark[z].text 
										: calendarWidget.config.formatText(calendarWidget.config.mark[z].text);
					textTemp = "<div class='dayValue'>" + fontText;
					if (calendarWidget.config.mark[z].markPoint != false) // 是否显示点
						textTemp += calendarWidget.config.mark[z].pointText? '<span class="calendar-point">'+calendarWidget.config.mark[z].pointText+'</span>' : '<span class="calendar-point">●</span>';
					if (tempTextStr != undefined && tempTextStr != "") // 是否显示文字
						textTemp += '<div class="calendar-text">' + tempTextStr + '</div>';
					textTemp += "</div>";
					break;
				}
			}
			
			
			//如果设置了范围
			var calendar_range = "";
			if(calendarWidget.range.start && calendarWidget.range.end){
				if(calendarWidget.range.start <= tempCurrTime && tempCurrTime <= calendarWidget.range.end)
					calendar_range = ' calendar-range ';
			}
			
			if (tempDay == currentDateTemp) {  //当天
				htmlStr += '<div class="calendar-col aligncanter currentDays calendar-today ' +calendar_range + '" data-day="' + i + '" data-date="' + tempDay + '">' + textTemp +
					'</div>';
			} else {  //其他
				htmlStr += '<div class="calendar-col aligncanter currentDays ' +calendar_range + '" data-day="' + i + '" data-date="' + tempDay + '">' + textTemp + '</div>';
			}
		}
		if (sum < 42) { // 创建后面的空白，补够五行
			var j = 0;
			for (var i = sum; i < 42; i++) {
				sum++;
				j++;
				htmlStr += '<div class="calendar-col aligncanter calendar-col-nextMonth">' + j + '</div>';
			}
		}
		
		var content = "<div class='calendar-Time-header under_line'><a class='calendar-lastMonth'>" +calendarWidget.config.lastText+ "</a><a  class='calendar-TimeH'>" +
			textStr + "<a><a class='calendar-nextMonth'>" +calendarWidget.config.nextText+ "</a> <a class='calendar-backToToday'>回到今天</a></div><div class='ClearBoth'></div>" +
			'<div class="calendar-content">' +
			'<div class="calendar-row calendar-header">' +
			'<div class="calendar-col aligncanter">日</div>' +
			'<div class="calendar-col aligncanter">一</div>' +
			'<div class="calendar-col aligncanter">二</div>' +
			'<div class="calendar-col aligncanter">三</div>' +
			'<div class="calendar-col aligncanter">四</div>' +
			'<div class="calendar-col aligncanter">五</div>' +
			'<div class="calendar-col aligncanter">六</div>' +
			'</div>' +
			'<div class="calendar-row calendar-day">' + htmlStr +
			'</div><div class="ClearBoth"></div> ' +
			'</div>';

		calendarWidget.htmlStr = content;
		$(calendarWidget.config.elem).html(calendarWidget.htmlStr);
		calendarWidget.bindEvent();
		if (calendarWidget.config.mounted) //初始化完成
			calendarWidget.config.mounted(calendarWidget.year + "/" + calendarWidget.month);
		return content;
	},
	bindEvent: function() { //绑定事件
		//点击顶部时间回调
		$(".calendar-TimeH").on('tap',function(){ 
			if(calendarWidget.config.dateclick){
				var textStr = calendarWidget.year + "-" + calendarWidget.month;
				calendarWidget.config.dateclick(calendarWidget, textStr);
			}
		})
		//每项点击
		$(".calendar-day").on('tap', '.currentDays', function() {  
			$(".calendar-active").removeClass("calendar-active");
			$(this).addClass("calendar-active");
			calendarWidget.day = $(this).attr("data-day");
			calendarWidget.change();
		})
		//日历中属于上个月的日期
		$(".calendar-day").on('tap', '.calendar-col-lastMonth', function() {
			var screenX = window.screen.width;
			calendarWidget.calendarTransform(screenX,300);
			setTimeout(function(){
				calendarWidget.subMonth();
			},300);
		})
		//日历中属于下个月的日期
		$(".calendar-day").on('tap', '.calendar-col-nextMonth', function() {
			var screenX = window.screen.width;
			screenX = -screenX;
			calendarWidget.calendarTransform(screenX,300);
			setTimeout(function(){
				calendarWidget.addMonth();
			},300);
		})
		
		//头部上月按钮
		$(".calendar-nextMonth").on('tap', function() {
			var screenX = window.screen.width;
			screenX = -screenX;
			calendarWidget.calendarTransform(screenX,300);
			setTimeout(function(){
				calendarWidget.addMonth();
			},300);
		})
		//头部下月按钮
		$(".calendar-lastMonth").on('tap', function() {
			var screenX = window.screen.width;
			calendarWidget.calendarTransform(screenX,300);
			setTimeout(function(){
				calendarWidget.subMonth();
			},300);
		})
		
		//头部回到今天按钮
		$(".calendar-backToToday").on('tap', function() {
			var currDate = new Date();
			var value = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate();
			calendarWidget.setDate(value); 
		})
		
		
		//以下为实现日历左右滚动
		var startPageX = 0;
		var startPageY = 0;
		$(".calendar-day").on("touchstart", function(e) {
			startPageX = event.targetTouches[0].pageX;
			startPageY = event.targetTouches[0].pageY;
		})
		$(".calendar-day").on("touchmove", function(e) {
			var touchmovePageX = event.targetTouches[0].pageX;
			var result = touchmovePageX - startPageX;
			calendarWidget.calendarTransform(result,0);

		})
		$(".calendar-day").on("touchend", function(e) {
			var endPageX = event.changedTouches[0].pageX;
			var endPageY = event.changedTouches[0].pageY;
			var x = Math.abs(startPageX - endPageX); //横坐标之差
			var y = Math.abs(startPageY - endPageY); //纵坐标之差
			var screenX = window.screen.width;
			var screenY = window.screen.height;
			if (startPageX > endPageX) { //左滑
				var a = Math.atan(y / x);
				var Rate = x / screenX;
				if (a < Math.PI / 6 && Rate > 0.3) {
					screenX = -screenX;
					calendarWidget.calendarTransform(screenX,300);
					setTimeout(function(){
						calendarWidget.addMonth();
					},300);
				}
				else{
					calendarWidget.calendarTransform(0,300);
				}
			} else {
				var a = Math.atan(y / x);
				var Rate = x / screenX;
				if (a < Math.PI / 6 && Rate > 0.3) {
					calendarWidget.calendarTransform(screenX,300);
					setTimeout(function(){
						calendarWidget.subMonth();
					},300);
				}
				else{
					calendarWidget.calendarTransform(0,300);
				}
			}

		})
	},
	calendarTransform:function(x,time){  //日历滑动动画
		$(".calendar-day").css("transform", 'translate3d('+x+'px, 0px, 0px) translateZ(0px)'); 
		$(".calendar-day").css("transition-duration", time+"ms"); 
	},
	addMonth: function() { //加一个月
		if (calendarWidget.month == 12) { //跨年
			calendarWidget.month = 1;
			calendarWidget.year += 1;
		} else {
			calendarWidget.month += 1;
		}
		var str = calendarWidget.year + "/" + calendarWidget.month + "/01";
		calendarWidget.setDate(str);
	},
	subMonth: function() { //减一个月
		if (calendarWidget.month == 1) { //跨年
			calendarWidget.month = 12;
			calendarWidget.year -= 1;
		} else {
			calendarWidget.month -= 1;
		}
		var str = calendarWidget.year + "/" + calendarWidget.month + "/01";
		calendarWidget.setDate(str);
	},
	setDate:function(date){  //设置日期并重新生成日历
		calendarWidget.config.currentTime = date;
		calendarWidget.renderCalendar();
	},
	change: function() { //改变日期
		var tempd = calendarWidget.getSelectedDay();
		var markPoint = undefined;
		for (var z = 0; z < calendarWidget.config.mark.length; z++) { //判断是否为标记点
			if (tempd.indexOf(calendarWidget.config.mark[z].time) > -1) {
				markPoint = calendarWidget.config.mark[z];
			}
		}

		if (calendarWidget.config.change)
			calendarWidget.config.change(tempd, markPoint);
	},
	getSelectedDay: function() { //获取选择时间
		return calendarWidget.year + '-' + calendarWidget.month + '-' + calendarWidget.day;
	},
	/**
	 * 设置标记点，初始化完成后可执行
	 * @param {array} data 标记点列表
	 * [{
	 *   time:'yyyy-MM-dd',  string   标记时间  
	 * 	 text:'标记文本',	 string   标记文本  
	 *   markPoint:false,    boolean  是否显示点 
	 *   pointText:'文字'    string   代替点的文字，设置了则不显示点，需要把markPoint设为true  
	 * }]
	 * @param {Boolean} cover 是否覆盖原来的标记点
	 * @return none
	 * */
	setMark:function(data,cover){  
		if(cover){  //如果是覆盖标记点
			calendarWidget.config.mark = data;
			calendarWidget.renderCalendar();
			return;
		}
		
		if(data && data.length > 0){  //填充标记点
			for(var i = 0;i < data.length;i++){
				if(data[i] ==undefined){
					continue;
				}
				calendarWidget.config.mark.push(data[i])
				var selectDiv = $(".calendar-day").find('div[data-date="'+data[i].time+'"]');
				
				var tempTextStr = calendarWidget.config.formatText == undefined? data[i].text 
									: calendarWidget.config.formatText(data[i].text);
				
				if (tempTextStr != undefined && tempTextStr != ""){// 是否显示文字
					$(selectDiv).find('.calendar-text').html(tempTextStr);
				} 
				if(data[i].markPoint){// 是否显示点
					var pointTextStr = data[i].pointText? data[i].pointText : '●';
					$(selectDiv).find('.calendar-point').html(pointTextStr);
				}
			}
		}
	},
	/**
	 * 设置标记范围，初始化完成后可执行
	 * @param {string} startDate 开始时间 yyyy-MM-dd
	 * @param {string} endDate 结束时间 yyyy-MM-dd
	 * */
	setRange:function(startDate,endDate){  
		calendarWidget.range.start = undefined;
		calendarWidget.range.end = undefined;
		if(startDate && endDate){  //填充标记点
			startDate = startDate.replace(/-/g, "/");
			endDate = endDate.replace(/-/g, "/");
			var start = new Date(startDate);
			var end = new Date(endDate);
			calendarWidget.range.start =  new Date(startDate);
			calendarWidget.range.end = new Date(endDate);
			if(start == "Invalid Date" || end == "Invalid Date"){
				console.error('setRange : error param');
				return;
			}

			while(start <= end){
				var currentTimeStr = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate();
				var selectDiv = $(".calendar-day").find('div[data-date="'+currentTimeStr+'"]');
				$(selectDiv).addClass("calendar-range");
				$(selectDiv).removeClass("calendar-active");
				start = start.setDate(start.getDate() + 1);
				start=new Date(start);
			}
		}
		else
			console.error('setRange : error param');
	},
	clearRange:function(){  //去掉范围标记
		calendarWidget.range.start = undefined;
		calendarWidget.range.end = undefined;
		$(".calendar-range").removeClass("calendar-range");
	},
	getTotalDay: function(time) { //获取月日期总数
		time = time.replace(/-/g, "/");
		var selectedDate = new Date(time);
		if(selectedDate == "Invalid Date"){
			selectedDate = new Date(time + "/01");
		}
		var selectedMonth = selectedDate.getMonth() + 1;
		selectedDate.setMonth(selectedMonth);
		selectedDate.setDate(0);
		var dayMany = selectedDate.getDate();

		return dayMany;
	},
	/**
	 * 设置日历的日期范围
	 * @param {string} startDate 开始时间 yyyy-MM-dd
	 * @param {string} endDate 结束时间 yyyy-MM-dd
	 * */
	setDateRange:function(startDate,endDate){
		//设置开始时间
		if(startDate){
			calendarWidget.config.startDate = new Date(startDate.replace(/-/g, "/")); 
			if(calendarWidget.config.startDate == "Invalid Date"){
				console.error('startDate config error');
				calendarWidget.config.startDate = undefined;
			}
		}
		
		//设置结束时间
		if(endDate){
			calendarWidget.config.endDate = new Date(endDate.replace(/-/g, "/")); 
			if(calendarWidget.config.endDate == "Invalid Date"){
				console.error('endDate config error');
				calendarWidget.config.endDate = undefined;
			}
		}
		
		calendarWidget.renderCalendar();
	}
}
