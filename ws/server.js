
const http=require("http")
const io=require('socket.io')
const fs=require('fs')
const mysql=require('mysql')
const url=require('url')


// const httpServer=http.createServer();
// httpServer.listen(8084);

// const wsServer=io.listen(httpServer);
// wsServer.on('connection',sock=>{
//     //sock.emit();
//     sock.on('a',function(a1,a2,a3,a4,a5){
//         console.log(a1,a2)
//     });
// })

let db=mysql.createPool({host:'localhost',user:'root',password:'123456',database:'chatroom'})


//http 服务器
// const httpServer=http.createServer((request,response)=>{
//     response.setHeader('content-type','text/html;charset=utf-8')
//     let{pathname,query}=url.parse(request.url,true);
//     if(pathname=="/reg"){
//         //regist
//         //console.log(query)
//         let {user,pass}=query;
//         if(!/^\w{6,32}$/.test(user)){
//             response.write(JSON.stringify({code:1,msg:'用户名不规范'}))
//             response.end()
//         }else if(!/^\w{6,32}$/.test(pass)){
//             response.write(JSON.stringify({code:1,msg:'密码不规范'}))
//             response.end()
//         }else{
//             //console.log(user)
//             db.query(`select * from user_table where user="${user}"`,(err,data)=>{
//                 if(err){
//                     response.write(JSON.stringify({code:1,msg:'查询失败'}))
//                     response.end();
//                 }else if(data.length>0){
//                     response.write(JSON.stringify({code:1,msg:'用户名重复'}))
//                     response.end();
//                 }else{
//                     db.query(`insert into user_table(user,password,online) values ("${user}","${pass}",0)`,err=>{
//                         if(err){
//                             response.write(JSON.stringify({code:1,msg:'插入失败'}))
//                             response.end();
//                         }else{
//                             response.write(JSON.stringify({code:0,msg:'成功'}))
//                             response.end();
//                         }
//                     })
//                 }

//             })
//         }
//     }else if(pathname=="/login"){
//         //login
//         let{user,pass}=query;
//         db.query(`select * from user_table where user="${user}" and password="${pass}"`,(err,data)=>{
//             if(err){
//                 response.write(JSON.stringify({code:1,msg:'登录错误'}))
//                 response.end();
//             }else if(data.length>0){
                
//                 db.query(`update user_table set online =1 where user ="${user}" and password ="${pass}"`,(err,data)=>{
//                     if(err){
//                         response.write(JSON.stringify({code:1,msg:'登录有误'}))
//                         response.end();
//                     }
//                     else{
//                         response.write(JSON.stringify({code:0,msg:'登录成功'}))
//                         response.end();
//                     }
//                 })

//             }else{
//                 response.write(JSON.stringify({code:1,msg:'登录失败 账号密码错误'}))
//                 response.end();
//             }
//         })
//     }else{
//         fs.readFile(`www${request.url}`,(err,data)=>{
//             if(err){
//                 response.writeHeader(404);
//                 response.write('NOT FOUND');
//             }else{
//                 response.write(data);
//             }
//             response.end();
//         })
//     }
// });
// httpServer.listen(8080)


//websocket服务器
let httpServer=http.createServer((request,response)=>{
    fs.readFile(`www${request.url}`,(err,data)=>{
        if(err){
            response.writeHeader(404)
            response.write("NOT FOUND")
        }else{
            response.write(data)
        }
        response.end();
    })
});
let aSock=[]
httpServer.listen(8080);
let webServer=io.listen(httpServer);
webServer.on('connection',sock=>{
    aSock.push(sock)
    let cur_username='';
    let cur_userid=0;
    sock.on('reg',(user,pass)=>{
        db.query(`select id from user_table where user='${user}'`,(err,data)=>{
            if(err){
                sock.emit(`reg_ret`,1,`数据库有误`)
            }else if(data.length>0){
                sock.emit(`reg_ret`,1,`用户名已存在`)
            }else{
                db.query(`insert into user_table(user,password,online) values('${user}','${pass}',0)`,err=>{
                    if(err){
                        sock.emit(`reg_ret`,1,`数据库有误`)
                    }else{
                        sock.emit(`reg_ret`,0,`注册成功`)
                    }
                })
            }
        })
    })

    sock.on(`login`,(user,pass)=>{
        db.query(`select id,password from user_table where user='${user}'`,(err,data)=>{
            if(err){
                socke.emit(`login_ret`,1,`数据库有误`)
            }else if(data.length==0){
                sock.emit(`login_ret`,1,`此用户不存在`)
            }else if(data[0].password!=pass){
                sock.emit(`login_ret`,1,`用户名或密码错误`)
            }else{
                db.query(`update user_table set online=1 where id=${data[0].id}`,err=>{
                    if(err){
                        sock.emit(`login_ret`,1,`数据库有误`)
                    }else{
                        sock.emit(`login_ret`,0,`成功`)
                        cur_username=user;
                        cur_userid=data[0].id;
                    }
                
                })
            }
        })
    })

    //发言
    sock.on('msg',txt=>{
        if(!txt){
            sock.emit('msg_ret',1,'消息文本不能为空');
        }else{
            aSock.forEach(item=>{
                if(item==sock)return;
                item.emit('msg',cur_username,txt)
            })
            sock.emit('msg_ret',0,'发送成功')
        }
    })



    //离线

    sock.on('disconnect',function(){
        db.query(`update user_table set online=0 where id=${cur_userid}`,err=>{
            if(err){
                console.log(`数据库有误`,err)
            }else{
                cur_userid=0;
                cur_username='';
                aSock.filter(item=>item!=sock)
            }
        })

    })
})