const fs=require('fs');

// fs.readFile('1.txt',(err,data)=>{
//     if(err){
//         console.log(`读取文件失败`);
//     }else{
//         console.log(`读取成功`);
//         console.log(data.buffer)
//     }
// })

fs.writeFile('2.txt','功夫啊u回复',err=>{
    if(err){
        console.log("写入失败")
    }else{
        console.log('邪恶如成功')
    }
})