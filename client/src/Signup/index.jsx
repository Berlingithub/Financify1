import React from 'react'
import { Container, FormWrap, Icon, FormContent, Form, FormInput, FormH1, FormLabel, FormButton, Text } from './SignupElements'
import { signUp } from '../api/api';
import { useNavigate } from "react-router-dom";
import { Spinner } from "reactstrap";

// import img1 from "images/favicon.png";
import favicon from '../assets/images/favicon.png';

const Signup = () => {

  const [email,setEmail]=React.useState('');
  const [password,setPassword]=React.useState('');
  const [name,setName]=React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const navigate = useNavigate();

  const formSubmitHandler= async (e)=>{
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await signUp({ email, password, name });
      console.log("Signup response:", response);
      setSuccess('Account created successfully! Redirecting to dashboard...');
      
      // User is already logged in after signup, redirect directly to dashboard
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
      
    } catch (e) {
      console.log("Signup error:", e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccess('');
  };


  return (
    <>
      {loading && (
        <div>
          <Spinner animation="border" role="status" className="">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      {!loading && <Container>
        <FormWrap>
          <Icon to='/'><img src={favicon} height="30px" width="30px"></img>Financify</Icon>
          <FormContent>
            <Form onSubmit={formSubmitHandler}>
              <FormH1>Sign up for your account</FormH1>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              <FormLabel htmlFor='name'>Your Name</FormLabel>
                <FormInput id='name' required onChange={(e)=>setName(e.target.value)} />
              <FormLabel htmlFor='email'>Email</FormLabel>
                <FormInput id='email' type='email' required onChange={(e)=>setEmail(e.target.value)} />
              <FormLabel htmlFor='password'>Password</FormLabel>
                <FormInput id='password' type="password" required onChange={(e)=>setPassword(e.target.value)} />
              {/* <FormButton type='submit' >Continue</FormButton>
              <Text><a href="/signin">Already have an account?</a></Text> */}
                <div className="d-flex flex-column gap-2">
                <FormButton type='submit' disabled={loading}>
                  {loading ? 'Creating Account...' : 'Continue'}
                </FormButton>
                <button 
                  type="button" 
                  onClick={clearForm}
                  className="btn btn-outline-secondary"
                  disabled={loading}
                >
                  Clear Form
                </button>
                <Text className="mt-2 text-center"> {/* Reduced margin-top */}
                  <a href="/signin">Already have an account?</a>
                </Text>
              </div>
            </Form>
          </FormContent>
        </FormWrap>
      </Container>}
    </>
  )
}

export default Signup
