let express = require('express')
let app = express()
let mysql = require('./database.js')
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const rekognition = require('./rekognition.js');

app.use(bodyParser.json({limit:'50mb'}));
app.use(cors());

app.get('/', (req, res) => {
  res.send('This is server');
})

app.post('/login',(req,res)=>{
  console.log(req.body);
  let query = mysql.format("select password from users where username=?",req.body.username);
  mysql.query(query, (err,password)=>{
    if (err) throw err;
    if(!password[0]){
      res.json({"success":false, "message":"User doesn't exists"});
      return;
    }
    else{
      bcrypt.compare(req.body.password,password[0].password,(err,result)=>{
        if(err) throw err;
        if(result){
          res.json({"success":true});
        }
        else{
          res.json({"success":false,"message":"Wrong password"});
        }
      })
    }
});
})

app.post('/register',(req,res)=>{
  console.log(req.body);
  if(req.body.username == ""){
    res.json({"success":false,"message":"Username can't be null"});
    return;
  }
  let query = mysql.format("select count(*) as count from users where username=?",req.body.username);
  mysql.query(query, (err,count)=>{
    if (err) throw err;
    console.log(count);
    if(count[0].count>0){
      res.json({"success":false, "message":"User already exists"});
      return;
    }
    else{
      bcrypt.hash(req.body.password,10,(err,result)=>{
        if (err) throw err;
        let query2 = mysql.format("insert into users (username,password) values (?,?)",[req.body.username,result]);
        mysql.query(query2,(err)=>
        {
          if (err) throw err;
          res.json({"success":true});
        })
      })
      }
});
})

app.post('/image',(req,res)=>{
  const buffer = Buffer.from(req.body.image, 'base64');
  let labels;
  let text;
  let filePath = '/images/'+req.body.path;
  if(req.body.username !== null){
  let query =mysql.format("select count(*) as count from images where image=? and username=?",[filePath,req.body.username]);
  mysql.query(query,(err,count)=>{
    if (err) throw err;
    if(count[0].count<1){
    let query2 = mysql.format("insert into images(username,image) values(?,?)", [req.body.username,filePath]);
    mysql.query(query2,(err)=>{
      if (err) throw err;
    });
  }
});
  }
  const params1 = {
Image:{
  Bytes:buffer
},
MaxLabels: 10
  }

  rekognition.detectLabels(params1, (err,response)=>{
    if(err) {
      console.log(err,err.stack);
    }
    else{
      console.log(response);
     labels=response;
     if(req.body.username !== null){
      let query =mysql.format("update images set label1=? where image=? and username=?",[response.Labels[0].Name,filePath,req.body.username]);
      mysql.query(query,(err)=>{
        if(err)throw err;
        if(response.Labels.length>1){
        let query2=mysql.format("update images set label2=? where image=? and username=?",[response.Labels[1].Name,filePath,req.body.username]);
        mysql.query(query2,(err)=>{
          if(err)throw err;
          if(response.Labels.length>2){
          let query3=mysql.format("update images set label3=? where image=? and username=?",[response.Labels[2].Name,filePath,req.body.username]);
          mysql.query(query3,(err)=>{
            if(err)throw err;
          })
        }
        })
      }
      })
    }
    const params2 = {
      Image:{
        Bytes:buffer
      }
        }
  rekognition.detectText(params2, (err,response)=>{
    if(err) {
      console.log(err,err.stack);
    }
    else{
     text=response;
     res.json({"labels":labels,"text":text,"path":filePath});
    }
  })
  }
  })
})

app.post('/get-image',(req,res)=>{
  console.log(req.body);
  let query = mysql.format("select id,image,private from images where username=?",req.body.username);
  mysql.query(query,(err,result)=>{
    if (err) throw err;
    res.json({"images":result});
  })
})

app.post('/store-similar',(req,res)=>{
  console.log(req.body);
  let query = mysql.format("select count(*) as count from images where username=? and image=?",[req.body.username,req.body.path]);
  mysql.query(query,(err,result)=>{
    if (err) throw err;
    console.log(result);
    if(result[0].count<1){
      let query2 = mysql.format("insert into images(username,image,label1,label2,label3) values(?,?,?,?,?)",[req.body.username,req.body.path,req.body.label1,req.body.label2,req.body.label3]);
      mysql.query(query2,(err)=>{
        if(err)throw err;
        res.json({"message":"Image stored"});
      })
    }
  })
})

app.post('/set-private',(req,res)=>{
  let private;
  if(req.body.private){
    private='T';
  }
  else{
    private='F';
  }
  let query = mysql.format("update images set private=? where id=?",[private,req.body.id]);
  mysql.query(query,(err)=>{
    if (err) throw err;
    res.json({"message":"Set"});
  })
})

app.post('/delete-image',(req,res)=>{
  console.log(req.body);
  let query = mysql.format("delete from images where id=?",req.body.id);
  mysql.query(query,(err,result)=>{
    if (err) throw err;
    res.json({"message":"Image deleted"});
  })
})

app.post('/similar-image',(req,res)=>{
  console.log(req.body);
  let similar = {};
  let query = mysql.format("select distinct image,label1,label2,label3 from images where label1=? and private=?",[req.body.labels[0].Name,'F']);
  mysql.query(query,(err,result)=>{
    if (err) throw err;
    if(result.length!==0){
      similar['images1']=result;
    }
    if(req.body.labels.length>1){
      let query2 = mysql.format("select distinct image,label1,label2,label3 from images where label1<>? and label2=? and private=?",[req.body.labels[0].Name,req.body.labels[1].Name,'F']);
      mysql.query(query2,(err,response)=>{
        if(err)throw err;
        if(response.length!==0){
          similar['images2']=response;
        }
        if(req.body.labels.length>2){
        let query3 = mysql.format("select distinct image,label1,label2,label3 from images where label1<>? and label2<>? and label3=? and private=?",[req.body.labels[0].Name,req.body.labels[1].Name,req.body.labels[2].Name,'F']);
        mysql.query(query3,(err,result3)=>{
          if(err)throw err;
          if(result3.length!==0){
            similar['images3']=result3;
          }
          res.json({"similar":similar});
        })
      }
      else{
        res.json({"similar":similar});
      }
      })
    }
    else{
      res.json({"similar":similar});
    }
  })
})

app.post('/share-image',(req,res)=>{
  console.log(req.body);
  let query = mysql.format("select count(*) as count from users where username=?",req.body.username);
  mysql.query(query,(err,count)=>{
    if(err) throw err;
    if(count[0].count<1){
      res.json({"message":"User doesn't exist"});
      return;
    }
    else{
  let query2 = mysql.format("select image from images where id=?",req.body.id);
  mysql.query(query2,(err,result)=>{
    if (err) throw err;
    let query3 = mysql.format("select username from images where image=?",result[0].image);
    mysql.query(query3,(err,names)=>{
      if(err) throw err;
      for(let i=0;i<names.length;i++){
        if(names[i].username==req.body.username){
          res.json({"message":"User already has the image"});
          return;
        }
      }
      let query4 = mysql.format("insert into images(username,image) values(?,?)",[req.body.username,result[0].image]);
mysql.query(query4,(err)=>{
  if(err) throw err;
  res.json({"message":"Image shared"});
})
  })
    })
   
  }
})
})

module.exports = app;
