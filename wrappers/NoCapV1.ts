import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode, Slice } from '@ton/core';

export type NoCapV1Config = {
    stored_seqno: number,
    stored_subwallet: number,
    public_key: Buffer,
    plugins: Dictionary<Address, Cell>,
    pool: Address,
    stored_amount: number
};

export function noCapV1ConfigToCell(config: NoCapV1Config): Cell {
    return beginCell()
        .storeUint(config.stored_seqno, 32)
        .storeUint(config.stored_subwallet, 32)
        .storeBuffer(config.public_key)
        .storeDict(config.plugins)
        .storeAddress(config.pool)
        .storeCoins(config.stored_amount)
    .endCell();
}

export class NoCapV1 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NoCapV1(address);
    }

    static createFromConfig(config: NoCapV1Config, code: Cell, workchain = 0) {
        const data = noCapV1ConfigToCell(config);
        const init = { code, data };
        return new NoCapV1(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
