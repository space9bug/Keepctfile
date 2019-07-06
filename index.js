const request = require('request');
const cheerio = require('cheerio');

exports.handler = function (event, context, callback) {
	const user_email = '***@163.com'; //邮箱
	const user_password = '***'; //密码
	login(user_email, user_password); //登录

	const urlstrlist = [
		"https://u20114131.ctfile.com/fs/20114131-373000858",
		"https://u20114131.ctfile.com/fs/20114131-373000097",
		"https://u20114131.ctfile.com/fs/20114131-372999775",
		"https://u20114131.ctfile.com/fs/20114131-372999314"
    ];

	var urllength = urlstrlist.length;
	for (var promiseArr = [], i = 0; i < urllength; i++) {
		promiseArr.push(setparm(urlstrlist[i]));
	}
	Promise.all(promiseArr)
					.then(function(){
						logout(); //注销
						callback(null, "Success");
					})
}

function setparm(urlhoststr) {
	return new Promise(resolve => {
		request(urlhoststr, function (error, response, body) {
			var host_url = urlhoststr.match(/^.*\/\/[^\/]+/)[0];
			//console.log("host_url：" + host_url);

			const $ = cheerio.load(body);
			var uhref = $('a', 'ul.breadcrumb')[1].attribs.href; //含有userid的href
			var userid = uhref.replace(/\/u\//g, ''); //去除/u/字符

			//console.log("downfunc：" + $('#free_down_link')[0].attribs.onclick);
			var str1 = $('#free_down_link')[0].attribs.onclick;

			var str2 = str1.match(/\((.+)\)/)[1]; //括号中的参数
			var str3 = str2.replace(/'/g, ''); //去除'字符
			var str4 = str3.replace(/\s/g, ''); //去除空格
			var file_parm = str4.split(/,/); //根据,进行分割字符串
			//解析下载链接
			var file_id = file_parm[0];
			var folder_id = file_parm[1];
			var file_chk = file_parm[2];
			var mb = file_parm[3];
			var app = file_parm[4];
			verifycode = typeof verifycode !== 'undefined' ? verifycode : "";

			//console.log("请求网址：" + host_url + "/get_file_url.php?uid=" + userid + "&fid=" + file_id + "&folder_id=" + folder_id + "&fid=" + file_id + "&file_chk=" + file_chk + "&mb=" + mb + "&app=" + app + "&verifycode=" + verifycode + '&rd=' + Math.random());

			request(host_url + "/get_file_url.php?uid=" + userid + "&fid=" + file_id + "&folder_id=" + folder_id + "&fid=" + file_id + "&file_chk=" + file_chk + "&mb=" + mb + "&app=" + app + "&verifycode=" + verifycode + '&rd=' + Math.random(),
				function (error, response, body) {
					var statusCode = response && response.statusCode;
					var jsondata = JSON.parse(body);

					console.log("error：", error);
					if (statusCode == 503) {
						console.log("错误!!!");
					}
					if (statusCode == 200) {
						console.log("confirm_url：" + jsondata.confirm_url);
						console.log("download_url：" + jsondata.downurl);
					}
					resolve();
				});
		});
	});
}

function login(user_email, user_password) {
	request.post('https://www.ctfile.com/p/login').form({ ref: 'https://www.ctfile.com/', action: 'login', task: 'login', email: user_email, password: user_password });
}

function logout() {
	request.get('https://www.ctfile.com/p/login?action=logout');
}