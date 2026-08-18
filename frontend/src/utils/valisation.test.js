import {
  EMAIL_REGEX,
  STRONG_PASSWORD_REGEX,
  validateEmail,
  validateLoginPassword,
  validateStrongPassword,
  validateUsername,
} from "./validation";

describe("validateEmail", () => {
  it("rejects an empty or whitespace-only email", () => {
    expect(validateEmail("")).toBe("Email is required.");
    expect(validateEmail("   ")).toBe("Email is required.");
  });

  it("rejects an email missing the @ symbol", () => {
    expect(validateEmail("not-an-email.com")).toBe("Enter a valid email address.");
  });

  it("rejects an email missing a domain dot", () => {
    expect(validateEmail("user@domain")).toBe("Enter a valid email address.");
  });

  it("rejects an email with spaces", () => {
    expect(validateEmail("user name@domain.com")).toBe("Enter a valid email address.");
  });

  it("accepts a valid email", () => {
    expect(validateEmail("user@example.com")).toBe("");
  });

  it("accepts a valid email with surrounding whitespace", () => {
    expect(validateEmail("  user@example.com  ")).toBe("");
  });

  it("does not hang on a long input with no matching dot (ReDoS regression check)", () => {
    const maliciousInput = "a@" + "b".repeat(50000);
    const start = Date.now();
    validateEmail(maliciousInput);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});

describe("validateLoginPassword", () => {
  it("rejects an empty password", () => {
    expect(validateLoginPassword("")).toBe("Password is required.");
  });

  it("accepts any non-empty password (login doesn't enforce strength)", () => {
    expect(validateLoginPassword("x")).toBe("");
  });
});

describe("validateStrongPassword", () => {
  it("rejects an empty password", () => {
    expect(validateStrongPassword("")).toBe("Password is required.");
  });

  it("rejects a password under 6 characters", () => {
    expect(validateStrongPassword("Ab1!")).toBe("Password must be at least 6 characters.");
  });

  it("rejects a password missing a special character", () => {
    expect(validateStrongPassword("Abcdef1")).toBe(
      "Use letters, numbers, and at least one special character."
    );
  });

  it("rejects a password missing a number", () => {
    expect(validateStrongPassword("Abcdef!")).toBe(
      "Use letters, numbers, and at least one special character."
    );
  });

  it("rejects a password missing a letter", () => {
    expect(validateStrongPassword("123456!")).toBe(
      "Use letters, numbers, and at least one special character."
    );
  });

  it("accepts a valid strong password", () => {
    expect(validateStrongPassword("Abcdef1!")).toBe("");
  });
});

describe("validateUsername", () => {
  it("rejects an empty or whitespace-only username", () => {
    expect(validateUsername("")).toBe("Username is required.");
    expect(validateUsername("   ")).toBe("Username is required.");
  });

  it("rejects a username under 3 characters", () => {
    expect(validateUsername("ab")).toBe("Username must be at least 3 characters.");
  });

  it("accepts a valid username", () => {
    expect(validateUsername("alice")).toBe("");
  });

  it("accepts a username exactly at the minimum length", () => {
    expect(validateUsername("abc")).toBe("");
  });
});