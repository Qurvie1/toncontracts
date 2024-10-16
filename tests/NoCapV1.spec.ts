import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { NoCapV1 } from '../wrappers/NoCapV1';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('NoCapV1', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('NoCapV1');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let noCapV1: SandboxContract<NoCapV1>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        noCapV1 = blockchain.openContract(NoCapV1.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await noCapV1.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: noCapV1.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and noCapV1 are ready to use
    });
});
