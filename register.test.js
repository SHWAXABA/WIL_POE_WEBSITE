//The following nine test will test the various features of the website register and login
// Mock Firebase setup
jest.mock("firebase/app", () => {
  const auth = {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    currentUser: { uid: "testUID" },
  };

  const database = {
    ref: jest.fn(() => ({
      child: jest.fn(() => ({
        set: jest.fn(),
        update: jest.fn(),
      })),
    })),
  };

  return { auth, database };
});

const firebase = require("firebase/app");
const { auth, database } = firebase;

// Input Validation for the password and email tests
function validateInputs(email, password, username) {
  if (!email || !password || !username) {
    return "All fields are required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    return "Please enter a valid email address.";
  }
  return null; // No errors
}

// Register function for the registared email tests
async function register(user_name, user_email, user_phone, user_password) {
  const errorMessage = validateInputs(user_email, user_password, user_name);
  if (errorMessage) return { error: errorMessage };

  try {
    await auth.createUserWithEmailAndPassword(user_email, user_password);
    const user = auth.currentUser;
    const user_data = {
      username: user_name,
      email: user_email,
      phone: user_phone,
      last_login: Date.now(),
    };
    await database.ref("users/" + user.uid).set(user_data);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}

// Login function
async function login(user_email, user_password) {
  try {
    await auth.signInWithEmailAndPassword(user_email, user_password);
    const user = auth.currentUser;
    await database.ref("users/" + user.uid).update({ last_login: Date.now() });
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}

// Logout function
async function logout() {
  try {
    await auth.signOut();
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}

// Test Suite
describe("Firebase Authentication", () => {
  // Input Validation Tests
  describe("Input Validation", () => {
    test("should return an error message for empty email", () => {
      const result = validateInputs("", "password123", "John Doe");
      expect(result).toBe("All fields are required.");
    });

    test("should return an error message for short password", () => {
      const result = validateInputs("user@example.com", "short", "John Doe");
      expect(result).toBe("Password must be at least 8 characters.");
    });

    test("should return an error message for invalid email", () => {
      const result = validateInputs("invalidemail", "password123", "John Doe");
      expect(result).toBe("Please enter a valid email address.");
    });

    test("should return null for valid inputs", () => {
      const result = validateInputs(
        "user@example.com",
        "password123",
        "John Doe"
      );
      expect(result).toBeNull();
    });
  });

  // Register Function Tests
  describe("Register Function", () => {
    test("should return an error if inputs are invalid", async () => {
      const result = await register("", "invalidEmail", "1234567890", "short");
      expect(result.error).toBe("All fields are required.");
    });

    test("should handle Firebase error correctly", async () => {
      auth.createUserWithEmailAndPassword.mockRejectedValueOnce(
        new Error("Firebase error")
      );

      const result = await register(
        "John Doe",
        "user@example.com",
        "1234567890",
        "validpassword123"
      );
      expect(result.error).toBe("Firebase error");
    });
  });

  // Login Function Tests
  describe("Login Function", () => {
    test("should return an error for invalid credentials", async () => {
      auth.signInWithEmailAndPassword.mockRejectedValueOnce(
        new Error("Invalid credentials")
      );
      const result = await login("invalid@example.com", "wrongpassword");
      expect(result.error).toBe("Invalid credentials");
    });
  });

  // Logout Function Tests
  describe("Logout Function", () => {
    test("should call Firebase signOut and return success", async () => {
      auth.signOut.mockResolvedValueOnce();
      const result = await logout();
      expect(result.success).toBe(true);
      expect(auth.signOut).toHaveBeenCalled();
    });

    test("should handle Firebase error correctly", async () => {
      auth.signOut.mockRejectedValueOnce(new Error("Sign out failed"));
      const result = await logout();
      expect(result.error).toBe("Sign out failed");
    });
  });
});
