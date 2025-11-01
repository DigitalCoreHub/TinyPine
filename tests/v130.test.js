/**
 * TinyPine v1.3.0 - Form Components Tests
 * Tests for tp-input, tp-field, tp-checkbox, tp-file-upload
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

describe('TinyPine v1.3.0 - Form Components', () => {
  beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';

    // Reset TinyPine if it exists
    if (global.window.TinyPine) {
      delete global.window.TinyPine;
    }
  });

  describe('tp-field component', () => {
    it('should create field with label', () => {
      document.body.innerHTML = `
        <tp-field label="Email">
          <input type="text" />
        </tp-field>
      `;

      const field = document.querySelector('tp-field');
      expect(field).toBeTruthy();
      expect(field.getAttribute('label')).toBe('Email');
    });

    it('should show required asterisk when required', () => {
      document.body.innerHTML = `
        <tp-field label="Name" required>
          <input type="text" />
        </tp-field>
      `;

      const field = document.querySelector('tp-field');
      expect(field.hasAttribute('required')).toBe(true);
    });

    it('should display helper text', () => {
      document.body.innerHTML = `
        <tp-field label="Email" helper="We'll never share your email">
          <input type="text" />
        </tp-field>
      `;

      const field = document.querySelector('tp-field');
      expect(field.getAttribute('helper')).toBe("We'll never share your email");
    });

    it('should display error message', () => {
      document.body.innerHTML = `
        <tp-field label="Email" error="Invalid email address">
          <input type="text" />
        </tp-field>
      `;

      const field = document.querySelector('tp-field');
      expect(field.getAttribute('error')).toBe('Invalid email address');
    });
  });

  describe('tp-input component', () => {
    it('should create input with default props', () => {
      document.body.innerHTML = `
        <tp-input placeholder="Enter text"></tp-input>
      `;

      const input = document.querySelector('tp-input');
      expect(input).toBeTruthy();
      expect(input.getAttribute('placeholder')).toBe('Enter text');
    });

    it('should support different sizes', () => {
      document.body.innerHTML = `
        <tp-input size="sm"></tp-input>
        <tp-input size="md"></tp-input>
        <tp-input size="lg"></tp-input>
      `;

      const inputs = document.querySelectorAll('tp-input');
      expect(inputs.length).toBe(3);
      expect(inputs[0].getAttribute('size')).toBe('sm');
      expect(inputs[1].getAttribute('size')).toBe('md');
      expect(inputs[2].getAttribute('size')).toBe('lg');
    });

    it('should support icon prop', () => {
      document.body.innerHTML = `
        <tp-input icon="mail" placeholder="Email"></tp-input>
      `;

      const input = document.querySelector('tp-input');
      expect(input.getAttribute('icon')).toBe('mail');
    });

    it('should support state prop for validation', () => {
      document.body.innerHTML = `
        <tp-input state="error"></tp-input>
        <tp-input state="valid"></tp-input>
      `;

      const inputs = document.querySelectorAll('tp-input');
      expect(inputs[0].getAttribute('state')).toBe('error');
      expect(inputs[1].getAttribute('state')).toBe('valid');
    });

    it('should support different input types', () => {
      document.body.innerHTML = `
        <tp-input type="email"></tp-input>
        <tp-input type="password"></tp-input>
        <tp-input type="text"></tp-input>
      `;

      const inputs = document.querySelectorAll('tp-input');
      expect(inputs[0].getAttribute('type')).toBe('email');
      expect(inputs[1].getAttribute('type')).toBe('password');
      expect(inputs[2].getAttribute('type')).toBe('text');
    });
  });

  describe('tp-checkbox component', () => {
    it('should create checkbox with label', () => {
      document.body.innerHTML = `
        <tp-checkbox label="I agree to terms"></tp-checkbox>
      `;

      const checkbox = document.querySelector('tp-checkbox');
      expect(checkbox).toBeTruthy();
      expect(checkbox.getAttribute('label')).toBe('I agree to terms');
    });

    it('should support disabled state', () => {
      document.body.innerHTML = `
        <tp-checkbox label="Disabled" disabled></tp-checkbox>
      `;

      const checkbox = document.querySelector('tp-checkbox');
      expect(checkbox.hasAttribute('disabled')).toBe(true);
    });

    it('should work without label', () => {
      document.body.innerHTML = `
        <tp-checkbox></tp-checkbox>
      `;

      const checkbox = document.querySelector('tp-checkbox');
      expect(checkbox).toBeTruthy();
      expect(checkbox.getAttribute('label')).toBeNull();
    });
  });

  describe('tp-file-upload component', () => {
    it('should create file upload with default props', () => {
      document.body.innerHTML = `
        <tp-file-upload></tp-file-upload>
      `;

      const upload = document.querySelector('tp-file-upload');
      expect(upload).toBeTruthy();
    });

    it('should support accept attribute', () => {
      document.body.innerHTML = `
        <tp-file-upload accept="image/*"></tp-file-upload>
      `;

      const upload = document.querySelector('tp-file-upload');
      expect(upload.getAttribute('accept')).toBe('image/*');
    });

    it('should support multiple files', () => {
      document.body.innerHTML = `
        <tp-file-upload multiple></tp-file-upload>
      `;

      const upload = document.querySelector('tp-file-upload');
      expect(upload.hasAttribute('multiple')).toBe(true);
    });

    it('should support max-size attribute', () => {
      document.body.innerHTML = `
        <tp-file-upload max-size="5"></tp-file-upload>
      `;

      const upload = document.querySelector('tp-file-upload');
      expect(upload.getAttribute('max-size')).toBe('5');
    });
  });

  describe('Form components integration', () => {
    it('should work together in a complete form', () => {
      document.body.innerHTML = `
        <form>
          <tp-field label="Name">
            <tp-input icon="user" placeholder="John Doe"></tp-input>
          </tp-field>
          <tp-field label="Email">
            <tp-input icon="mail" type="email" placeholder="email@example.com"></tp-input>
          </tp-field>
          <tp-checkbox label="Subscribe to newsletter"></tp-checkbox>
          <tp-field label="Avatar">
            <tp-file-upload accept="image/*"></tp-file-upload>
          </tp-field>
        </form>
      `;

      const form = document.querySelector('form');
      const fields = form.querySelectorAll('tp-field');
      const inputs = form.querySelectorAll('tp-input');
      const checkbox = form.querySelector('tp-checkbox');
      const upload = form.querySelector('tp-file-upload');

      expect(form).toBeTruthy();
      expect(fields.length).toBe(3);
      expect(inputs.length).toBe(2);
      expect(checkbox).toBeTruthy();
      expect(upload).toBeTruthy();
    });

    it('should support t-model binding on all form components', () => {
      document.body.innerHTML = `
        <div t-data="{ name: '', email: '', agree: false, file: null }">
          <tp-input t-model="name"></tp-input>
          <tp-input t-model="email"></tp-input>
          <tp-checkbox t-model="agree"></tp-checkbox>
          <tp-file-upload t-model="file"></tp-file-upload>
        </div>
      `;

      const container = document.querySelector('[t-data]');
      const inputs = container.querySelectorAll('tp-input');
      const checkbox = container.querySelector('tp-checkbox');
      const upload = container.querySelector('tp-file-upload');

      expect(inputs[0].getAttribute('t-model')).toBe('name');
      expect(inputs[1].getAttribute('t-model')).toBe('email');
      expect(checkbox.getAttribute('t-model')).toBe('agree');
      expect(upload.getAttribute('t-model')).toBe('file');
    });
  });

  describe('Form validation states', () => {
    it('should display error state correctly', () => {
      document.body.innerHTML = `
        <tp-field label="Email" error="Invalid email">
          <tp-input state="error" type="email"></tp-input>
        </tp-field>
      `;

      const field = document.querySelector('tp-field');
      const input = document.querySelector('tp-input');

      expect(field.getAttribute('error')).toBe('Invalid email');
      expect(input.getAttribute('state')).toBe('error');
    });

    it('should display valid state correctly', () => {
      document.body.innerHTML = `
        <tp-field label="Email">
          <tp-input state="valid" type="email"></tp-input>
        </tp-field>
      `;

      const input = document.querySelector('tp-input');
      expect(input.getAttribute('state')).toBe('valid');
    });
  });
});