const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});


var nameError = document.getElementById("name-error");
var numberError = document.getElementById("number-error");
var emailError = document.getElementById("email-error");
var passwordError = document.getElementById("password-error");
var confirmPasswordError = document.getElementById('confirmPassword-error');
var submitError = document.getElementById('submit-error');
// var mailExists = document.getElementById('mail-exists');

// function validateEmailExists(){
//     var emailExists = document.getElementById('mail-exists').value;

//     if(emailExists=true){
//         mailExists.innerHTML = "User Already Exists";
//         return false;
//     }
// }

function validateName() {
    var name=document.getElementById("contact-name").value;

    if(name.length== 0){
        nameError.innerHTML = "Name is required";
        return false;
    }
    if(name.length<3){
        nameError.innerHTML='Minimum 3 charater';
        return false;
    }
    if (name.match(' '+' ')) {
        nameError.innerHTML = 'Adjacent spaces are not allowed';
        return false;
    }
    if(!name.match( /^[a-zA-Z]+( [a-zA-Z]+)+$/)){
        nameError.innerHTML='Write full name';
        return false;
    }
   
    nameError.innerHTML= '';
    return true;
   
}


function validateNumber() {
    var number = document.getElementById("contact-number").value;

    if(number.length == 0){
        numberError.innerHTML = 'phone no is required';
        return false;
    }

    if(number.length !== 10){
        numberError.innerHTML = 'phone no should be 10 digits';
        return false;
    }

    if(!number.match(/^[0-9]{10}$/)){
        numberError.innerHTML='Only digits please';
        return false;
    }
    numberError.innerHTML= '';
    return true;
}

function validateEmail(){
    var email =document.getElementById("contact-email").value;

    if(email.length == 0){
        emailError.innerHTML ='Email is required'
        return false;
    }

    if(!email.match( /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)){
        emailError.innerHTML = 'Email Invalid'
        return false;
    }

    emailError.innerHTML = '';
    return true;
}

function validatePassword(){
    var password = document.getElementById('contact-password').value;


    if(password == ""){
        passwordError.innerHTML ="Fill the password please!"
        return false;
    }
    if(password.length < 8){
        passwordError.innerHTML =  "Password length must be atleast 8 characters";
        return false;
    }
   
    if(password.length > 15){
        passwordError.innerHTML = "Password length must not exceed 15 characters";
        return false;
    }
    
    passwordError.innerHTML = '';
    return true;
}

function validateConfirmPassword(){
    var password = document.getElementById('contact-password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;


    if(confirmPassword==""){
        confirmPasswordError.innerHTML = "Please fill the Confirm-Password";
        return false;
    }
    if(password!=confirmPassword){
        confirmPasswordError.innerHTML = "Entered Password not match";
        return false;
    }
    confirmPasswordError.innerHTML = '';
    return true;
}


function validateSignUp(event){
    
    if(!validateName() ||!validateNumber() || !validateEmail() || !validatePassword() ||!validateConfirmPassword()) {
    //   submitError.style.display='block';
      submitError.innerHTML='Please Fill All The Fields';
      event.preventDefault()
    //   setTimeout(function(){submitError.style.display='none';},5005);
      return false;
    }
    return true;
}