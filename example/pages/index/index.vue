<template>
	<view class="content">
		<!-- <view class="Mtext">----默认---</view>
		<Calendar :currentTime='currentTime' @dayChange='dayChange' @monthChange='monthChange'
		:rangeMode='rangeMode' @rangeChange='rangeChange' :showLunar='false'>
		</Calendar> -->

		<view class="Mtext">显示农历和标记点</view>
		<Calendar :currentTime='currentTime' :mark='mark' @dayChange='dayChange' @monthChange='monthChange' :rangeMode='rangeMode'
		 :range='range' @rangeChange='rangeChange' :dateStart='dateStart' :dateEnd='dateEnd' :canDrag='true'>
		</Calendar>
		<button @tap="setDate">
			指定日期
		</button>
		<button @tap="setRange">
			指定范围
		</button>
		<button @tap="setMark">
			设置标记
		</button>
		<button @tap="setRangeMode">
			范围选择模式({{rangeMode}})
		</button>
	</view>
</template>

<script>
	import Calendar from '@/components/Li-Calendar/Li-Calendar.vue';
	export default {
		components: {
			Calendar
		},
		data() {
			return {
				mark: [{
						time: '2019-8-23',
						text: '标记',
						markPoint: true,
						markTextColor: 'blue',
						pointText: '奖',
						pointTextColor: 'red'
					},
					{
						time: '2019-8-15',
						text: '上山打老虎上山打老虎',
						markPoint: true,
						pointText: '2',
					}
				],
				range: {
					rangeStart: undefined, //设置标记范围开始，yyyyMM-dd
					rangeEnd: undefined //设置标记范围结束，yyyyMM-dd
				},
				dateIndex:1,
				rangeMode: false,
				currentTime: '2019-8-31',
				title: 'Hello',
				dateStart: '2019-6-15',
				dateEnd: '2020-6-15'
			}
		},
		onLoad() {

		},
		methods: {
			scroll(e){
				console.log(e)
			},
			dayChange(data) {
				console.log(data)
			},
			monthChange(data) {
				console.log(data)
			},
			setDate() {
				this.currentTime = '2019-7-31'
			},
			setRange() {
				this.range = {
					rangeStart: '2019-8-10', //设置标记范围开始，yyyyMM-dd
					rangeEnd: '2019-8-20' //设置标记范围结束，yyyyMM-dd
				}
			},
			setRangeMode() {
				this.rangeMode = !this.rangeMode;
			},
			setMark(){
				if(this.dateIndex > 30)
					return;
				this.mark.push({
					time: '2019-8-' + this.dateIndex,
					text: '标记'+ this.dateIndex,
					markPoint: true,
					markTextColor: 'red',
					pointText: 'M',
					pointTextColor: 'green'
				});
				this.dateIndex++;
			},
			rangeChange(data) {
				console.log(data)
			}
		}
	}
</script>

<style>
	.Mtext {
		padding: 20px;
	}
</style>
