const mysql=require('mysql');

let db=mysql.createPool({host:'localhost',user:'root',password:'123456',database:'chatroom'});

let sql="select * from user_table"
db.query(sql,(err,data)=>{
    if(err){
        console.log(err)
    }else{
        console.log(JSON.stringify(data))
    }
})