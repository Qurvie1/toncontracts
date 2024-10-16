import { Address, Cell, toNano, Dictionary } from '@ton/core';
import { NoCapV1 } from '../wrappers/NoCapV1';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const noCapV1 = provider.open(NoCapV1.createFromConfig({
        stored_seqno: 2123,
        stored_subwallet: 699290,
        public_key: Buffer.from('76848753e4e879ae6484d633ef51436f8733bac82f61d7eb8b18e9aaf476098b', 'hex'),
        plugins: Dictionary.empty(),
        pool: Address.parse('UQCrBqzxufesS9nkeEVOJZW5fcwv8CKn4Qom_Q0knXmOAqFl'),
        stored_amount: 0,
    }, await compile('NoCapV1')));

    await noCapV1.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(noCapV1.address);

    // run methods on `noCapV1`
}