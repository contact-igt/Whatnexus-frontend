const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { QueryClient } = require('@tanstack/react-query');

test('group mutations invalidate tenant-scoped member data', async () => {
    const client = new QueryClient();
    const exports = {};
    const source = ts.transpileModule(
        fs.readFileSync(`${__dirname}/useContactGroupQuery.tsx`, 'utf8'),
        { compilerOptions: { module: ts.ModuleKind.CommonJS } },
    ).outputText;
    vm.runInNewContext(source, {
        exports,
        require: (name) => {
            if (name === '@tanstack/react-query') return {
                useQueryClient: () => client,
                useQuery: (options) => options,
                useMutation: (options) => options,
            };
            if (name === 'react-redux') return {
                useSelector: (select) => select({ auth: { user: { tenant_id: 'tenant-1' } } }),
            };
            if (name === '@/services/contactGroup') return { contactGroupApis: {} };
            if (name === '@/lib/toast') return { toast: { success() {} } };
            throw new Error(`Unexpected import: ${name}`);
        },
    });

    const groupKey = exports.useGetGroupByIdQuery('GRP01291').queryKey;
    const availableKey = exports.useGetAvailableContactsQuery('GRP01291').queryKey;
    const otherTenantKey = ['contact-group', 'tenant-2', 'GRP01291'];
    for (const hook of ['useAddContactsToGroupMutation', 'useRemoveContactFromGroupMutation', 'useUpdateGroupMutation']) {
        client.setQueryData(groupKey, { members: [] });
        client.setQueryData(availableKey, []);
        client.setQueryData(otherTenantKey, { members: [] });
        await exports[hook]().onSuccess({}, {
            groupId: 'GRP01291', data: { contact_ids: ['contact-1'] },
        });
        assert.equal(client.getQueryState(groupKey).isInvalidated, true, hook);
        if (hook !== 'useUpdateGroupMutation') {
            assert.equal(client.getQueryState(availableKey).isInvalidated, true, hook);
        }
        assert.equal(client.getQueryState(otherTenantKey).isInvalidated, false);
    }
    client.clear();
});
