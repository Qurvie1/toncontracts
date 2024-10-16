import { Blockchain, printTransactionFees, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, Dictionary } from '@ton/core';
import { NoCapV2 } from '../wrappers/NoCapV2';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import exp from 'constants';

describe('NoCapV2', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('NoCapV2');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let noCapV2: SandboxContract<NoCapV2>;
    let user: SandboxContract<TreasuryContract>;
    let receiver: SandboxContract<TreasuryContract>;
    let admin: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        receiver = await blockchain.treasury('receiver');
        admin = await blockchain.treasury('admin');

        noCapV2 = blockchain.openContract(NoCapV2.createFromConfig({
            stored_seqno: 0,
            stored_subwallet: 699290,
            public_key: Buffer.from('4fb0aad827d630692ea713a5eff85f4b8a8711963c249ec74fb07e8217a45c01', 'hex'),
            plugins: Dictionary.empty(),
            receiver: receiver.address,
            admin: admin.address
        }, code));

        deployer = await blockchain.treasury('deployer');
        user = await blockchain.treasury('user');

        const deployResult = await noCapV2.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: noCapV2.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and noCapV2 are ready to use
    });

    it ('should send funds', async () => {
        const sendFundsResult = await noCapV2.sendFunds(user.getSender(), toNano('1'));
        expect(sendFundsResult.transactions).toHaveTransaction({
            from: user.address,
            to: noCapV2.address,
            success: true,
            op: 0x706c7567,
            value: toNano('1')
        });

        expect(sendFundsResult.transactions).toHaveTransaction({
            from: noCapV2.address,
            to: receiver.address,
            success: true,
            value: toNano('1')
        });

        printTransactionFees(sendFundsResult.transactions);
    });

});
