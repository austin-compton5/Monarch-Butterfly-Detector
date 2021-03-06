import Nav from './components/navigation/navigation'
import './App.css'
import Clarifai from 'clarifai'
import Logo from './components/navigation/Logo/logo'
import React from 'react'
import Register from './components/navigation/register'
import Imagelinkform from './components/navigation/Imagelinkform'
import Rank from './components/navigation/rank'
import SignIn from './components/navigation/signIn.js'
import Particles from 'react-particles-js';
import FaceRecognition from './components/navigation/facerecognition'
// import { version } from 'react-dom'


const app = new Clarifai.App({
  apiKey: '42a188ff3bc8437aafca406922e37cd5'
 });

class App extends React.Component {
  constructor(props){
    super(props)
    this.state={
      input:'',
      imageUrl: '',
      box: {}, 
      route: 'signin',
      isSignedIn: false,
      handleData: '',
      user : {
        id: '',
        name: '',
        email: '',
        entries: 0,
      }
    }
  }

  componentDidMount(){
    fetch('http://localhost:3000/')
      .then(response => response.json())
      .then(console.log)
  }

  loadCurrentUserData = (data)=>{
    this.setState({user : {
      id : data.id,
      name : data.name,
      email: data.email,
      entries: data.entries
    }})
    console.log(this.state.user)
  }

  clearUserData = () => {
    this.setState({
      user : {
        id: '',
        name:  '', 
        email :  '',
        entries : 0
      }
    })
    console.log(this.state.user)
  }
  returnUser = () =>{
    return this.state.user
  }

  setImageCount = () =>{
        fetch('http://localhost:3000/images', {
          method: 'put',
          headers: {"Content-Type":'application/json'},
          body: JSON.stringify({
            id:this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
    })
 }


  calculateButterflyData(data){
    let adjustedDataSingleMonarchs = data.outputs[0].data.concepts[0].value
    let response = ``
    if(adjustedDataSingleMonarchs * 100 > 75){
      response = `Confirmed! We are ${adjustedDataSingleMonarchs.toFixed(4)*100} percent sure your sighting is a monarch`
    }else if(adjustedDataSingleMonarchs * 100 < 75 && adjustedDataSingleMonarchs * 100 > 50){
      response = `We're unsure if your sighting was a monarch`
    }else{
      response = 'Oops! This sighting probably was not a monarch'
    }
    return{
      response
    }
    
    }

  onInputChange = (event)=>{
    this.setState({input: event.target.value})
  }

  onButtonSubmit = () =>{
    this.setState({imageUrl: this.state.input})
    app.models.predict({id: 'monarch-butterfly-26127', version:'e7ce5a1b0c664a96a21c1dc457c1ff6e'}, this.state.input)
    .then(response =>
       this.setState({handleData: this.calculateButterflyData(response).response}))
    .then(()=> this.setImageCount())
    .catch(er => console.log(er))
  }


  onRouteChange = () => {
    this.setState({route: 'home'})
    this.setState({isSignedIn : true})
  }

  onRouteChange2 = () => {
    this.setState({route : 'signin'})
    this.setState({isSignedIn : false})
    this.setState({handleData: ''})
    this.setState({imageUrl: ''})
    this.clearUserData()
  }

  onRouteChange3 = () => {
    this.setState({route : 'register'})
    this.setState({isSignedIn: true})
  }


  render(){
  return (
    <div className='App'>
    <Particles className='particles'
        params={{ 
          particles: { 
            number: { 
              value: 140, 
              density: { 
                enable: true, 
                value_area: 1000, 
              } 
            }, 
          }, 
        }} 
      /> 
    <Nav onRouteChange2 = {this.onRouteChange2} isSignedIn = {this.state.isSignedIn}/>
    { this.state.route ==='signin' ?
    <SignIn onRouteChange = {this.onRouteChange} onRouteChange3={this.onRouteChange3} loadCurrentUserData={this.loadCurrentUserData}/>
    : (
      this.state.route ==='home' ?
    <div>
     <Logo/>
    <Rank userName={this.state.user.name} userEntries={this.state.user.entries}/>
    <Imagelinkform 
    onInputChange={this.onInputChange} 
    onButtonSubmit = {this.onButtonSubmit}
    handleData = {this.state.handleData}/>
    <FaceRecognition imageUrl={this.state.imageUrl}  box = {this.state.box} />
    </div>
    : <Register onRouteChange = {this.onRouteChange} loadCurrentUserData={this.loadCurrentUserData}/>
    )
    }
    </div>
  )
  }
}

export default App;
