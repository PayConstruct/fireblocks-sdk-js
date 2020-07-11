import { ApiClient } from "./api-client";
import { ApiTokenProvider } from "./api-token-provider";
import { IAuthProvider } from "./iauth-provider";
import {
    VaultAccountResponse,
    CreateTransactionResponse,
    TransactionArguments,
    AssetResponse,
    ExchangeResponse,
    TransactionResponse,
    TransactionFilter,
    CancelTransactionResponse,
    WalletContainerResponse,
    WalletAssetResponse,
    DepositAddressResponse,
    GenerateAddressResponse,
    OperationSuccessResponse,
    NetworkConnectionResponse,
    FiatAccountResponse,
    CreateTransferTicketArgs,
    TransferTicketResponse,
    TermResponse,
    MakeTransferOfTermArgs,
    CreateTransferTicketResponse
} from "./types";

export * from "./types";
import queryString from "query-string";

export class FireblocksSDK {

    private authProvider: IAuthProvider;
    private apiBaseUrl: string;
    private apiClient: ApiClient;

    /**
     * Creates a new Fireblocks API Client
     * @param privateKey A string representation of your private key
     * @param apiKey Your api key. This is a uuid you received from Fireblocks
     * @param apiBaseUrl The fireblocks server URL. Leave empty to use the default server
     */
    constructor(privateKey: string, apiKey: string, apiBaseUrl: string = "https://api.fireblocks.io") {
        this.authProvider = new ApiTokenProvider(privateKey, apiKey);

        if (apiBaseUrl) {
            this.apiBaseUrl = apiBaseUrl;
        }

        this.apiClient = new ApiClient(this.authProvider, this.apiBaseUrl);
    }

    /**
     * Gets all assets that are currently supported by Fireblocks
     */
    public async getSupportedAssets(): Promise<VaultAccountResponse[]> {
        return await this.apiClient.issueGetRequest("/v1/supported_assets");
    }

    /**
     * Gets all vault accounts for your tenant
     */
    public async getVaultAccounts(): Promise<VaultAccountResponse[]> {
        return await this.apiClient.issueGetRequest("/v1/vault/accounts");
    }

    /**
     * @deprecated Replaced by getVaultAccountById.
     * Gets a single vault account
     * @param vaultAccountId The vault account ID
     */
    public async getVaultAccount(vaultAccountId: string): Promise<VaultAccountResponse> {
        return await this.getVaultAccountById(vaultAccountId);
    }

    /**
     * Gets a single vault account
     * @param vaultAccountId The vault account ID
     */
    public async getVaultAccountById(vaultAccountId: string): Promise<VaultAccountResponse> {
        return await this.apiClient.issueGetRequest(`/v1/vault/accounts/${vaultAccountId}`);
    }

    /**
     * Gets a single vault account asset
     * @param vaultAccountId The vault account ID
     * @param assetId The ID of the asset to get
     */
    public async getVaultAccountAsset(vaultAccountId: string, assetId: string): Promise<AssetResponse> {
        return await this.apiClient.issueGetRequest(`/v1/vault/accounts/${vaultAccountId}/${assetId}`);
    }

    /**
     * Gets deposit addresses for an asset in a vault account
     * @param vaultAccountId The vault account ID
     * @param assetId The ID of the asset for which to get the deposit address
     */
    public async getDepositAddresses(vaultAccountId: string, assetId: string): Promise<DepositAddressResponse[]> {
        return await this.apiClient.issueGetRequest(`/v1/vault/accounts/${vaultAccountId}/${assetId}/addresses`);
    }

    /**
     * Generates a new address for an asset in a vault account
     * @param vaultAccountId The vault account ID
     * @param assetId The ID of the asset for which to generate the deposit address
     * @param description A description for the new address
     * @param customerRefId A customer reference ID
     */
    public async generateNewAddress(vaultAccountId: string, assetId: string, description?: string, customerRefId?: string): Promise<GenerateAddressResponse> {
        return await this.apiClient.issuePostRequest(`/v1/vault/accounts/${vaultAccountId}/${assetId}/addresses`, {
            description,
            customerRefId
        });
    }

    /**
     * Sets the description of an existing address
     * @param vaultAccountId The vault account ID
     * @param assetId The ID of the asset
     * @param address The address for which to set the description
     * @param tag The XRP tag, or EOS memo, for which to set the description
     * @param description The description to set
     */
    public async setAddressDescription(vaultAccountId: string, assetId: string, address: string, tag?: string, description?: string): Promise<GenerateAddressResponse> {
        let addressId = address;
        if (tag && tag.length > 0) {
            addressId = `${address}:${tag}`;
        }

        return await this.apiClient.issuePutRequest(
            `/v1/vault/accounts/${vaultAccountId}/${assetId}/addresses/${addressId}`,
            {description: description || ""});
    }

    /**
     * Gets all network connections
     */
    public async getNetworkConnections(): Promise<NetworkConnectionResponse[]> {
        return await this.apiClient.issueGetRequest("/v1/network_connections");
    }

    /**
     * Gets a single network connection by id
     */
    public async getNetworkConnectionById(connectionId: string): Promise<NetworkConnectionResponse> {
        return await this.apiClient.issueGetRequest(`/v1/network_connections/${connectionId}`);
    }

    /**
     * Gets all exchange accounts for your tenant
     */
    public async getExchangeAccounts(): Promise<ExchangeResponse[]> {
        return await this.apiClient.issueGetRequest("/v1/exchange_accounts");
    }

    /**
     * @deprecated Replaced by getExchangeAccountById
     * Gets a single exchange account by ID
     * @param exchangeAccountId The exchange account ID
     */
    public async getExchangeAccount(exchangeAccountId: string): Promise<ExchangeResponse> {
        return await this.getExchangeAccount(exchangeAccountId);
    }

    /**
     * Gets a single exchange account by ID
     * @param exchangeAccountId The exchange account ID
     */
    public async getExchangeAccountById(exchangeAccountId: string): Promise<ExchangeResponse> {
        return await this.apiClient.issueGetRequest(`/v1/exchange_accounts/${exchangeAccountId}`);
    }

    /**
     * Transfer from a main exchange account to a subaccount
     * @param exchangeAccountId The exchange ID in Fireblocks
     * @param subaccountId The ID of the subaccount in the exchange
     * @param assetId The asset to transfer
     * @param amount The amount to transfer
     */
    public async transferToSubaccount(exchangeAccountId: string, subaccountId: string, assetId: string, amount: number): Promise<OperationSuccessResponse> {
        const body = {
            subaccountId,
            amount
        };

        return await this.apiClient.issuePostRequest(`/v1/exchange_accounts/${exchangeAccountId}/${assetId}/transfer_to_subaccount`, body);
    }

    /**
     * Transfer from a subaccount to a main exchange account
     * @param exchangeAccountId The exchange ID in Fireblocks
     * @param subaccountId The ID of the subaccount in the exchange
     * @param assetId The asset to transfer
     * @param amount The amount to transfer
     */
    public async transferFromSubaccount(exchangeAccountId: string, subaccountId: string, assetId: string, amount: number): Promise<OperationSuccessResponse> {
        const body = {
            subaccountId,
            amount
        };

        return await this.apiClient.issuePostRequest(`/v1/exchange_accounts/${exchangeAccountId}/${assetId}/transfer_from_subaccount`, body);
    }

    /**
     * Gets all fiat accounts for your tenant
     */
    public async getFiatAccounts(): Promise<FiatAccountResponse[]> {
        return await this.apiClient.issueGetRequest("/v1/fiat_accounts");
    }

    /**
     * Gets a single fiat account by ID
     * @param accountId The fiat account ID
     */
    public async getFiatAccountById(accountId: string): Promise<FiatAccountResponse> {
        return await this.apiClient.issueGetRequest(`/v1/fiat_accounts/${accountId}`);
    }

    /**
     * Redeem from a fiat account to a linked DDA
     * @param accountId The fiat account ID in Fireblocks
     * @param amount The amount to transfer
     */
    public async redeemToLinkedDDA(accountId: string, amount: number): Promise<OperationSuccessResponse> {
        const body = {
            amount
        };

        return await this.apiClient.issuePostRequest(`/v1/fiat_accounts/${accountId}/redeem_to_linked_dda`, body);
    }

    /**
     * Deposit to a fiat account from a linked DDA
     * @param accountId The fiat account ID in Fireblocks
     * @param amount The amount to transfer
     */
    public async depositFromLinkedDDA(accountId: string, amount: number): Promise<OperationSuccessResponse> {
        const body = {
            amount
        };

        return await this.apiClient.issuePostRequest(`/v1/fiat_accounts/${accountId}/deposit_from_linked_dda`, body);
    }

    /**
     * Gets a list of transactions matching the given filter
     * @param filter.before Only gets transactions created before a given timestamp (in milliseconds)
     * @param filter.after Only gets transactions created after a given timestamp (in milliseconds)
     * @param filter.status Only gets transactions with the spcified status
     * @param filter.limit Limit the amount of returned results. If not specified, a limit of 200 results will be used
     * @param filter.orderBy Determines the order of the results
     */
    public async getTransactions(filter: TransactionFilter): Promise<TransactionResponse[]> {
        return await this.apiClient.issueGetRequest(`/v1/transactions?${queryString.stringify(filter)}`);
    }

    /**
     * Gets all internal wallets for your tenant
     */
    public async getInternalWallets(): Promise<WalletContainerResponse[]> {
        return await this.apiClient.issueGetRequest("/v1/internal_wallets");
    }

    /**
     * Gets a single internal wallet
     * @param walletId The internal wallet ID
     */
    public async getInternalWallet(walletId: string): Promise<WalletContainerResponse> {
        return await this.apiClient.issueGetRequest(`/v1/internal_wallets/${walletId}`);
    }

    /**
     * Gets a single internal wallet asset
     * @param walletId The internal wallet ID
     * @param assetId The asset ID
     */
    public async getInternalWalletAsset(walletId: string, assetId: string): Promise<WalletAssetResponse> {
        return await this.apiClient.issueGetRequest(`/v1/internal_wallets/${walletId}/${assetId}`);
    }

    /**
     * Gets all external wallets for your tenant
     */
    public async getExternalWallets(): Promise<WalletContainerResponse[]> {
        return await this.apiClient.issueGetRequest("/v1/external_wallets");
    }

    /**
     * Gets a single external wallet
     * @param walletId The external wallet ID
     */
    public async getExternalWallet(walletId: string): Promise<WalletContainerResponse> {
        return await this.apiClient.issueGetRequest(`/v1/external_wallets/${walletId}`);
    }

    /**
     * Gets a single external wallet asset
     * @param walletId The external wallet ID
     * @param assetId The asset ID
     */
    public async getExternalWalletAsset(walletId: string, assetId: string): Promise<WalletAssetResponse> {
        return await this.apiClient.issueGetRequest(`/v1/external_wallets/${walletId}/${assetId}`);
    }

    /**
     * Gets detailed information for a single transaction
     * @param txId The transaction id to query
     */
    public async getTransactionById(txId: string): Promise<TransactionResponse> {
        return await this.apiClient.issueGetRequest(`/v1/transactions/${txId}`);
    }

    /**
     * Cancels the selected transaction
     * @param txId The transaction id to cancel
     */
    public async cancelTransactionById(txId: string): Promise<CancelTransactionResponse> {
        return await this.apiClient.issuePostRequest(`/v1/transactions/${txId}/cancel`, {});
    }

    /**
     * Creates a new vault account
     * @param name A name for the new vault account
     * @param hiddenOnUI If true, the created account and all related transactions will not be shown on Fireblocks console
     * @param customerRefId A customer reference ID
     */
    public async createVaultAccount(name: string, hiddenOnUI?: boolean, customerRefId?: string): Promise<VaultAccountResponse> {
        const body = {
            name,
            customerRefId,
            hiddenOnUI: hiddenOnUI || false
        };

        return await this.apiClient.issuePostRequest("/v1/vault/accounts", body);
    }

    /**
     * Hides a vault account in Fireblocks console
     * @param vaultAccountId The vault account ID
     */
    public async hideVaultAccount(vaultAccountId: string): Promise<OperationSuccessResponse> {
        return await this.apiClient.issuePostRequest(`/v1/vault/accounts/${vaultAccountId}/hide`, {});
    }

    /**
     * Reveals a hidden vault account in Fireblocks console
     * @param vaultAccountId The vault account ID
     */
    public async unhideVaultAccount(vaultAccountId: string): Promise<OperationSuccessResponse> {
        return await this.apiClient.issuePostRequest(`/v1/vault/accounts/${vaultAccountId}/unhide`, {});
    }

    /**
     * Updates a vault account
     * @param name A new name for the vault account
     */
    public async updateVaultAccount(vaultAccountId: string, name: string): Promise<VaultAccountResponse> {
        const body = {
            name: name
        };

        return await this.apiClient.issuePutRequest(`/v1/vault/accounts/${vaultAccountId}`, body);
    }

    /**
     * Creates a new asset within an existing vault account
     * @param vaultAccountId The vault account ID
     * @param assetId The asset to add
     */
    public async createVaultAsset(vaultAccountId: string, assetId: string): Promise<AssetResponse> {
        return await this.apiClient.issuePostRequest(`/v1/vault/accounts/${vaultAccountId}/${assetId}`, {});
    }

    /**
     * Creates a new external wallet
     * @param name A name for the new external wallet
     * @param customerRefId A customer reference ID
     */
    public async createExternalWallet(name: string, customerRefId?: string): Promise<WalletContainerResponse> {
        const body = {
            name,
            customerRefId
        };

        return await this.apiClient.issuePostRequest("/v1/external_wallets", body);
    }

    /**
     * Creates a new internal wallet
     * @param name A name for the new internal wallet
     * @param customerRefId A customer reference ID
     */
    public async createInternalWallet(name: string, customerRefId?: string): Promise<WalletContainerResponse> {
        const body = {
            name,
            customerRefId
        };

        return await this.apiClient.issuePostRequest("/v1/internal_wallets", body);
    }

    /**
     * Creates a new asset within an exiting external wallet
     * @param walletId The wallet id
     * @param assetId The asset to add
     * @param address The wallet address
     * @param tag (for ripple only) The ripple account tag
     */
    public async createExternalWalletAsset(walletId: string, assetId: string, address: string, tag?: string): Promise<WalletAssetResponse> {
        const path = `/v1/external_wallets/${walletId}/${assetId}`;

        const body = {
            address: address,
            tag: tag
        };
        return await this.apiClient.issuePostRequest(path, body);
    }

    /**
     * Creates a new asset within an exiting internal wallet
     * @param walletId The wallet id
     * @param assetId The asset to add
     * @param address The wallet address
     * @param tag (for ripple only) The ripple account tag
     */
    public async createInternalWalletAsset(walletId: string, assetId: string, address: string, tag?: string): Promise<WalletAssetResponse> {
        const path = `/v1/internal_wallets/${walletId}/${assetId}`;

        const body = {
            address: address,
            tag: tag
        };
        return await this.apiClient.issuePostRequest(path, body);
    }

    /**
     * Creates a new transaction with the specified options
     */
    public async createTransaction(options: TransactionArguments): Promise<CreateTransactionResponse> {
        return await this.apiClient.issuePostRequest("/v1/transactions", options);
    }

    /**
     * Creates a new transfer ticket
     */
    public async createTransferTicket(options: CreateTransferTicketArgs): Promise<CreateTransferTicketResponse> {
        return await this.apiClient.issuePostRequest("/v1/transfer_tickets", options);
    }

    /**
     * Gets all transfer tickets
     */
    public async getTransferTickets(): Promise<TransferTicketResponse[]> {
        return await this.apiClient.issueGetRequest("/v1/transfer_tickets");
    }

    /**
     * Get a transfer ticket by ticket ID
     * @param ticketId
     */
    public async getTransferTicketById(ticketId: string): Promise<TransferTicketResponse> {
        return await this.apiClient.issueGetRequest(`/v1/transfer_tickets/${ticketId}`);
    }

    /**
     * Get a term in transfer ticket
     * @param ticketId
     * @param termId
     */
    public async getTermInTransferTicket(ticketId: string, termId: string): Promise<TermResponse> {
        return await this.apiClient.issueGetRequest(`/v1/transfer_tickets/${ticketId}/${termId}`);
    }

    /**
     * Cancel the transfer ticket
     * @param ticketId
     */
    public async cancelTransferTicket(ticketId: string) {
        return await this.apiClient.issuePostRequest(`/v1/transfer_tickets/${ticketId}/cancel`, {});
    }

    /**
     * Make a transfer of a term
     * @param ticketId
     * @param termId
     * @param options
     */
    public async makeATransferOfTerm(ticketId: string, termId: string, options: MakeTransferOfTermArgs) {
        return await this.apiClient.issuePostRequest(`/v1/transfer_tickets/${ticketId}/${termId}`,
            options);
    }

    /**
     * Deletes a single internal wallet
     * @param walletId The internal wallet ID
     */
    public async deleteInternalWallet(walletId: string): Promise<OperationSuccessResponse> {
        return await this.apiClient.issueDeleteRequest(`/v1/internal_wallets/${walletId}`);
    }

    /**
     * Deletes a single internal wallet asset
     * @param walletId The internal wallet ID
     * @param assetId The asset ID
     */
    public async deleteInternalWalletAsset(walletId: string, assetId: string): Promise<WalletAssetResponse> {
        return await this.apiClient.issueDeleteRequest(`/v1/internal_wallets/${walletId}/${assetId}`);
    }

    /**
     * Deletes a single external wallet
     * @param walletId The external wallet ID
     */
    public async deleteExternalWallet(walletId: string): Promise<OperationSuccessResponse> {
        return await this.apiClient.issueDeleteRequest(`/v1/external_wallets/${walletId}`);
    }

    /**
     * Deletes a single external wallet asset
     * @param walletId The external wallet ID
     * @param assetId The asset ID
     */
    public async deleteExternalWalletAsset(walletId: string, assetId: string): Promise<WalletAssetResponse> {
        return await this.apiClient.issueDeleteRequest(`/v1/external_wallets/${walletId}/${assetId}`);
    }

    /**
     * Sets a customer reference ID
     * @param vaultAccountId The vault account ID
     * @param customerRefId The customer reference ID to set
     */
    public async setCustomerRefIdForVaultAccount(vaultAccountId: string, customerRefId: string): Promise<OperationSuccessResponse> {
        return await this.apiClient.issuePostRequest(`/v1/vault/accounts/${vaultAccountId}/set_customer_ref_id`, {customerRefId});
    }

    /**
     * Sets a customer reference ID
     * @param walletId The ID of the internal wallet
     * @param customerRefId The customer reference ID to set
     */
    public async setCustomerRefIdForInternalWallet(walletId: string, customerRefId: string): Promise<OperationSuccessResponse> {
        return await this.apiClient.issuePostRequest(`/v1/internal_wallets/${walletId}/set_customer_ref_id`, {customerRefId});
    }

    /**
     * Sets a customer reference ID
     * @param walletId The ID of the external wallet
     * @param customerRefId The customer reference ID to set
     */
    public async setCustomerRefIdForExternalWallet(walletId: string, customerRefId: string): Promise<OperationSuccessResponse> {
        return await this.apiClient.issuePostRequest(`/v1/external_wallets/${walletId}/set_customer_ref_id`, {customerRefId});
    }

    /**
     * Sets a customer reference ID
     * @param vaultAccountId The vault account ID
     * @param assetId The ID of the asset
     * @param address The address
     * @param tag The XRP tag, or EOS memo
     * @param customerRefId The customer reference ID to set
     */
    public async setCustomerRefIdForAddress(vaultAccountId: string, assetId: string, address: string, tag?: string, customerRefId?: string): Promise<OperationSuccessResponse> {
        let addressId = address;
        if (tag && tag.length > 0) {
            addressId = `${address}:${tag}`;
        }

        return await this.apiClient.issuePostRequest(`/v1/vault/accounts/${vaultAccountId}/${assetId}/addresses/${addressId}/set_customer_ref_id`, {customerRefId});
    }
}
