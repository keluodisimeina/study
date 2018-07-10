const http=require('http');
const fs=require('fs');

let server=http.createServer(function(request,response){
    //console.log("aaaa")
    //console.log(`请求地址${request.url}`);
    //console.log(`请求方法${request.method}`);
    //response.write(`dasdas`);
    //response.end();
    fs.readFile(`www${request.url}`,(err,data)=>{
        if(err){
            response.writeHeader(404)
            response.write('404');
        }else{
            response.write(data);
        }
        response.end();
    })
    
});

server.listen(8083);