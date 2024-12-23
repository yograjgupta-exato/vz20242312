/* eslint-disable @typescript-eslint/camelcase */
import { CRMApiFactory } from '../crm/apis/crm-api.factory';
import { FireMobileApi } from '../sms/fire-mobile.api';
import { LanguageCode } from './enums';
import { SupportedBankTypes } from './enums/supported-bank-types';
export declare const SUPER_ADMIN_ROLE_CODE = '__super_admin_role__';

export const CREATE_OMIT_KEYS = ['id', 'createdAt', 'updatedAt', 'deletedAt'];

export const HEADER_ACCEPT_LANGUAGE = 'accept-language';
export const HEADER_CLIENT_TYPE = 'x-client-type';
export const HEADER_CLIENT_VERSION = 'x-client-version';
export const HEADER_DEVICE_NAME = 'x-device-name';
export const HEADER_DEVICE_OS = 'x-device-os';
export const HEADER_DEVICE_ID = 'x-device-id';
export const HEADER_API_VERSION = 'x-api-version';
export const HEADER_TIMEZONE_OFFSET = 'x-timezone-offset';
export const HEADER_OTP_TOKEN = 'x-otp-token';

export const PAYMENT_REF_NO_DELIMITER = '~';
export const PAYOUT_FILE_DELIMITER = ';';

export const HTTP_STATUS_UPGRADE_REQUIRED = 426;

export const TYPEORM_DUPLICATE_KEY_VALUE_VIOLATES_UNIQUE_CONSTRAINT_ERROR_CODE = '23505';

export const DefinedHttpHeaderKeys = [
    HEADER_ACCEPT_LANGUAGE,
    HEADER_CLIENT_TYPE,
    HEADER_CLIENT_VERSION,
    HEADER_DEVICE_NAME,
    HEADER_DEVICE_OS,
    HEADER_DEVICE_ID,
    HEADER_API_VERSION,
    HEADER_TIMEZONE_OFFSET,
];

export const DEFAULT_LANGUAGE_CODE = LanguageCode.En;

export const DEFAULT_COUNTRY_CODE = 'MY';

export const PRINCIPAL_GROUP_DMSS = 'DMSS';
export const PRINCIPAL_GROUP_AMSS = 'AMSS';

/**
 * A map of all the third party apis.
 */
export const ThirdPartyApisMap = {
    FireMobileApi,
    CRMApiFactory,
};

export const BankDisplayNames = {
    [SupportedBankTypes.AffinBank]: 'Affin Bank',
    [SupportedBankTypes.AffinIslamicBank]: 'Affin Islamic Bank',
    [SupportedBankTypes.Agrobank]: 'Agrobank',
    [SupportedBankTypes.AlRajhi]: 'Al-Rajhi Banking & Inv.Corp.(M) Bhd',
    [SupportedBankTypes.AllianceBank]: 'Alliance Bank',
    [SupportedBankTypes.AllianceIslamicBank]: 'Alliance Islamic Bank',
    [SupportedBankTypes.Ambank]: 'Ambank',
    [SupportedBankTypes.Amislamic]: 'AmIslamic Bank',
    [SupportedBankTypes.BankIslam]: 'Bank Islam',
    [SupportedBankTypes.BankKerjasama]: 'Bank Kerjasama Rakyat',
    [SupportedBankTypes.BankMuamalat]: 'Bank Muamalat',
    [SupportedBankTypes.BankOfAmerica]: 'Bank of America',
    [SupportedBankTypes.BankOfChina]: 'Bank of China',
    [SupportedBankTypes.BankOfTokyoMitsubishiUfj]: 'Bank of Tokyo-Mitsubishi UFJ',
    [SupportedBankTypes.BankSimpanan]: 'Bank Simpanan Nasional',
    [SupportedBankTypes.BnpParibas]: 'BNP Paribas',
    [SupportedBankTypes.CimbBank]: 'CIMB Bank',
    [SupportedBankTypes.CimbIslamicBank]: 'CIMB Islamic Bank',
    [SupportedBankTypes.Citibank]: 'Citibank',
    [SupportedBankTypes.DeutscheBank]: 'Deutsche Bank',
    [SupportedBankTypes.HongLeongBank]: 'Hong Leong Bank',
    [SupportedBankTypes.HongLeongIslamicBank]: 'Hong Leong Islamic Bank',
    [SupportedBankTypes.HsbcAmanah]: 'HSBC Amanah',
    [SupportedBankTypes.HsbcBank]: 'HSBC Bank',
    [SupportedBankTypes.IndustrialCommercialBankOfChina]: 'Industrial & Commercial Bank of China (ICBC)',
    [SupportedBankTypes.JpMorganChase]: 'JP Morgan Chase',
    [SupportedBankTypes.KuwaitFinanceHouse]: 'Kuwait Finance House',
    [SupportedBankTypes.Maybank]: 'Maybank',
    [SupportedBankTypes.MaybankIslamic]: 'Maybank Islamic',
    [SupportedBankTypes.MizuhoBank]: 'Mizuho Bank',
    [SupportedBankTypes.OcbcAlAminBank]: 'OCBC Al-Amin Bank',
    [SupportedBankTypes.OcbcBank]: 'OCBC Bank',
    [SupportedBankTypes.PublicBank]: 'Public Bank',
    [SupportedBankTypes.PublicIslamicBank]: 'Public Islamic Bank',
    [SupportedBankTypes.RhbBank]: 'RHB Bank',
    [SupportedBankTypes.RhbIslamicBank]: 'RHB Islamic Bank',
    [SupportedBankTypes.StandardCharteredBank]: 'Standard Chartered Bank',
    [SupportedBankTypes.StandardCharteredSaadiq]: 'Standard Chartered Saadiq',
    [SupportedBankTypes.SumitomoMitsuiBankingCorporation]: 'Sumitomo Mitsui Banking Corporation',
    [SupportedBankTypes.UnitedOverseasBank]: 'United Overseas Bank',
};

export const BankSwiftCodes = {
    [SupportedBankTypes.AffinBank]: 'PHBMMYKL',
    [SupportedBankTypes.AffinIslamicBank]: 'AIBBMYKL',
    [SupportedBankTypes.Agrobank]: 'AGOBMYKL',
    [SupportedBankTypes.AllianceBank]: 'MFBBMYKL',
    [SupportedBankTypes.AllianceIslamicBank]: 'ALSRMYKL',
    [SupportedBankTypes.AlRajhi]: 'RJHIMYKL',
    [SupportedBankTypes.Ambank]: 'ARBKMYKL',
    [SupportedBankTypes.Amislamic]: 'AISLMYKL',
    [SupportedBankTypes.BankIslam]: 'BIMBMYKL',
    [SupportedBankTypes.BankKerjasama]: 'BKRMMYKL',
    [SupportedBankTypes.BankMuamalat]: 'BMMBMYKL',
    [SupportedBankTypes.BankOfAmerica]: 'BOFAMY2X',
    [SupportedBankTypes.BankOfChina]: 'BKCHMYKL',
    [SupportedBankTypes.BankSimpanan]: '‎BSNAMYK1',
    [SupportedBankTypes.BankOfTokyoMitsubishiUfj]: 'BOTKMYKX',
    [SupportedBankTypes.CimbBank]: 'CIBBMYKL',
    [SupportedBankTypes.CimbIslamicBank]: 'CTBBMYKL',
    [SupportedBankTypes.BnpParibas]: 'BNPAMYKL',
    [SupportedBankTypes.Citibank]: 'CITIMYKL',
    [SupportedBankTypes.DeutscheBank]: 'DEUTMYKL',
    [SupportedBankTypes.HongLeongBank]: 'HLBBMYKL',
    [SupportedBankTypes.HongLeongIslamicBank]: '	HLIBMYKL',
    [SupportedBankTypes.HsbcBank]: 'HBMBMYKL',
    [SupportedBankTypes.HsbcAmanah]: 'HMABMYKL',
    [SupportedBankTypes.IndustrialCommercialBankOfChina]: 'ICBKCNBJ',
    [SupportedBankTypes.JpMorganChase]: 'CHASMYKX',
    [SupportedBankTypes.KuwaitFinanceHouse]: 'KFHOMYKL',
    [SupportedBankTypes.Maybank]: 'MBBEMYKL',
    [SupportedBankTypes.MaybankIslamic]: 'MBISMYKL',
    [SupportedBankTypes.MizuhoBank]: 'MHCBMYKA',
    [SupportedBankTypes.OcbcBank]: 'OCBCMYKL',
    [SupportedBankTypes.OcbcAlAminBank]: 'OABBMYKL',
    [SupportedBankTypes.PublicBank]: 'PBBEMYKL',
    [SupportedBankTypes.PublicIslamicBank]: 'PIBEMYK1',
    [SupportedBankTypes.RhbBank]: 'RHBBMYKL',
    [SupportedBankTypes.RhbIslamicBank]: 'RHBAMYKL',
    [SupportedBankTypes.StandardCharteredBank]: 'SCBLMYKX',
    [SupportedBankTypes.StandardCharteredSaadiq]: 'SCSRMYK1',
    [SupportedBankTypes.SumitomoMitsuiBankingCorporation]: 'SMBCMYKL',
    [SupportedBankTypes.UnitedOverseasBank]: 'UOVBMYKL',
};
