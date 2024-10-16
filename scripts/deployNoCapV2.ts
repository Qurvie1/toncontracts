import { toNano, Dictionary } from '@ton/core';
import { NoCapV2 } from '../wrappers/NoCapV2';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const noCapV2 = provider.open(NoCapV2.createFromConfig({
        stored_seqno: 123,
        stored_subwallet: 699290,
        public_key: Buffer.from('4fb0aad827d630692ea713a5eff85f4b8a8711963c249ec74fb07e8217a45c01', 'hex'),
        plugins: Dictionary.empty(),
    }, await compile('NoCapV2')));

    await noCapV2.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(noCapV2.address);

    // run methods on `noCapV2`
}