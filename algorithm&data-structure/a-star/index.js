var fs = require('fs');
var express = require('express');
var app = express();
var timeFrom = 0;
var timeTo = 0;
var throughRein = 0; //统计重复访问
var nodeName = "./data/San Francisco Road Network's Nodes .txt"
var edgeName = "./data/San Francisco Road Network's Edges.txt"
fs.readFile(nodeName, {
	encoding: 'utf-8'
}, function(err, bytesRead) {
	timeFrom = new Date()
	if (err) throw err;
	//初始化部分----------------------
	var all = new Array();
	var arc_lines = new Array(); //保存弧段 from,to,Weight
	var arc_nodes = new Array(); //保存节点 X,Y,f值,父节点
	var node_arcs = new Array(); //每个节点对应的弧段编号 
	var dist = new Array(); //最短距离以及初始化
	var openList = new Array(); //打开列表
	var closeList = new Array(); //关闭列表
	//数据读取与储存部分-----------------------------------------------------节点
	all = bytesRead.split("\n"); //每一行的数组
	for (var i = 0; i < all.length; i++) {
		all[i] = all[i].replace(/\s+/g, ' '); //清除多余空格
		var temp = all[i].split(" "); //筛选每个段落
		node_arcs[i] = new Array(); //预先创建节点对应弧段列表的第二维
		var tempArray = new Array();
		tempArray.push(parseFloat(temp[1], 10)); //X
		tempArray.push(parseFloat(temp[2], 10)); //Y
		tempArray.push(0); //保存每个点的g值
		tempArray.push(-1); //保存父节点
		tempArray.push(0); //暂存每个节点的f值
		arc_nodes.push(tempArray);
	}
	fs.readFile(edgeName, {
		encoding: 'utf-8'
	}, function(err, bytesRead) {
		if (err) throw err;
		all = bytesRead.split("\n"); //每一行的数组
		//边数据读取
		for (var i = 0; i < all.length; i++) {
			all[i] = all[i].replace(/\s+/g, ' '); //清除多余空格
			var temp = all[i].split(" "); //筛选每个段落
			var tempArray = new Array();
			tempArray.push(parseInt(temp[1], 10));
			tempArray.push(parseInt(temp[2], 10));
			tempArray.push(parseFloat(temp[3], 10));
			arc_lines.push(tempArray);
			node_arcs[tempArray[0]].push(i);
			node_arcs[tempArray[1]].push(i);
		}

		//算法部分---------------------------------------------------------
		var f = new Array; //f=g+h
		function Astar(start, end) {
			//计算起始点和终止点的位置
			var startPoint = {
				x: arc_nodes[start][0],
				y: arc_nodes[start][1]
			}
			var endPoint = {
				x: arc_nodes[end][0],
				y: arc_nodes[end][1]
			}
			openList.push(start); //第一步先将起始点加入open表中
			while (openList.length > 0) {
				//取出与该点连接的所有线
				var father = openList.shift(); //取出OPEN列表中的第一个，open列表一直保持有序
				closeList.push(father); //添加到关闭列表中
				outerloop:
					for (var i = 0; i < node_arcs[father].length; i++) {
						var toNode = 0;
						//找到相邻的对面的点id
						if (father == arc_lines[node_arcs[father][i]][0]) {
							toNode = arc_lines[node_arcs[father][i]][1];
						} else {
							toNode = arc_lines[node_arcs[father][i]][0];
						}
						//判断相邻的点不是在close列表中，若是则略过
						for (var j = 0; j < closeList.length; j++) {
							if (closeList[j] == toNode) continue outerloop; //跳出 TODO
						}
						//计算估计函数部分
						// 普通方法-----------------------------------------------------------------------

						// var h = Math.abs(parseFloat(endPoint.x) - parseFloat(arc_nodes[toNode][0])) + Math.abs(parseFloat(endPoint.y) - parseFloat(arc_nodes[toNode][1]));
						// var g = parseFloat(arc_nodes[father][2]) + parseFloat(arc_lines[node_arcs[father][i]][2]); //求出从起始点到该点的g值
						// var f = h+g;

						//改进方法1：考虑角度，使用归一化处理---------------------------------------------

						var w1 = 0.65;
						var w2 = 0.35;
						var L = Math.abs(parseFloat(endPoint.x) - parseFloat(arc_nodes[toNode][0])) + Math.abs(parseFloat(endPoint.y) - parseFloat(arc_nodes[toNode][1]));
						var k1 = 0;
						var k2 = 0;
						if (arc_nodes[toNode][0] - endPoint.x == 0) {
								k1 = 99999999;
							} else {
								k1 = (arc_nodes[toNode][1] - endPoint.y) / (arc_nodes[toNode][0] - endPoint.x);
							}
							if (arc_nodes[toNode][0] - startPoint.x == 0) {
								k2 = 99999999;
							} else {
								k2 = (arc_nodes[toNode][1] - startPoint.y) / (arc_nodes[toNode][0] - startPoint.x);
							}
						var alpha = Math.abs(Math.atan( (k1 - k2) / (1 + k1 * k2)));
						var alpha_sum = 0;
						var L_sum = 0;
						for (var j = 0; j < node_arcs[toNode].length; j++) {
							var node_around = 0;
							if (toNode == arc_lines[node_arcs[toNode][j]][0]) {
								node_around = arc_lines[node_arcs[toNode][j]][1];
							} else {
								node_around = arc_lines[node_arcs[toNode][j]][0];
							}
							L_sum += Math.abs(endPoint.x - arc_nodes[node_around][0]) + Math.abs(endPoint.y - arc_nodes[node_around][1]);
							if (arc_nodes[node_around][0] - endPoint.x == 0) {
								k1 = 99999999;
							} else {
								k1 = (arc_nodes[node_around][1] - endPoint.y) / (arc_nodes[node_around][0] - endPoint.x);
							}
							if (arc_nodes[node_around][0] - startPoint.x == 0) {
								k2 = 99999999;
							} else {
								k2 = (arc_nodes[node_around][1] - startPoint.y) / (arc_nodes[node_around][0] - startPoint.x);
							}
							alpha_sum += Math.abs(Math.atan((k1 - k2) / (1 + k1 * k2)));

						}

						var h = w1 * (L / L_sum) * node_arcs[toNode].length + w2 * alpha / alpha_sum * node_arcs[toNode].length;
						var g = parseFloat(arc_nodes[father][2]) + parseFloat(arc_lines[node_arcs[father][i]][2]); //求出从起始点到该点的g值
						var f = h*L + g;

						//改进方法2,迪杰斯特拉变种权值版-------------------------------------
						// var w = 0;
						// var S = Math.sqrt(Math.pow((endPoint.y - startPoint.y), 2) + Math.pow((endPoint.x - startPoint.x), 2));
						// var d = Math.sqrt(Math.pow((endPoint.y - arc_nodes[toNode][1]), 2) + Math.pow((endPoint.x - arc_nodes[toNode][0]), 2));
						// if (d < S) {
						// 	w = d / S;
						// } else {
						// 	w = 1;
						// }
						// var h = Math.abs(parseFloat(endPoint.x) - parseFloat(arc_nodes[toNode][0])) + Math.abs(parseFloat(endPoint.y) - parseFloat(arc_nodes[toNode][1]));
						// var g = parseFloat(arc_nodes[father][2]) + parseFloat(arc_lines[node_arcs[father][i]][2]); //求出从起始点到该点的g值
						// var f = 0;
						// if (w < 0.3) {
						// 	f = g + w * h;
						// } else {
						// 	f = g + h;
						// }
						//改进方法3：带父节点的----------------------------------------------

						// var h = Math.abs(parseFloat(endPoint.x) - parseFloat(arc_nodes[toNode][0])) + Math.abs(parseFloat(endPoint.y) - parseFloat(arc_nodes[toNode][1]));
						// var h2 = Math.abs(parseFloat(endPoint.x) - parseFloat(arc_nodes[father][0])) + Math.abs(parseFloat(endPoint.y) - parseFloat(arc_nodes[father][1]));
						// var g = parseFloat(arc_nodes[father][2]) + parseFloat(arc_lines[node_arcs[father][i]][2]); //求出从起始点到该点的g值
						// var f = h + g + h2;

						//替换与更新
						if (arc_nodes[toNode][4] > f) { //已经被访问过，且新的路线比原来更短
							arc_nodes[toNode][2] = g; //更新g值
							arc_nodes[toNode][4] = f;
							arc_nodes[toNode][3] = father; //更新父节点
							throughRein++;
						} else if (arc_nodes[toNode][2] == 0) { //没有被访问过，则添加到open列表中
							arc_nodes[toNode][2] = g; //更新g值
							arc_nodes[toNode][4] = f;
							arc_nodes[toNode][3] = father; //更新父节点
							throughRein++;
							openList.push(toNode);
						}
					}
				openList.sort(function(a, b) {
					return arc_nodes[a][4] - arc_nodes[b][4];
				}); //排序

				if (father == end) break;
			}

		}
		var b = 1;
		var a = 300;
		var c = a;
		Astar(b, a);
		timeTo = new Date();
		// 找到最终识别的最短路径
		// for (var i = 0; i < arc_nodes.length; i++) {
		// 	if (arc_nodes[i][3] == -1) {
		// 		console.log(arc_nodes[i])
		// 	}
		// }
		//数据准备-----------------用以发送

		var SendJson = {};
		for (var i = 0; i < arc_lines.length; i++) {
			SendJson[i] = arc_nodes[arc_lines[i][0]][0] + ',' + arc_nodes[arc_lines[i][0]][1] + ';' + arc_nodes[arc_lines[i][1]][0] + ',' + arc_nodes[arc_lines[i][1]][1];
		}
		var roadLength = 0;
		var ct = 0;
		//给路径上的线段上标记
		while (1) {
			for (var i = 0; i < node_arcs[a].length; i++) {
				if (a == arc_lines[node_arcs[a][i]][0] || a == arc_lines[node_arcs[a][i]][1]) {
					if (arc_nodes[a][3] == arc_lines[node_arcs[a][i]][0] || arc_nodes[a][3] == arc_lines[node_arcs[a][i]][1]) {
						roadLength += arc_lines[node_arcs[a][i]][2];
						SendJson[node_arcs[a][i]] = SendJson[node_arcs[a][i]] + ';red';
						ct++;
					}
				}
			}
			if (a == b) break;
			a = arc_nodes[a][3];
		}
		//给遍历过的线上标记，并统计遍历的节点数
		var count_points = 0;
		for (var i = 0; i < arc_nodes.length; i++) {
			if (arc_nodes[i][3] != -1) {
				for (var j = 0; j < node_arcs[i].length; j++) {
					SendJson[node_arcs[i][j]] += ';blue';
				}
				count_points++;
			}
		}
		console.log("最短路径上的点数：" + ct)
		console.log("遍历的点数：" + count_points);
		console.log("点的访问次数：" + throughRein);
		console.log("花费的时间：" + (timeTo - timeFrom));

		console.log("总长度：" + roadLength)
			//服务器模块，用以数据发送---------------------------------------------------
		app.get('/*', function(req, res) {
			console.log(req.query);
			var start_q = req.query['start'];
			var end_q = req.query['end'];
			res.jsonp(SendJson);
		})
		var server = app.listen(8082, function() {
			// var host = server.address().address
			// var port = server.address().port
		})
	});
})