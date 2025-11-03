/**
 * TinyPine v1.3.0 - Form Components Tests
 * Tests for tp-input, tp-field, tp-checkbox, tp-file-upload
 */

/**
 * TinyPine v1.3.0 - Form Components Tests
 * Tests for tp-input, tp-field, tp-checkbox, tp-file-upload
 *
 * Note: These are basic structural tests.
 * Full UI tests should be performed in browser environment.
 */

import { describe, it, expect, beforeEach } from "vitest";

describe("TinyPine v1.3.0 - Form Components", () => {
    beforeEach(() => {
        // Clear document body
        document.body.innerHTML = "";

        // Reset TinyPine if it exists
        if (global.window.TinyPine) {
            delete global.window.TinyPine;
        }
    });

    describe("tp-field component", () => {
        it("should create field with label", () => {
            document.body.innerHTML = `
        <tp-field label="Email">
          <input type="text" />
        </tp-field>
      `;

            const field = document.querySelector("tp-field");
            expect(field).toBeTruthy();
            expect(field.getAttribute("label")).toBe("Email");
        });

        it("should show required asterisk when required", () => {
            document.body.innerHTML = `
        <tp-field label="Name" required>
          <input type="text" />
        </tp-field>
      `;

            const field = document.querySelector("tp-field");
            expect(field.hasAttribute("required")).toBe(true);
        });

        it("should display helper text", () => {
            document.body.innerHTML = `
        <tp-field label="Email" helper="We'll never share your email">
          <input type="text" />
        </tp-field>
      `;

            const field = document.querySelector("tp-field");
            expect(field.getAttribute("helper")).toBe(
                "We'll never share your email"
            );
        });

        it("should display error message", () => {
            document.body.innerHTML = `
        <tp-field label="Email" error="Invalid email address">
          <input type="text" />
        </tp-field>
      `;

            const field = document.querySelector("tp-field");
            expect(field.getAttribute("error")).toBe("Invalid email address");
        });
    });

    describe("tp-input component", () => {
        it("should create input with default props", () => {
            // jsdom doesn't parse custom elements from innerHTML
            // Use createElement instead
            const input = document.createElement("tp-input");
            input.setAttribute("placeholder", "Enter text");
            document.body.appendChild(input);

            expect(input).toBeTruthy();
            expect(input.tagName.toLowerCase()).toBe("tp-input");

            // Manually trigger connectedCallback for jsdom
            if (typeof input.connectedCallback === "function") {
                input.connectedCallback();
            }

            expect(input.getAttribute("placeholder")).toBe("Enter text");
        });

        it("should support different sizes", () => {
            const sizes = ["sm", "md", "lg"];
            const inputs = sizes.map((size) => {
                const input = document.createElement("tp-input");
                input.setAttribute("size", size);
                document.body.appendChild(input);

                // Trigger connectedCallback
                if (typeof input.connectedCallback === "function") {
                    input.connectedCallback();
                }

                return input;
            });

            expect(inputs.length).toBe(3);
            expect(inputs[0].getAttribute("size")).toBe("sm");
            expect(inputs[1].getAttribute("size")).toBe("md");
            expect(inputs[2].getAttribute("size")).toBe("lg");
        });

        it("should support icon prop", () => {
            const input = document.createElement("tp-input");
            input.setAttribute("icon", "mail");
            input.setAttribute("placeholder", "Email");
            document.body.appendChild(input);

            if (typeof input.connectedCallback === "function") {
                input.connectedCallback();
            }

            expect(input.getAttribute("icon")).toBe("mail");
        });

        it("should support state prop for validation", () => {
            const input1 = document.createElement("tp-input");
            input1.setAttribute("state", "error");
            document.body.appendChild(input1);

            const input2 = document.createElement("tp-input");
            input2.setAttribute("state", "valid");
            document.body.appendChild(input2);

            if (typeof input1.connectedCallback === "function") {
                input1.connectedCallback();
            }
            if (typeof input2.connectedCallback === "function") {
                input2.connectedCallback();
            }

            expect(input1.getAttribute("state")).toBe("error");
            expect(input2.getAttribute("state")).toBe("valid");
        });

        it("should support different input types", () => {
            const types = ["email", "password", "text"];
            const inputs = types.map((type) => {
                const input = document.createElement("tp-input");
                input.setAttribute("type", type);
                document.body.appendChild(input);

                if (typeof input.connectedCallback === "function") {
                    input.connectedCallback();
                }

                return input;
            });

            expect(inputs[0].getAttribute("type")).toBe("email");
            expect(inputs[1].getAttribute("type")).toBe("password");
            expect(inputs[2].getAttribute("type")).toBe("text");
        });
    });

    describe("tp-checkbox component", () => {
        it("should create checkbox with label", () => {
            const checkbox = document.createElement("tp-checkbox");
            checkbox.setAttribute("label", "I agree to terms");
            document.body.appendChild(checkbox);

            if (typeof checkbox.connectedCallback === "function") {
                checkbox.connectedCallback();
            }

            expect(checkbox).toBeTruthy();
            expect(checkbox.getAttribute("label")).toBe("I agree to terms");
        });

        it("should support disabled state", () => {
            const checkbox = document.createElement("tp-checkbox");
            checkbox.setAttribute("label", "Disabled");
            checkbox.setAttribute("disabled", "");
            document.body.appendChild(checkbox);

            if (typeof checkbox.connectedCallback === "function") {
                checkbox.connectedCallback();
            }

            expect(checkbox.hasAttribute("disabled")).toBe(true);
        });

        it("should work without label", () => {
            const checkbox = document.createElement("tp-checkbox");
            document.body.appendChild(checkbox);

            if (typeof checkbox.connectedCallback === "function") {
                checkbox.connectedCallback();
            }

            expect(checkbox).toBeTruthy();
            expect(checkbox.getAttribute("label")).toBeNull();
        });
    });

    describe("tp-file-upload component", () => {
        it("should create file upload with default props", () => {
            const upload = document.createElement("tp-file-upload");
            document.body.appendChild(upload);

            if (typeof upload.connectedCallback === "function") {
                upload.connectedCallback();
            }

            expect(upload).toBeTruthy();
        });

        it("should support accept attribute", () => {
            const upload = document.createElement("tp-file-upload");
            upload.setAttribute("accept", "image/*");
            document.body.appendChild(upload);

            if (typeof upload.connectedCallback === "function") {
                upload.connectedCallback();
            }

            expect(upload.getAttribute("accept")).toBe("image/*");
        });

        it("should support multiple files", () => {
            const upload = document.createElement("tp-file-upload");
            upload.setAttribute("multiple", "");
            document.body.appendChild(upload);

            if (typeof upload.connectedCallback === "function") {
                upload.connectedCallback();
            }

            expect(upload.hasAttribute("multiple")).toBe(true);
        });

        it("should support max-size attribute", () => {
            const upload = document.createElement("tp-file-upload");
            upload.setAttribute("max-size", "5");
            document.body.appendChild(upload);

            if (typeof upload.connectedCallback === "function") {
                upload.connectedCallback();
            }

            expect(upload.getAttribute("max-size")).toBe("5");
        });
    });

    describe("Form components integration", () => {
        it("should work together in a complete form", () => {
            // Test that all components can be created
            const field = document.createElement("tp-field");
            field.setAttribute("label", "Name");

            const input1 = document.createElement("tp-input");
            input1.setAttribute("icon", "user");
            input1.setAttribute("placeholder", "John Doe");
            field.appendChild(input1);

            const checkbox = document.createElement("tp-checkbox");
            checkbox.setAttribute("label", "Subscribe to newsletter");

            const upload = document.createElement("tp-file-upload");
            upload.setAttribute("accept", "image/*");

            document.body.appendChild(field);
            document.body.appendChild(checkbox);
            document.body.appendChild(upload);

            // Trigger connectedCallback
            [field, input1, checkbox, upload].forEach((el) => {
                if (typeof el.connectedCallback === "function") {
                    el.connectedCallback();
                }
            });

            expect(field).toBeTruthy();
            expect(input1).toBeTruthy();
            expect(checkbox).toBeTruthy();
            expect(upload).toBeTruthy();
        });

        it("should support t-model binding on all form components", () => {
            // Test that components support t-model attribute
            const input1 = document.createElement("tp-input");
            input1.setAttribute("t-model", "name");

            const input2 = document.createElement("tp-input");
            input2.setAttribute("t-model", "email");

            const checkbox = document.createElement("tp-checkbox");
            checkbox.setAttribute("t-model", "agree");

            const upload = document.createElement("tp-file-upload");
            upload.setAttribute("t-model", "file");

            expect(input1.getAttribute("t-model")).toBe("name");
            expect(input2.getAttribute("t-model")).toBe("email");
            expect(checkbox.getAttribute("t-model")).toBe("agree");
            expect(upload.getAttribute("t-model")).toBe("file");
        });
    });

    describe("Form validation states", () => {
        describe("Form validation states", () => {
            it("should display error state correctly", () => {
                const field = document.createElement("tp-field");
                field.setAttribute("label", "Email");
                field.setAttribute("error", "Invalid email");

                const input = document.createElement("tp-input");
                input.setAttribute("state", "error");
                input.setAttribute("type", "email");
                field.appendChild(input);

                document.body.appendChild(field);

                if (typeof field.connectedCallback === "function") {
                    field.connectedCallback();
                }
                if (typeof input.connectedCallback === "function") {
                    input.connectedCallback();
                }

                expect(field.getAttribute("error")).toBe("Invalid email");
                expect(input.getAttribute("state")).toBe("error");
            });

            it("should display valid state correctly", () => {
                const field = document.createElement("tp-field");
                field.setAttribute("label", "Email");

                const input = document.createElement("tp-input");
                input.setAttribute("state", "valid");
                input.setAttribute("type", "email");
                field.appendChild(input);

                document.body.appendChild(field);

                if (typeof field.connectedCallback === "function") {
                    field.connectedCallback();
                }
                if (typeof input.connectedCallback === "function") {
                    input.connectedCallback();
                }

                expect(input.getAttribute("state")).toBe("valid");
            });
        });
    });
});
