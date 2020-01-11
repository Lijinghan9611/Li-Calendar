### 通用日历，可标记，选择范围，高度自定义

组件名：``Li-Calendar``。

1.通用日历,h5,5+app,微信小程序测试通过, 大部分内容可以自定义

2.可标记，设置任意标记内容和显示右上角点

3.选择范围，选择指定日期范围或者设置日期范围

4.限制日历显示范围，设置日期的上下限

5.显示农历，可以选择关闭，设置了标记点的优先显示标记点。



**使用方式：**

在 ``script`` 中引用组件 

```javascript
import Calendar from '@/components/Li-Calendar/Li-Calendar.vue';
export default {
    components: {Calendar}
}
```

在 ``template`` 中使用组件

```html
		<view class="Mtext">----默认---</view>
		
		<Calendar :currentTime='currentTime' @dayChange='dayChange' @monthChange='monthChange'
		:rangeMode='rangeMode' @rangeChange='rangeChange' :showLunar='false'>
		</Calendar> 
		
		<view class="Mtext">显示农历和标记点</view>
		
		<Calendar :currentTime='currentTime' :mark='mark' @dayChange='dayChange' @monthChange='monthChange' :rangeMode='rangeMode'
		 :range='range' @rangeChange='rangeChange' :dateStart='dateStart' :dateEnd='dateEnd' :canDrag='true'>
		</Calendar>
		
		
```

```javascript
		export default {
			components: {
				Calendar
			},
			data() {
				return {
					mark: [
						{
							time: '2019-8-23',
							text: '标记',
							markPoint: true,
							markTextColor:'blue',
							pointText: '奖',
							pointTextColor:'red'
						},
						{
						time: '2019-8-24',
						text: '上山打老虎',
						markPoint: true,
						pointText: '2',
					}],
					range:{
						rangeStart:undefined,	//设置标记范围开始，yyyyMM-dd
						rangeEnd:undefined   	//设置标记范围结束，yyyyMM-dd
					},
					rangeMode:false,
					currentTime: '2019-8-23',
					title: 'Hello',
					dateStart: '2019-6-15',
					dateEnd: '2020-6-15'
				}
			},
			onLoad() {
		
			},
			methods: {
				dayChange(data){
					console.log(data)
				},
				monthChange(data){
					console.log(data)
				},
				setDate(){
					this.currentTime = '2019-7-10'
				},
				setRange(){
					this.range = {
						rangeStart:'2019-8-10',	//设置标记范围开始，yyyyMM-dd
						rangeEnd:'2019-8-20'   	//设置标记范围结束，yyyyMM-dd
					}
				},
				setRangeMode(){
					this.rangeMode = !this.rangeMode;
				},
				rangeChange(data){
					console.log(data)
				}
			}
		}
```

**属性说明：**

|属性名		|类型|默认值	|说明|
|---|----|---|---|
|currentTime	|String	|当前时间|当前设定时间 yyyy-MM-dd|
|mark	|Array	|-|标记点列表	|
|lastText	|String	|'〈'|上个月按键文字|
|nextText	|String	|'〉'|下个月按键文字|
|maskColor	|String	|#01AAED|全局标记点颜色，包括点和文字|
|showLunar	|Boolean	|true|是否显示农历，mask优先级高|
|range	|Object	|-|设置标记范围|
|rangeMode	|Boolean	|false|是否开启范围选择模式|
|dateStart	|String	|'1970-01-01'|日历起始时间 yyyy-MM-dd|
|dateEnd	|String	|'2100-12-31'|日历结束时间 yyyy-MM-dd|
|canDrag	|Boolean	|true|是否可以滚动|
						
**mark 标记点列表 属性说明：**

|属性名		|类型|默认值	|说明|
|---|----|---|---|
|time	|String	|-|标记时间 yyyy-MM-dd|
|text	|Array	|-|标记内容	|
|markPoint	|Boolean	|false|是否显示标记点	|
|markTextColor	|String	|-|标记内容颜色|
|pointText	|String	|-|左上角标记点内容|
|pointTextColor	|String	|-|标记点颜色|

**range 设置范围 属性说明：**

|属性名		|类型|默认值	|说明|
|---|----|---|---|
|rangeStart	|String	|-|设置标记范围开始，yyyy-MM-dd|
|rangeEnd	|String	|-|设置标记范围结束，yyyy-MM-dd	|

**事件说明：**

|属性名		|说明|
|---|---|
|@dayChange	|当月日期改变|
|@monthChange	|月份改变|
|@rangeChange	|范围改变|
