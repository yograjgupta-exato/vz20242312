export enum ProductCategoryID {
    ServicePack = 'SRVPACK',
}

export enum BaseUOM {
    EA = 'EA',
}

export enum ProcessingTypeCode {
    AMSS = 'ZASR',
    DMSS = 'ZDSR',
}

export enum ServiceRequestMappingKeys {
    id = 'zUberID_KUT',
    bookingDate = 'zBookingDate_KUT',
    bookingTime = 'zBookingTime_KUT',
    appointmentDate = 'zAppointmentDate_KUT',
    appointmentTime = 'zAppointmentTime_KUT',
    serviceType = 'zServiceType_KUT',
    endConsumerC4CID = 'BuyerPartyID',
    addressPropertyType = 'zPropertyType_KUT',
    addressBuilding = 'zAddressBuilding_KUT',
    addressCompany = 'zAddressCompany_KUT',
    addressCity = 'zAddressCity_KUT',
    addressCountryCode = 'zAddressCountryCode_KUT',
    addressLat = 'zAddressLalitude_KUT',
    addressLng = 'zAddressLongitude_KUT',
    addressState = 'zAddressState_KUT',
    addressStreet1 = 'zAddressStreet1_KUT',
    addressStreet2 = 'zAddressStreet2_KUT',
    addressPostalCode = 'zAddressPostalCode_KUT',
    contactEmail = 'zContactsEMail_KUT',
    contactName = 'zContactsName_KUT',
    contactPhone = 'zContactsPhone_KUT',
    contactSecondaryPhone = 'zContactsSecondaryPhone_KUT',
}

export enum ServiceCategoryID {
    AMSS = 'AMSS_9',
    DMSS = 'DMSS_10',
}

// for c4c i/o
export enum StateCode {
    KED = 'Kedah',
    JOH = 'Johor',
    KEL = 'Kelantan',
    KUL = 'Kuala Lumpur',
    LAB = 'Labuan',
    LAN = 'Langkawi',
    MEL = 'Melaka',
    PAH = 'Pahang',
    PEL = 'Perlis',
    PER = 'Perak',
    PIN = 'Pulau Pinang',
    PJY = 'Putrajaya',
    SAB = 'Sabah',
    SAR = 'Sarawak',
    SEL = 'Selangor',
    SER = 'Negeri Sembilan',
    TIO = 'Tioman',
    TRE = 'Terengganu',
}

export enum Race {
    MALAY = 'malay',
    CHINESE = 'chinese',
    INDIAN = 'indian',
    OTHER = 'other',
}
