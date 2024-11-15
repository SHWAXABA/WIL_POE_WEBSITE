// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoZkihqHBN4TDcXbSIowszXrk2926MdI0",
  authDomain: "durbannaturalsciencemuseum.firebaseapp.com",
  databaseURL: "https://durbannaturalsciencemuseum-default-rtdb.firebaseio.com",
  projectId: "durbannaturalsciencemuseum",
  storageBucket: "durbannaturalsciencemuseum.firebasestorage.app",
  messagingSenderId: "84941898203",
  appId: "1:84941898203:web:4f1b8afd117d4b85b4e7fe",
  measurementId: "G-KKXT8WT6HJ",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Register function
function register() {
  const user_name = document.getElementById("userName").value;
  const user_email = document.getElementById("userEmail").value;
  const user_phone = document.getElementById("userNumber").value;
  const user_password = document.getElementById("userPassword").value;

  auth
    .createUserWithEmailAndPassword(user_email, user_password)
    .then(() => {
      const user = auth.currentUser;
      const database_ref = database.ref();

      const user_data = {
        username: user_name,
        email: user_email,
        phone: user_phone,
        last_login: Date.now(),
      };

      database_ref.child("users/" + user.uid).set(user_data);
      alert("User created successfully!");
    })
    .catch((err) => {
      console.error("Error:", err.message);
      alert("Error: " + err.message);
    });
}
//Login function
function login() {
  const user_email = document.getElementById("userEmail").value;
  const user_password = document.getElementById("userPassword").value;

  //Validate user
  auth
    .signInWithEmailAndPassword(user_email, user_password)
    .then(function () {
      const user = auth.currentUser;
      const database_ref = database.ref();

      const user_data = {
        last_login: Date.now(),
      };

      database_ref.child("users/" + user.uid).update(user_data);
      alert("User Logged In!");
      // Redirect to homepage after successful login
      window.location.href = "index.html";
    })
    .catch(function (err) {
      console.error("Error:", err.message);
      alert("Error: " + err.message);
    });
}
// Logout function
function logout() {
  auth
    .signOut()
    .then(() => {
      alert("User Logged Out!");
      // Redirect to login page or home page
      window.location.href = "login.html";
    })
    .catch((err) => {
      console.error("Error:", err.message);
      alert("Error: " + err.message);
    });
}

// Check user authentication state on page load
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is logged in
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
  } else {
    // User is logged out
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("logoutBtn").style.display = "none";
  }
});
