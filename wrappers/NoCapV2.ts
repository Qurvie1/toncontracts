import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Dictionary } from '@ton/core';

export type NoCapV2Config = {
    stored_seqno: number,
    stored_subwallet: number,
    public_key: Buffer,
    plugins: Dictionary<Address, Cell>,
};

export function noCapV2ConfigToCell(config: NoCapV2Config): Cell {
    return beginCell()
        .storeUint(config.stored_seqno, 32)
        .storeUint(config.stored_subwallet, 32)
        .storeBuffer(config.public_key)
        .storeDict(config.plugins)
    .endCell();
}

export class NoCapV2 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NoCapV2(address);
    }

    static createFromConfig(config: NoCapV2Config, code: Cell, workchain = 0) {
        const data = noCapV2ConfigToCell(config);
        const init = { code, data };
        return new NoCapV2(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}