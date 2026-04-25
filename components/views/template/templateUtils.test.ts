import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAndValidateTemplateVariables } from './templateUtils';

test('normalizeAndValidateTemplateVariables normalizes unordered variables', () => {
    assert.equal(
        normalizeAndValidateTemplateVariables('Hello {{3}}, your appointment is at {{2}}.'),
        'Hello {{2}}, your appointment is at {{1}}.'
    );
});

test('normalizeAndValidateTemplateVariables normalizes skipped numbers', () => {
    assert.equal(
        normalizeAndValidateTemplateVariables('Hello {{1}}, your report is {{3}}.'),
        'Hello {{1}}, your report is {{2}}.'
    );
});

test('normalizeAndValidateTemplateVariables rejects duplicate numbers', () => {
    assert.throws(
        () => normalizeAndValidateTemplateVariables('Hello {{2}}, please confirm {{2}}.'),
        /Template body must not contain duplicate variable numbers/
    );
});

test('normalizeAndValidateTemplateVariables keeps valid ordered variables unchanged', () => {
    assert.equal(
        normalizeAndValidateTemplateVariables('Hello {{1}}, your appointment is at {{2}}.'),
        'Hello {{1}}, your appointment is at {{2}}.'
    );
});
