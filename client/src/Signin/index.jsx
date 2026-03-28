import React from "react";
import {
  Container,
  FormWrap,
  Icon,
  FormContent,
  Form,
  FormInput,
  FormH1,
  FormLabel,
  FormButton,
  Text,
} from "./SigninElements";
// import { signIn } from "API";
import { signIn } from "../api/api";
import { useNavigate } from "react-router-dom";
import { Spinner } from "reactstrap";
import { Link } from "react-router-dom";

// import img1 from "images/favicon.png";
import favicon from '../assets/images/favicon.png';



const Signin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState();
  const [password, setPassword] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors
    // await signIn({ email, password })
    //   .then((res) => {
    //     setLoading(false);
    //     navigate("/admin/dashboard");
    //   })
    //   .catch((e) => {
    //     setLoading(false);
    //   });  

    try {
      const response = await signIn({ email, password });
      console.log("Signin response:", response); // Log the response
      console.log("Navigating to /admin/dashboard"); // Debugging
      navigate("/admin/dashboard"); // Navigate after successful sign-in
    } catch (e) {
      console.log("Signin error:", e.response?.data || e.message); // Log the error
      setError(e.response?.data?.message || e.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Spinner animation="border" role="status" className="">
          {/* <span className="visually-hidden">Loading...</span>  */}
          Loading...
        </Spinner>
      </div>
    );
  } else {
    return (
      <>
        {!loading && (
          <Container>
            <FormWrap>
              <Icon to="/"><img src={favicon} height="30px" width="30px"></img>Financify</Icon>
              <FormContent>
                <Form onSubmit={formSubmitHandler}>
                  <FormH1>Sign in to your account</FormH1>
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  
                  <FormLabel htmlFor="for">Email</FormLabel>
                  <FormInput
                    htmlFor="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FormLabel htmlFor="for">Password</FormLabel>
                  <FormInput
                    type="password"
                    htmlFor="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <FormButton type="submit" disabled={loading}>
                    {loading ? 'Signing In...' : 'Continue'}
                  </FormButton>
                  <Link to="/signup" className="text-center mt-4">Don't have an account?</Link>
                </Form>
              </FormContent>
            </FormWrap>
          </Container>
        )}
      </>
    );
  }
};

export default Signin;
