import React, { useState } from "react";
import './App.css'

class LoginForm extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      login: JSON.parse(localStorage.getItem("login"))
    };
  }

  login_action=(event) =>{
    event.preventDefault();
    let input1 = event.target.elements.username.value;
    let input2 = event.target.elements.password.value;
    event.target.elements.username.value="";
    event.target.elements.password.value="";

    fetch('http://localhost:9000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": input1,
        "password": input2
      })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {
      console.log('Response from Express:', data);
      if(data.success){
      localStorage.setItem("login",true);
      localStorage.setItem("username",input1);
      this.setState({"login":true});
      window.location.reload();
      }
      else{
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  }

 logout_action=()=>{
  this.setState({"login":false});
    localStorage.setItem("login",false);
    localStorage.removeItem("username");
    window.location.reload();
  }

render(){
    if (!this.state.login) {
      return (
        <div>
          <form onSubmit={this.login_action}>
            <h2>Login to get your own library</h2>
            <label htmlFor="username">Username</label>
            <input id="username" type="text" required />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required />
            <button type="submit">Login</button>
          </form>
          <RegisterForm />
        </div>
      );
    } else {
      return (
        <div className="login">
          <h1>Hi, {localStorage.getItem("username")}</h1>
          <button onClick={this.logout_action}>Logout</button>
          <Library />
        </div>
      );
    }
  }
}

const RegisterForm = () => {
  const register_action = (event) => {
    event.preventDefault();
    let input1 = event.target.elements.new_username.value;
    event.target.elements.new_username.value="";
    let input2 = event.target.elements.new_password.value;
    event.target.elements.new_password.value="";
    fetch('http://localhost:9000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": input1,
        "password": input2
      })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {
      console.log('Response from Express:', data);
      if(data.success){
        alert("Register success");
      }
      else{
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  };

  return (
    <form onSubmit={register_action}>
      <h2>Don't have an account? Register!</h2>
      <label htmlFor="new_username">Username</label>
      <input id="new_username" type="text" required />
      <label htmlFor="new_password">Password</label>
      <input id="new_password" type="password" required />
      <button type="submit">Register</button>
    </form>
  );
};

const ImageUpload = () => {
  const [file,setFile] = useState('');
const[labels,setLabels]=useState('');
const[text,setText]=useState('');
const[similar,setSimilar]=useState('');
const[image1,setImage1]=useState('');
const[image2,setImage2]=useState('');
const[image3,setImage3]=useState('');

const similar_image=(labels,path)=>{
  fetch('http://localhost:9000/similar-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "labels":labels
    })
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Network response was not ok.');
  })
  .then(data => {
    console.log(data);
    if(data.similar.images1 !==undefined){
    let similar_images1 = data.similar.images1.map((item)=>{
      console.log(item.image);
      if(item.image !== path){
        if(JSON.parse(localStorage.getItem("login"))){
          return(
            <div key={item.image}>
        <img src={item.image} />
        <button onClick={()=>store_similar(item.image,item.label1,item.label2,item.label3)}>Store</button>
        </div>
          )
          }
          else{
            return(
              <img key={item.image} src={item.image} />
            )
          }
      }
    })
    setImage1(similar_images1);
  }
  if(data.similar.images2 !== undefined){
    let similar_images2=data.similar.images2.map((item)=>{
      if(item.image !== path){
        if(JSON.parse(localStorage.getItem("login"))){
        return(
          <div key={item.image}>
      <img src={item.image} />
      <button onClick={()=>store_similar(item.image,item.label1,item.label2,item.label3)}>Store</button>
      </div>
        )
        }
        else{
          return(
            <img key={item.image} src={item.image} />
          )
        }
      }
    })
    setImage2(similar_images2);
  }
  if(data.similar.images3 !== undefined){
    let similar_images3=data.similar.images3.map((item)=>{
     if(item.image !== path){
      if(JSON.parse(localStorage.getItem("login"))){
        return(
          <div key={item.image}>
      <img src={item.image} />
      <button onClick={()=>store_similar(item.image,item.label1,item.label2,item.label3)}>Store</button>
      </div>
        )
        }
        else{
          return(
            <img key={item.image} src={item.image} />
          )
        }
     }
    })
    setImage3(similar_images3);
  }
}).catch(error => {
  console.error('There was a problem with the fetch operation:', error);
});
}

const store_similar=(path,label1,label2,label3)=>{
  fetch('http://localhost:9000/store-similar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "path":path,
      "username":localStorage.getItem("username"),
      "label1":label1,
      "label2":label2,
      "label3":label3
    })
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Network response was not ok.');
  })
  .then(data=>{
    console.log(data.message);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}

  const get_image = (event) => {
    setImage1('');
    setImage2('');
    setImage3('');
    event.preventDefault();
    let file = event.target.image.files[0];
    setFile(URL.createObjectURL(file));
    event.target.image.value="";
    if(!file){
      alert("You must upload a file!");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      fetch('http://localhost:9000/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "image": reader.result.split(',')[1],
        "username": localStorage.getItem("username"),
        "path":file.name
      })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {
      console.log('Response from Express:', data);
      let all_labels=data.labels.Labels.map((item,index)=>{
        if(index<=10){
          let size = 40-index*5;
          if(size<10){
            size=10;
          }
        return(
          <p key={index} className="label" style={{fontSize:size}}>{item.Name}</p>
        )
        }
      })
     setLabels(all_labels);
     if(data.text.TextDetections.length==0){
      setText(()=>{
        return(
          <p>There's no text in the picture</p>
        )
      });
     }
     else{
     let all_text=data.text.TextDetections.map((item,index)=>{
      if(index<=10){
        if(index==0){
          return(
            <div key={index}>
            <strong>Text in the picture:</strong>
            <p className="text" >{item.DetectedText}</p>
            </div>
          )
        }
        else{
      return(
        <p className="text" key={index}>{item.DetectedText}</p>
      )
        }
      }
    })
   setText(all_text);
   let similar_button=()=>{
    return(
      <button onClick={()=>similar_image(data.labels.Labels,data.path)}>Find Similar</button>
    )
   }
   setSimilar(similar_button);
  }
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
    };
  };
  

  return (
    <div>
    <form onSubmit={get_image}>
      <h2>Upload your image here</h2>
      <input className="upload" id="image" accept="image/*" type="file" required/>
      <button type="submit">Upload</button>
    </form>
    <div>{file && <img src={file} alt="Your image"/>}</div>
    <div className="output">
    {labels}
    </div>
    <div className="output">
    {text}
    </div>
    <div className="similar">
    {similar}
    </div>
    <div>
      {image1}
      {image2}
      {image3}
    </div>
    </div>

  );
};

const Library=()=>{
  const [images,setImages] = useState('');
  const[share,setShare]=useState('');

  const setPrivate=(id,boolean)=>{
    fetch('http://localhost:9000/set-private',{
      method:"POST",
      headers:{
        "Content-type":"application/json"
      },
      body:JSON.stringify({
        "id":id,
        "private":boolean
      })
    }).then(response=>{
      if(response.ok){
        return response.json();
      }
      throw new Error('Network response was not ok.');
    }).then(data=>{
     console.log(data.message);
     all_images();
    }).catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  }

  const deleteImage=(id)=>{
    fetch('http://localhost:9000/delete-image',{
      method:"POST",
      headers:{
        "Content-type":"application/json"
      },
      body:JSON.stringify({
        "id":id
      })
    }).then(response=>{
      if(response.ok){
        return response.json();
      }
      throw new Error('Network response was not ok.');
    }).then(data=>{
     console.log(data.message);
     all_images();
    }).catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  }

const shareImage=(id)=>{
  const shareForm = ()=>{
    return(
      <form onSubmit={share_action}>
         <label htmlFor="share_name">Share With</label>
      <input id="share_name" type="text" required />
      <button type="submit">Confirm</button>
      <button onClick={()=>{
        setShare('');
      }}>Cancel</button>
      </form>
    )
  }

const share_action=(event)=>{
  event.preventDefault();
  let username =event.target.share_name.value;
  event.target.share_name.value="";
  fetch('http://localhost:9000/share-image',{
      method:"POST",
      headers:{
        "Content-type":"application/json"
      },
      body:JSON.stringify({
        "username":username,
        "id":id
      })
    }).then(response=>{
      if(response.ok){
        return response.json();
      }
      throw new Error('Network response was not ok.');
    }).then(data=>{
      alert(data.message);
     console.log(data.message);
    }).catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  }
  setShare(shareForm);
}

  const all_images=()=>{
    let username = localStorage.getItem("username");
    fetch('http://localhost:9000/get-image',{
      method: "POST",
      headers:{
        'Content-type':'application/json'
      },
      body:JSON.stringify({
        "username":username
      })
    }).then(response=>{
      if(response.ok){
        return response.json();
      }
      throw new Error('Network response was not ok.');
    }).then(data=>{
      let all_images=data.images.map((item)=>{
        if(item.private=='F'){
        return(
    <div key={item.id}>
      <img src={item.image} />
      <button onClick={()=>deleteImage(item.id)
       }>Delete</button>
      <button onClick={()=>shareImage(item.id)}>Share</button>
      <button onClick={()=>setPrivate(item.id,true)}>Set Private</button>
    </div>
        )
      }
      else{
        return(
          <div key={item.id}>
            <img src={item.image} />
            
            <button onClick={()=>deleteImage(item.id)
             }>Delete</button>
            <button onClick={()=>shareImage(item.id)}>Share</button>
            <button onClick={()=>setPrivate(item.id,false)}>Set Public</button>
            
          </div>
              )
      }
      })
   setImages(all_images);
  }).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
  }

  if(images!==''){
return(
  <div>
  <button onClick={()=>{
    setImages('');
    setShare('');
  }}>Back</button>
  {images}
  {share}
  </div>

);
  }
  else{
    return(
      <div>
    <button onClick={all_images}>Library</button>
    </div>
    );
  }
}

function App() {
  return (

    <div className="App">
      <div className="title">
      <h1 className="title-inside">Simple Image Processor</h1>
      </div>
     <div className="login">
      <LoginForm />
      </div>
      <div className="image">
      <ImageUpload />
      </div>
    </div>
   
  );
}

export default App;
