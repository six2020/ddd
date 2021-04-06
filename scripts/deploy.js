const path = require('path');
const shell = require('shelljs');
const Rsync = require('rsync');
const colors = require('colors');
const argv = require('yargs').argv;


console.log('argv ====>>>>', argv);

let arg = argv._[0];
let server = {
    "six01": `root@39.102.77.26`,
    "six02": `root@1.1.1.1`
};

if(!arg || !server[arg]){
    console.log( colors.red("==> 服务器不存在 <==") );
    shell.exit(1);
}

// 通知
function notice(data){
    shell.exec(`curl 'https://oapi.dingtalk.com/robot/send?access_token=e214de934c9e0942042656b49a0003917b0d387d44e5a56a8780d98dc24c3414' -H 'Content-Type: application/json' -d '{"msgtype": "text","text": {"content": "deploy ${data}"}}'`)
}

// curl 'https://oapi.dingtalk.com/robot/send?access_token=e214de934c9e0942042656b49a0003917b0d387d44e5a56a8780d98dc24c3414' -H 'Content-Type: application/json' -d '{"msgtype": "text","text": {"content": "deploy 我就是我, 是不一样的烟火"}}'

// // 安装依赖
console.log( colors.yellow("==> 安装依赖 <==") );

if (shell.exec('npm i').code !== 0) {
    shell.echo('Error: npm i failed');
    shell.exit(1);
}

// // lint


// // 测试
console.log( colors.yellow("==> 测试 <==") );
if (shell.exec('npm run tests').code !== 0) {
    shell.echo('Error: npm run tests failed');
    shell.exit(1);
}

notice('开始构建')
// // 构建
console.log( colors.yellow("==> 构建 <==") );
if (shell.exec('npm run build').code !== 0) {
    shell.echo('Error: npm run build failed');
    shell.exit(1);
}


// // 部署 
// // if (shell.exec(`scp ${path.join(__dirname, '../dist/*')} root@39.102.77.26:/root/six`).code !== 0) {
// //     shell.echo('Error: scp failed');
// //     shell.exit(1);
// // }


notice('开始部署')
console.log( colors.yellow("==> 开始部署 <==") );
// 部署  rsync 增量部署
let rsync = Rsync.build({
    source: path.join(__dirname, '../dist/*'),
    destination: `${server[arg]}:/root/six`,
    flags: 'avz',
    shell: 'ssh'
});

rsync.execute(function (error, code, cmd) {
    // console.log(' error====>>>>', error);
    // console.log(' code====>>>>', code);
    // console.log(' cmd====>>>>', cmd);

    if(code == 0){
        console.log( colors.blue("==> 部署完成 <==") );
        notice('部署完成')
    }else{
        notice('部署失败')
        console.log( colors.red("==> 部署失败 <==") );
    }
    
});




