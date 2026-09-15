const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

test('specialization trash displays deleted rows and admin actions', async () => {
    for (const role of ['tenant_admin', 'staff']) {
        let stateIndex = 0;
        const states = [true, 1, 'restore', '', null, false, 'create', 'spec-1'];
        const calls = [];
        const mutation = { isPending: true, mutateAsync: async id => calls.push(id) };
        const exports = {};
        const source = ts.transpileModule(fs.readFileSync(`${__dirname}/specializationManagement.tsx`, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
        }).outputText;
        vm.runInNewContext(source, { exports, console, require(name) {
            if (name === 'react') return { useState: () => [states[stateIndex++], () => {}] };
            if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
            if (name.includes('authSelector')) return { useAuth: () => ({ user: { user_type: 'tenant', role } }) };
            if (name.includes('useSpecializationsQuery')) return new Proxy({}, { get: (_, key) => () => key === 'useGetDeletedSpecializationsQuery' ? { data: { data: { items: [{ specialization_id: 'spec-1', name: 'Deleted specialty' }], total: 1 } } } : key === 'useGetAllSpecializationsQuery' ? { data: { data: [] } } : mutation });
            if (name === '@/lib/utils') return { cn: () => '' };
            return new Proxy({}, { get: (_, key) => key });
        }});
        const tree = exports.SpecializationManagement({ isDarkMode: true });
        const nodes = [];
        function walk(node) {
            if (Array.isArray(node)) return node.forEach(walk);
            if (!node || typeof node !== 'object') return;
            nodes.push(node);
            walk(node.props?.children);
        }
        walk(tree);
        assert.match(JSON.stringify(tree), /Deleted specialty/);
        const menu = nodes.find(node => node.type === 'ActionMenu');
        assert.equal(menu.props.isRestore, role === 'tenant_admin');
        assert.equal(menu.props.isPermanentDelete, role === 'tenant_admin');
        assert.equal(menu.props.isEdit, false);
        const modal = nodes.find(node => node.type === 'ConfirmationModal');
        assert.equal(modal.props.isLoading, true);
        assert.equal(modal.props.confirmText, 'Restore');
        await modal.props.onConfirm();
        assert.deepEqual(calls, ['spec-1']);
    }
});
