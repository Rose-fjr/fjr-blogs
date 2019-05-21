//加密
const crypto=require('crypto')

//加密对象-->返回加密成功的数据
module.exports=function(password,key="fangjinrong blogs"){
    //sha256:加密方式 ,key:签名
    const hmac=crypto.createHmac("sha256",key);
    hmac.update(password);
    const passwordHmac=hmac.digest("hex");//hex十六进制
    return passwordHmac;
}